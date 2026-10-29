import { readFileSync } from 'fs';
import { join } from 'path';
import { test, expect } from '@playwright/test';
import { buildBeachFocusMapUrl, buildPlaceMapUrl } from '@/lib/utils/beach-urls';
import { focusCenter, parseBeachFocus, withFocusedBeach } from '@/lib/utils/map-focus';

// The card mapper loads @/env: set its variables before the dynamic import.
process.env.SKIP_ENV_VALIDATION = '1';
process.env.NEXT_PUBLIC_CDN_TEASER = 'https://s3.beachrex.com/unsafe/fit-in/800x800/';
process.env.NEXT_PUBLIC_CDN_LARGE = 'https://s3.beachrex.com/unsafe/fit-in/2800x2800/';
process.env.NEXT_PUBLIC_CDN_ASSETS = 'https://beachrex.fra1.digitaloceanspaces.com/public/';

/**
 * Owner 2026-10-29: "Wherever cards have a map PIN marker, clicking it should redirect to the map page."
 * Beach cards → the map focused on that beach; country / region / island / city cards → the map filtered to the place.
 */
const read = (p: string) => readFileSync(join(process.cwd(), p), 'utf8');

test('beach focus map URL: beach_id plus coordinates, localized map slug', () => {
  expect(buildBeachFocusMapUrl('si', { id: 989, latitude: '45.54', longitude: '13.66' }))
    .toBe('/si/zemljevid-plaz?beach_id=989&lat=45.54&lng=13.66');
  expect(buildBeachFocusMapUrl('en', { id: '12', latitude: 43.1, longitude: 16.4 }))
    .toBe('/en/beach-map?beach_id=12&lat=43.1&lng=16.4');
  // Missing or placeholder coordinates: only the id (the map loads the beach and centers on it)
  expect(buildBeachFocusMapUrl('de', { id: 7 })).toBe('/de/strand-karte?beach_id=7');
  expect(buildBeachFocusMapUrl('en', { id: 7, latitude: '0', longitude: '0' })).toBe('/en/beach-map?beach_id=7');
  expect(buildBeachFocusMapUrl('en', { id: 7, latitude: 'x', longitude: '1' })).toBe('/en/beach-map?beach_id=7');
});

test('place map URL uses the banner map parameters (code first)', () => {
  expect(buildPlaceMapUrl('en', 'country', { code: 'HR', continent_code: 'EU', slug: 'croatia' }))
    .toBe('/en/beach-map?continent_code=EU&country=HR');
  expect(buildPlaceMapUrl('si', 'island', { code: 'hvar', id: 5, country_code: 'HR', slug: 'otok-hvar' }))
    .toBe('/si/zemljevid-plaz?country=HR&island=hvar');
  expect(buildPlaceMapUrl('en', 'region', { code: 'kvarner', country_code: 'HR' }))
    .toBe('/en/beach-map?country=HR&region=kvarner');
  expect(buildPlaceMapUrl('en', 'city', { id: 42, country_code: 'HR', slug: 'jelsa' }))
    .toBe('/en/beach-map?country=HR&city=42');
  expect(buildPlaceMapUrl('en', 'city', { slug: 'jelsa' })).toBe('/en/beach-map?city=jelsa');
  expect(buildPlaceMapUrl('en', 'country', {})).toBe('/en/beach-map');
});

test('focus parameters are parsed strictly', () => {
  const p = (q: string) => parseBeachFocus(new URLSearchParams(q));
  expect(p('beach_id=989&lat=45.54&lng=13.66')).toEqual({ id: 989, lat: 45.54, lng: 13.66 });
  expect(p('beach_id=989')).toEqual({ id: 989, lat: null, lng: null });
  expect(p('beach_id=989&lat=45.5')).toEqual({ id: 989, lat: null, lng: null });
  expect(p('beach_id=989&lat=200&lng=13')).toEqual({ id: 989, lat: null, lng: null });
  expect(p('country=HR')).toBeNull();
  expect(p('beach_id=abc')).toBeNull();
  expect(p('beach_id=0')).toBeNull();
  expect(p('beach_id=-3')).toBeNull();
  expect(parseBeachFocus(null)).toBeNull();
});

