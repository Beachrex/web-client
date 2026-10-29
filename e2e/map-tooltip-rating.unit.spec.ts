import { readFileSync } from 'fs';
import { join } from 'path';
import { test, expect } from '@playwright/test';

/**
 * Owner, 2026-10-29: the beach tooltip on the map showed "⭐ 0.0" for every beach (a hardcoded 0), which read as
 * a bad rating. Beaches have no rating source yet, so the tooltip shows no rating badge (like PropertyCard).
 */
test('map beach tooltip shows no hardcoded 0.0 rating', () => {
  const tooltip = readFileSync(join(process.cwd(), 'src/components/Map/BeachMarkerTooltip.tsx'), 'utf8');
  expect(tooltip).not.toContain('Number(0)');
  expect(tooltip).not.toMatch(/<Star\b/);
  expect(tooltip).not.toMatch(/toFixed\(1\)/);
});
