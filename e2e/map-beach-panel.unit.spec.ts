import { readFileSync } from 'fs';
import { join } from 'path';
import { test, expect } from '@playwright/test';
import {
  MAP_BEACH_PARAM,
  buildMapPanelUrl,
  isPlainPrimaryClick,
  opensBeachPanel,
  desktopPanelWidth,
  panelBreadcrumb,
  panelMapInset,
  panelWidth,
  parseMapBeachParam,
  withoutPanelParam,
} from '@/lib/utils/map-beach-panel';

/**
 * Owner 2026-10-30: on the beach map a beach opened in a NEW TAB (bad on phones). It now opens in a panel over the
 * map (desktop: left panel, phone: bottom sheet) with X to close and "open in new tab"; approved variant A.
 */
const read = (p: string) => readFileSync(join(process.cwd(), p), 'utf8');

const click = (over: Partial<Parameters<typeof isPlainPrimaryClick>[0]> = {}) => ({
  button: 0,
  ctrlKey: false,
  metaKey: false,
  shiftKey: false,
  altKey: false,
  defaultPrevented: false,
  ...over,
});

test('only a plain primary click is intercepted; modified and middle clicks keep the link behaviour', () => {
  expect(isPlainPrimaryClick(click())).toBe(true);
  expect(isPlainPrimaryClick(click({ ctrlKey: true }))).toBe(false);
  expect(isPlainPrimaryClick(click({ metaKey: true }))).toBe(false);
  expect(isPlainPrimaryClick(click({ shiftKey: true }))).toBe(false);
  expect(isPlainPrimaryClick(click({ altKey: true }))).toBe(false);
  expect(isPlainPrimaryClick(click({ button: 1 }))).toBe(false); // middle
  expect(isPlainPrimaryClick(click({ button: 2 }))).toBe(false);
  expect(isPlainPrimaryClick(click({ defaultPrevented: true }))).toBe(false);
});

test('the panel opens only on the map page (a panel exists) and for a real beach id', () => {
  expect(opensBeachPanel(true, 989, click())).toBe(true);
  // Outside the map page there is no panel: PropertyCard links navigate as before
  expect(opensBeachPanel(false, 989, click())).toBe(false);
  expect(opensBeachPanel(true, 0, click())).toBe(false);
  expect(opensBeachPanel(true, null, click())).toBe(false);
  expect(opensBeachPanel(true, 989, click({ metaKey: true }))).toBe(false);
});

test('panel URL state: ?beach=<id> on the map URL, filters kept, removed on close', () => {
  expect(MAP_BEACH_PARAM).toBe('beach');
  const loc = { pathname: '/si/zemljevid-plaz', search: '?country=HR&waterbody=sea' };
  expect(buildMapPanelUrl(loc, 989)).toBe('/si/zemljevid-plaz?country=HR&waterbody=sea&beach=989');
  expect(buildMapPanelUrl({ pathname: '/en/beach-map', search: '' }, 7)).toBe('/en/beach-map?beach=7');
  // Swapping keeps one parameter
  expect(buildMapPanelUrl({ pathname: '/en/beach-map', search: '?beach=7&city=12' }, 8)).toBe('/en/beach-map?beach=8&city=12');
  // Close restores the original query exactly
  expect(buildMapPanelUrl({ pathname: '/si/zemljevid-plaz', search: '?country=HR&waterbody=sea&beach=989' }, null))
    .toBe('/si/zemljevid-plaz?country=HR&waterbody=sea');
  expect(buildMapPanelUrl({ pathname: '/en/beach-map', search: '?beach=7' }, null)).toBe('/en/beach-map');
  expect(buildMapPanelUrl({ pathname: '/en/beach-map', search: '?beach_id=5&lat=1&lng=2', hash: '#x' }, 5))
    .toBe('/en/beach-map?beach_id=5&lat=1&lng=2&beach=5#x');

  const p = (q: string) => parseMapBeachParam(new URLSearchParams(q));
  expect(p('beach=989')).toBe(989);
  expect(p('country=HR&beach=12')).toBe(12);
  expect(p('beach=')).toBeNull();
  expect(p('beach=abc')).toBeNull();
  expect(p('beach=0')).toBeNull();
  expect(p('beach=-4')).toBeNull();
  expect(p('beach_id=989')).toBeNull(); // the pin focus parameter is a different feature
  expect(parseMapBeachParam(null)).toBeNull();

  // The filter sidebar never sees the panel parameter as a filter
  expect(withoutPanelParam(new URLSearchParams('country=HR&beach=9')).toString()).toBe('country=HR');
  expect(withoutPanelParam('beach=9').toString()).toBe('');
});

