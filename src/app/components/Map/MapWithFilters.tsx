'use client';
import React from 'react';
import { PropertyCard } from '@/app/components/PropertyCard/PropertyCard';
import LeftSidebarFilters from '@/app/components/Map/LeftSidebarFilters';
import dynamic from 'next/dynamic';

// Test with simple global Leaflet approach
const SimpleTestMap = dynamic(() => import('./SimpleTestMap'), {
    ssr: false,
    loading: () => (
        <div className="flex items-center justify-center h-full bg-gray-100">
            <div className="text-gray-600">Loading map...</div>
        </div>
    ),
});

const MapWithFilters = () => {
    // Removed unused places variable - can be added back when needed for map markers

    return (
        <div className="flex w-full h-[100vh]">
            <div className="bg-variable-collection-ultra-light-grey p-4">
                <LeftSidebarFilters/>
            </div>

            <div className="bg-white p-4">
                <PropertyCard
                    id="1"
                    image="https://beachrex.fra1.digitaloceanspaces.com/public/img/beaches/hr-102-o-pag/hr-102-o-pag-sl4.jpg"
                    title="Plaža Ladinka"
                    location="Baška, Croatia"
                    price={25}
                    originalPrice={35}
                    rating={7.2}
                    reviews={123}
                    discount="30"
                    isFreeBreakfast={true}
                    isFreeCancellation={true}
                />
            </div>
            {/* Map container with proper height */}
            <div className="flex-1 relative">
                <div id="map" className="absolute inset-0">
                    <SimpleTestMap />
                </div>
            </div>
        </div>
    );
};

export default MapWithFilters;
