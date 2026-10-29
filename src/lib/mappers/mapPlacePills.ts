import { buildLocationPillUrls, type LocationPillUrls } from '@/lib/utils/beach-urls';

type PillLevel = 'continent' | 'country' | 'region' | 'island' | 'city';

interface PillPlace {
  slug?: string | null;
  name?: string | null;
  beaches_count?: number | null;
}

export interface LocationPillProps {
  pillLinks: LocationPillUrls;
  pillNames: { region?: string | null; island?: string | null; city?: string | null };
  pillCounts: Partial<Record<PillLevel, number | null>>;
}

/**
 * Links, full names and published beach counts for the location pills of a banner (owner, 2026-10-29: every page
 * that shows pills makes them interactive). Works for the beach details `location` and for a place page's nested
 * parents. A missing count stays undefined, so the tab shows no count box instead of a wrong number.
 */
export function mapPlacePills(
  locale: string,
  places: Partial<Record<PillLevel, PillPlace | null | undefined>> | null | undefined,
): LocationPillProps {
  const count = (level: PillLevel) => {
    const value = places?.[level]?.beaches_count;
    return typeof value === 'number' ? value : undefined;
  };
  return {
    pillLinks: buildLocationPillUrls(locale, places),
    pillNames: {
      region: places?.region?.name,
      island: places?.island?.name,
      city: places?.city?.name,
    },
    pillCounts: {
      continent: count('continent'),
      country: count('country'),
      region: count('region'),
      island: count('island'),
      city: count('city'),
    },
  };
}
