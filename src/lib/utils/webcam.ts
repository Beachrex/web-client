/**
 * The `beach.webcam` column holds whatever was pasted into the old admin: mostly
 * embed HTML with an `href` (Lookr), sometimes an iframe `src`, a bare URL, or
 * junk ("bre"). This returns the webcam page URL, or null when there is none.
 *
 * Use it both to decide whether a beach "has a webcam" and to open it, so the
 * map, cards and beach page agree (QA #36, #65, #68).
 */
export function parseWebcamUrl(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;

  const text = raw.replace(/\\"/g, '"').trim();
  if (!text) return null;

  const attr =
    /href\s*=\s*["']([^"']+)["']/i.exec(text)?.[1] ??
    /src\s*=\s*["']([^"']+)["']/i.exec(text)?.[1];
  const candidate = (attr ?? text).trim();

  if (!/^https?:\/\/[^\s<>"']+$/i.test(candidate)) return null;
  return candidate;
}
