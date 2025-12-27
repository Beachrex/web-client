import type { Property } from '@/components/PropertySection';
import type { BeachLike } from './mapBeachToProperty';
import { mapBeachToProperty } from './mapBeachToProperty';
import { buildBeachUrlFromSchema } from '@/lib/utils/beach-urls';

type BeachUrlSchema = Parameters<typeof buildBeachUrlFromSchema>[0];

function mapBeachLikeToUrlSchema(beach: BeachLike): BeachUrlSchema {
  return {
    slug: typeof beach.slug === 'string' ? beach.slug : undefined,

    continent_slug:
      typeof beach.continent_slug === 'string'
        ? beach.continent_slug
        : undefined,

    country_slug:
      typeof beach.country_slug === 'string'
        ? beach.country_slug
        : undefined,

    region_slug:
      typeof beach.region_slug === 'string'
        ? beach.region_slug
        : undefined,

    island_slug:
      typeof beach.island_slug === 'string'
        ? beach.island_slug
        : undefined,

    city_slug:
      typeof beach.city_slug === 'string'
        ? beach.city_slug
        : undefined,
  };
}

export function mapBeachToPropertyWithUrl(
  beach: BeachLike | null | undefined,
  options: Parameters<typeof mapBeachToProperty>[1],
  locale?: string,
): Property | null {
  if (!beach) return null;

  const p = mapBeachToProperty(beach, {
    ...options,
    locale,
  });

  if (!p) return null;

  const beachUrl =
    buildBeachUrlFromSchema(
      mapBeachLikeToUrlSchema(beach),
      locale ?? 'en',
    ) ?? undefined;

  return {
    ...p,
    beachUrl,
  };
}