test('panel geometry and breadcrumb', () => {
  expect(panelWidth(1440)).toBe(720);
  expect(panelWidth(1024)).toBe(563);
  // Covers exactly filters + list when that fits (no strip of the list between panel and map)
  expect(desktopPanelWidth(1440, 778)).toBe(778);
  expect(desktopPanelWidth(1024, 778)).toBe(563);
  expect(desktopPanelWidth(1440, 1196)).toBe(720); // two-column list
  expect(desktopPanelWidth(1440, 0)).toBe(720);
  expect(panelMapInset(720, 778)).toBe(0);
  expect(panelMapInset(720, 600)).toBe(120);
  expect(panelBreadcrumb(['Evropa', 'Francija', null, ' Saint-Nazaire ', undefined])).toBe('Evropa › Francija › Saint-Nazaire');
  expect(panelBreadcrumb(['Monako', 'Monako'])).toBe('Monako');
  expect(panelBreadcrumb([])).toBe('');
});

test('map-page beach links no longer open a new tab; they open the panel', () => {
  const tooltip = read('src/components/Map/BeachMarkerTooltip.tsx');
  const beachLinks = tooltip.match(/<Link\s+href=\{beachUrl\}[\s\S]*?>/g) ?? [];
  expect(beachLinks.length).toBe(2); // the name and "View →"
  for (const link of beachLinks) {
    expect(link).not.toContain('_blank');
    expect(link).toContain('onClick={onBeachLinkClick}');
  }
  expect(tooltip).toContain('useBeachPanelLinkClick(beach.id)');

  const card = read('src/components/PropertyCard/PropertyCard.tsx');
  const titleLink = card.match(/<Link\s+href=\{beachUrl\}[\s\S]*?>/)?.[0] ?? '';
  expect(titleLink).toContain('onClick={openInPanel}');
  expect(titleLink).not.toContain('_blank');
  expect(titleLink).not.toContain('openInNewTab');
});

test('the interception is scoped to the map page; PropertyCard elsewhere is unchanged', () => {
  const ctx = read('src/components/Map/MapBeachPanelContext.tsx');
  expect(ctx).toContain('createContext<MapBeachPanelApi | null>(null)');
  expect(ctx).toMatch(/if \(!panel \|\| /); // no provider → the click is not touched

  // Only the beach map provides the panel
  const providers = ['src/components/Map/MapWithSidebar.tsx'];
  expect(read(providers[0]!)).toContain('<MapBeachPanelContext.Provider value={beachPanelApi}>');

  // The card's info bar is clickable only with a panel; without one it has no handler
  const card = read('src/components/PropertyCard/PropertyCard.tsx');
  expect(card).toContain('onClick={beachPanel ? handleInfoBarClick : undefined}');
});

test('panel URL: filters ignore the panel parameter and keep it when they rewrite the URL', () => {
  const filters = read('src/components/Map/LeftSidebarFilters.tsx');
  expect(filters).toContain('withoutPanelParam(rawSearch)');
  expect(filters.match(/parseMapBeachParam\(rawSearchParams\)/g)?.length).toBe(2);

  const map = read('src/components/Map/MapWithSidebar.tsx');
  expect(map).toContain('window.history.pushState(');
  expect(map).toContain('window.history.back()');
  // Our replaceState data never includes Next's own state (that would skip the router update)
  expect(map).toContain("window.history.replaceState({ [PANEL_HISTORY_KEY]: historyEntryIsPanel() }, '', url)");
});

test('accessibility: non-modal desktop dialog, modal phone sheet, Escape, reduced motion', () => {
  const panel = read('src/components/Map/MapBeachPanel.tsx');
  expect(panel.match(/role="dialog"/g)?.length).toBe(2);
  expect(panel.match(/^\s+aria-modal="true"$/gm)?.length).toBe(1); // the JSX attribute, on the sheet only
  expect(panel).toContain("e.key !== 'Escape'");
  expect(panel).toContain("document.body.style.overflow = 'hidden'");
  expect(panel).toContain('<BeachDetailPage key={beachId} beachDetails={details} embedded />');

  const css = read('src/styles/globals.css');
  expect(css).toMatch(/@media \(prefers-reduced-motion: no-preference\)\s*\{\s*\.beach-panel-slide-left/);
});

test('panel strings exist in all 19 locales (and are translated in Slovenian)', () => {
  const locales = ['en', 'si', 'de', 'hr', 'fr', 'es', 'it', 'ua', 'ru', 'pl', 'cs', 'hu', 'bg', 'sk', 'da', 'pt', 'nl', 'el', 'sq'];
  const keys = ['close', 'dialogLabel', 'openInNewTab', 'newTab', 'openFullPage', 'openFullPageShort', 'directions',
    'escHint', 'loading', 'loadError', 'retry'];
  const load = (l: string) =>
    (JSON.parse(read(`messages/${l}.json`)) as Record<string, Record<string, string>>).MapBeachPanel ?? {};
  const en = load('en');
  for (const locale of locales) {
    const ns = load(locale);
    for (const key of keys) {
      expect(typeof ns[key] === 'string' && ns[key]!.trim().length > 0, `${locale}.MapBeachPanel.${key}`).toBe(true);
    }
  }
  const si = load('si');
  for (const key of keys) expect(si[key], key).not.toBe(en[key]);
});
