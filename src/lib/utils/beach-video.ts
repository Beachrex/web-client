import { buildCdnUrl } from '@/lib/utils/beach-images';

/**
 * One rule for "which video does this beach have" (QA #67): the embed URL
 * (`embeds.video_url`, usually YouTube) first, otherwise the first uploaded
 * video (`media.videos`). The map/list cards used to ignore uploaded videos,
 * so they said "No video" where the beach page showed one.
 */

export function toYouTubeEmbedUrl(raw: string): string {
  if (raw.includes('youtu.be/')) {
    return raw.replace('youtu.be/', 'www.youtube.com/embed/');
  }
  if (raw.includes('youtube.com/watch')) {
    try {
      const v = new URL(raw).searchParams.get('v');
      if (v) return `https://www.youtube.com/embed/${v}`;
    } catch {
      // fall through: not a valid URL
    }
    return raw.replace('watch?v=', 'embed/');
  }
  return raw;
}

export function buildBeachVideoUrl(
  embedUrl: unknown,
  videos: readonly { url?: string | null; is_primary?: boolean | null }[] | null | undefined,
): string | null {
  if (typeof embedUrl === 'string' && /^https?:\/\//i.test(embedUrl.trim())) {
    return toYouTubeEmbedUrl(embedUrl.trim());
  }

  const list = videos ?? [];
  const uploaded = list.find((v) => v.is_primary && v.url) ?? list.find((v) => v.url);
  return uploaded?.url ? buildCdnUrl(uploaded.url, 'video') : null;
}
