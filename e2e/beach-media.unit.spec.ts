import { test, expect } from '@playwright/test';
import type { BeachDetailsSchema } from '@/lib/api-client/types.gen';
import { getBeachMediaSources, parseShowcaseBeachId, showcaseCards } from '@/lib/utils/beach-media';

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
