import { locales } from '@/app/config/locales';
import { getBeachMapWord, getBeachesWord } from '@/lib/utils/beach-urls';

/** Every locale's "beaches" and "beach map" URL word (a URL may use another locale's word). */
const ALL_BEACHES_WORDS = new Set(locales.map(getBeachesWord));
const ALL_BEACH_MAP_WORDS = new Set(locales.map(getBeachMapWord));

/**
 * Paths whose words are fixed per locale (no API lookup): the world beaches page and the beach map.
 * Returns `null` for any other path.
 */
export function translateFixedPath(segments: string[], targetLocale: string): string | null {
  const [first, ...rest] = segments;
  if (!first) return null;
  if (ALL_BEACH_MAP_WORDS.has(first) && rest.length === 0) return `/${getBeachMapWord(targetLocale)}`;
  if (ALL_BEACHES_WORDS.has(first) && rest.length === 0) return `/${getBeachesWord(targetLocale)}`;
  return null;
}

export const isBeachesWord = (segment: string | undefined): boolean =>
  segment !== undefined && ALL_BEACHES_WORDS.has(segment);
