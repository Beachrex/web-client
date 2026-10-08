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
