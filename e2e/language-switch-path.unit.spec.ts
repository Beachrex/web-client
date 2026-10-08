import { test, expect } from '@playwright/test';
import { locales } from '@/app/config/locales';
import { getBeachMapWord, getBeachesWord } from '@/lib/utils/beach-urls';

/**
 * TASK-004 audit B9: the language switch had its own "beaches" word map without da/pt/nl/el/sq,
 * so switching from e.g. /da/straande kept the Danish word, and the beach map word was never
 * translated. It now uses the shared URL builders for all 19 locales.
 */

test('every locale\'s beaches word is recognised and translated to every other locale', async () => {
  const { isBeachesWord, translateFixedPath } = await import('@/lib/utils/locale-path-words');
  for (const from of locales) {
    expect(isBeachesWord(getBeachesWord(from)), from).toBe(true);
    for (const to of locales) {
      expect(translateFixedPath([getBeachesWord(from)], to)).toBe(`/${getBeachesWord(to)}`);
      expect(translateFixedPath([getBeachMapWord(from)], to)).toBe(`/${getBeachMapWord(to)}`);
    }
  }
});

test('only fixed paths are translated here; deeper beaches paths go through the API lookup', async () => {
  const { isBeachesWord, translateFixedPath } = await import('@/lib/utils/locale-path-words');
  expect(translateFixedPath(['straande', 'europa'], 'en')).toBeNull();
  expect(translateFixedPath(['p', 'about-us'], 'de')).toBeNull();
  expect(translateFixedPath([], 'de')).toBeNull();
  expect(isBeachesWord('stranden')).toBe(true);
  expect(isBeachesWord('p')).toBe(false);
  expect(isBeachesWord(undefined)).toBe(false);
});
