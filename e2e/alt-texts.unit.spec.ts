import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import { test, expect } from '@playwright/test';

/**
 * TASK-004 A6: no hard-coded English alt texts ("Accommodation 1", "image 0", "Map icon", …). Decorative icons
 * next to visible text use alt="" (screen readers skip them); images that are the only content of a button or
 * link get a translated alt; photos use the beach name. Brand names are the same in every language.
 */
const BRANDS = new Set(['BeachRex', 'Facebook', 'Instagram', 'YouTube']);

const files = (dir: string): string[] =>
  readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? files(p) : p.endsWith('.tsx') ? [p] : [];
  });

test('alt texts are empty (decorative), translated, data-driven or a brand name', () => {
  const offenders: string[] = [];
  for (const f of files(join(process.cwd(), 'src'))) {
    for (const m of readFileSync(f, 'utf8').matchAll(/alt="([^"]+)"/g)) {
      if (!BRANDS.has(m[1]!)) offenders.push(`${f.replace(process.cwd(), '')}: ${m[1]}`);
    }
  }
  expect(offenders).toEqual([]);
});
