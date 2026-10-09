import { test, expect } from '@playwright/test';
import { readFileSync } from 'fs';
import { join } from 'path';
import { buildShareLink, SHARE_NETWORKS } from '@/lib/utils/share-links';

/** Beach page share menu (owner, 2026-10-08). */

const url = 'https://beachrex.com/si/plaze/evropa/hrvaska/plaza-tisno';
const title = 'Plaža Tisno & okolica | Beachrex';

test('each network gets its own share URL with the page encoded', () => {
  const links = Object.fromEntries(SHARE_NETWORKS.map((n) => [n, buildShareLink(n, url, title)]));
  expect(links.x).toBe(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`);
  expect(links.facebook).toBe(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`);
  expect(links.linkedin).toBe(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`);
  expect(links.whatsapp).toBe(`https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`);
  expect(links.telegram).toContain('https://t.me/share/url?url=');
  expect(links.email).toBe(`mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`);
  // "&" in the title must not break the query
  expect(links.x).not.toContain('& okolica');
});

test('banner: no hardcoded rating; save is the real favorites button (FavoriteButton), share opens the menu', () => {
  const src = readFileSync(join(process.cwd(), 'src/components/Beach/BeachBanner/TopBarBeachRight.tsx'), 'utf8');
  expect(src).not.toContain('7.2');
  expect(src).not.toMatch(/t\('save'\)|t\('reviews'\)/);
  expect(src).toContain('<ShareMenu />');
});
