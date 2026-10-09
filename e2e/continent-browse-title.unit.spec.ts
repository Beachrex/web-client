import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { test, expect } from '@playwright/test';

/**
 * Mobile report 2026-10-09: "Brskaj po vseh plažah Evrope" had Europe written into the text, so every
 * continent page (Asia, Africa, …) said Europe, in all 19 languages. The continent now comes as {continent}.
 */
const root = process.cwd();

test('the continent page "browse all beaches" title takes the continent name in every language', () => {
  for (const f of readdirSync(join(root, 'messages')).filter((x) => x.endsWith('.json'))) {
    const title = (JSON.parse(readFileSync(join(root, 'messages', f), 'utf8')) as { SearchBeach: { title: string } })
      .SearchBeach.title;
    expect(title, f).toContain('{continent}');
  }
  expect(readFileSync(join(root, 'src/app/[locale]/beaches/[continent]/page.tsx'), 'utf8'))
    .toContain("titleParams={{ continent: continent.name ?? '' }}");
});

test('Slovenian labels: capitalised "Plaže:" and "Države s plažami"', () => {
  const si = JSON.parse(readFileSync(join(root, 'messages/si.json'), 'utf8')) as {
    Common: { numBeaches: string };
    WorldTopBar: { countriesWithBeachesLabel: string };
  };
  expect(si.Common.numBeaches).toBe('Plaže: ');
  expect(si.WorldTopBar.countriesWithBeachesLabel).toBe('Države s plažami');
});
