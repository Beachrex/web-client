'use client';
import { Button } from 'flowbite-react';
import Image from 'next/image';
import React, { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { getBeachFiltersOptions } from '@/lib/api-client/@tanstack/react-query.gen';
import type { GetBeachFiltersResponse } from '@/lib/api-client/types.gen';

interface CategoryItem {
  filterKey: string;
  optionCode: string;
  icon: string;
  label: string;
  description?: string;
}

interface BeachCategorySearchProps {
  title: string;
  description: string;
  seaBeachesLabel: string;
  lakeBeachesLabel: string;
  riverBeachesLabel: string;
  outdoorPoolsLabel: string;
  indoorPoolsSpasLabel: string;
}

const BeachCategorySearch: React.FC<BeachCategorySearchProps> = ({
  title,
  description,
  seaBeachesLabel,
  lakeBeachesLabel,
  riverBeachesLabel,
  outdoorPoolsLabel,
  indoorPoolsSpasLabel,
}) => {
  const [selectedCategories, setSelectedCategories] = useState<
    Record<string, string[]>
  >({});
  const t = useTranslations('BeachCategories');
  const locale = useLocale();
  const router = useRouter();

  // Fetch filter options from API (same as map page)
  const { data: filtersData, isLoading: filtersLoading } = useQuery(
    getBeachFiltersOptions({
      query: {} as never,
    })
  );

  const filterOptions = (filtersData?.data ?? null) as GetBeachFiltersResponse['data'] | null;

  // Localized beach-map routes
  const beachMapRoutes: Record<string, string> = {
    en: 'beach-map',
    si: 'zemljevid-plaz',
    de: 'strand-karte',
    hr: 'karta-plaza',
    fr: 'carte-des-plages',
    es: 'mapa-de-playas',
    it: 'mappa-spiagge',
    ua: 'karta-plyazhiv',
    ru: 'karta-plyazhey',
    pl: 'mapa-plaz',
    cs: 'mapa-plazi',
    hu: 'strand-terkep',
    bg: 'karta-na-plyazhovete',
    sk: 'mapa-plazi',
  };

  const getLocalizedMapRoute = () => {
    return beachMapRoutes[locale] ?? 'beach-map';
  };

  // Convert API filter options to flat category list for display
  // We'll show all filter options from the API dynamically
  const categories = React.useMemo(() => {
    if (!filterOptions) return [];

    const allCategories: {
      filterKey: string;
      optionCode: string;
      label: string;
      icon: string;
    }[] = [];

    // Priority filter keys to show on homepage (in order)
    const priorityFilters = [
      'beach_type',
      'location_infrastructure',
      'natural_location_condition',
      'accommodation_around',
      'sporting_activities',
      'culinary_offer',
    ];

    priorityFilters.forEach(filterKey => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const filter = filterOptions[filterKey as keyof typeof filterOptions];
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (!filter?.options) return;

      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      filter.options.forEach((option: { code?: string; name?: string }) => {
        if (option.code && option.name) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          const iconPath = filter.icon;
          allCategories.push({
            filterKey,
            optionCode: option.code,
            label: option.name,
            icon: iconPath ?? '/images/categories/default.png',
          });
        }
      });
    });

    return allCategories;
  }, [filterOptions]);

  const toggleCategory = (filterKey: string, optionCode: string) => {
    setSelectedCategories((prev) => {
      const currentValues = prev[filterKey] ?? [];
      const isSelected = currentValues.includes(optionCode);

      if (isSelected) {
        // Remove this option
        const newValues = currentValues.filter(code => code !== optionCode);
        if (newValues.length === 0) {
          // Remove entire filter key if no options selected
          const { [filterKey]: _, ...rest } = prev;
          return rest;
        }
        return { ...prev, [filterKey]: newValues };
      } else {
        // Add this option
        return {
          ...prev,
          [filterKey]: [...currentValues, optionCode],
        };
      }
    });
  };

  const handleShowAdvancedFilters = () => {
    // Build query parameters from selected categories
    const queryParams = new URLSearchParams();

    // selectedCategories is already grouped by filter key
    // e.g., { beach_type: ['sand', 'grass_beach'], location_infrastructure: ['parking'] }
    Object.entries(selectedCategories).forEach(([filterKey, optionCodes]) => {
      if (optionCodes.length > 0) {
        // Join multiple values with comma
        queryParams.set(filterKey, optionCodes.join(','));
      }
    });

    // Build the localized map URL with query parameters
    const mapRoute = getLocalizedMapRoute();
    const queryString = queryParams.toString();
    const mapUrl = `/${locale}/${mapRoute}${queryString ? `?${queryString}` : ''}`;

    console.log('[BeachCategorySearch] Navigating to map with filters:', {
      selectedCategories,
      queryString,
      mapUrl,
    });

    // Navigate to map page with filters
    router.push(mapUrl);
  };

  const CategoryButton: React.FC<{ category: CategoryItem }> = ({
    category,
  }) => {
    const isSelected = selectedCategories[category.filterKey]?.includes(category.optionCode) ?? false;

    return (
      <button
        onClick={() => toggleCategory(category.filterKey, category.optionCode)}
        className={`
    flex aspect-square w-full flex-col items-center justify-center gap-1
    rounded border border-[#E0E0E0] bg-[#F5F5F5] p-1 transition-all duration-200
    sm:gap-2 sm:p-2 md:gap-3 md:p-3 lg:gap-[10px] lg:p-[8px_3px]
    ${
      isSelected
        ? 'border-blue-500 bg-blue-50 text-blue-700'
        : 'text-[#4D4D4D]'
    }
  `}
      >
        {/* Ikona (slika) */}
        <Image
          src={category.icon}
          alt={category.label}
          width={32}
          height={32}
          className="h-4 w-4 object-contain sm:h-5 sm:w-5 md:h-6 md:w-6 lg:h-7 lg:w-7 xl:h-8 xl:w-8"
        />
        {/* Label */}
        <div className="text-center text-[7px] font-medium leading-tight sm:text-[8px] sm:leading-tight md:text-[9px] lg:text-[10px] lg:leading-[100%] xl:text-[12px]">
          {category.label}
        </div>
      </button>
    );
  };

  return (
    <section className="py-12 sm:py-16 lg:py-20">
      <div className="container mx-auto">
        <div className="rounded-lg bg-variable-collection-temno-modro px-4 py-8 text-center sm:px-8 sm:py-12 lg:px-16 lg:py-16 xl:px-24">
          <h2 className="mb-6 font-[Figtree] text-[30px] font-bold leading-[100%] text-white">
            {title}
          </h2>
          <p className="text-white mx-auto mb-8 max-w-4xl font-[Figtree] text-[14px] font-light leading-[24px]">
            {description}
          </p>
          {/* Category Grid */}
          {filtersLoading ? (
            <div className="py-12 text-center text-white">
              Loading filters...
            </div>
          ) : (
            <div className="mb-4 grid grid-cols-4 gap-2 sm:mb-6 sm:grid-cols-5 sm:gap-3 md:grid-cols-6 md:gap-4 lg:grid-cols-8 lg:gap-5 xl:grid-cols-10 xl:gap-6 2xl:grid-cols-11">
              {categories.map((category) => (
                <CategoryButton key={`${category.filterKey}-${category.optionCode}`} category={category} />
              ))}
            </div>
          )}

          {/* Selected Categories Display */}
          {Object.keys(selectedCategories).length > 0 && (
            <div className="mt-8 rounded-lg bg-white/10 p-4 backdrop-blur-sm">
              <h3 className="mb-2 font-semibold text-white">
                {t('selectedCategories')} ({Object.values(selectedCategories).flat().length})
              </h3>
              <div className="flex flex-wrap gap-2">
                {Object.entries(selectedCategories).flatMap(([filterKey, optionCodes]) =>
                  optionCodes.map((code) => {
                    const category = categories.find(
                      (c) => c.filterKey === filterKey && c.optionCode === code
                    );
                    return category ? (
                      <span
                        key={`${filterKey}-${code}`}
                        className="flex items-center gap-1 rounded-full bg-blue-500 px-3 py-1 text-sm text-white"
                      >
                        <Image
                          src={category.icon}
                          alt={category.label}
                          width={16}
                          height={16}
                        />
                        {category.label}
                        <button
                          onClick={() => toggleCategory(filterKey, code)}
                          className="ml-1 flex h-4 w-4 items-center justify-center rounded-full text-xs hover:bg-blue-600"
                        >
                          ×
                        </button>
                      </span>
                    ) : null;
                  })
                )}
              </div>
            </div>
          )}

            {/* Advanced Filters Button */}
            <div className="flex justify-center">
                <Button
                    onClick={handleShowAdvancedFilters}
                    className="flex items-center justify-center gap-3 rounded-md border border-[#E0E0E0] bg-white px-4 py-2 text-sm font-bold text-[#4D4D4D] transition-colors duration-200 hover:bg-gray-50 sm:gap-4 sm:px-5 sm:py-3 sm:text-base lg:gap-5 lg:px-6 mt-10"
                >
                    <Image
                        src="/images/filters-blue.png"
                        alt="Filtri"
                        width={20}
                        height={20}
                        className="mr-1 h-4 w-4 object-contain sm:mr-2 sm:h-5 sm:w-5"
                    />
                    {t('showAdvancedFilters')}
                </Button>
            </div>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4 xl:grid-cols-5 xl:gap-8">
          {/* Morske plaže */}
          <button
            className="relative flex h-20 items-center justify-center overflow-hidden rounded-lg px-4 py-3 text-sm font-bold text-white transition-transform hover:scale-105 sm:h-24 sm:px-6 sm:py-4 sm:text-base lg:h-[100px] lg:px-8 lg:text-lg"
            style={{ backgroundColor: '#0069AB' }}
          >
            <Image
              src="/images/categories/sea-beaches.jpg"
              alt={seaBeachesLabel}
              fill
              className="object-cover opacity-10"
            />
            <span className="relative z-10 flex items-center gap-2 sm:gap-3">
              <Image
                src="/images/categories/sunset.png"
                alt="Sunset icon"
                width={32}
                height={32}
                className="h-6 w-6 object-contain sm:h-7 sm:w-7 lg:h-8 lg:w-8"
              />
              {seaBeachesLabel}
            </span>
          </button>

          {/* Plaže ob jezeru */}
          <button
            className="relative flex h-20 items-center justify-center overflow-hidden rounded-lg px-4 py-3 text-sm font-bold text-white transition-transform hover:scale-105 sm:h-24 sm:px-6 sm:py-4 sm:text-base lg:h-[100px] lg:px-8 lg:text-lg"
            style={{ backgroundColor: '#4CC07E' }}
          >
            <Image
              src="/images/categories/lake-beaches.jpg"
              alt={lakeBeachesLabel}
              fill
              className="object-cover opacity-10"
            />
            <span className="relative z-10 flex items-center gap-2 sm:gap-3">
              <Image
                src="/images/categories/gozd.png"
                alt="Forest icon"
                width={32}
                height={32}
                className="h-6 w-6 object-contain sm:h-7 sm:w-7 lg:h-8 lg:w-8"
              />
              {lakeBeachesLabel}
            </span>
          </button>

          {/* Plaže ob reki */}
          <button
            className="relative flex h-20 items-center justify-center overflow-hidden rounded-lg px-4 py-3 text-sm font-bold text-white transition-transform hover:scale-105 sm:h-24 sm:px-6 sm:py-4 sm:text-base lg:h-[100px] lg:px-8 lg:text-lg"
            style={{ backgroundColor: '#4CC07E' }}
          >
            <Image
              src="/images/categories/river-beaches.jpg"
              alt={riverBeachesLabel}
              fill
              className="object-cover opacity-10"
            />
            <span className="relative z-10 flex items-center gap-2 sm:gap-3">
              <Image
                src="/images/categories/reka.png"
                alt="River icon"
                width={32}
                height={32}
                className="h-6 w-6 object-contain sm:h-7 sm:w-7 lg:h-8 lg:w-8"
              />
              {riverBeachesLabel}
            </span>
          </button>

          {/* Zunanji bazeni */}
          <button
            className="relative flex h-20 items-center justify-center overflow-hidden rounded-lg px-4 py-3 text-sm font-bold text-white transition-transform hover:scale-105 sm:h-24 sm:px-6 sm:py-4 sm:text-base lg:h-[100px] lg:px-8 lg:text-lg"
            style={{ backgroundColor: '#42D4F4' }}
          >
            <Image
              src="/images/categories/bazen.jpg"
              alt="Zunanji bazeni background"
              fill
              className="object-cover opacity-10"
            />
            <span className="relative z-10 flex items-center gap-2 sm:gap-3">
              <Image
                src="/images/categories/reka.png"
                alt="Pool icon"
                width={32}
                height={32}
                className="h-6 w-6 object-contain sm:h-7 sm:w-7 lg:h-8 lg:w-8"
              />
              {outdoorPoolsLabel}
            </span>
          </button>

          {/* Pokriti bazeni, terme */}
          <button
            className="relative flex h-20 items-center justify-center overflow-hidden rounded-lg px-4 py-3 text-sm font-bold text-white transition-transform hover:scale-105 sm:h-24 sm:px-6 sm:py-4 sm:text-base lg:h-[100px] lg:px-8 lg:text-lg"
            style={{ backgroundColor: '#42D4F4' }}
          >
            <Image
              src="/images/categories/indoor-pool.jpg"
              alt={indoorPoolsSpasLabel}
              fill
              className="object-cover opacity-10"
            />
            <span className="relative z-10 flex items-center gap-2 sm:gap-3">
              <Image
                src="/images/categories/reka.png"
                alt="Indoor pool icon"
                width={32}
                height={32}
                className="h-6 w-6 object-contain sm:h-7 sm:w-7 lg:h-8 lg:w-8"
              />
              {indoorPoolsSpasLabel}
            </span>
          </button>
        </div>
      </div>
    </section>
  );
};

export default BeachCategorySearch;
