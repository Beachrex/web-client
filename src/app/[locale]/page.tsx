'use client';

import AccommodationSection from '@/app/components/Home/AccommodationSection';
import BeachCategorySearch from '@/app/components/Home/BeachCategorySearch';
import HeroSection from '@/app/components/Home/HeroSection';
import TopDesinationsSection from '@/app/components/Home/TopDestination';
import WorldMapSection from '@/app/components/Home/WorldMapSection';
import BeachMediaSection from '../components/Home/BeachMediaSection';
import ExploreSection from '../components/Home/ExploreSection';

export default function HomePage() {

  return (
    <>
      {/* Hero Section */}
      <HeroSection />
      {/* World Map Section */}
      <WorldMapSection />

      {/* Beach Category Search Section */}
      <BeachCategorySearch />
      <BeachMediaSection />

      <AccommodationSection />
      <TopDesinationsSection />
      <ExploreSection />
    </>
  );
}
