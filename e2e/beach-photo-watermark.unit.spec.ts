import { test, expect } from '@playwright/test';
import type { BeachDetailsSchema } from '@/lib/api-client/types.gen';

/**
 * Owner, 2026-10-29: photos uploaded from the mobile app (`img/beaches_mobile/`) have no baked-in
 * logo, so Imagor draws the Beachrex watermark when they are shown (ADR 2026-10-29). Admin photos
 * (logo already baked in), icons, videos and 360° spheres/tours never get it.
 */

const TEASER = 'https://s3.beachrex.com/unsafe/fit-in/800x800/';
const LARGE = 'https://s3.beachrex.com/unsafe/fit-in/2800x2800/';
const ASSETS = 'https://beachrex.fra1.digitaloceanspaces.com/public/';

process.env.SKIP_ENV_VALIDATION = '1';
process.env.NEXT_PUBLIC_BASE_URL = 'https://beachrex.com';
process.env.NEXT_PUBLIC_CDN_TEASER = TEASER;
process.env.NEXT_PUBLIC_CDN_LARGE = LARGE;
process.env.NEXT_PUBLIC_CDN_ASSETS = ASSETS;

const FILTER = 'watermark(img/watermark/beachrex-watermark-v1.png,-3p,-4p,0,20,30)';
const MOBILE = 'img/beaches_mobile/biarritz-plage-du-port-vieux_5/biarritz-plage-du-port-vieux-085-sl1.jpg';
const DESKTOP = 'img/beaches/sl-6-k/sl-6-k-sl1.jpg';

const count = (url: string | null, needle: string) => (url ?? '').split(needle).length - 1;
const load = () => import('@/lib/utils/beach-images');

test('mobile photos get exactly one watermark filter in every image size', async () => {
  const { buildCdnUrl, WATERMARK_FILTER } = await load();
  expect(WATERMARK_FILTER).toBe(FILTER);

  expect(buildCdnUrl(MOBILE, 'list')).toBe(`${TEASER}filters:${FILTER}/${MOBILE}`);
  expect(buildCdnUrl(MOBILE, 'banner')).toBe(`${LARGE}filters:${FILTER}/${MOBILE}`);
  for (const context of ['hero', 'carousel', 'gallery', undefined] as const) {
    const url = buildCdnUrl(MOBILE, context);
    expect(count(url, 'watermark(')).toBe(1);
    expect(count(url, 'filters:')).toBe(1);
    expect(url!.endsWith(`/${MOBILE}`)).toBe(true);
  }
  // A leading slash and upper-case extensions are the same photo.
  expect(count(buildCdnUrl(`/${MOBILE}`, 'list'), 'watermark(')).toBe(1);
  expect(count(buildCdnUrl(MOBILE.replace('.jpg', '.JPG'), 'list'), 'watermark(')).toBe(1);
  expect(count(buildCdnUrl(MOBILE.replace('.jpg', '.webp'), 'list'), 'watermark(')).toBe(1);
});

test('admin photos, icons, videos, tours and panoramas get no watermark', async () => {
  const { buildCdnUrl, buildSphereTourUrl } = await load();
  expect(buildCdnUrl(DESKTOP, 'list')).toBe(`${TEASER}${DESKTOP}`);
  expect(buildCdnUrl(DESKTOP, 'banner')).toBe(`${LARGE}${DESKTOP}`);
  for (const url of [
    buildCdnUrl('img/flag/fr.svg', 'icon'),
    buildCdnUrl('img/icon/map.svg', 'icon'),
    buildCdnUrl('img/beaches_mobile/x_5/clip.mp4', 'video'),
    buildCdnUrl('img/beaches_mobile/x_5/clip.mp4', 'list'),
    buildCdnUrl('img/beaches_mobile/x_5/logo.svg', 'list'),
    buildCdnUrl(MOBILE, 'icon'), // assets endpoint is direct Spaces, not Imagor
    buildSphereTourUrl('img/beaches_mobile/x_5/vtour/tour.html'),
    buildCdnUrl('img/beaches_mobile/x_5/vtour/panos/a.tiles/preview.jpg', 'gallery'),
    buildCdnUrl('img/beaches_mobile/biarritz-plage-du-port-vieux_5/biarritz-plage-du-port-vieux-365-panorama1.jpg', 'gallery'),
    buildCdnUrl('img/beaches_mobile/x_5/x-sphere1.jpg', 'gallery'),
    buildCdnUrl(MOBILE, 'gallery', { watermark: false }),
    buildCdnUrl('img/cities/biarritz.jpg', 'banner'),
  ]) {
    expect(url).not.toBeNull();
    expect(url).not.toContain('watermark');
  }
});

