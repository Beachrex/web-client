import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { test, expect } from '@playwright/test';

process.env.SKIP_ENV_VALIDATION = '1';

/**
 * Favorites on the web (owner 2026-10-09, "ja, potrjujem"): hearts on beach cards and the beach page,
 * a "My favorite beaches" page linked from the top bar, sign-in dialog for signed-out visitors.
 */
const root = process.cwd();
const read = (f: string) => readFileSync(join(root, f), 'utf8');

test('the API error for a full list maps to its own message; other failures to a generic one', async () => {
  const { favoriteErrorKey } = await import('@/lib/utils/favorites');

  expect(favoriteErrorKey({ error: 'favorites_limit', limit: 500 })).toBe('limit');
  expect(favoriteErrorKey({ error: 'validation' })).toBe('error');
  expect(favoriteErrorKey(undefined)).toBe('error');
});

test('saving puts the beach first without duplicates; removing drops it', async () => {
  const { toggledIds } = await import('@/lib/utils/favorites');

  expect(toggledIds([3, 2], 5, true)).toEqual([5, 3, 2]);
  expect(toggledIds([3, 5, 2], 5, true)).toEqual([5, 3, 2]);
  expect(toggledIds([3, 5, 2], 5, false)).toEqual([3, 2]);
});

test('the heart is on beach cards, the beach page and the top bar (a link to the favorites page)', () => {
  expect(read('src/lib/constants/features.ts')).toMatch(/favorites: true/);
  expect(read('src/components/PropertyCard/PropertyCard.tsx')).toContain('<FavoriteButton beachId={Number(id)} />');
  expect(read('src/components/Beach/BeachBanner/TopBarBeachRight.tsx')).toContain('<FavoriteButton beachId={beachId} variant="banner" />');
  expect(read('src/components/Beach/BeachBanner/BeachBannerSection.tsx')).toContain('<TopBarBeachRight beachId={beachId} />');
  expect(read('src/components/Header/TopBar.tsx').match(/href="\/favorites"/g)).toHaveLength(2);
  // Cards from the beach search carry the beach id, so their heart works too.
  expect(read('src/components/DynamicSearchBeaches.tsx')).toContain('id: String(b.id)');
});

test('the favorites page uses the owner-only API and is never indexed', () => {
  expect(read('src/hooks/useFavorites.ts')).toContain('getMyFavorites(');
  expect(read('src/app/[locale]/favorites/layout.tsx')).toContain('robots: { index: false, follow: false }');
  expect(read('src/components/Favorites/FavoriteButton.tsx')).toContain('<SignInOptions />');
});

test('every favorites text exists in all 19 languages', () => {
  const dir = join(root, 'messages');
  const files = readdirSync(dir).filter((f) => f.endsWith('.json'));
  expect(files).toHaveLength(19);
  const block = (f: string) =>
    (JSON.parse(readFileSync(join(dir, f), 'utf8')) as { Favorites: Record<string, string> }).Favorites;
  const en = block('en.json');

  for (const f of files) {
    const other = block(f);
    expect(Object.keys(other).sort(), f).toEqual(Object.keys(en).sort());
    for (const v of Object.values(other)) expect(v.trim(), f).not.toBe('');
  }
});

test('cards show the star only with a real rating (no "0.0" badge, owner 2026-10-09)', () => {
  const card = read('src/components/PropertyCard/PropertyCard.tsx');
  expect(card).toContain('{Number(rating) > 0 && (');
  expect(card).not.toContain('Number(rating ?? 0).toFixed(1)');
});
