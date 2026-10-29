import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import { test, expect } from '@playwright/test';
import { getBeachesWord } from '@/lib/utils/beach-urls';

// Set before the modules (and @/env) are loaded.
process.env.SKIP_ENV_VALIDATION = '1';
process.env.NEXT_PUBLIC_BASE_URL = 'https://beachrex.com';
process.env.NEXT_PUBLIC_CDN_TEASER = 'https://s3.beachrex.com/unsafe/fit-in/800x800/';
process.env.NEXT_PUBLIC_CDN_LARGE = 'https://s3.beachrex.com/unsafe/fit-in/2800x2800/';
process.env.NEXT_PUBLIC_CDN_ASSETS = 'https://beachrex.fra1.digitaloceanspaces.com/public/';

/**
 * TASK-004 SEO: region, island and city pages fetched their data in the browser, so the server
 * HTML had no name, no h1, no beach cards, and the title was the capitalised slug.
 * The route now fetches on the server and passes the data down; only the weather loads later.
 */

const root = process.cwd();
const read = (p: string) => readFileSync(join(root, p), 'utf8');
const route = read('src/app/[locale]/beaches/[continent]/[country]/[...segments]/page.tsx');
const pages = {
  region: read('src/components/Pages/RegionListingPage.tsx'),
  island: read('src/components/Pages/IslandListingPage.tsx'),
  city: read('src/components/Pages/CityListingPage.tsx'),
};

test('the route fetches region, island and city data on the server', () => {
  expect(route).not.toMatch(/require\('@\/components\/Pages\//);
  expect(route).toMatch(/fetchRegionPageData/);
  expect(route).toMatch(/fetchIslandPageData/);
  expect(route).toMatch(/fetchCityPageData/);
  expect(route).toMatch(/buildDestinationMetadata/);
  expect(route).toMatch(/buildDestinationSchema/);
});

test('the page components render the server data and do not fetch it in the browser', () => {
  for (const [kind, source] of Object.entries(pages)) {
    expect(source, kind).toMatch(/initialData: \w+PageData;/);
    expect(source, kind).not.toMatch(/use(Region|Island|City)Details|useCities|useIslands|useMostVisitedBeaches/);
    // No English loading/error placeholders and no test city name in the server HTML (audit D6)
    expect(source, kind).not.toMatch(/Loading (region|island)|Failed to load|'Malinska'/);
  }
});

test('title and description come from the SEO messages of each page type', async () => {
  const { buildDestinationSeoText } = await import('@/lib/utils/destination-seo');
  const calls: [string, Record<string, string>][] = [];
  const t = (key: string, values: Record<string, string>) => {
    calls.push([key, values]);
    return `${key}:${Object.values(values).join('|')}`;
  };

  expect(buildDestinationSeoText('region', 'Istra', 'Hrvaška', t)).toEqual({
    title: 'regionTitle:Istra|Hrvaška',
    description: 'regionDescription:Istra|Hrvaška',
  });
  expect(calls[0]).toEqual(['regionTitle', { regionName: 'Istra', countryName: 'Hrvaška' }]);

  buildDestinationSeoText('island', 'Krk', 'Hrvaška', t);
  expect(calls[2]).toEqual(['islandTitle', { islandName: 'Krk', countryName: 'Hrvaška' }]);
  buildDestinationSeoText('city', 'Bol', 'Hrvaška', t);
  expect(calls[4]).toEqual(['cityTitle', { cityName: 'Bol', countryName: 'Hrvaška' }]);

  const long = buildDestinationSeoText('city', 'x'.repeat(300), 'y', t);
  // truncateTitle/truncateDescription: 60/160 characters plus "..."
  expect(long.title.length).toBeLessThanOrEqual(63);
  expect(long.description.length).toBeLessThanOrEqual(163);
  expect(long.title.endsWith('...')).toBe(true);
});

test('every locale has the SEO title/description with the parameters the helper sends', () => {
  const dir = join(root, 'messages');
  const locales = readdirSync(dir).filter((f) => f.endsWith('.json'));
  expect(locales).toHaveLength(19);
  for (const file of locales) {
    const seo = (JSON.parse(readFileSync(join(dir, file), 'utf8')) as { SEO: Record<string, string> }).SEO;
    for (const [kind, param] of [['region', 'regionName'], ['island', 'islandName'], ['city', 'cityName']]) {
      for (const key of [`${kind}Title`, `${kind}Description`]) {
        expect(seo[key], `${file} SEO.${key}`).toContain(`{${param}}`);
      }
    }
  }
});

test('canonical path uses the locale\'s beaches word and the resolved segments', async () => {
  const { buildDestinationPath } = await import('@/lib/utils/destination-seo');
  expect(buildDestinationPath('si', 'evropa', 'hrvaska', ['dalmacija', 'brac', 'bol'])).toBe(
    `/${getBeachesWord('si')}/evropa/hrvaska/dalmacija/brac/bol`,
  );
});

test('Place JSON-LD names the country and the coordinates', async () => {
  const { buildDestinationSchema } = await import('@/lib/utils/json-ld-helpers');
  const schema = buildDestinationSchema({
    name: 'Bol',
    url: 'https://beachrex.com/hr/plaze/europa/hrvatska/dalmacija/brac/bol',
    description: 'Plaže u Bolu',
    mainImage: 'img/cities/bol.jpg',
    latitude: 43.26,
    longitude: 16.65,
    countryName: 'Hrvatska',
  });
  expect(schema['@type']).toBe('Place');
  expect(schema.geo).toEqual({ '@type': 'GeoCoordinates', latitude: 43.26, longitude: 16.65 });
  expect(schema.containedInPlace).toEqual({ '@type': 'Country', name: 'Hrvatska' });
  expect(String(schema.image)).toContain('bol.jpg');

  const bare = buildDestinationSchema({ name: 'X', url: 'u', latitude: null, longitude: 1, countryName: null });
  expect(bare.geo).toBeUndefined();
  expect(bare.containedInPlace).toBeUndefined();
  expect(bare.image).toBeUndefined();
});
