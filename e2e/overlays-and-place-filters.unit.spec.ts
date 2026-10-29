import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { test, expect } from '@playwright/test';

/**
 * Owner 2026-10-23: (1) the sticky header covered the gallery / 360° / video popups and their close button;
 * popups must sit above it and close on a click outside. (2) The map's place filters showed "Izberite možnost"
 * in a plain select; now "All countries" … with a search box.
 */
const read = (f: string) => readFileSync(join(process.cwd(), f), 'utf8');
const zOf = (cls: string) => Number(/z-\[(\d+)\]/.exec(cls)?.[1] ?? /\bz-(\d+)\b/.exec(cls)?.[1] ?? 0);

test('every full-screen overlay is above the sticky header', () => {
  const header = zOf(/<header className="([^"]+)"/.exec(read('src/components/Layout.tsx'))![1]!);
  expect(header).toBe(1050);

  expect(read('src/components/Beach/MediaOverlay.tsx')).toContain("OVERLAY_Z_CLASS = 'z-[1100]'");
  for (const [file, re] of [
    ['src/components/Beach/WebcamModal.tsx', /"fixed inset-0 ([^"]+)"/],
    ['src/components/DynamicSearchBeaches.tsx', /"fixed inset-0 ([^"]+)"/],
  ] as const) {
    expect(zOf(re.exec(read(file))![1]!), file).toBeGreaterThan(header);
  }
  const page = read('src/components/Beach/BeachPageView.tsx');
  expect(page).toContain('<MediaOverlay');
  expect(page).not.toContain('fixed inset-0 z-50');
});

test('the media popup renders into body and closes on the backdrop, Escape and the button', () => {
  const overlay = read('src/components/Beach/MediaOverlay.tsx');
  expect(overlay).toContain('createPortal(');
  expect(overlay).toContain('if (e.target === e.currentTarget) onClose();');
  expect(overlay).toContain("if (e.key === 'Escape') onClose();");
  expect(overlay).toContain('aria-label={closeLabel}');
  expect(overlay).toContain("document.body.style.overflow = 'hidden';");
});

test('place filters use the searchable select with "All …" labels in all 19 languages', () => {
  const sidebar = read('src/components/Map/LeftSidebarFilters.tsx');
  expect(sidebar).toContain('<SearchableSelect');
  expect(sidebar).not.toContain("tUi('selectOption')");
  const files = readdirSync(join(process.cwd(), 'messages')).filter((f) => f.endsWith('.json'));
  expect(files).toHaveLength(19);
  for (const f of files) {
    const m = JSON.parse(read(`messages/${f}`)) as Record<string, Record<string, string>>;
    for (const k of ['allCountries', 'allRegions', 'allIslands', 'allCities', 'all', 'search', 'noMatches', 'clear']) {
      expect(m.PlaceSelect?.[k], `${f} PlaceSelect.${k}`).toBeTruthy();
    }
    expect(m.BeachDetails?.closeMedia, `${f} closeMedia`).toBeTruthy();
  }
});

test('the select search ignores case and diacritics', async () => {
  const { normalizeSearchText } = await import('@/lib/utils/search-tabs');
  const labels = ['Šibenik', 'Krk', 'Ελλάδα', 'Kvarner'];
  const match = (q: string) => labels.filter((l) => normalizeSearchText(l).includes(normalizeSearchText(q)));
  expect(match('sibenik')).toEqual(['Šibenik']);
  expect(match('KR')).toEqual(['Krk']);
  expect(match('ελλ')).toEqual(['Ελλάδα']);
});
