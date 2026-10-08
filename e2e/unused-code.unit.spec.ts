import { existsSync, readdirSync, readFileSync, statSync } from 'fs';
import { join } from 'path';
import { test, expect } from '@playwright/test';

/**
 * TASK-004 audit F2/F3: files nothing imported (a test image page, an old Leaflet map, a hero
 * search with a console-only submit, …) and per-file `localhost` fallbacks for the API URL.
 */
const REMOVED = [
  'src/components/TestImageComponent.tsx',
  'src/components/Home/HeroSearchSection.tsx',
  'src/components/Map/LeafletMapComponent.tsx',
  'src/components/Map/MapRadiusControl.tsx',
  'src/lib/utils/__tests__/manual-test-seo.ts',
  'src/lib/query-keys.ts',
];

test('removed unused files stay removed', () => {
  for (const file of REMOVED) expect(existsSync(join(process.cwd(), file)), file).toBe(false);
});

function files(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return name === 'api-client' ? [] : files(path);
    return /\.(ts|tsx)$/.test(name) ? [path] : [];
  });
}

test('the API URL comes from env.NEXT_PUBLIC_API_ENDPOINT, not a per-file localhost fallback', () => {
  const offenders = files(join(process.cwd(), 'src')).filter((f) =>
    /NEXT_PUBLIC_API_ENDPOINT \?\? 'http:\/\/localhost/.test(readFileSync(f, 'utf8')) && !f.endsWith('env.ts'),
  );
  expect(offenders).toEqual([]);
});
