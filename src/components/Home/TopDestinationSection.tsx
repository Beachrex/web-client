'use client';
import DestinationsCarousel from '../DestinationsCarousel';
import type { CountryResource } from '@/lib/api-client/types.gen';

interface TopDestinationsSectionProps {
  title: string;
  items: CountryResource[];
  countLabel: string;
  badgeLabel: string;
}

export default function TopDestinationsSection({
  title,
  items,
  countLabel,
  badgeLabel,
}: TopDestinationsSectionProps) {
  return (
    <DestinationsCarousel
      items={items}
      title={title}
      countLabel={countLabel}
      badgeLabel={badgeLabel}
    />
  );
}
