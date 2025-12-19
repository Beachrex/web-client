'use client';

import PropertySection, {
  type Property,
} from '@/components/PropertySection';
import { useTranslations } from 'next-intl';
import React from 'react';
import DistanceDropdown, { type DistanceOption } from '../DistanceDropdown';

interface SimilarBeachesSectionProps {
  properties: Property[];
  distanceOptions?: DistanceOption[];
  selectedDistance?: DistanceOption;
  onDistanceChange?: (value: string | number) => void;
}

const SimilarBeachesSection: React.FC<SimilarBeachesSectionProps> = ({
  properties,
  distanceOptions = [
    { value: 10, label: '10 km' },
    { value: 15, label: '15 km' },
    { value: 20, label: '20 km' },
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
          value={selectedDistance?.value ?? distanceOptions[1]?.value ?? ''}
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
