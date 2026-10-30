/**
 * Bounded Next.js cache handler (ISR pages, route handlers and the fetch Data Cache).
 *
 * Why (prod 2026-10-30, backend ADR "Bounded Next.js cache"): the default handler writes every rendered ISR page
 * (HTML + RSC, ~260 KB per beach page and language) to `.next/server/app` and every fetch response to
 * `.next/cache/fetch-cache`, and never deletes anything. 19 languages × ~3 800 beaches + places, plus every
 * 404 or redirect URL a bot invents, filled the `front_prod` container's writable layer with ~14 GB in one day.
 *
 * This handler keeps everything in memory, gzip-compressed, in one LRU with a byte budget
 * (`NEXT_CACHE_MAX_MB`, default 128). It never writes to disk. Least recently used entries go first, so popular
 * pages stay hot; an evicted page is rendered again on its next visit (the same as after a deploy).
 * Pages that are not 200 (404, redirects) are not stored: bots cannot fill the cache with invented URLs.
 * Build-time files (robots.txt, sitemap index, prerendered pages) are still read from the image, read-only.
 */
const zlib = require('zlib');
const { promisify } = require('util');

const gzip = promisify(zlib.gzip);
const gunzip = promisify(zlib.gunzip);

const MB = 1024 * 1024;
const DEFAULT_MAX_MB = 128;
/** One entry may use at most this share of the budget (a huge entry would evict everything else). */
const MAX_ENTRY_SHARE = 0.1;
const NEXT_CACHE_TAGS_HEADER = 'x-next-cache-tags';

/** @param {string | undefined} raw */
function budgetBytes(raw) {
  const mb = Number(raw);
  return (Number.isFinite(mb) && mb > 0 ? mb : DEFAULT_MAX_MB) * MB;
}

/**
 * Least-recently-used map with a byte budget. A JS Map keeps insertion order, so re-inserting on access
 * moves an entry to the end and the first key is always the least recently used one.
 * @template V
 */
class ByteLru {
  /** @param {number} maxBytes */
  constructor(maxBytes) {
    this.maxBytes = maxBytes;
    this.bytes = 0;
    this.evictions = 0;
    /** @type {Map<string, { size: number, value: V }>} */
    this.map = new Map();
  }

  /** @param {string} key */
  get(key) {
    const hit = this.map.get(key);
    if (!hit) return undefined;
    this.map.delete(key);
    this.map.set(key, hit);
    return hit.value;
  }

  /** @param {string} key @param {V} value @param {number} size @returns {boolean} false when too big to keep */
  set(key, value, size) {
    this.delete(key);
    if (size > this.maxBytes * MAX_ENTRY_SHARE) return false;
    this.map.set(key, { size, value });
    this.bytes += size;
    while (this.bytes > this.maxBytes) {
      const oldest = this.map.keys().next();
      if (oldest.done) break;
      this.delete(oldest.value);
      this.evictions += 1;
    }
    return true;
  }

  /** @param {string} key */
  delete(key) {
    const hit = this.map.get(key);
    if (!hit) return;
    this.bytes -= hit.size;
    this.map.delete(key);
  }

  get size() {
    return this.map.size;
  }
}

/**
 * Whether a value is worth keeping. Non-200 pages and route responses are rendered again on each visit
 * (cheap, and the URL space of 404s/redirects is unbounded); images never come here (we use Imagor).
 * @param {any} value
 */
function isCacheable(value) {
  if (!value || typeof value !== 'object') return false;
  if (value.kind === 'PAGE' || value.kind === 'ROUTE') {
    return value.status === undefined || value.status === null || value.status === 200;
  }
  return value.kind === 'FETCH' || value.kind === 'REDIRECT';
}

/** @param {any} value @param {string[] | undefined} ctxTags @returns {string[]} */
function tagsOf(value, ctxTags) {
  if (value?.kind === 'FETCH') return [...(ctxTags || value.tags || [])];
  const header = value?.headers?.[NEXT_CACHE_TAGS_HEADER];
  return typeof header === 'string' ? header.split(',') : [];
}

