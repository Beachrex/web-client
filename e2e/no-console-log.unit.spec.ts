import { readdirSync, readFileSync, statSync } from 'fs';
import { join, relative } from 'path';
import { test, expect } from '@playwright/test';

/**
 * TASK-004 audit D5/F1: visitors' consoles filled with debug output (~25 lines per language
 * switch, map filters, category search) and the city page's distance/filter handlers only
 * logged. No `console.log` in `src/` except the files listed here, which follow-up PRs clean up.
 */
const ALLOWED: Record<string, string> = {
  // Debug logging behind a `false` constant (never runs)
  'src/components/PropertyCard/PropertyCard.tsx': 'ENABLE_PERF_LOGGING = false',
  'src/components/Map/VirtualizedBeachList.tsx': 'ENABLE_PERF_LOGGING = false',
  'src/components/Map/ReactLeafletMap.tsx': 'ENABLE_MAP_PERF_LOGGING',
  // Follow-ups: B9 (language switch) and F2 (unused files)
  'src/hooks/useLocalizedPath.ts': 'B9',
  'src/components/Map/LeafletMapComponent.tsx': 'F2',
  'src/components/Home/HeroSearchSection.tsx': 'F2',
  'src/lib/utils/__tests__/manual-test-seo.ts': 'F2',
};

function files(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return name === 'api-client' ? [] : files(path);
    return /\.(ts|tsx)$/.test(name) ? [path] : [];
  });
}

test('no console.log in src/ outside the allowlist', () => {
  const root = process.cwd();
  const offenders = files(join(root, 'src'))
    .map((p) => relative(root, p))
    .filter((p) => !(p in ALLOWED) && /console\.log\(/.test(readFileSync(join(root, p), 'utf8')));
  expect(offenders).toEqual([]);
});
