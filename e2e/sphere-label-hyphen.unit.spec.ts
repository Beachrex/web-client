import { readFileSync } from 'fs';
import { join } from 'path';
import { test, expect } from '@playwright/test';

/** Owner 2026-10-12 (Strand Wulfen, /de): the 360° button read "360°-Ansicht"; no hyphen after "360°". */
test('German and Dutch 360° labels have no hyphen', () => {
  for (const locale of ['de', 'nl']) {
    const raw = readFileSync(join(process.cwd(), `messages/${locale}.json`), 'utf8');
    expect(raw, locale).not.toContain('360°-');
    const media = (JSON.parse(raw) as { BeachDetails?: Record<string, string> }).BeachDetails;
    expect(media?.beachMedia360, locale).toMatch(/^360° /);
  }
});
