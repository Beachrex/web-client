"use client";

import AccommodationSection from "@/app/components/Home/AccommodationSection";
import BeachCategorySearch from "@/app/components/Home/BeachCategorySearch";
import HeroSection from "@/app/components/Home/HeroSection";
import TopDesinationsSection from "@/app/components/Home/TopDestination";
import WorldMapSection from "@/app/components/Home/WorldMapSection";
import { fetchFromApi } from "@/app/utils/apiHelper";
import { Button, Carousel } from "flowbite-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import TestimonialsSection from "../components/Home/TestimonialsSection";

interface Counters {
  totalBeaches: number;
  totalCountries: number;
  totalContinents: number;
  seaBeaches: number;
  islandsCount: number;
  sweetwaterBeaches: number;
  boatOnlyBeaches: number;
}

const skeletonLoader = (
  <div className="grid grid-cols-1 gap-4 text-center sm:grid-cols-2 sm:gap-6 md:grid-cols-3 lg:gap-8">
    {Array.from({ length: 7 }).map((_, index) => (
      <div
        key={index}
        className="flex flex-col items-center justify-center rounded-xl bg-gray-200 p-3 sm:p-4"
      >
        <div className="mb-2 h-6 w-24 rounded bg-gray-300 sm:h-8 sm:w-32" />
        <div className="h-4 w-16 rounded bg-gray-300 sm:h-6 sm:w-24" />
      </div>
    ))}
  </div>
);

export default function HomePage() {
  const t = useTranslations("HomePage");
  const [counters, setCounters] = useState<Counters | null>(null);
  const [error, setError] = useState<string | null>(null);
  const isMounted = useRef(false);

  useEffect(() => {
    if (isMounted.current) return; // Prevent fetching again
    isMounted.current = true;

    const fetchCounters = async () => {
      try {
        const data = await fetchFromApi<Counters>("");
        setCounters(data);
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        setError(errorMessage);
      }
    };

    void fetchCounters(); // Silences no-floating-promises warning
  }, []);

  return (
    <>
      {/* Hero Section */}
      <HeroSection />
      {/* World Map Section */}
      <WorldMapSection />
      {/* Beach Category Search Section */}
      <BeachCategorySearch />

      {/* Statistics Section */}
      <section className="bg-gray-400 py-8 sm:py-12 lg:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {error && (
            <div className="mb-4 rounded-lg bg-red-100 p-3 text-center text-red-700 sm:p-4">
              {error}
            </div>
          )}

          {/* New Beaches Button - Mobile: Top, Desktop: Absolute */}
          <div className="mb-6 flex justify-center sm:mb-8 lg:absolute lg:right-8 lg:top-8 lg:mb-0">
            <Button className="rounded-lg bg-red-500 px-4 py-2 text-sm font-bold text-white transition duration-300 hover:bg-red-600 sm:px-6 sm:py-3 sm:text-base">
              New Beaches
            </Button>
          </div>

          {counters ? (
            <div className="grid grid-cols-1 gap-4 text-center sm:grid-cols-2 sm:gap-6 md:grid-cols-3 lg:gap-8">
              <div className="flex flex-col items-center justify-center rounded-xl bg-white/10 p-3 transition-colors hover:bg-white/20 sm:p-4">
                <h3 className="text-lg font-bold text-white sm:text-xl lg:text-2xl">{t("allBeaches")}</h3>
                <div className="text-base text-white/90 sm:text-lg">{counters.totalBeaches}</div>
              </div>
              <div className="flex flex-col items-center justify-center rounded-xl bg-white/10 p-3 transition-colors hover:bg-white/20 sm:p-4">
                <h3 className="text-lg font-bold text-white sm:text-xl lg:text-2xl">{t("beachCountries")}</h3>
                <div className="text-base text-white/90 sm:text-lg">{counters.totalCountries}</div>
              </div>
              <div className="flex flex-col items-center justify-center rounded-xl bg-white/10 p-3 transition-colors hover:bg-white/20 sm:p-4">
                <h3 className="text-lg font-bold text-white sm:text-xl lg:text-2xl">{t("beachContinents")}</h3>
                <div className="text-base text-white/90 sm:text-lg">{counters.totalContinents}</div>
              </div>
              <div className="flex flex-col items-center justify-center rounded-xl bg-white/10 p-3 transition-colors hover:bg-white/20 sm:p-4">
                <h3 className="text-lg font-bold text-white sm:text-xl lg:text-2xl">{t("seaBeaches")}</h3>
                <div className="text-base text-white/90 sm:text-lg">{counters.seaBeaches}</div>
              </div>
              <div className="flex flex-col items-center justify-center rounded-xl bg-white/10 p-3 transition-colors hover:bg-white/20 sm:p-4">
                <h3 className="text-lg font-bold text-white sm:text-xl lg:text-2xl">{t("beachIslands")}</h3>
                <div className="text-base text-white/90 sm:text-lg">{counters.islandsCount}</div>
              </div>
              <div className="flex flex-col items-center justify-center rounded-xl bg-white/10 p-3 transition-colors hover:bg-white/20 sm:p-4">
                <h3 className="text-lg font-bold text-white sm:text-xl lg:text-2xl">{t("sweetwaterBeaches")}</h3>
                <div className="text-base text-white/90 sm:text-lg">{counters.sweetwaterBeaches}</div>
              </div>
              <div className="flex flex-col items-center justify-center rounded-xl bg-white/10 p-3 transition-colors hover:bg-white/20 sm:p-4">
                <h3 className="text-lg font-bold text-white sm:text-xl lg:text-2xl">{t("boatOnlyBeaches")}</h3>
                <div className="text-base text-white/90 sm:text-lg">{counters.boatOnlyBeaches}</div>
              </div>
            </div>
          ) : (
            skeletonLoader
          )}
        </div>
      </section>

      <AccommodationSection />
      <TopDesinationsSection />
      <TestimonialsSection />

      {/* Carousel Section */}
      <section className="bg-gray-50 py-8 sm:py-12 lg:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-48 sm:h-64 md:h-72 lg:h-80 xl:h-96">
            <Carousel pauseOnHover className="rounded-lg overflow-hidden">
              <Image
                width={800}
                height={400}
                src="https://flowbite.com/docs/images/carousel/carousel-1.svg"
                alt="Carousel image 1"
                className="w-full h-full object-cover"
              />
              <Image
                width={800}
                height={400}
                src="https://flowbite.com/docs/images/carousel/carousel-2.svg"
                alt="Carousel image 2"
                className="w-full h-full object-cover"
              />
              <Image
                width={800}
                height={400}
                src="https://flowbite.com/docs/images/carousel/carousel-3.svg"
                alt="Carousel image 3"
                className="w-full h-full object-cover"
              />
              <Image
                width={800}
                height={400}
                src="https://flowbite.com/docs/images/carousel/carousel-4.svg"
                alt="Carousel image 4"
                className="w-full h-full object-cover"
              />
              <Image
                width={800}
                height={400}
                src="https://flowbite.com/docs/images/carousel/carousel-5.svg"
                alt="Carousel image 5"
                className="w-full h-full object-cover"
              />
            </Carousel>
          </div>
        </div>
      </section>
    </>
  );
}
