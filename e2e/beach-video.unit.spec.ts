import { test, expect } from '@playwright/test';

/**
 * QA #67: map/list cards ignored uploaded videos (media.videos) and said
 * "No video" where the beach page showed one. buildBeachVideoUrl is the one
 * rule for both.
 */

const ASSETS = 'https://beachrex.fra1.digitaloceanspaces.com/public/';

process.env.SKIP_ENV_VALIDATION = '1';
process.env.NEXT_PUBLIC_CDN_TEASER = 'https://s3.beachrex.com/unsafe/fit-in/800x800/';
process.env.NEXT_PUBLIC_CDN_LARGE = 'https://s3.beachrex.com/unsafe/fit-in/2800x2800/';
process.env.NEXT_PUBLIC_CDN_ASSETS = ASSETS;

const load = () => import('@/lib/utils/beach-video');

test.describe('buildBeachVideoUrl', () => {
  test('YouTube embed wins and is converted', async () => {
    const { buildBeachVideoUrl } = await load();
    expect(buildBeachVideoUrl('https://www.youtube.com/watch?v=abc123&t=5', [{ url: 'img/v.mp4' }])).toBe(
      'https://www.youtube.com/embed/abc123',
    );
    expect(buildBeachVideoUrl('https://youtu.be/abc123', null)).toBe('https://www.youtube.com/embed/abc123');
  });

  test('uploaded video is used when there is no embed (QA #67)', async () => {
    const { buildBeachVideoUrl } = await load();
    expect(buildBeachVideoUrl(null, [{ url: 'img/beaches/hr-1/video/a.mp4' }])).toBe(
      `${ASSETS}img/beaches/hr-1/video/a.mp4`,
    );
    expect(
      buildBeachVideoUrl('', [
        { url: 'img/beaches/hr-1/video/a.mp4' },
        { url: 'img/beaches/hr-1/video/b.mp4', is_primary: true },
      ]),
    ).toBe(`${ASSETS}img/beaches/hr-1/video/b.mp4`);
  });

  test('no embed and no uploaded video → null', async () => {
    const { buildBeachVideoUrl } = await load();
    expect(buildBeachVideoUrl(null, [])).toBeNull();
    expect(buildBeachVideoUrl(undefined, undefined)).toBeNull();
    expect(buildBeachVideoUrl('not a url', [{ url: '' }])).toBeNull();
  });
});
