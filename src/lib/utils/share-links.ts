/**
 * Share links for the beach page share menu (owner, 2026-10-08). Each network's own share URL,
 * so nothing loads third-party scripts.
 */

export type ShareNetwork = 'x' | 'facebook' | 'linkedin' | 'whatsapp' | 'telegram' | 'email';

export const SHARE_NETWORKS: ShareNetwork[] = ['x', 'facebook', 'linkedin', 'whatsapp', 'telegram', 'email'];

export const SHARE_NETWORK_NAMES: Record<Exclude<ShareNetwork, 'email'>, string> = {
  x: 'X',
  facebook: 'Facebook',
  linkedin: 'LinkedIn',
  whatsapp: 'WhatsApp',
  telegram: 'Telegram',
};

export function buildShareLink(network: ShareNetwork, url: string, title: string): string {
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(title);
  switch (network) {
    case 'x':
      return `https://twitter.com/intent/tweet?url=${u}&text=${t}`;
    case 'facebook':
      return `https://www.facebook.com/sharer/sharer.php?u=${u}`;
    case 'linkedin':
      return `https://www.linkedin.com/sharing/share-offsite/?url=${u}`;
    case 'whatsapp':
      return `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`;
    case 'telegram':
      return `https://t.me/share/url?url=${u}&text=${t}`;
    case 'email':
      return `mailto:?subject=${t}&body=${u}`;
  }
}