test('share image: watermark joins the existing filters segment', async () => {
  const { buildShareImageUrl, getBeachShareImage } = await load();
  expect(buildShareImageUrl(MOBILE)).toBe(
    `https://s3.beachrex.com/unsafe/1200x630/smart/filters:format(jpeg):quality(85):${FILTER}/${MOBILE}`,
  );
  expect(buildShareImageUrl(DESKTOP)).toBe(
    `https://s3.beachrex.com/unsafe/1200x630/smart/filters:format(jpeg):quality(85)/${DESKTOP}`,
  );
  const mobileShare = getBeachShareImage([{ file_name: 'm.jpg' }], 'hr-1', true);
  expect(count(mobileShare, 'watermark(')).toBe(1);
  expect(count(mobileShare, 'filters:')).toBe(1);
  expect(getBeachShareImage([{ file_name: 'm.jpg' }], 'hr-1', false)).not.toContain('watermark');
});

const MAIN = 'img/beaches_mobile/hr-1_5/a.jpg';

const beach = (mobileUpload: boolean) => {
  const base = mobileUpload ? 'img/beaches_mobile/hr-1_5' : 'img/beaches/hr-1';
  return {
    basic_info: { name: 'Plaža', folder_name: mobileUpload ? 'hr-1_5' : 'hr-1', mobile_upload: mobileUpload },
    media: {
      gallery: [{ file_name: 'a.jpg', url: `${base}/a.jpg`, thumbnail_url: `${base}/a.jpg`, is_primary: true }],
      spheres_360: [{ url: `${base}/hr-1-panorama1.jpg`, thumbnail_url: `${base}/hr-1-panorama1.jpg`, tour_url: `${base}/vtour/tour.html` }],
      videos: [],
    },
  } as unknown as BeachDetailsSchema;
};

test('consumers: banner, gallery popup, JSON-LD watermark mobile photos, not the 360° thumb', async () => {
  const { getMainBeachImage } = await load();
  const { getBeachMediaSources } = await import('@/lib/utils/beach-media');
  const { buildBeachImageObjects, buildDestinationSchema } = await import('@/lib/utils/json-ld-helpers');

  const mobile = beach(true);
  expect(count(getMainBeachImage(mobile.media!.gallery, 'hr-1_5', true, 'banner'), 'watermark(')).toBe(1);
  const sources = getBeachMediaSources(mobile);
  expect(sources.galleryImages.every((u) => count(u, 'watermark(') === 1)).toBe(true);
  expect(sources.galleryThumbs.every((u) => count(u, 'watermark(') === 1)).toBe(true);
  expect(sources.sphereThumb).not.toBeNull();
  expect(sources.sphereThumb).not.toContain('watermark');
  expect(sources.sphereTourUrl).not.toContain('watermark');
  const [image] = buildBeachImageObjects(mobile);
  expect(count(image!.contentUrl as string, 'watermark(')).toBe(1);
  expect(count(buildDestinationSchema({ name: 'x', url: 'https://beachrex.com/x', mainImage: MAIN }).image as string, 'watermark(')).toBe(1);

  const desktop = beach(false);
  expect(getMainBeachImage(desktop.media!.gallery, 'hr-1', false, 'banner')).not.toContain('watermark');
  expect(getBeachMediaSources(desktop).galleryImages.join()).not.toContain('watermark');
  expect(buildBeachImageObjects(desktop)[0]!.contentUrl).not.toContain('watermark');
});
