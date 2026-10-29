/**
 * Distance text for beach cards ("Nearby beaches" on the beach page, owner 2026-10-29).
 * Same rules as the mobile app (`mobile-app/src/lib/format.ts` formatDistance):
 * under 1 km in metres rounded to 10 m (min 10 m), under 10 km one decimal, from 10 km whole kilometres,
 * numbers formatted for the page locale ("850 m", "4,2 km" in /si, "4.2 km" in /en, "24 km").
 */
import { intlLocale } from '@/lib/utils/itinerary';

/** `distance_km` from the spatial API; a number, but accept a numeric string too. Null when unusable. */
export function parseDistanceKm(value: unknown): number | null {
  const n = typeof value === 'number' ? value : typeof value === 'string' && value.trim() !== '' ? Number(value) : NaN;
  return Number.isFinite(n) && n >= 0 ? n : null;
}

export function formatDistance(km: number, locale: string): string {
  if (!Number.isFinite(km) || km < 0) return '';
  const loc = intlLocale(locale);
  if (km < 1) {
    const meters = Math.max(10, Math.round((km * 1000) / 10) * 10);
    // 0.996 km rounds to 1000 m: show it as "1 km", not "1.000 m".
    if (meters < 1000) return `${new Intl.NumberFormat(loc).format(meters)} m`;
  }
  const digits = km < 10 ? 1 : 0;
  return `${new Intl.NumberFormat(loc, { maximumFractionDigits: digits }).format(km)} km`;
}
