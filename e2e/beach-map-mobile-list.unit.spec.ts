import { readFileSync } from 'fs';
import { join } from 'path';
import { test, expect } from '@playwright/test';

/**
 * Owner 2026-10-10 (iPhone 16 Pro video, /en/beach-map): the Filters button reacted only after seconds and the
 * list jumped. On phones the page scrolls, so the list had no fixed height and react-window rendered all
 * 2 876 rows (one 894 000 px tall element). Phones now show a page of cards plus "show more".
 */
const source = readFileSync(join(process.cwd(), 'src/components/Map/VirtualizedBeachList.tsx'), 'utf8');

test('phones get a paged list, decided by the screen width', () => {
  expect(source).toContain('export const MOBILE_PAGE_SIZE = 20;');
  expect(source).toContain('window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)');
  expect(source).toMatch(/if \(isPhone\) \{[\s\S]*beaches\.slice\(0, mobileVisible\)/);
  expect(source).toContain("tFilter('showMore', { count: Math.min(MOBILE_PAGE_SIZE, remaining) })");
});

test('a new result set starts again at the first page', () => {
  const reset = /renderedRowsRef\.current\.clear\(\);\s*setMobileVisible\(MOBILE_PAGE_SIZE\);\s*\}, \[beaches\]\);/;
  expect(source).toMatch(reset);
});

test('desktop keeps the virtualized list', () => {
  expect(source).toContain('<List');
  expect(source).not.toMatch(/if \(isMobile\) \{\s*const remaining/);
});
