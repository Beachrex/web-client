'use client';

import { useTranslations } from 'next-intl';
import { isDestinationSort, type DestinationSort } from '@/lib/utils/destination-sort';

interface DestinationSortSelectProps {
  value: DestinationSort;
  onChange: (value: DestinationSort) => void;
}

/** "Sort by" control for destination carousels: alphabetical, most beaches, fewest beaches. */
export default function DestinationSortSelect({ value, onChange }: DestinationSortSelectProps) {
  const t = useTranslations('ContinentPage');

  return (
    <label className="flex items-center gap-2 font-figtree text-[14px] font-bold text-[#8D8D8D]">
      <span>{t('sortBy')}</span>
      <select
        value={value}
        onChange={(e) => {
          if (isDestinationSort(e.target.value)) onChange(e.target.value);
        }}
        className="rounded-md border border-gray-300 bg-white py-1.5 pl-3 pr-8 text-[14px] font-normal text-[#222222] focus:border-[#00B2C9] focus:ring-[#00B2C9]"
      >
        <option value="name">{t('sortAlphabetical')}</option>
        <option value="beaches_desc">{t('sortBeachesDesc')}</option>
        <option value="beaches_asc">{t('sortBeachesAsc')}</option>
      </select>
    </label>
  );
}
