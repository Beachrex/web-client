import { globalRoutes } from '@/i18n/routing';

/**
 * Owner 2026-10-23: beach slugs lost their English "beach-" prefix (`beach-svetilnik` → `svetilnik`).
 * The page's own redirect is streamed (200 + meta refresh) and cached by ISR, so old URLs are moved in the
 * middleware instead, with a real 301. Only paths whose last segment starts with "beach-" are checked.
 */
const BEACHES_WORDS = new Set(Object.values(globalRoutes.beaches));

/** The old slug of a beach URL (`/{locale}/{beaches}/{continent}/{country}/…/beach-x`), else null. */
export function oldBeachSlug(pathname: string): string | null {
  const parts = pathname.split('/').filter(Boolean);
  // locale, beaches word, continent, country, at least one place, the beach
  if (parts.length < 6 || !BEACHES_WORDS.has(parts[1]!)) return null;
  const last = parts[parts.length - 1]!;
  return last.startsWith('beach-') ? last : null;
}

/** The same path with the beach slug replaced. */
export function withBeachSlug(pathname: string, slug: string): string {
  const parts = pathname.split('/');
  parts[parts.length - 1] = encodeURIComponent(slug);
  return parts.join('/');
}

/** Current slug of a beach by any of its slugs (old ones included), or null when the API does not answer. */
export async function currentBeachSlug(apiEndpoint: string | undefined, slug: string): Promise<string | null> {
  if (!apiEndpoint) return null;
  try {
    const res = await fetch(`${apiEndpoint}/api/v1/beaches/${encodeURIComponent(slug)}`, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(2000),
      next: { revalidate: 3600 },
    } as RequestInit);
    if (!res.ok) return null;
    const json = (await res.json()) as { data?: { slug?: string } };
    return json.data?.slug ?? null;
  } catch {
    return null;
  }
}
