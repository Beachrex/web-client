import { test, expect } from '@playwright/test';

/** Owner, 2026-10-08: a shared beach link shows that beach's photo (1200×630 JPEG for previews). */

process.env.SKIP_ENV_VALIDATION = '1';
process.env.NEXT_PUBLIC_CDN_LARGE = 'https://s3.beachrex.com/unsafe/fit-in/2800x2800/';

test('share image is a 1200×630 JPEG crop of the primary photo', async () => {
  const { getBeachShareImage } = await import('@/lib/utils/beach-images');
  const gallery = [{ file_name: 'a.jpg' }, { file_name: 'b.jpg', is_primary: true }];
  expect(getBeachShareImage(gallery, 'hr-1-tisno')).toBe(
    'https://s3.beachrex.com/unsafe/1200x630/smart/filters:format(jpeg):quality(85)/img/beaches/hr-1-tisno/b.jpg',
  );
  expect(getBeachShareImage([{ file_name: 'm.jpg' }], 'hr-1', true)).toContain('/img/beaches_mobile/hr-1/m.jpg');
  expect(getBeachShareImage([], 'hr-1')).toBeNull();
});
