import { test, expect } from '@playwright/test';

process.env.SKIP_ENV_VALIDATION = '1';

/** Pre-launch 2026-10-23: structured data for entity recognition (search engines, AI assistants). */

test('Organization lists the social profiles and beaches use the ISO country code', async () => {
  const { buildOrganizationSchema, buildBeachSchema } = await import('@/lib/utils/json-ld-helpers');
  const { SOCIAL_PROFILES } = await import('@/lib/constants/social');
  expect(buildOrganizationSchema('x').sameAs).toEqual(Object.values(SOCIAL_PROFILES));
  const schema = buildBeachSchema(
    { basic_info: { name: 'Špina' }, location: { city: { name: 'Đuba' }, country: { code: 'HR', name: 'Hrvaška' } } } as never,
    'si',
    'https://beachrex.com/si/x',
  ) as { address: { addressCountry: string } };
  expect(schema.address.addressCountry).toBe('HR');
});
