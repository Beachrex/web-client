import { readFileSync } from 'fs';
import { join } from 'path';
import { test, expect } from '@playwright/test';
import { FEATURES } from '../src/lib/constants/features';

/** Owner 2026-10-12: the fixed "Scenic town" / "Sea experiences" badges on destination cards are hidden. */
test('destination card badges are hidden behind the placeCardBadges flag', () => {
  expect(FEATURES.placeCardBadges).toBe(false);
  const card = readFileSync(join(process.cwd(), 'src/components/DestinationCard.tsx'), 'utf8');
  expect(card).toContain('{FEATURES.placeCardBadges && badgeLabel && (');
  expect(card.match(/\{badgeLabel\}/g)).toHaveLength(1);
});
