import { test, expect } from '@playwright/test';
import { existsSync } from 'node:fs';
import path from 'node:path';
import {
  LOGO_COLORS,
  LOGO_VERSIONS,
  MEDIA_KIT_GUIDELINES,
  MEDIA_KIT_PACKAGE,
  PALETTE_FILES,
  SOCIAL_FILES,
  logoFiles,
} from '@/config/mediaKit';

/**
 * Media kit (owner, 2026-10-08): every download link on the page points at a file in public/brand/.
 */

const inPublic = (href: string) => existsSync(path.join(process.cwd(), 'public', href));

test('every logo version, colour and format exists', () => {
  for (const version of LOGO_VERSIONS) {
    for (const color of LOGO_COLORS) {
      const { preview, files } = logoFiles(version, color);
      expect(inPublic(preview), preview).toBe(true);
      expect(files.map((f) => f.format)).toEqual(['SVG', 'PNG 1000 px', 'PNG 3000 px', 'PDF', 'EPS']);
      for (const f of files) expect(inPublic(f.href), f.href).toBe(true);
    }
  }
});

test('package, guidelines, palette and social files exist', () => {
  const hrefs = [
    MEDIA_KIT_PACKAGE,
    ...MEDIA_KIT_GUIDELINES.map((g) => g.href),
    ...PALETTE_FILES.map((f) => f.href),
    ...SOCIAL_FILES.map((f) => f.href),
  ];
  for (const href of hrefs) expect(inPublic(href), href).toBe(true);
});
