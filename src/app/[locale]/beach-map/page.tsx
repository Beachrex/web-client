'use client';
import dynamic from 'next/dynamic';


// Dynamically import the MapWithFilters component with ssr: false
const MapWithFilters = dynamic(() => import('@/app/components/Map/MapWithFilters'), { ssr: false });

const BeachMapPage = () => {
    return (
        <>
            <MapWithFilters />
        </>
    );
};

export default BeachMapPage;
