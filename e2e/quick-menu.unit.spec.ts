import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { test, expect } from '@playwright/test';

/**
 * Owner request 2026-10-29: the top quick menu had a "Beach view" (Prikaz plaže) item that linked
 * nowhere meaningful. It is removed; the menu keeps the other five categories in order.
 */

const read = (p: string) => readFileSync(join(process.cwd(), p), 'utf8');
const source = read('src/components/Header/QuickMenu.tsx');

test('quick menu has no "Beach view" item', () => {
  expect(source).not.toContain('quickMenuBeachDisplay');
  expect(source).not.toContain('beachShowType.svg');
});

test('quick menu keeps the remaining categories in order', () => {
  const keys = [...source.matchAll(/labelKey: '(\w+)'/g)].map((m) => m[1]);
  expect(keys).toEqual([
    'quickMenuWorldBeaches',
    'quickMenuBeachType',
    'quickMenuUserType',
    'quickMenuBeachServices',
    'quickMenuTopBeaches',
  ]);
});

test('the unused "Beach view" message key is gone from every locale', () => {
  const files = readdirSync(join(process.cwd(), 'messages')).filter((f) => f.endsWith('.json'));
  expect(files).toHaveLength(19);
  for (const f of files) {
    const common = JSON.parse(read(`messages/${f}`)).Common ?? {};
    expect(common, f).not.toHaveProperty('quickMenuBeachDisplay');
    expect(common, f).toHaveProperty('quickMenuBeachServices');
  }
});
