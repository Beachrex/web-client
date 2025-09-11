"use client";
import React from 'react';
import {PropertyCard} from "@/app/components/PropertyCard/PropertyCard";
import LeftSidebarFilters from "@/app/components/Map/LeftSidebarFilters";

// Import Leaflet dynamically to avoid SSR issues
import dynamic from 'next/dynamic';

// Create the map component with no SSR
const LeafletMap = dynamic(() => import('./LeafletMapComponent'), {
    ssr: false,
    loading: () => (
        <div className="flex items-center justify-center h-full bg-gray-100">
            <div className="text-gray-600">Loading map...</div>
        </div>
    )
});

const MapWithFilters = () => {
    const places = [
        { lat: 45.1, lon: 15.2, title: 'Plaža Haludovo', description: 'Great beach with clear water.', id: 1 },
        { lat: 45.2, lon: 15.3, title: 'Pine Beach', description: 'A nice beach with pine trees.', id: 2 },
        { lat: 45.3, lon: 15.4, title: 'Sunset Beach', description: 'Amazing sunset view.', id: 3 },
    ];

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
            <div className="flex-1">
                <LeafletMap places={places} />
            </div>
        </div>
    );
};

export default MapWithFilters;