/** @param {any} value */
function encode(value) {
  if (value.kind === 'ROUTE') {
    return JSON.stringify({ ...value, body: Buffer.from(value.body).toString('base64'), bodyB64: true });
  }
  return JSON.stringify(value);
}

/** @param {string} json */
function decode(json) {
  const value = JSON.parse(json);
  if (value.kind === 'ROUTE' && value.bodyB64) {
    value.body = Buffer.from(value.body, 'base64');
    delete value.bodyB64;
  }
  return value;
}

/**
 * Shared by every handler instance of this process (Next creates one per request). Kept on globalThis so
 * GET /api/health (bundled separately by webpack) can read the numbers without a second copy of the cache.
 */
const STATE_KEY = '__beachrexNextCache';
/** @type {any} */
const g = globalThis;
const state = g[STATE_KEY] || (g[STATE_KEY] = {
  /** @type {ByteLru<{ lastModified: number, tags: string[], gz: Buffer }> | null} */
  lru: null,
  /** @type {Map<string, number>} tag → time it was revalidated */
  revalidatedAt: new Map(),
  hits: 0,
  misses: 0,
  skipped: 0,
  stats: () => cacheStats(),
});

function lru() {
  if (!state.lru) state.lru = new ByteLru(budgetBytes(process.env.NEXT_CACHE_MAX_MB));
  return state.lru;
}

/** Numbers for /api/health and the deploy disk report. */
function cacheStats() {
  const cache = lru();
  return {
    entries: cache.size,
    bytes: cache.bytes,
    maxBytes: cache.maxBytes,
    evictions: cache.evictions,
    hits: state.hits,
    misses: state.misses,
    skipped: state.skipped,
  };
}

class BoundedCacheHandler {
  /** @param {any} ctx Next's CacheHandlerContext */
  constructor(ctx) {
    this.ctx = ctx;
    /** @type {any} */
    this.seed = null;
    if (ctx && ctx.fs && ctx.serverDistDir) {
      try {
        // Read-only fallback to the files built into the image (flushToDisk false: it never writes).
        const FileSystemCache = require('next/dist/server/lib/incremental-cache/file-system-cache').default;
        this.seed = new FileSystemCache({ ...ctx, flushToDisk: false, maxMemoryCacheSize: 0 });
      } catch {
        this.seed = null;
      }
    }
  }

  /** @param {string} key @param {any} [ctx] */
  async get(key, ctx = {}) {
    const entry = lru().get(key);
    if (entry) {
      const wanted = [...(entry.tags || []), ...(ctx.tags || []), ...(ctx.softTags || [])];
      const revalidated = (this.ctx?.revalidatedTags || []);
      const stale = wanted.some(
        (tag) => revalidated.includes(tag) || (state.revalidatedAt.get(tag) ?? 0) >= entry.lastModified,
      );
      if (stale) {
        lru().delete(key);
      } else {
        state.hits += 1;
        return { lastModified: entry.lastModified, value: decode((await gunzip(entry.gz)).toString('utf8')) };
      }
    }
    state.misses += 1;
    if (this.seed && ctx.kindHint !== 'fetch') {
      try {
        return (await this.seed.get(key, ctx)) ?? null;
      } catch {
        return null;
      }
    }
    return null;
  }

  /** @param {string} key @param {any} data @param {any} [ctx] */
  async set(key, data, ctx = {}) {
    if (!isCacheable(data)) {
      lru().delete(key);
      if (data) state.skipped += 1;
      return;
    }
    const gz = await gzip(Buffer.from(encode(data), 'utf8'), { level: 1 });
    const tags = tagsOf(data, ctx.tags);
    if (!lru().set(key, { lastModified: Date.now(), tags, gz }, gz.length + key.length + 64)) state.skipped += 1;
  }

  /** @param {string | string[]} tags */
  async revalidateTag(tags) {
    const now = Date.now();
    for (const tag of typeof tags === 'string' ? [tags] : tags) state.revalidatedAt.set(tag, now);
  }

  resetRequestCache() {}
}

module.exports = BoundedCacheHandler;
module.exports.ByteLru = ByteLru;
module.exports.isCacheable = isCacheable;
module.exports.cacheStats = cacheStats;
module.exports.budgetBytes = budgetBytes;
