'use client';

import DestinationsCarousel from '@/components/DestinationsCarousel';
import { useCountries } from '@/hooks/useCountries';
import { useTranslations, useLocale } from 'next-intl';
import { buildDestinationUrl } from '@/lib/utils/destination-url';
import { useMemo, useState } from 'react';

type CountrySort = 'name' | 'beaches_desc' | 'beaches_asc';

// App locale codes that differ from BCP 47 (used for alphabetical collation)
const COLLATION_LOCALE: Record<string, string> = { si: 'sl', ua: 'uk' };

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
  const [sort, setSort] = useState<CountrySort>('name');

  const sortedCountries = useMemo(() => {
    const collator = new Intl.Collator(COLLATION_LOCALE[locale] ?? locale, {
      sensitivity: 'base',
    });
    const byName = (a: (typeof countries)[number], b: (typeof countries)[number]) =>
      collator.compare(a.name ?? '', b.name ?? '');

    return [...countries].sort((a, b) => {
      if (sort === 'name') return byName(a, b);
      const diff = (a.beaches_count ?? 0) - (b.beaches_count ?? 0);
      if (diff !== 0) return sort === 'beaches_asc' ? diff : -diff;
      return byName(a, b);
    });
  }, [countries, sort, locale]);

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
  headerActions={
    <label className="flex items-center gap-2 font-figtree text-[14px] font-bold text-[#8D8D8D]">
      <span>{tContinent('sortBy')}</span>
      <select
        value={sort}
        onChange={(e) => setSort(e.target.value as CountrySort)}
        className="rounded-md border border-gray-300 bg-white py-1.5 pl-3 pr-8 text-[14px] font-normal text-[#222222] focus:border-[#00B2C9] focus:ring-[#00B2C9]"
      >
        <option value="name">{tContinent('sortAlphabetical')}</option>
        <option value="beaches_desc">{tContinent('sortBeachesDesc')}</option>
        <option value="beaches_asc">{tContinent('sortBeachesAsc')}</option>
      </select>
    </label>
  }
  backgroundClassName={backgroundClassName}
  titleClassName={titleClassName}
    />

  );
}
