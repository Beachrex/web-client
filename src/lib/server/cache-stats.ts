/**
 * Numbers of the bounded page/fetch cache (`cache-handler.cjs` at the repo root, backend ADR 2026-10-30
 * "Bounded Next.js cache"). The handler is loaded by Next outside webpack, so it publishes its state on
 * globalThis; `null` until the server has used the cache.
 */
interface CacheStats {
  entries: number;
  bytes: number;
  maxBytes: number;
  evictions: number;
  hits: number;
  misses: number;
  skipped: number;
}

const MB = 1024 * 1024;

export function readCacheStats(): Record<string, number> | null {
  const state = (globalThis as { __beachrexNextCache?: { stats?: () => CacheStats } }).__beachrexNextCache;
  const stats = state?.stats?.();
  if (!stats) return null;
  return {
    entries: stats.entries,
    mb: Math.round((stats.bytes / MB) * 10) / 10,
    maxMb: Math.round(stats.maxBytes / MB),
    evictions: stats.evictions,
    hits: stats.hits,
    misses: stats.misses,
    skipped: stats.skipped,
  };
}

export function rssMb(): number {
  return Math.round(process.memoryUsage().rss / MB);
}
