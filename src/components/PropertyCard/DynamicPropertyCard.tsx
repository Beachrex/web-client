'use client';

import type { BeachSchema } from '@/lib/api-client/types.gen';
import { useLocale } from 'next-intl';
import React from 'react';

import { mapBeachToProperty } from '@/lib/mappers/mapBeachToProperty';
import { buildBeachUrlFromSchema } from '@/lib/utils/beach-urls';
import PropertyCard from './PropertyCard';

interface DynamicPropertyCardProps {
  beach: BeachSchema;
  onLocationClick?: (latitude: string, longitude: string, beachId?: number) => void;
}

// OPTIMIZATION: Memoize to prevent unnecessary re-renders and blinking
export const DynamicPropertyCard = React.memo(({
  beach,
  onLocationClick,
}: DynamicPropertyCardProps) => {
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
}, (prevProps, nextProps) => {
  // Only re-render if beach ID changed
  return prevProps.beach.id === nextProps.beach.id;
});

DynamicPropertyCard.displayName = 'DynamicPropertyCard';

export default DynamicPropertyCard;
