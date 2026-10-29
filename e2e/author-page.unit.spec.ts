import { test, expect } from '@playwright/test';
import { existsSync, readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import { AUTHOR_BEACH_PHOTO, AUTHOR_PATH, AUTHOR_PHOTO, AUTHOR_ROUTE, AUTHOR_STATS, numberLocale } from '@/lib/constants/author';

/** Owner, 2026-10-08: a dedicated page about the author, Gregor Balažic, in all 19 locales. */

type Author = { countries: Record<string, string>; stats: Record<string, string>; metaTitle: string; metaDescription: string };

test('every locale has the full author text, every country and stat label', () => {
  const dir = join(process.cwd(), 'messages');
  const files = readdirSync(dir).filter((f) => f.endsWith('.json'));
  expect(files).toHaveLength(19);
  for (const f of files) {
    const a = (JSON.parse(readFileSync(join(dir, f), 'utf8')) as { AuthorPage: Author }).AuthorPage;
    for (const c of AUTHOR_ROUTE) expect(a.countries[c], `${f} ${c}`).toBeTruthy();
    for (const s of AUTHOR_STATS) expect(a.stats[s.key], `${f} ${s.key}`).toBeTruthy();
    expect(a.metaTitle.length, f).toBeLessThanOrEqual(60);
    expect(a.metaDescription.length, f).toBeLessThanOrEqual(160);
  }
});

test('photos exist, path is the name, numbers are grouped like the text', () => {
  expect(existsSync(join(process.cwd(), 'public', AUTHOR_PHOTO))).toBe(true);
  expect(existsSync(join(process.cwd(), 'public', AUTHOR_BEACH_PHOTO))).toBe(true);
  expect(AUTHOR_PATH).toBe('/gregor-balazic');
  const opts = { useGrouping: 'always' } as unknown as Intl.NumberFormatOptions;
  expect(new Intl.NumberFormat(numberLocale('si'), opts).format(2445)).toBe('2.445');
  expect(numberLocale('ua')).toBe('uk');
});
