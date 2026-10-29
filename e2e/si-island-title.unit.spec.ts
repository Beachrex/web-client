import { readFileSync } from 'fs';
import { join } from 'path';
import { test, expect } from '@playwright/test';

/** Mobile report 2026-10-09: the Slovenian country/region page heading said "Otoški {country}" (an adjective). */
test('Slovenian islands heading is the noun "Otoki", like Regije/Mesta', () => {
  const si = JSON.parse(readFileSync(join(process.cwd(), 'messages/si.json'), 'utf8')) as {
    countryPage: { islandsTitle: string };
  };
  expect(si.countryPage.islandsTitle).toBe('Otoki {country}');
});
