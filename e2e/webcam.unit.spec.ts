import { test, expect } from '@playwright/test';
import { parseWebcamUrl } from '@/lib/utils/webcam';

/**
 * QA #36, #65, #68: "has webcam" used to mean "the webcam column is a string",
 * but the card could only open embeds with an href. Values seen in the dev DB
 * (2026-10-08): 252 Lookr embeds with href, 2 bare whatsupcams URLs, and 2 junk
 * values ("bret", "bre").
 */
test.describe('parseWebcamUrl', () => {
  test('Lookr embed HTML → its href', () => {
    const embed =
      '<a name="lookr-widget" href="https://www.lookr.com/lookout/1234-Piran" data-id="1234">Piran</a><script src="https://www.lookr.com/widget.js"></script>';
    expect(parseWebcamUrl(embed)).toBe('https://www.lookr.com/lookout/1234-Piran');
  });

  test('escaped quotes from the old admin', () => {
    expect(parseWebcamUrl('<a href=\\"https://www.lookr.com/x\\">x</a>')).toBe(
      'https://www.lookr.com/x',
    );
  });

  test('iframe src', () => {
    expect(parseWebcamUrl('<iframe src="https://example.com/cam" width="600"></iframe>')).toBe(
      'https://example.com/cam',
    );
  });

  test('bare URL (whatsupcams rows)', () => {
    expect(
      parseWebcamUrl(
        '  http://www.whatsupcams.com/en/webcams/slovenia/coastal-karst/piran/piran-seaside-promenade ',
      ),
    ).toBe('http://www.whatsupcams.com/en/webcams/slovenia/coastal-karst/piran/piran-seaside-promenade');
  });

  test('junk, empty and non-strings are no webcam', () => {
    for (const value of ['bret', 'bre', '', '   ', null, undefined, 42, 'javascript:alert(1)', '<a href="ftp://x">x</a>']) {
      expect(parseWebcamUrl(value)).toBeNull();
    }
  });
});

/* TASK-006: verified Windy webcams replace the pasted links. */
import { parseWindyWebcams, webcamLink, windyPlayerUrl } from '@/lib/utils/webcam';

test.describe('Windy webcams (TASK-006)', () => {
  test('player url is the iframe Windy builds, page url is windy.com', () => {
    expect(windyPlayerUrl(1616668973)).toBe(
      'https://webcams.windy.com/webcams/public/embed/player?webcamId=1616668973&playerType=day&loop=0&autoPlay=0&interactive=1',
    );
  });

  test('webcams[] → primary first, malformed entries dropped, urls built locally', () => {
    const cams = parseWindyWebcams([
      { windy_id: 2, title: 'B', is_primary: false, player_url: 'https://evil.example/x' },
      { windy_id: 1, title: 'A', is_primary: true },
      { windy_id: 'x' },
      null,
      { windy_id: -5 },
    ]);
    expect(cams.map((c) => c.windyId)).toEqual([1, 2]);
    expect(cams[1]?.playerUrl).toBe(windyPlayerUrl(2)); // never the API's / an attacker's URL
    expect(cams[0]?.pageUrl).toBe('https://www.windy.com/webcams/1');
    expect(parseWindyWebcams(undefined)).toEqual([]);
    expect(parseWindyWebcams('nope')).toEqual([]);
  });

  test('cards and map: Windy link when verified, nothing otherwise; old links only with the flag off', () => {
    const lookr = '<a name="lkr-timelapse-player" data-id="1400255409" href="https://www.lookr.com/lookout/1400255409-Pula">x</a>';
    expect(webcamLink({ webcam: lookr, windy_webcam_id: 1400255409 }, true)).toBe('https://www.windy.com/webcams/1400255409');
    expect(webcamLink({ webcam: lookr, windy_webcam_id: null }, true)).toBeNull();
    expect(webcamLink({ webcam: 'brez' }, true)).toBeNull();
    expect(webcamLink(undefined, true)).toBeNull();
    expect(webcamLink({ webcam: lookr, windy_webcam_id: null }, false)).toBe('https://www.lookr.com/lookout/1400255409-Pula');
  });
});
