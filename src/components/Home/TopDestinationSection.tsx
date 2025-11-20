'use client';
import type { Country } from '@/lib/api-client/types.gen';
import DestinationsCarousel from '../DestinationsCarousel';

interface TopDestinationsSectionProps {
  title: string;
  items: Country[];
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
      backgroundClassName="bg-[#F5F5F5] border border-[#E7E7E7]" // ali border na vseh straneh: "bg-[#F5F5F5] border border-[#E7E7E7]"
      titleClassName="text-[#1A3C68]"
    />
  );
}
