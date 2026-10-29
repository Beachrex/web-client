import { readFileSync } from 'fs';
import { join } from 'path';
import { test, expect } from '@playwright/test';

/**
 * Owner 2026-10-09 (Risskov / Murter screenshots): the "Browse all beaches" list showed beaches of every
 * country and loaded slowly — it sent the place slug (ignored by the API), downloaded every beach and paged
 * in the browser. Now: place code, one server page at a time, first page in the server HTML.
 */
const read = (p: string) => readFileSync(join(process.cwd(), p), 'utf8');

test('the list asks the server for one page; the download-everything hook is gone', () => {
  const list = read('src/components/DynamicSearchBeaches.tsx');
  expect(list).toContain('useBeachPage(');
  expect(list).not.toContain('useAllBeaches');
  expect(list).not.toContain('.slice(\n    (currentPage - 1)');
  expect(list).not.toContain("value: 'rating'"); // there are no ratings to sort by
  expect(list).toContain('<Suspense fallback={<FirstPageFallback {...props} />}>');
  const hook = read('src/hooks/useBeaches.ts');
  expect(hook).not.toContain('export function useAllBeaches');
  expect(hook).toContain('per_page: BEACH_PAGE_SIZE');
});

test('place pages pass the place code and the server-rendered first page', () => {
  for (const page of ['City', 'Region', 'Island']) {
    const source = read(`src/components/Pages/${page}ListingPage.tsx`);
    expect(source, page).toContain('baseFilters={initialData.listFilters}');
    expect(source, page).toContain('initialPage={initialData.firstPage}');
  }
  const data = read('src/lib/server/destination-page-data.ts');
  expect(data).toContain('{ city: placeFilterValue(details, slug) }');
  expect(data).toContain('city_code: details.code ?? slug');
  expect(read('src/app/[locale]/beaches/[continent]/[country]/page.tsx')).toContain('initialPage={firstBeachPage}');
  expect(read('src/app/[locale]/beaches/page.tsx')).toContain('initialPage={firstBeachPage}');
});

test('place filter value prefers the code, then the id, then the slug', async () => {
  const { placeFilterValue, BEACH_PAGE_SIZE } = await import('@/lib/utils/beach-list');
  expect(placeFilterValue({ code: 'murter', id: 7 }, 'murter-si')).toBe('murter');
  expect(placeFilterValue({ code: null, id: 7 }, 'x')).toBe(7);
  expect(placeFilterValue({}, 'x')).toBe('x');
  expect(BEACH_PAGE_SIZE).toBe(16);
});

test('the beach sitemap pages through all beaches (100 per page)', () => {
  const sitemap = read('src/lib/seo/sitemap-sections.ts');
  expect(sitemap).toContain('/api/v1/beaches?limit=100&page=${page}');
  expect(sitemap).toContain('if (page >= lastPage || rows.length === 0) break;');
});

test('the pager is localized in all 19 languages', () => {
  expect(read('src/components/DynamicSearchBeaches.tsx')).toContain("previousLabel={tCommon('paginationPrevious')}");
  for (const loc of ['en', 'si', 'hr', 'de', 'it', 'fr', 'es', 'pt', 'nl', 'pl', 'cs', 'sk', 'hu', 'bg', 'ru', 'ua', 'el', 'da', 'sq']) {
    const common = (JSON.parse(read(`messages/${loc}.json`)) as { Common: Record<string, string> }).Common;
    expect(common.paginationPrevious, loc).toBeTruthy();
    expect(common.paginationNext, loc).toBeTruthy();
  }
});
