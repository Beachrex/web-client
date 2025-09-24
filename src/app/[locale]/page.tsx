"use client";

import { useEffect, useState, useRef } from "react";
import { fetchFromApi } from "@/app/utils/apiHelper";
import { Carousel, Button } from "flowbite-react";
import { useTranslations } from 'next-intl';
import Image from "next/image";
import WorldMapSection from "@/app/components/Home/WorldMapSection";
import BeachCategorySearch from "@/app/components/Home/BeachCategorySearch";

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
    <div className="grid grid-cols-1 text-center sm:grid-cols-2 md:grid-cols-3 gap-8">
        {Array.from({ length: 7 }).map((_, index) => (
            <div key={index} className="flex flex-col items-center justify-center rounded-xl bg-gray-200 p-4">
                <div className="h-8 w-32 bg-gray-300 rounded mb-2" />
                <div className="h-6 w-24 bg-gray-300 rounded" />
            </div>
        ))}
    </div>
);

export default function HomePage() {
    const t = useTranslations('HomePage');
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
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                setError(errorMessage);
            }
        };

        void fetchCounters(); // Silences no-floating-promises warning
    }, []);

    return (
        <>
            {/* World Map Section */}
            <WorldMapSection />
            {/* Beach Category Search Section */}
            <BeachCategorySearch />

            <div className="flex flex-col items-center">
                <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 relative">
                    {error && <div>{error}</div>}
                    {counters ? (
                        <div className="grid grid-cols-1 text-center sm:grid-cols-2 md:grid-cols-3 gap-8">
                            <div
                                className="flex flex-col items-center justify-center rounded-xl bg-white/10 p-4 hover:bg-white/20">
                                <h3 className="text-2xl font-bold">{t('allBeaches')}</h3>
                                <div className="text-lg">{counters.totalBeaches}</div>
                            </div>
                            <div
                                className="flex flex-col items-center justify-center rounded-xl bg-white/10 p-4 hover:bg-white/20">
                                <h3 className="text-2xl font-bold">{t('beachCountries')}</h3>
                                <div className="text-lg">{counters.totalCountries}</div>
                            </div>
                            <div
                                className="flex flex-col items-center justify-center rounded-xl bg-white/10 p-4 hover:bg-white/20">
                                <h3 className="text-2xl font-bold">{t('beachContinents')}</h3>
                                <div className="text-lg">{counters.totalContinents}</div>
                            </div>
                            <div
                                className="flex flex-col items-center justify-center rounded-xl bg-white/10 p-4 hover:bg-white/20">
                                <h3 className="text-2xl font-bold">{t('seaBeaches')}</h3>
                                <div className="text-lg">{counters.seaBeaches}</div>
                            </div>
                            <div
                                className="flex flex-col items-center justify-center rounded-xl bg-white/10 p-4 hover:bg-white/20">
                                <h3 className="text-2xl font-bold">{t('beachIslands')}</h3>
                                <div className="text-lg">{counters.islandsCount}</div>
                            </div>
                            <div
                                className="flex flex-col items-center justify-center rounded-xl bg-white/10 p-4 hover:bg-white/20">
                                <h3 className="text-2xl font-bold">{t('sweetwaterBeaches')}</h3>
                                <div className="text-lg">{counters.sweetwaterBeaches}</div>
                            </div>
                            <div
                                className="flex flex-col items-center justify-center rounded-xl bg-white/10 p-4 hover:bg-white/20">
                                <h3 className="text-2xl font-bold">{t('boatOnlyBeaches')}</h3>
                                <div className="text-lg">{counters.boatOnlyBeaches}</div>
                            </div>
                            {/* Add other counters here */}

                            <div className="absolute top-4 right-4">
                                <Button className="bg-red-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-red-600 transition duration-300">
                                    New Beaches
                                </Button>
                            </div>
                        </div>
                    ) : (
                        skeletonLoader // Show skeleton loader while data is being fetched
                    )}
                </div>
            </div>



            <div className="h-56 sm:h-64 xl:h-80 2xl:h-96 m-4">
                <Carousel pauseOnHover>
                    <Image width="50" height="50" src="https://flowbite.com/docs/images/carousel/carousel-1.svg" alt="..."/>
                    <Image width="50" height="50" src="https://flowbite.com/docs/images/carousel/carousel-2.svg" alt="..."/>
                    <Image width="50" height="50" src="https://flowbite.com/docs/images/carousel/carousel-3.svg" alt="..."/>
                    <Image width="50" height="50" src="https://flowbite.com/docs/images/carousel/carousel-4.svg" alt="..."/>
                    <Image width="50" height="50" src="https://flowbite.com/docs/images/carousel/carousel-5.svg" alt="..."/>
                </Carousel>
            </div>
        </>
    );
}
