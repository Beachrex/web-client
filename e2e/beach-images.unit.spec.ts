import { test, expect } from '@playwright/test';

/**
 * TASK-002 §5: storage keys are ASCII and the old non-ASCII keys were deleted,
 * so buildCdnUrl no longer bypasses Imagor with a direct Spaces URL for paths
 * with č/š/ž. Every image goes through Imagor.
 */

const TEASER = 'https://s3.beachrex.com/unsafe/fit-in/800x800/';
const LARGE = 'https://s3.beachrex.com/unsafe/fit-in/2800x2800/';
const ASSETS = 'https://beachrex.fra1.digitaloceanspaces.com/public/';

// Set before the module (and @/env) is loaded.
process.env.SKIP_ENV_VALIDATION = '1';
process.env.NEXT_PUBLIC_CDN_TEASER = TEASER;
process.env.NEXT_PUBLIC_CDN_LARGE = LARGE;
process.env.NEXT_PUBLIC_CDN_ASSETS = ASSETS;

const load = () => import('@/lib/utils/beach-images');

test.describe('buildCdnUrl', () => {
  test('ASCII image paths go through Imagor', async () => {
    const { buildCdnUrl } = await load();
    expect(buildCdnUrl('img/beaches/hr-114-o-brac/hr-114-o-brac-sl17.jpg', 'list')).toBe(
      `${TEASER}img/beaches/hr-114-o-brac/hr-114-o-brac-sl17.jpg`,
    );
    expect(buildCdnUrl('img/beaches/hr-114-o-brac/x.jpg', 'banner')).toBe(
      `${LARGE}img/beaches/hr-114-o-brac/x.jpg`,
    );
  });

  test('non-ASCII image paths never get a direct Spaces URL', async () => {
    const { buildCdnUrl } = await load();
    for (const path of [
      'img/beaches/hr-114-o-brač/hr-114-o-brač-sl17.jpg',
      'img/beaches/hr-114-o-brač/x.jpg',
    ]) {
      const url = buildCdnUrl(path, 'list');
      expect(url).not.toBeNull();
      expect(url!.startsWith(TEASER)).toBe(true);
      expect(url).not.toContain('digitaloceanspaces');
      expect(/^[\x00-\x7F]*$/.test(url!)).toBe(true);
    }
  });

  test('empty paths give null', async () => {
    const { buildCdnUrl } = await load();
    expect(buildCdnUrl(null)).toBeNull();
    expect(buildCdnUrl('')).toBeNull();
  });
});
