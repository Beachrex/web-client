import { readFileSync } from 'fs';
import { join } from 'path';
import { test, expect } from '@playwright/test';
import { FEATURES } from '../src/lib/constants/features';

/**
 * Owner 2026-10-21: the "from 0 €" accommodation price badge on beach cards (list and map) is hidden,
 * there are no accommodation prices yet. It comes back with FEATURES.accommodation.
 */
test('the accommodation price badge on beach cards is hidden behind the accommodation flag', () => {
  expect(FEATURES.accommodation).toBe(false);
  const card = readFileSync(join(process.cwd(), 'src/components/PropertyCard/PropertyCard.tsx'), 'utf8');
  const priceAt = card.indexOf("t('priceFrom'");
  const gateAt = card.lastIndexOf('{FEATURES.accommodation && (', priceAt);
  expect(priceAt).toBeGreaterThan(-1);
  expect(gateAt).toBeGreaterThan(-1);
  // The gate must be the block that holds the badge: no closing of a JSX conditional in between.
  expect(card.slice(gateAt, priceAt)).not.toContain(')}');
  expect(card.match(/t\('priceFrom'/g)).toHaveLength(1);
});

/** Owner 2026-10-21: the accommodation buttons with no action (continent search, beach banner) are hidden too. */
test('the accommodation buttons on the continent search and the beach banner are behind the flag', () => {
  for (const f of ['src/components/Continent/SearchContinent.tsx', 'src/components/Beach/BeachBanner/BeachBannerSection.tsx']) {
    const src = readFileSync(join(process.cwd(), f), 'utf8');
    const iconAt = src.indexOf('/images/accomodation.png');
    const gateAt = src.lastIndexOf('{FEATURES.accommodation && (', iconAt);
    expect(iconAt, f).toBeGreaterThan(-1);
    expect(gateAt, f).toBeGreaterThan(-1);
    expect(src.slice(gateAt, iconAt), f).not.toContain(')}');
  }
});
