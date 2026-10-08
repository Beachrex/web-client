import { buildCdnUrl } from '@/lib/utils/beach-images';

/** Badge icons are local (`/images/...`) or CDN-relative (`js/assets/...`, see beach-badges.ts). */
export function resolveBadgeIcon(icon: string): string {
  return icon.startsWith('/') ? icon : (buildCdnUrl(icon, 'icon') ?? icon);
}
