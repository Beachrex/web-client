import { readFileSync } from 'fs';
import { join } from 'path';
import { test, expect } from '@playwright/test';

/**
 * Owner, 2026-10-30: the beach panel on the map loaded slowly on first open. Cards prefetched by slug while the panel
 * asks by id (another cache key), and the panel showed only a grey box while loading.
 */
const read = (p: string) => readFileSync(join(process.cwd(), p), 'utf8');

test('map panel exposes a prefetch with the panel query (same key as the panel)', () => {
  expect(read('src/components/Map/MapBeachPanelContext.tsx')).toContain('prefetch: (beachId: number) => void;');
  const map = read('src/components/Map/MapWithSidebar.tsx');
  expect(map).toContain('queryClient.prefetchQuery(beachPanelQueryOptions(beachId))');
  expect(map).toContain('{ open: openBeachPanel, prefetch: prefetchBeachPanel }');
});

test('on the map, a hovered card and an opened marker popup prefetch the panel content', () => {
  const card = read('src/components/PropertyCard/PropertyCard.tsx');
  expect(card).toMatch(/if \(beachPanel && beachId > 0\) \{\s*debouncedPrefetch\(/);
  expect(card).toContain('beachPanel.prefetch(beachId);');
  const tooltip = read('src/components/Map/BeachMarkerTooltip.tsx');
  expect(tooltip).toContain('beachPanel?.prefetch(beach.id)');
});

test('while loading, the panel shows the beach photo and name from the map list', () => {
  const panel = read('src/components/Map/MapBeachPanel.tsx');
  expect(panel).toContain("imageUrl={previewOk?.main_image ? buildCdnUrl(previewOk.main_image, 'hero') : null}");
  expect(panel).toMatch(/function PanelSkeleton\(\{ imageUrl, name \}/);
});
