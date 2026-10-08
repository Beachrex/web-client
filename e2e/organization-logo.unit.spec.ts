import { existsSync } from 'fs';
import { join } from 'path';
import { test, expect } from '@playwright/test';

process.env.SKIP_ENV_VALIDATION = '1';
process.env.NEXT_PUBLIC_BASE_URL = 'https://beachrex.com';

/**
 * Organization JSON-LD pointed `logo` at `/logo.png`, which does not exist (404 for Google).
 * It now uses a PNG from the brand package in `public/brand/`.
 */
test('Organization logo is a file that exists in public/', async () => {
  const { buildOrganizationSchema, ORGANIZATION_LOGO_PATH } = await import('@/lib/utils/json-ld-helpers');
  const schema = buildOrganizationSchema('desc');
  expect(schema.logo).toBe(`https://beachrex.com${ORGANIZATION_LOGO_PATH}`);
  expect(ORGANIZATION_LOGO_PATH).toMatch(/\.png$/);
  expect(existsSync(join(process.cwd(), 'public', ORGANIZATION_LOGO_PATH))).toBe(true);
});
