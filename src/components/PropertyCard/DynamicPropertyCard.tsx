'use client';

import type { BeachSchema } from '@/lib/api-client/types.gen';
import { useLocale } from 'next-intl';

import { mapBeachToProperty } from '@/lib/mappers/mapBeachToProperty';
import { buildBeachUrlFromSchema } from '@/lib/utils/beach-urls';
import PropertyCard from './PropertyCard';

interface DynamicPropertyCardProps {
  beach: BeachSchema;
  onLocationClick?: (latitude: string, longitude: string, beachId?: number) => void;
}

export function DynamicPropertyCard({
  beach,
  onLocationClick,
}: DynamicPropertyCardProps) {
  const locale = useLocale();
  const property = mapBeachToProperty(beach);
const beachUrl = buildBeachUrlFromSchema(beach, locale) ?? undefined;

  if (!property) return null;

  return (
    <PropertyCard
      {...property}
      beachUrl={beachUrl}
      onLocationClick={
        onLocationClick
          ? () =>
              onLocationClick(
                beach.latitude ?? '0',
                beach.longitude ?? '0',
                beach.id
              )
          : undefined
      }
    />
  );
}


export default DynamicPropertyCard;
