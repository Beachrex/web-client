'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import LeftSidebarFilters from './LeftSidebarFilters';
import ReactLeafletMap from './ReactLeafletMap';
import { useBeaches } from '@/hooks/useBeaches';
import { DynamicPropertyCard } from '@/components/PropertyCard/DynamicPropertyCard';
import { useTranslations } from 'next-intl';
import { SingleColumnIcon, DoubleColumnIcon } from '@/components/Icons/LayoutIcons';

type ColumnLayout = 1 | 2;

const MapWithSidebar = () => {
    const t = useTranslations('BeachesMap');
    const [mapCenter, setMapCenter] = useState<[number, number]>([46.861505, 2.496587]); // Default center (France)
    const [mapZoom, setMapZoom] = useState<number>(8);
    const [columnLayout, setColumnLayout] = useState<ColumnLayout>(1);
    const [radius, setRadius] = useState<number>(100); // Default radius: 100km
    const [selectedBeachId, setSelectedBeachId] = useState<number | null>(null); // Track selected beach
    const beachCardsContainerRef = useRef<HTMLDivElement>(null);

    // Get user's location on initial load
    useEffect(() => {
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    // Set map center to user's location
                    setMapCenter([position.coords.latitude, position.coords.longitude]);
                    setMapZoom(10); // Zoom in closer when we have user location
                },
                (error) => {
                    // If geolocation fails, silently keep default location
                    console.warn('Geolocation not available:', error.message);
                },
                {
                    enableHighAccuracy: false,
                    timeout: 5000,
                    maximumAge: 300000, // Cache for 5 minutes
                }
            );
        }
    }, []); // Empty dependency array = run only once on mount

    // Fetch beaches within radius of map center
    const { beaches, loading, error } = useBeaches({
        latitude: mapCenter[0],
        longitude: mapCenter[1],
        radius: radius,
        limit: 100, // Fetch up to 100 beaches
    });

    const handleLocationClick = (latitude: string, longitude: string, beachId?: number) => {
        const lat = parseFloat(latitude);
        const lng = parseFloat(longitude);
        if (!isNaN(lat) && !isNaN(lng)) {
            setMapCenter([lat, lng]);
            setMapZoom(13); // Zoom in when clicking on a beach
            setSelectedBeachId(beachId ?? null); // Highlight the selected beach marker
        }
    };

    // Handler for map viewport changes (pan/zoom) - now includes radius
    const handleMapViewportChange = useCallback((center: [number, number], zoom: number, radius: number) => {
        setMapCenter(center);
        setMapZoom(zoom);
        setRadius(radius);
    }, []);

    // Handler for marker clicks - scrolls to the corresponding beach card
    const handleMarkerClick = useCallback((beachId: number) => {
        setSelectedBeachId(beachId); // Highlight the marker

        // Scroll to the beach card
        const beachCard = document.querySelector(`[data-beach-id="${beachId}"]`);
        if (beachCard && beachCardsContainerRef.current) {
            beachCard.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
            });
        }
    }, []);

    // Calculate container width based on column layout
    const getContainerWidth = () => {
        const cardWidth = 410; // big card width
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

    return (
        <div className="h-screen w-full overflow-hidden">
            <div className="h-full w-full flex flex-col md:flex-row gap-2">
                {/* Left Sidebar - Filters */}
                <div className="w-full md:w-80 h-full overflow-y-auto flex-shrink-0">
                    <div className="h-full shadow-md rounded-lg" style={{ backgroundColor: '#F6F6F5' }}>
                        <LeftSidebarFilters
                            beachesCount={beaches.length}
                            beachesLoading={loading}
                        />
                    </div>
                </div>

                {/* Middle Column - Beach Cards List */}
                <div
                    ref={beachCardsContainerRef}
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
                                <div key={beach.id} data-beach-id={beach.id!}>
                                    <DynamicPropertyCard
                                        beach={beach}
                                        onLocationClick={handleLocationClick}
                                    />
                                </div>
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
                            radius={radius}
                            selectedBeachId={selectedBeachId}
                            onViewportChange={handleMapViewportChange}
                            onMarkerClick={handleMarkerClick}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MapWithSidebar;

