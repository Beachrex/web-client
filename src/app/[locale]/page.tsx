import BeachCategorySearch from '@/components/Home/BeachCategorySearch';
import HeroSection from '@/components/Home/HeroSection';
import HomeAccommodationSection from '@/components/Home/HomeAccommodationSection';
import TopDestinationsSection from '@/components/Home/TopDestinationSection';
import WorldMapSection from '@/components/Home/WorldMapSection';
import BeachMediaSection from '../../components/Home/BeachMediaSection';
import ExploreSection from '../../components/Home/ExploreSection';

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

      <HomeAccommodationSection />
      <TopDestinationsSection />
      <ExploreSection />
    </>
  );
}
