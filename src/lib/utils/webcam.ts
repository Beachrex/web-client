import { FEATURES } from '@/lib/constants/features';

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

/* ------------------------------------------------------------------
 * TASK-006: verified Windy webcams from the API (`webcams[]` on beach details,
 * `embeds.windy_webcam_id` on lists and the map). The old pasted `webcam` HTML
 * is only used while FEATURES.windyWebcams is off.
 * ------------------------------------------------------------------ */


/** Same iframe Windy's own embed script builds (checked 2026-10-14). */
const WINDY_PLAYER = 'https://webcams.windy.com/webcams/public/embed/player';

export interface WindyWebcam {
  windyId: number;
  title: string | null;
  isPrimary: boolean;
  playerUrl: string;
  pageUrl: string;
}

function toWindyId(value: unknown): number | null {
  const id = typeof value === 'string' ? Number(value) : value;
  return typeof id === 'number' && Number.isInteger(id) && id > 0 ? id : null;
}

export function windyPlayerUrl(windyId: number): string {
  const q = new URLSearchParams({
    webcamId: String(windyId),
    playerType: 'day',
    loop: '0',
    autoPlay: '0',
    interactive: '1',
  });
  return `${WINDY_PLAYER}?${q.toString()}`;
}

export function windyPageUrl(windyId: number): string {
  return `https://www.windy.com/webcams/${windyId}`;
}

/** `https://www.windy.com/webcams/123` (what cards get from `webcamLink`) → 123, else null. */
export function windyIdFromPageUrl(url: unknown): number | null {
  if (typeof url !== 'string') return null;
  const m = /^https:\/\/www\.windy\.com\/webcams\/(\d+)$/.exec(url.trim());
  return m ? toWindyId(m[1]) : null;
}

/** `webcams[]` from beach details → verified webcams, primary first. Ignores anything malformed. */
export function parseWindyWebcams(raw: unknown): WindyWebcam[] {
  if (!Array.isArray(raw)) return [];
  const out: WindyWebcam[] = [];
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue;
    const r = item as Record<string, unknown>;
    const windyId = toWindyId(r.windy_id);
    if (!windyId) continue;
    out.push({
      windyId,
      title: typeof r.title === 'string' ? r.title : null,
      isPrimary: r.is_primary === true,
      // Built here, not taken from the API, so the iframe can only ever point at Windy's player.
      playerUrl: windyPlayerUrl(windyId),
      pageUrl: windyPageUrl(windyId),
    });
  }
  return out.sort((a, b) => Number(b.isPrimary) - Number(a.isPrimary));
}

/**
 * Link a card, the map or a list opens for "webcam": the Windy page of the verified
 * primary webcam, or (flag off) the old pasted embed's link. Null = no webcam.
 */
export function webcamLink(
  embeds: { webcam?: unknown; windy_webcam_id?: unknown } | null | undefined,
  useWindy: boolean = FEATURES.windyWebcams,
): string | null {
  if (useWindy) {
    const id = toWindyId(embeds?.windy_webcam_id);
    return id ? windyPageUrl(id) : null;
  }
  return parseWebcamUrl(embeds?.webcam);
}
