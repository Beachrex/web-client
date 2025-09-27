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
  <div className="grid grid-cols-1 gap-8 text-center sm:grid-cols-2 md:grid-cols-3">
    {Array.from({ length: 7 }).map((_, index) => (
      <div
        key={index}
        className="flex flex-col items-center justify-center rounded-xl bg-gray-200 p-4"
      >
        <div className="mb-2 h-8 w-32 rounded bg-gray-300" />
        <div className="h-6 w-24 rounded bg-gray-300" />
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

      <div className="flex flex-col items-center">
        <div className="container relative mt-10 flex flex-col items-center justify-center gap-12 bg-gray-400 px-4 py-16">
          {error && <div>{error}</div>}
          {counters ? (
            <div className="grid grid-cols-1 gap-8 text-center sm:grid-cols-2 md:grid-cols-3">
              <div className="flex flex-col items-center justify-center rounded-xl bg-white/10 p-4 hover:bg-white/20">
                <h3 className="text-2xl font-bold">{t("allBeaches")}</h3>
                <div className="text-lg">{counters.totalBeaches}</div>
              </div>
              <div className="flex flex-col items-center justify-center rounded-xl bg-white/10 p-4 hover:bg-white/20">
                <h3 className="text-2xl font-bold">{t("beachCountries")}</h3>
                <div className="text-lg">{counters.totalCountries}</div>
              </div>
              <div className="flex flex-col items-center justify-center rounded-xl bg-white/10 p-4 hover:bg-white/20">
                <h3 className="text-2xl font-bold">{t("beachContinents")}</h3>
                <div className="text-lg">{counters.totalContinents}</div>
              </div>
              <div className="flex flex-col items-center justify-center rounded-xl bg-white/10 p-4 hover:bg-white/20">
                <h3 className="text-2xl font-bold">{t("seaBeaches")}</h3>
                <div className="text-lg">{counters.seaBeaches}</div>
              </div>
              <div className="flex flex-col items-center justify-center rounded-xl bg-white/10 p-4 hover:bg-white/20">
                <h3 className="text-2xl font-bold">{t("beachIslands")}</h3>
                <div className="text-lg">{counters.islandsCount}</div>
              </div>
              <div className="flex flex-col items-center justify-center rounded-xl bg-white/10 p-4 hover:bg-white/20">
                <h3 className="text-2xl font-bold">{t("sweetwaterBeaches")}</h3>
                <div className="text-lg">{counters.sweetwaterBeaches}</div>
              </div>
              <div className="flex flex-col items-center justify-center rounded-xl bg-white/10 p-4 hover:bg-white/20">
                <h3 className="text-2xl font-bold">{t("boatOnlyBeaches")}</h3>
                <div className="text-lg">{counters.boatOnlyBeaches}</div>
              </div>
              {/* Add other counters here */}

              <div className="absolute right-4 top-4">
                <Button className="rounded-lg bg-red-500 px-6 py-3 font-bold text-white transition duration-300 hover:bg-red-600">
                  New Beaches
                </Button>
              </div>
            </div>
          ) : (
            skeletonLoader // Show skeleton loader while data is being fetched
          )}
        </div>
      </div>

      <AccommodationSection />
      <TopDesinationsSection />
      <TestimonialsSection />
      <div className="m-4 h-56 sm:h-64 xl:h-80 2xl:h-96">
        <Carousel pauseOnHover>
          <Image
            width="50"
            height="50"
            src="https://flowbite.com/docs/images/carousel/carousel-1.svg"
            alt="..."
          />
          <Image
            width="50"
            height="50"
            src="https://flowbite.com/docs/images/carousel/carousel-2.svg"
            alt="..."
          />
          <Image
            width="50"
            height="50"
            src="https://flowbite.com/docs/images/carousel/carousel-3.svg"
            alt="..."
          />
          <Image
            width="50"
            height="50"
            src="https://flowbite.com/docs/images/carousel/carousel-4.svg"
            alt="..."
          />
          <Image
            width="50"
            height="50"
            src="https://flowbite.com/docs/images/carousel/carousel-5.svg"
            alt="..."
          />
        </Carousel>
      </div>
    </>
  );
}
