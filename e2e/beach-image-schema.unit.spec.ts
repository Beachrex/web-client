import { test, expect } from '@playwright/test';
import type { BeachDetailsSchema } from '@/lib/api-client/types.gen';

/**
 * Owner, 2026-10-08: beach photos in structured data name MOJA PLAŽA, d.o.o. as creator and
 * copyright holder, with licence pages, so Google Images credits them.
 */

process.env.SKIP_ENV_VALIDATION = '1';
process.env.NEXT_PUBLIC_BASE_URL = 'https://beachrex.com';
process.env.NEXT_PUBLIC_CDN_LARGE = 'https://s3.beachrex.com/unsafe/fit-in/2800x2800/';
process.env.NEXT_PUBLIC_CDN_TEASER = 'https://s3.beachrex.com/unsafe/fit-in/800x800/';

const beach = (mobileUpload: boolean) => ({
  basic_info: { name: 'Plaža Tisno', folder_name: 'hr-1-tisno', mobile_upload: mobileUpload },
  media: {
    gallery: [
      { file_name: 'a.jpg', is_primary: false },
      { file_name: 'b.jpg', is_primary: true },
      ...['c', 'd', 'e', 'f', 'g'].map((n) => ({ file_name: `${n}.jpg`, is_primary: false })),
    ],
  },
}) as unknown as BeachDetailsSchema;

test('ImageObjects: primary first, at most 5, large size, with creator and licence', async () => {
  const { buildBeachImageObjects, buildBeachSchema } = await import('@/lib/utils/json-ld-helpers');
  const images = buildBeachImageObjects(beach(false));
  expect(images).toHaveLength(5);
  expect(images[0]!.contentUrl).toContain('2800x2800/img/beaches/hr-1-tisno/b.jpg');
  expect(images[1]!.contentUrl).toContain('/a.jpg');
  expect(images[0]).toMatchObject({
    '@type': 'ImageObject',
    creator: { '@type': 'Organization', name: 'MOJA PLAŽA, d.o.o.' },
    copyrightHolder: { name: 'MOJA PLAŽA, d.o.o.' },
    copyrightNotice: '© MOJA PLAŽA, d.o.o.',
    creditText: 'Beachrex',
    license: 'https://beachrex.com/en/p/terms-of-use',
    acquireLicensePage: 'https://beachrex.com/en/p/media-kit',
  });
  expect(buildBeachSchema(beach(false), 'en', 'https://beachrex.com/x').image).toEqual(images);
});

test('mobile uploads use their own path and claim no copyright', async () => {
  const { buildBeachImageObjects } = await import('@/lib/utils/json-ld-helpers');
  const [first] = buildBeachImageObjects(beach(true));
  expect(first!.contentUrl).toContain('/img/beaches_mobile/hr-1-tisno/b.jpg');
  expect(first).not.toHaveProperty('copyrightHolder');
});
