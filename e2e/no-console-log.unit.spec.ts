import { readdirSync, readFileSync, statSync } from 'fs';
import { join, relative } from 'path';
import { test, expect } from '@playwright/test';

/**
 * TASK-004 audit D5/F1: visitors' consoles filled with debug output (~25 lines per language
 * switch, map filters, category search) and the city page's distance/filter handlers only
 * logged. No `console.log` in `src/` except the flag-gated debug logging listed here.
 */
const ALLOWED: Record<string, string> = {
  // Debug logging behind a `false` constant (never runs)
  'src/components/PropertyCard/PropertyCard.tsx': 'ENABLE_PERF_LOGGING = false',
  'src/components/Map/VirtualizedBeachList.tsx': 'ENABLE_PERF_LOGGING = false',
  'src/components/Map/ReactLeafletMap.tsx': 'ENABLE_MAP_PERF_LOGGING',
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
