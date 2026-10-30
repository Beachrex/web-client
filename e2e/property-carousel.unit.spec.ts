import { readFileSync } from 'fs';
import { join } from 'path';
import { test, expect } from '@playwright/test';

/**
 * Owner, 2026-10-30: in the beach panel on the map page the "Nearby beaches" carousel squeezed one card into a quarter
 * of the width with both arrows over it. Columns now follow itemsPerSlide, arrows show only with more than one slide.
 */
const read = (p: string) => readFileSync(join(process.cwd(), p), 'utf8');

test('carousel columns follow itemsPerSlide, not window breakpoints', () => {
  const carousel = read('src/components/PropertySection/PropertyCarousel.tsx');
  expect(carousel).toContain('gridTemplateColumns: `repeat(${itemsPerSlide}, minmax(0, 1fr))`');
  expect(carousel).not.toMatch(/className="[^"]*lg:grid-cols-3/);
});

test('carousel arrows only with more than one slide, with accessible labels', () => {
  const carousel = read('src/components/PropertySection/PropertyCarousel.tsx');
  expect(carousel).toContain('{slides.length > 1 && (');
  expect(carousel).toContain("aria-label={c('paginationPrevious')}");
  expect(carousel).toContain("aria-label={c('paginationNext')}");
});

test('in the map panel the section uses a smaller title and padding', () => {
  const section = read('src/components/PropertySection.tsx');
  expect(section).toContain("embedded ? 'py-8'");
  expect(section).toContain("embedded ? 'text-[22px]'");
});
