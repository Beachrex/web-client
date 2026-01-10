'use client';

import DestinationsCarousel from '@/components/DestinationsCarousel';
import { useCountries } from '@/hooks/useCountries';
import { useTranslations, useLocale } from 'next-intl';
import { buildDestinationUrl } from '@/lib/utils/destination-url';

interface CountryDestinationItem {
  slug: string;
  continent: {
    slug: string;
  };
}

interface ContinentCountriesSectionProps {
  title?: string;
  titleKey?: string;
  backgroundClassName?: string;
  titleClassName?: string;
}

export default function ContinentCountriesSection({
  title,
  titleKey,
  backgroundClassName,
  titleClassName,
}: ContinentCountriesSectionProps) {
  const tContinent = useTranslations('ContinentPage');
  const tHome = useTranslations('HomePage');
  const locale = useLocale();
  const tCommon = useTranslations('Common');

  const resolvedTitle =
    title ??
    (titleKey
      ? tCommon(titleKey)
      : tContinent('countriesContinent', { continent: 'Europe' }));

  const { countries, loading } = useCountries();

  if (loading || countries.length === 0) return null;

  const countriesWithUrl = countries.map((c) => {
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
  backgroundClassName={backgroundClassName}
  titleClassName={titleClassName}
    />

  );
}
