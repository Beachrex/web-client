"use client";

import Link from "next/link";
import Layout from '@/app/components/Layout';
import { useEffect, useState } from "react";
import { fetchFromApi } from "@/app/utils/apiHelper";

interface Counters {
    totalBeaches: number;
    totalCountries: number;
    totalContinents: number;
    seaBeaches: number;
    islandsCount: number;
    sweetwaterBeaches: number;
    boatOnlyBeaches: number;
}
export default function HomePage() {
    const [counters, setCounters] = useState<Counters | null>(null);
    const [error, setError] = useState<string | null>(null);
    let isMounted = false;

    useEffect(() => {
        if (isMounted) return; // Prevent fetching again
        isMounted = true;
        const fetchCounters = async () => {
            try {
                // const data = await fetchFromApi<Counters>('totalBeaches,totalCountries');
                const data = await fetchFromApi<Counters>("");
                setCounters(data);
            } catch (error: any) {
                setError(error.message);
            }
        };
        fetchCounters();
    }, []);

    return (
        <Layout>
            <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
                {error && <div>{error}</div>}
                {counters && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                        <div
                            className="flex flex-col items-center justify-center rounded-xl bg-white/10 p-4 hover:bg-white/20">
                            <h3 className="text-2xl font-bold">All Beaches</h3>
                            <div className="text-lg">{counters.totalBeaches}</div>
                        </div>
                        <div
                            className="flex flex-col items-center justify-center rounded-xl bg-white/10 p-4 hover:bg-white/20">
                            <h3 className="text-2xl font-bold">Beach Countries</h3>
                            <div className="text-lg">{counters.totalCountries}</div>
                        </div>
                        <div
                            className="flex flex-col items-center justify-center rounded-xl bg-white/10 p-4 hover:bg-white/20">
                            <h3 className="text-2xl font-bold">Beach Continents</h3>
                            <div className="text-lg">{counters.totalContinents}</div>
                        </div>
                        <div
                            className="flex flex-col items-center justify-center rounded-xl bg-white/10 p-4 hover:bg-white/20">
                            <h3 className="text-2xl font-bold">Sea Beaches</h3>
                            <div className="text-lg">{counters.seaBeaches}</div>
                        </div>
                        <div
                            className="flex flex-col items-center justify-center rounded-xl bg-white/10 p-4 hover:bg-white/20">
                            <h3 className="text-2xl font-bold">Beach Islands</h3>
                            <div className="text-lg">{counters.islandsCount}</div>
                        </div>
                        <div
                            className="flex flex-col items-center justify-center rounded-xl bg-white/10 p-4 hover:bg-white/20">
                            <h3 className="text-2xl font-bold">Sweetwater Beaches</h3>
                            <div className="text-lg">{counters.sweetwaterBeaches}</div>
                        </div>
                        <div
                            className="flex flex-col items-center justify-center rounded-xl bg-white/10 p-4 hover:bg-white/20">
                            <h3 className="text-2xl font-bold">Boat Only Beaches</h3>
                            <div className="text-lg">{counters.boatOnlyBeaches}</div>
                        </div>
                        {/* Add other counters here */}
                    </div>
                )}
            </div>
        </Layout>

    );
}
