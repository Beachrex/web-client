import { existsSync, readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { test, expect } from '@playwright/test';

process.env.SKIP_ENV_VALIDATION = '1';

/**
 * AI-3 (owner 2026-10-09: "AI načrtovalec potovanj mora delat 100% zelo dobro, da ga lahko prodajamo"):
 * the old form sent any free-text destination as Croatia, any number of days and free-text interests that
 * the API rejects. The planner now sends only values the API accepts and shows real prices.
 */
const root = process.cwd();

test('the request carries the chosen country, region, length and wishes in the API format', async () => {
  const { buildItineraryRequest, DEFAULT_FORM } = await import('@/lib/utils/itinerary');

  expect(
    buildItineraryRequest({
      ...DEFAULT_FORM,
      countryCode: 'it',
      regionSlug: 'sardinia',
      days: 14,
      interests: ['snorkeling', 'quiet'],
      surfaces: ['sand'],
      pace: 'relaxed',
      adults: 2,
      children: 1,
    }),
  ).toEqual({
    destination: { country_code: 'IT', region_slug: 'sardinia' },
    duration_days: 14,
    travel_party: { adults: 2, children: 1 },
    preferences: { pace: 'relaxed', interests: ['snorkeling', 'quiet'], surface_types: ['sand'] },
  });

  const minimal = buildItineraryRequest({ ...DEFAULT_FORM, countryCode: 'HR' });
  expect(minimal.destination).toEqual({ country_code: 'HR' });
  expect(minimal.preferences).toEqual({ pace: 'balanced' });
});

test('the form only offers values the backend validation accepts', async () => {
  const { INTERESTS, SURFACES, PACES, TRIP_LENGTHS } = await import('@/lib/utils/itinerary');
  const rulesFile = join(root, '..', 'backend', 'app', 'Http', 'Requests', 'AI', 'ItineraryRequest.php');
  // The backend repo sits next to this one in the agent workspace; in CI only this repo exists.
  test.skip(!existsSync(rulesFile), 'backend repo not checked out');
  const rules = readFileSync(rulesFile, 'utf8');
  const allowed = (field: string) => {
    const m = rules.match(new RegExp(`'${field.replace(/[.*]/g, (c) => `\\${c}`)}' => '[^']*in:([^'|]+)`));
    return m?.[1] ? m[1].split(',') : null;
  };

  expect(TRIP_LENGTHS.map(String)).toEqual(allowed('duration_days'));
  for (const i of INTERESTS) expect(allowed('preferences.interests.*')).toContain(i);
  for (const s of SURFACES) expect(allowed('preferences.surface_types.*')).toContain(s);
  for (const p of PACES) expect(allowed('preferences.pace')).toContain(p);
});

test('prices are formatted from the API amount and currency in the page language', async () => {
  const { formatPrice, productFor } = await import('@/lib/utils/itinerary');
  const products = [
    { product_type: 'itinerary_3day', days: 3, amount: 19, currency: 'EUR', credits: 1 },
    { product_type: 'itinerary_7day', days: 7, amount: 39.5, currency: 'EUR', credits: 1 },
  ];

  expect(productFor(products, 7)?.product_type).toBe('itinerary_7day');
  expect(productFor(products, 14)).toBeUndefined();
  expect(formatPrice(products[0]!, 'si')).toMatch(/^19\s?€$/);
  expect(formatPrice(products[1]!, 'en')).toBe('€39.50');
});

test('API errors map to messages that say whether the plan was used', async () => {
  const { itineraryErrorKey } = await import('@/lib/utils/itinerary');

  expect(itineraryErrorKey(402)).toBe('buyRequired');
  expect(itineraryErrorKey(401)).toBe('signInRequired');
  expect(itineraryErrorKey(422, { error: 'not_enough_beaches' })).toBe('notEnoughBeaches');
  expect(itineraryErrorKey(422, { error: 'validation' })).toBe('error');
  expect(itineraryErrorKey(503)).toBe('busy');
  expect(itineraryErrorKey(500)).toBe('error');
});

test('credits per trip length come from the entitlements response', async () => {
  const { creditsFromEntitlements } = await import('@/lib/utils/itinerary');

  expect(creditsFromEntitlements({ itinerary_3day_credits: 1, itinerary_7day_credits: 0, itinerary_14day_credits: 2 })).toEqual({ 3: 1, 7: 0, 14: 2 });
  expect(creditsFromEntitlements(undefined)).toEqual({ 3: 0, 7: 0, 14: 0 });
});

test('every planner text exists in all 19 languages with the same placeholders', () => {
  const dir = join(root, 'messages');
  const files = readdirSync(dir).filter((f) => f.endsWith('.json'));
  expect(files).toHaveLength(19);
  const flat = (o: Record<string, unknown>, p = ''): Record<string, string> =>
    Object.entries(o).reduce<Record<string, string>>((acc, [k, v]) => {
      if (typeof v === 'string') acc[p + k] = v;
      else Object.assign(acc, flat(v as Record<string, unknown>, `${p}${k}.`));
      return acc;
    }, {});
  const block = (f: string) =>
    flat((JSON.parse(readFileSync(join(dir, f), 'utf8')) as { AI: { itinerary: Record<string, unknown> } }).AI.itinerary);
  const en = block('en.json');
  const vars = (s: string) => (s.match(/\{\w+\}/g) ?? []).sort().join();

  for (const f of files) {
    const other = block(f);
    expect(Object.keys(other).sort(), f).toEqual(Object.keys(en).sort());
    for (const k of Object.keys(en)) expect(vars(other[k]!), `${f} ${k}`).toBe(vars(en[k]!));
  }
});
