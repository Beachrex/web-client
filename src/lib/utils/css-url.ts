/**
 * CSS `url()` value for an image URL.
 *
 * Imagor URLs contain parentheses (`filters:watermark(img/…,0,20,30)` for mobile photos, owner 2026-10-29). An
 * unquoted `url(...)` with parentheses is invalid CSS, so the browser silently dropped the whole
 * `background-image` declaration: banners with a mobile photo showed no image and no network error
 * (owner 2026-10-30, e.g. /en/beaches/europe/denmark). Quote the URL and escape what would end the string.
 */
export function cssUrl(url: string): string {
  const escaped = url.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '');
  return `url("${escaped}")`;
}
