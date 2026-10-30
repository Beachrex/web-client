import { readFileSync } from 'fs';
import { join } from 'path';
import { test, expect } from '@playwright/test';
import { isJunkPath } from '@/lib/utils/junk-paths';

/**
 * Prod 2026-10-30: scanner URLs were rendered as 404 pages of locale "api" (or "en") and cached on disk, one
 * page per invented path (178 000 files in a day). These paths now get a plain 404 from the middleware.
 * The list below is taken from the files found on the prod server.
 */
test.describe('isJunkPath', () => {
  test('scanner probes seen on prod are junk', () => {
    for (const path of [
      '/api/proc/self/environ',
      '/api/public/.env.production',
      '/api/..;/.env',
      '/api/client/.env.local',
      '/api/.env.bak',
      '/api/graphql',
      '/api/auth/session',
      '/api/settings',
      '/api',
      '/.env',
      '/en/.env',
      '/.git/config',
      '/wp-login.php',
      '/en/wp-admin/install.php',
      '/wp-content/plugins/x/readme.txt',
      '/xmlrpc.php',
      '/cgi-bin/luci',
      '/phpinfo.php',
      '/backup.sql',
      '/config.yml',
      '/en/beaches/europe/croatia/..%2f..%2fetc/passwd',
      '/%E0%A4%A',
      '/actuator/health',
      '/en/beaches/x;jsessionid=1',
    ]) {
      expect(isJunkPath(path), path).toBe(true);
    }
  });

  test('real pages and the health route are not junk', () => {
    for (const path of [
      '/',
      '/en',
      '/si/plaze/evropa/hrvaska/dalmacija/brac/bol/zlatni-rat',
      '/de/strande/europa/kroatien/dalmatia-split/brac/bol/zlatni-rat',
      '/el/paralies/evropi/ellada/kriti',
      '/en/beach-map',
      '/en/p/privacy-policy',
      '/en/ai/itinerary/plans/12',
      '/hr/hrvatska/dalmacija/tisno-plaze/plaza-tisno', // old site URL (legacy redirect)
      '/api/health',
      '/.well-known/security.txt',
      '/en/beaches/europe/croatia/istria/porec/plaza-borik',
      '/en/beaches/europe/croatia/dalmatia/hvar/jelsa/plaza-etc-1',
    ]) {
      expect(isJunkPath(path), path).toBe(false);
    }
  });

  test('the middleware answers junk first and no longer skips every /api path', () => {
    const middleware = readFileSync(join(process.cwd(), 'src', 'middleware.ts'), 'utf8');
    expect(middleware).toContain('if (isJunkPath(pathname))');
    expect(middleware.indexOf('isJunkPath(pathname)')).toBeLessThan(middleware.indexOf('previewGateDecision('));
    expect(middleware).not.toContain("'/((?!api|");
  });

  test('the catch-all route is not ISR-cached and unknown locales are 404', () => {
    const rest = readFileSync(join(process.cwd(), 'src', 'app', '[locale]', '[...rest]', 'page.tsx'), 'utf8');
    expect(rest).toContain("export const dynamic = 'force-dynamic'");
    expect(rest).not.toMatch(/export const revalidate/);
    const layout = readFileSync(join(process.cwd(), 'src', 'app', '[locale]', 'layout.tsx'), 'utf8');
    expect(layout).toContain('if (!(locales as readonly string[]).includes(locale)) notFound();');
  });
});
