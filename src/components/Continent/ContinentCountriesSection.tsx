'use client';

import DestinationsCarousel from '@/components/DestinationsCarousel';
import { useCountries } from '@/hooks/useCountries';
import { useTranslations, useLocale } from 'next-intl';
import { buildDestinationUrl } from '@/lib/utils/destination-url';
import { useMemo, useState } from 'react';
import DestinationSortSelect from '@/components/DestinationSortSelect';
import {
  DEFAULT_DESTINATION_SORT,
  sortDestinations,
  type DestinationSort,
} from '@/lib/utils/destination-sort';

interface CountryDestinationItem {
  slug: string;
  continent: {
    slug: string;
  };
}

interface ContinentCountriesSectionProps {
  title?: string;
  /** Only countries of this continent (continent pages); all countries when omitted (world page). */
  continentCode?: string;
  titleKey?: string;
  backgroundClassName?: string;
  titleClassName?: string;
}

export default function ContinentCountriesSection({
  title,
  continentCode,
  titleKey,
  backgroundClassName,
  titleClassName,
}: ContinentCountriesSectionProps) {
  const tHome = useTranslations('HomePage');
  const locale = useLocale();
  const tCommon = useTranslations('Common');

  // Callers pass a translated title; the old default was a hardcoded "Countries in Europe" on every continent.
  const resolvedTitle = title ?? (titleKey ? tCommon(titleKey) : tHome('beachCountries'));

  const { countries, loading } = useCountries(continentCode);
  const [sort, setSort] = useState<DestinationSort>(DEFAULT_DESTINATION_SORT);

  const sortedCountries = useMemo(
    () => sortDestinations(countries, sort, locale),
    [countries, sort, locale],
  );

  if (loading || countries.length === 0) return null;

  const countriesWithUrl = sortedCountries.map((c) => {
    const item = c as unknown as CountryDestinationItem;

    return {
      ...c,
      url: buildDestinationUrl({
        locale,
        type: 'country',
        slug: item.slug,
        location: {
          continent_slug: item.continent.slug,
          country_slug: item.slug,
        },
      }),
    };
  });

  return (
    <DestinationsCarousel
  items={countriesWithUrl}
  title={resolvedTitle}
  countLabel={tHome('allCountriesCount', {
    count: countriesWithUrl.length,
  })}
  badgeLabel={tHome('seaExperiences')}
  showFlag
  headerActions={<DestinationSortSelect value={sort} onChange={setSort} />}
  backgroundClassName={backgroundClassName}
  titleClassName={titleClassName}
    />

  );
}
