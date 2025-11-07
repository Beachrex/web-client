'use client';

import { useState } from 'react';
import LeftSidebarFilters from './LeftSidebarFilters';
import ReactLeafletMap from './ReactLeafletMap';
import { useBeaches } from '@/hooks/useBeaches';
import { DynamicPropertyCard } from '@/components/PropertyCard/DynamicPropertyCard';
import { useTranslations } from 'next-intl';

type ColumnLayout = 1 | 2;

const MapWithSidebar = () => {
    const t = useTranslations('BeachesMap');
    const { beaches, loading, error } = useBeaches();
    const [mapCenter, setMapCenter] = useState<[number, number]>([46.861505, 2.496587]);
    const [mapZoom, setMapZoom] = useState<number>(6);
    const [columnLayout, setColumnLayout] = useState<ColumnLayout>(1);

    const handleLocationClick = (latitude: string, longitude: string) => {
        const lat = parseFloat(latitude);
        const lng = parseFloat(longitude);

        if (!isNaN(lat) && !isNaN(lng)) {
            setMapCenter([lat, lng]);
            setMapZoom(13); // Zoom in when clicking on a beach
        }
    };

    // Calculate container width based on column layout
    const getContainerWidth = () => {
        const cardWidth = 289; // small card width
        const gap = 16; // gap-4 = 1rem = 16px
        const padding = 32; // p-4 = 1rem each side = 32px total

        switch (columnLayout) {
            case 1:
                return cardWidth + padding;
            case 2:
                return (cardWidth * 2) + gap + padding;
            default:
                return cardWidth + padding;
        }
    };

    // SVG icon for single column layout
    const SingleColumnIcon = ({ isActive }: { isActive: boolean }) => (
        <svg
            width='10'
            height='22'
            viewBox='0 0 13 30'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'
        >
            <rect
                width='13'
                height='13'
                rx='2'
                fill={isActive ? '#4D4D4D' : '#E7E7E7'}
            />
            <rect
                y='17'
                width='13'
                height='13'
                rx='2'
                fill={isActive ? '#4D4D4D' : '#E7E7E7'}
            />
        </svg>
    );

    // SVG icon for double column layout
    const DoubleColumnIcon = ({ isActive }: { isActive: boolean }) => (
        <svg
            width='22'
            height='22'
            viewBox='0 0 30 30'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'
        >
            <rect
                width='13'
                height='13'
                rx='2'
                fill={isActive ? '#4D4D4D' : '#E7E7E7'}
            />
            <rect
                y='17'
                width='13'
                height='13'
                rx='2'
                fill={isActive ? '#4D4D4D' : '#E7E7E7'}
            />
            <rect
                x='17'
                width='13'
                height='13'
                rx='2'
                fill={isActive ? '#4D4D4D' : '#E7E7E7'}
            />
            <rect
                x='17'
                y='17'
                width='13'
                height='13'
                rx='2'
                fill={isActive ? '#4D4D4D' : '#E7E7E7'}
            />
        </svg>
    );

    return (
        <div className="h-screen w-full overflow-hidden">
            <div className="h-full w-full flex flex-col md:flex-row gap-2">
                {/* Left Sidebar - Filters */}
                <div className="w-full md:w-80 h-full overflow-y-auto flex-shrink-0">
                    <div className="h-full shadow-md rounded-lg" style={{ backgroundColor: '#F6F6F5' }}>
                        <LeftSidebarFilters />
                    </div>
                </div>

                {/* Middle Column - Beach Cards List */}
                <div
                    className='h-full overflow-y-auto bg-gray-50 flex-shrink-0 rounded-lg scrollbar-hide'
                    style={{
                        width: `${getContainerWidth()}px`,
                        scrollbarWidth: 'none',
                        msOverflowStyle: 'none',
                    }}
                >
                    {/* Column Layout Toggle */}
                    <div className="sticky top-0 z-10 bg-white p-3 flex items-center justify-end">
                        <div className="flex">
                            <button
                                onClick={() => setColumnLayout(1)}
                                className="py-1.5 pl-1.5 pr-0.5 transition-all hover:bg-gray-50"
                                aria-label="Single column layout"
                            >
                                <SingleColumnIcon isActive={columnLayout === 1} />
                            </button>
                            <button
                                onClick={() => setColumnLayout(2)}
                                className="py-1.5 pl-0.5 pr-1.5 transition-all hover:bg-gray-50"
                                aria-label="Double column layout"
                            >
                                <DoubleColumnIcon isActive={columnLayout === 2} />
                            </button>
                        </div>
                    </div>

                    <div className="p-4">
                        {loading && (
                            <div className="text-center py-8">
                                <p className="text-gray-600">{t('loadingFilters')}</p>
                            </div>
                        )}

                        {error && (
                            <div className="text-center py-8">
                                <p className="text-red-600">{error}</p>
                            </div>
                        )}

                        {!loading && !error && beaches.length === 0 && (
                            <div className="text-center py-8">
                                <p className="text-gray-600">{t('noBeachesFound')}</p>
                            </div>
                        )}

                        {!loading && !error && beaches.length > 0 && (
                            <div
                                className='grid gap-4'
                                style={{
                                    gridTemplateColumns: `repeat(${columnLayout}, minmax(0, 1fr))`,
                                }}
                            >
                                {beaches.map((beach) => (
                                    <DynamicPropertyCard
                                        key={beach.id}
                                        beach={beach}
                                        size='small'
                                        onLocationClick={handleLocationClick}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Side - Map */}
                <div className='flex-1 h-full'>
                    <div className='h-full w-full rounded-lg overflow-hidden'>
                        <ReactLeafletMap
                            beaches={beaches}
                            center={mapCenter}
                            zoom={mapZoom}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MapWithSidebar;

