import type { BeachDetailsSchema } from '@/lib/api-client/types.gen';
import type { Continent, Country } from '@/lib/api-client/types.gen';
import { formatRegionPillLabel } from '@/components/BannerSection/topbar-utils';

export function mapBeachLocationToTopBar(
  beach?: BeachDetailsSchema,
): {
  continent?: Continent;
  country?: Country;
  regionPillLabel?: string | null;
  islandPillLabel?: string | null;
  cityPillLabel?: string | null;
} {
  const loc = beach?.location;

  const continent: Continent | undefined = loc?.continent?.code
    ? {
        code: loc.continent.code,
        name: loc.continent.name,
        slug: loc.continent.slug ?? undefined, // 🔑 null → undefined
      }
    : undefined;

  const country: Country | undefined = loc?.country?.code
    ? {
        code: loc.country.code,
        name: loc.country.name,
        full_name: loc.country.full_name ?? undefined, // 🔑 null → undefined
        slug: loc.country.slug ?? undefined,
      }
    : undefined;

  return {
    continent,
    country,

    regionPillLabel: loc?.region?.name
      ? formatRegionPillLabel(loc.region.name)
      : null,

    islandPillLabel: loc?.island?.name
      ? formatRegionPillLabel(loc.island.name)
      : null,

    cityPillLabel: loc?.city?.name
      ? formatRegionPillLabel(loc.city.name)
      : null,
  };
}
