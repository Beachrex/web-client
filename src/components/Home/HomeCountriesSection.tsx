'use client';

import { useCountries } from '@/hooks/useCountries';
import DestinationsSection from '../DestinationsSection';

export default function HomeCountriesSection() {
  const { countries } = useCountries();

  if (!countries || countries.length === 0) {
    return null;
  }

const countriesWithLocation = countries
  .map((c) => {
    const item = c as unknown as {
      slug: string;
      continent: { slug: string };
    };

    return {
      ...c,
      location: {
        continent_slug: item.continent.slug,
        country_slug: item.slug,
      },
    };
  });


  return (
    <DestinationsSection
  context="home"
  sections={[
    {
      type: 'country',
      items: countriesWithLocation,
      titleKey: 'mostBeatifulDestinationsWorld',
      titleNamespace: 'Common',
      badgeKey: 'seaExperiences',
      showFlag: true,
      backgroundClassName: 'bg-[#F5F5F5]',
      titleClassName: 'text-[#1A3C68]',
    },
  ]}
    />

  );
}