test('focus center: URL coordinates first, then the loaded beach', () => {
  expect(focusCenter({ id: 1, lat: 1, lng: 2 }, { latitude: '9', longitude: '9' })).toEqual([1, 2]);
  expect(focusCenter({ id: 1, lat: null, lng: null }, { latitude: '43.2', longitude: '16.6' })).toEqual([43.2, 16.6]);
  expect(focusCenter({ id: 1, lat: null, lng: null }, null)).toBeNull();
  expect(focusCenter(null, { latitude: '1', longitude: '2' })).toBeNull();
});

test('the focused beach is always on the map, once', () => {
  const a = { id: 1 };
  const b = { id: 2 };
  const focused = { id: 3 };
  expect(withFocusedBeach([a, b], focused)).toEqual([focused, a, b]);
  expect(withFocusedBeach([a, b], { id: 2 })).toEqual([a, b]);
  expect(withFocusedBeach([a, b], null)).toEqual([a, b]);
});

test('beach cards carry their coordinates', async () => {
  const { mapBeachToProperty } = await import('@/lib/mappers/mapBeachToProperty');
  const p = mapBeachToProperty({ id: 5, name: 'X', main_image: 'a.jpg', latitude: '43.1', longitude: '16.4' });
  expect(p?.latitude).toBe('43.1');
  expect(p?.longitude).toBe('16.4');
  expect(read('src/components/DynamicSearchBeaches.tsx')).toContain('latitude: b.latitude ?? null,');
});

test('the beach card pin links to the focused map (the map page list keeps its in-place zoom)', () => {
  const card = read('src/components/PropertyCard/PropertyCard.tsx');
  expect(card).toContain('buildBeachFocusMapUrl(locale, { id: Number(id), latitude, longitude })');
  expect(card).toMatch(/<Link\s+href=\{mapUrl\}\s+prefetch=\{false\}\s+onClick=\{\(e\) => e\.stopPropagation\(\)\}\s+data-testid="card-map-pin"/);
  expect(card).toContain("aria-label={t('showOnMap', { title })}");
  expect(card).toContain('{onLocationClick || !mapUrl ? (');
  expect(card).toContain('focus-visible:ring-2');
});

test('place card pins link to the filtered map without nesting links', () => {
  const card = read('src/components/DestinationCard.tsx');
  expect(card).toMatch(/<Link\s+href=\{mapUrl\}\s+prefetch=\{false\}\s+data-testid="destination-card-map-pin"/);
  expect(card).toContain("aria-label={tCard('showOnMap', { title: name })}");
  // The card link is a stretched sibling (absolute inset-0), not a wrapper around the pin
  expect(card).toMatch(/<Link\s+href=\{url\}[^>]*className="absolute inset-0 z-10/);
  expect(card).toContain('relative z-20');
  expect(card).not.toMatch(/<Link\s+href=\{url\}\s+className="flex h-\[310px\]/);

  expect(read('src/components/DestinationsCarousel.tsx').match(/mapUrl=\{c\.mapUrl\}/g)).toHaveLength(2);
  expect(read('src/components/DestinationsSection.tsx')).toContain('mapUrl: buildPlaceMapUrl(locale, section.type, item as MapPlace)');
  expect(read('src/components/Continent/ContinentCountriesSection.tsx')).toContain("mapUrl: buildPlaceMapUrl(locale, 'country', c)");
});

test('the map page focuses the beach from beach_id and shows it outside the filters', () => {
  const map = read('src/components/Map/MapWithSidebar.tsx');
  expect(map).toContain('parseBeachFocus(searchParams)');
  expect(map).toContain('getBeachByIdentifierOptions({ path: { identifier: focus?.id ?? 0 } })');
  expect(map).toContain('withFocusedBeach(beaches, focusedBeach)');
  expect(map.match(/beaches=\{mapBeaches\}/g)).toHaveLength(2);
  expect(map).toContain('setSelectedBeachId(focus.id);');
});

test('beach_id / lat / lng are not shown as filter chips', () => {
  expect(read('src/lib/utils/filter-chips.ts')).toContain("'beach_id', 'lat', 'lng'");
});
