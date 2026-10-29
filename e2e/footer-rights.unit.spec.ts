import { test, expect } from '@playwright/test';
import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';

/** Owner, 2026-10-08: the footer names the company and the brand, with the year, in every locale. */
test('footer rights line names MOJA PLAŽA, d.o.o. and BeachRex with the year in all 19 locales', () => {
  const dir = join(process.cwd(), 'messages');
  const files = readdirSync(dir).filter((f) => f.endsWith('.json'));
  expect(files).toHaveLength(19);
  for (const f of files) {
    const rights = (JSON.parse(readFileSync(join(dir, f), 'utf8')) as { Footer: { legal: { rights: string } } })
      .Footer.legal.rights;
    expect(rights, f).toMatch(/^© \{year\} MOJA PLAŽA, d\.o\.o\. · BeachRex\. \S/);
  }
});
