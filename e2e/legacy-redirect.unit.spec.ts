import { test, expect } from '@playwright/test';
import { buildLegacyTargetUrl, legacySlovenianPath } from '@/lib/utils/legacy-redirect';
import { buildBeachMapUrl, getBeachesWord } from '@/lib/utils/beach-urls';

/**
 * Old beachrex.com URLs redirect to the new pages (TASK-004 step 5b). The backend resolves the
 * old path; these helpers handle the old `/sl` prefix and build the new localized URL.
 */

test('old /sl prefix maps to /si, other paths are left alone', () => {
  expect(legacySlovenianPath('/sl')).toBe('/si');
  expect(legacySlovenianPath('/sl/hrvaska/istra/labin-plaze/plaza-sveta-marina')).toBe(
    '/si/hrvaska/istra/labin-plaze/plaza-sveta-marina',
  );
  expect(legacySlovenianPath('/si/plaze')).toBeNull();
  expect(legacySlovenianPath('/slovenia')).toBeNull();
  expect(legacySlovenianPath('/en/sl')).toBeNull();
});

test('beach target becomes the localized beach URL', () => {
  expect(
    buildLegacyTargetUrl({ type: 'beach', segments: ['europa', 'hrvatska', 'dalmacija-sibenik', 'tisno', 'plaza-tisno'] }, 'hr'),
  ).toBe(`/hr/${getBeachesWord('hr')}/europa/hrvatska/dalmacija-sibenik/tisno/plaza-tisno`);
});

test('country target and map target', () => {
  expect(buildLegacyTargetUrl({ type: 'country', segments: ['europe', 'croatia'] }, 'de')).toBe(
    `/de/${getBeachesWord('de')}/europe/croatia`,
  );
  expect(buildLegacyTargetUrl({ type: 'map', segments: [] }, 'it')).toBe(buildBeachMapUrl('it'));
});

test('no target, or too few segments, gives no redirect (→ 404)', () => {
  expect(buildLegacyTargetUrl(null, 'en')).toBeNull();
  expect(buildLegacyTargetUrl({ type: 'country', segments: ['europe'] }, 'en')).toBeNull();
  expect(buildLegacyTargetUrl({ type: 'beach', segments: [] }, 'en')).toBeNull();
});
