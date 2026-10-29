import { test, expect } from '@playwright/test';
import type { BeachDetailsSchema } from '@/lib/api-client/types.gen';
import { getBeachMediaSources, PANORAMA_VIEWER_PATH, parseShowcaseBeachId, showcaseCards } from '@/lib/utils/beach-media';

/**
 * TASK-008: homepage "View beaches from all angles" shows one real beach.
 * Fixture mirrors GET /beach-details/989 (Svetilnik) on dev, 2026-10-28.
 */
function beach(overrides: Record<string, unknown> = {}): BeachDetailsSchema {
  return {
    basic_info: { id: 989, name: 'Svetilnik', slug: 'svetilnik' },
    media: {
      gallery: [1, 10, 2, 3].map((n) => ({
        url: `img/beaches/sl-6-k/sl-6-k-sl${n}.jpg`,
        thumbnail_url: `img/beaches/sl-6-k/sl-6-k-sl${n}.jpg`,
      })),
      videos: [],
      spheres_360: [
        { tour_url: 'img/beaches/sl-6-k/vtour/tour.html', thumbnail_url: 'img/beaches/sl-6-k/sl-6-k-Panorama.jpg' },
      ],
    },
    embeds: { video_url: 'https://youtu.be/y4BOrVAndlA' },
    webcams: [{ windy_id: 1600352235, title: 'Izola: Svetilnik Beach Izola', is_primary: true }],
    ...overrides,
  } as unknown as BeachDetailsSchema;
}

test.describe('parseShowcaseBeachId', () => {
  test('reads the string id admin stores', () => {
    expect(parseShowcaseBeachId({ showcase_beach_id: '989' })).toBe(989);
    expect(parseShowcaseBeachId({ showcase_beach_id: ' 614 ' })).toBe(614);
    expect(parseShowcaseBeachId({ showcase_beach_id: 88 })).toBe(88);
  });

  test('anything else means "no example" (static section)', () => {
    for (const config of [null, undefined, {}, [], 'x', { showcase_beach_id: '' }, { showcase_beach_id: '0' },
      { showcase_beach_id: '-3' }, { showcase_beach_id: '9.5' }, { showcase_beach_id: 'abc' }, { other: '989' }]) {
      expect(parseShowcaseBeachId(config), JSON.stringify(config)).toBeNull();
    }
  });
});

test.describe('showcaseCards', () => {
  test('a beach with everything gets four cards, each with a different photo of that beach', () => {
    const cards = showcaseCards(getBeachMediaSources(beach()));
    expect(cards.map((c) => c.kind)).toEqual(['gallery', 'video', 'sphere', 'live']);
    expect(new Set(cards.map((c) => c.image)).size).toBe(4);
    for (const card of cards) expect(card.image).toContain('sl-6-k');
    expect(cards[2]?.image).toContain('Panorama');
  });

  test('only the media the beach really has', () => {
    const noCamNoVideo = showcaseCards(getBeachMediaSources(beach({ webcams: [], embeds: { video_url: null } })));
    expect(noCamNoVideo.map((c) => c.kind)).toEqual(['gallery', 'sphere']);

    const nothing = showcaseCards(
      getBeachMediaSources(beach({ media: { gallery: [], videos: [], spheres_360: [] }, embeds: {}, webcams: [] })),
    );
    expect(nothing).toEqual([]);
  });

  test('popup sources point at real content: YouTube embed, 360 tour, Windy player only', () => {
    const s = getBeachMediaSources(beach());
    expect(s.videoEmbedUrl).toMatch(/^https:\/\/(www\.)?youtube(-nocookie)?\.com\/embed\/y4BOrVAndlA/);
    expect(s.sphereTourUrl).toMatch(/vtour\/tour\.html$/);
    expect(s.webcams[0]?.playerUrl).toMatch(/^https:\/\/webcams\.windy\.com\/webcams\/public\/embed\/player\?webcamId=1600352235/);
    expect(s.galleryImages).toHaveLength(4);
  });

  test('a malformed webcam entry is ignored, not shown', () => {
    const cards = showcaseCards(getBeachMediaSources(beach({ webcams: [{ windy_id: 'javascript:alert(1)' }] })));
    expect(cards.map((c) => c.kind)).not.toContain('live');
  });
});

/** Owner 2026-10-29, Plage du Port Vieux (3247): panorama without a generated tour; mp4 uploaded from the app. */
test.describe('mobile uploads: 360° without tour, uploaded video', () => {
  const portVieux = (overrides: Record<string, unknown> = {}) =>
    beach({
      media: {
        gallery: [{ url: 'img/beaches_mobile/biarritz-plage-du-port-vieux_5/biarritz-plage-du-port-vieux-085-sl1.jpg' }],
        videos: [{ url: 'img/beaches_mobile/biarritz-plage-du-port-vieux_5/biarritz-plage-du-port-vieux-935-video.mp4' }],
        spheres_360: [{
          url: 'img/beaches_mobile/biarritz-plage-du-port-vieux_5/biarritz-plage-du-port-vieux-365-panorama1.jpg',
          tour_url: null,
        }],
      },
      embeds: { video_url: null },
      webcams: [],
      ...overrides,
    });

  test('no tour → the panorama opens in our 360° viewer', () => {
    const s = getBeachMediaSources(portVieux());
    expect(s.sphereTourUrl).not.toBeNull();
    const url = s.sphereTourUrl!;
    expect(url.startsWith(`${PANORAMA_VIEWER_PATH}#panorama=`)).toBe(true);
    const panorama = decodeURIComponent(url.split('#panorama=')[1]!.split('&')[0]!);
    expect(panorama).toMatch(/img\/beaches_mobile\/.+panorama1\.jpg$/);
    expect(url).toContain('autoLoad=true');
    expect(showcaseCards(s).map((c) => c.kind)).toContain('sphere');
  });

  test('a generated tour is still used as before', () => {
    const s = getBeachMediaSources(beach());
    expect(s.sphereTourUrl).toMatch(/vtour\/tour\.html$/);
    expect(s.sphereTourUrl).not.toContain(PANORAMA_VIEWER_PATH);
  });

  test('no panorama and no tour → no 360° card', () => {
    const s = getBeachMediaSources(portVieux({ media: { gallery: [], videos: [], spheres_360: [] } }));
    expect(s.sphereTourUrl).toBeNull();
  });

  test('uploaded mp4 plays as a file, YouTube stays an embed', () => {
    const file = getBeachMediaSources(portVieux());
    expect(file.videoEmbedUrl).toMatch(/\.mp4$/);
    expect(file.videoIsFile).toBe(true);

    const yt = getBeachMediaSources(beach());
    expect(yt.videoIsFile).toBe(false);
  });
});

