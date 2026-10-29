'use client';

import PropertySection, {
  type Property,
} from '@/components/PropertySection';
import { useTranslations } from 'next-intl';
import React from 'react';
import DistanceDropdown, { type DistanceOption } from '../DistanceDropdown';
import { MapPin } from 'lucide-react';
import Image from 'next/image';

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
    { value: 50, label: '50 km' },
    { value: 100, label: '100 km' },
  ],
  selectedDistance,
  onDistanceChange,
}) => {
  const t = useTranslations('BeachSimilarBeaches');

  // If no properties, show empty state
  if (properties.length === 0) {
    return (
      <section className="relative overflow-x-hidden bg-white py-10 sm:py-14 lg:py-20">
        <div className="container relative z-10 mx-auto">
          {/* HEADER */}
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4 sm:mb-6">
            <h2 className="font-figtree text-[22px] sm:text-[26px] lg:text-[30px] font-bold text-[#222222]">
              {t('title')}
            </h2>

            <div className="flex flex-wrap items-center gap-[16px]">
              <DistanceDropdown
                value={selectedDistance?.value ?? distanceOptions[1]?.value ?? ''}
                options={distanceOptions}
                onChange={(val) => onDistanceChange?.(val)}
                ariaLabel={t('dropdownAria')}
                renderOptionLabel={(opt) =>
                  t('dropdownOption', { distance: opt.label })
                }
              />
            </div>
          </div>

          {/* EMPTY STATE */}
          <div className="flex flex-col items-center justify-center py-12 sm:py-16 lg:py-20">
            <div className="relative mb-6 h-32 w-32 sm:h-40 sm:w-40">
              <Image
                src="/images/propertycard/beach-gray.png"
                alt=""
                width={160}
                height={160}
                className="h-full w-full object-contain"
              />
            </div>

            <div className="flex items-center gap-2 mb-3">
              <MapPin className="h-5 w-5 text-gray-400" />
              <h3 className="font-figtree text-lg sm:text-xl font-semibold text-gray-700">
                {t('emptyStateTitle')}
              </h3>
            </div>

            <p className="max-w-md text-center font-figtree text-sm sm:text-base text-gray-500">
              {t('emptyStateDescription', {
                distance: selectedDistance?.label ?? distanceOptions[1]?.label ?? '15 km',
              })}
            </p>

            <p className="mt-2 text-center font-figtree text-xs sm:text-sm text-gray-400">
              {t('emptyStateHint')}
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <PropertySection
      title={t('title')}
      properties={properties}
      totalCount={properties.length}
      controlsBelowHeader={
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
