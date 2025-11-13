'use client';

import PropertySection from '@/components/PropertySection';
import { useTranslations } from 'next-intl';
import React from 'react';
import DistanceDropdown, { type DistanceOption } from '../DistanceDropdown';

interface Property {
  id: string;
  image: string;
  title: string;
  location: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviews: number;
  discount?: string;
  isFreeBreakfast?: boolean;
  isFreeCancellation?: boolean;
}

interface SimilarBeachesSectionProps {
  properties: Property[];
  distanceOptions?: DistanceOption[];
  selectedDistance?: DistanceOption;
  onDistanceChange?: (value: string | number) => void;
}

const SimilarBeachesSection: React.FC<SimilarBeachesSectionProps> = ({
  properties,
  distanceOptions = [
    { value: 0.25, label: '250 m' },
    { value: 0.5, label: '500 m' },
    { value: 1, label: '1 km' },
    { value: 2, label: '2 km' },
  ],
  selectedDistance,
  onDistanceChange,
}) => {
  const t = useTranslations('BeachSimilarBeaches');

  return (
    <PropertySection
      title={t('title')}
      properties={properties}
      headerRight={
        <DistanceDropdown
          value={selectedDistance?.value ?? distanceOptions[0]?.value ?? ''}
          options={distanceOptions}
          onChange={(val) => onDistanceChange?.(val)}
          ariaLabel={t('dropdownAria')}
          renderOptionLabel={(opt) =>
            t('dropdownOption', { distance: opt.label })
          }
        />
      }
    />
  );
};

export default SimilarBeachesSection;
