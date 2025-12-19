'use client';

import type { BeachSchema } from '@/lib/api-client/types.gen';
import { useLocale } from 'next-intl';
import Link from 'next/link';

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

  if (!property) return null;

  const beachUrl = buildBeachUrlFromSchema(beach, locale);

  const card = (
    <PropertyCard
      {...property}
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


  return beachUrl ? (
    <Link
  href={beachUrl}
  className="block cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1A3C68] focus-visible:ring-offset-2 rounded-[10px]"
    >

      {card}
    </Link>
  ) : (
    <div className="block">
      {card}
    </div>
  );
}

export default DynamicPropertyCard;
