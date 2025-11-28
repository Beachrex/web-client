'use client';

import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import LeftSidebarFilters from './LeftSidebarFilters';
import ReactLeafletMap from './ReactLeafletMap';
import { useBeachesBoundingBox, useBeachesMapBounds, type BoundingBoxSearchFilters } from '@/hooks/useBeaches';
import type { GetBeachFiltersResponse, BeachSchema } from '@/lib/api-client/types.gen';
import { DynamicPropertyCard } from '@/components/PropertyCard/DynamicPropertyCard';
import { useTranslations } from 'next-intl';
import { SingleColumnIcon, DoubleColumnIcon } from '@/components/Icons/LayoutIcons';
import { expandBounds } from '@/lib/utils/debounce';

type ColumnLayout = 1 | 2;

const MapWithSidebar = () => {
    const t = useTranslations('BeachesMap');
    const [mapCenter, setMapCenter] = useState<[number, number] | null>(null);
    const [mapZoom, setMapZoom] = useState<number>(6);
    const [columnLayout, setColumnLayout] = useState<ColumnLayout>(1);
    const [isListVisible, setIsListVisible] = useState(true);
    const [isMobileMapOpen, setIsMobileMapOpen] = useState(false);
    const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
    const [showScrollTop, setShowScrollTop] = useState(false);
    const [boundingBox, setBoundingBox] = useState<{
        min_lat: number;
        min_lon: number;
        max_lat: number;
        max_lon: number;
    } | null>(null);
    const [selectedBeachId, setSelectedBeachId] = useState<number | null>(null);
    const [filters, setFilters] = useState<Record<string, string | number | boolean | undefined>>({});
    const [filterOptions, setFilterOptions] = useState<GetBeachFiltersResponse['data'] | null>(null);
    const [filterOptionsLoading, setFilterOptionsLoading] = useState(false);
    const lastValidatedFiltersRef = useRef<Record<string, string | number | boolean | undefined>>({});
    const viewportChangedByUserRef = useRef(false);
    const initialBoundingBoxRef = useRef<{
        min_lat: number;
        min_lon: number;
        max_lat: number;
        max_lon: number;
    } | null>(null);
    const lastFetchedBoundsRef = useRef<{
        min_lat: number;
        min_lon: number;
        max_lat: number;
        max_lon: number;
    } | null>(null);
    const beachCardsContainerRef = useRef<HTMLDivElement>(null);
    const mapContainerRef = useRef<HTMLDivElement>(null);
    // Keep previous beaches visible while loading new data
    const previousBeachesRef = useRef<BeachSchema[]>([]);
    // Show scroll-to-top button on mobile when page scrolled down
    useEffect(() => {
        const handleScroll = () => {
            const y = window.scrollY || document.documentElement.scrollTop || 0;
            setShowScrollTop(y > 50);
        };

        window.addEventListener('scroll', handleScroll);
        handleScroll();

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const ignoreNextViewportChangeRef = useRef(false);
    const hasInitialBoundsRef = useRef(false);

    // Fetch map bounds only on initial load (when we don't have initial bounds yet)
    const { data: mapBoundsData, loading: mapBoundsLoading, error: mapBoundsError } =
        useBeachesMapBounds(!hasInitialBoundsRef.current);

    // Set initial bounding box and center from map bounds response
    useEffect(() => {
        if (mapBoundsData && !hasInitialBoundsRef.current) {
            // Set bounding box
            if (mapBoundsData.bounding_box) {
                const bb = mapBoundsData.bounding_box;
                if (
                    bb.min_latitude !== null &&
                    bb.min_longitude !== null &&
                    bb.max_latitude !== null &&
                    bb.max_longitude !== null
                ) {
                    // Save initial bounding box for use when filters change
                    // Create separate objects to avoid reference sharing and mutation
                    const initialBoundsForRef = {
                        min_lat: bb.min_latitude,
                        min_lon: bb.min_longitude,
                        max_lat: bb.max_latitude,
                        max_lon: bb.max_longitude,
                    };
                    initialBoundingBoxRef.current = initialBoundsForRef;

                    // Set boundingBox state with a separate object
                    setBoundingBox({
                        min_lat: bb.min_latitude,
                        min_lon: bb.min_longitude,
                        max_lat: bb.max_latitude,
                        max_lon: bb.max_longitude,
                    });
                }
            }

            // Set initial map center
            if (mapBoundsData.center && !mapCenter) {
                const center = mapBoundsData.center;
                if (center.latitude !== null && center.longitude !== null) {
                    setMapCenter([center.latitude, center.longitude]);
                }
            }

            hasInitialBoundsRef.current = true;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mapBoundsData]);

    // Validate filters against filter options - only include filters that exist in the current options
    // Wait for filter options to load before validating, but keep previous validated filters while loading
    const validatedFilters = useMemo(() => {
        // If filter options are loading or not loaded yet, return last validated filters
        // This prevents calling the beaches API with invalid filters while keeping existing markers
        if (filterOptionsLoading || !filterOptions) {
            return lastValidatedFiltersRef.current;
        }

        // If no filters are selected, return empty
        if (Object.keys(filters).length === 0) {
            lastValidatedFiltersRef.current = filters;
            return filters;
        }

        const validated: Record<string, string | number | boolean | undefined> = {};

        Object.entries(filters).forEach(([filterKey, filterValue]) => {
            if (filterValue === undefined || filterValue === null || filterValue === '') {
                return;
            }

            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            const filterData = (filterOptions as Record<string, unknown>)[filterKey] as
                | {
                      options?: {
                          id?: number;
                          code?: string;
                          slug?: string;
                      }[];
                  }
                | undefined;

            // If filter key doesn't exist in filter options, skip it (not valid)
            if (!filterData?.options) {
                return;
            }

            const options = filterData.options;

            // Handle comma-separated values (for checkboxes/multiple selection)
            if (typeof filterValue === 'string' && filterValue.includes(',')) {
                const selectedValues = filterValue.split(',');
                const validValues = selectedValues.filter(val => {
                    return options.some((opt: { id?: number; code?: string; slug?: string }) =>
                        opt.code === val || opt.slug === val || String(opt.id) === String(val)
                    );
                });
                if (validValues.length > 0) {
                    validated[filterKey] = validValues.join(',');
                }
            } else {
                // Single value - check if it exists in options
                const isValid = options.some((opt: { id?: number; code?: string; slug?: string }) =>
                    opt.code === filterValue ||
                    opt.slug === filterValue ||
                    String(opt.id) === String(filterValue)
                );
                if (isValid) {
                    validated[filterKey] = filterValue;
                }
            }
        });

        // Update the ref with the newly validated filters
        lastValidatedFiltersRef.current = validated;
        return validated;
    }, [filters, filterOptions, filterOptionsLoading]);

    // Update filters state when validation removes invalid filters
    useEffect(() => {
        // Only update if filter options are loaded and validation removed some filters
        if (!filterOptions || filterOptionsLoading) {
            return;
        }

        const filtersJson = JSON.stringify(filters);
        const validatedJson = JSON.stringify(validatedFilters);

        if (filtersJson !== validatedJson) {
            setFilters(validatedFilters);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [validatedFilters, filterOptions, filterOptionsLoading]);

    // Prepare bounding box filters with validated filters only
    // When filters change, use initial bounding box instead of current viewport bounding box
    const boundingBoxFilters: BoundingBoxSearchFilters = useMemo(() => {
        // Determine which bounding box to use
        // If filters have changed (validatedFilters is not empty), use initial bounding box
        // Otherwise, use current viewport bounding box
        const hasFilters = Object.keys(validatedFilters).length > 0;
        const boundingBoxToUse = hasFilters && initialBoundingBoxRef.current
            ? initialBoundingBoxRef.current
            : boundingBox;

        if (!boundingBoxToUse) {
            return { min_lat: 0, min_lon: 0, max_lat: 0, max_lon: 0 };
        }

        // Create a copy of the bounding box to avoid mutation
        const boundingBoxCopy = {
            min_lat: boundingBoxToUse.min_lat,
            min_lon: boundingBoxToUse.min_lon,
            max_lat: boundingBoxToUse.max_lat,
            max_lon: boundingBoxToUse.max_lon,
        };

        // Update last fetched bounds when we're about to fetch
        lastFetchedBoundsRef.current = boundingBoxCopy;

        return {
            ...boundingBoxCopy,
            ...(validatedFilters as Partial<BoundingBoxSearchFilters>),
        };
    }, [boundingBox, validatedFilters]);

    // Call bounding box API when we have a bounding box
    // Don't call API while filter options are loading (wait for validation)
    const boundingBoxResult = useBeachesBoundingBox(
        boundingBoxFilters,
        boundingBox !== null && !filterOptionsLoading
    );

    // Keep previous beaches visible while loading new data (smooth UX)
    const newBeaches = useMemo(() => boundingBoxResult.data?.data ?? [], [boundingBoxResult.data?.data]);
    const beaches = newBeaches.length > 0 ? newBeaches : previousBeachesRef.current;

    // Update ref when we have new data
    useEffect(() => {
        if (newBeaches.length > 0) {
            previousBeachesRef.current = newBeaches;
        }
    }, [newBeaches]);

    const loading = boundingBoxResult.loading;
    const error = boundingBoxResult.error;
    const boundingBoxMeta = boundingBoxResult.data?.meta;

    // Keep loading true until query is complete
    const isLoading = mapBoundsLoading || loading;

    const handleFiltersChange = useCallback((newFilters: Record<string, string | number | boolean | undefined>) => {
        // Reset viewport changed flag when filters change - allow fitting bounds from API response
        viewportChangedByUserRef.current = false;
        // Update filters, which will trigger bounding box API with new filters
        setFilters(newFilters);
    }, []);


    const handleLocationClick = (latitude: string, longitude: string, beachId?: number) => {
        const lat = parseFloat(latitude);
        const lng = parseFloat(longitude);
        if (!isNaN(lat) && !isNaN(lng)) {
            // Ignore the next viewport change event (caused by programmatic center change)
            ignoreNextViewportChangeRef.current = true;
            setMapCenter([lat, lng]);
            setMapZoom(13);
            setSelectedBeachId(beachId ?? null);
        }
    };

    const handleMapViewportChange = useCallback(
        (
            center: [number, number],
            zoom: number,
            radius: number,
        bounds: { min_lat: number; min_lon: number; max_lat: number; max_lon: number }
    ) => {
        // radius parameter is available but not used in current implementation
        void radius;

        // Mark that viewport changed by user - don't fit bounds from this change
        viewportChangedByUserRef.current = true;

        // Expand bounding box by 1.5x to prefetch beaches in adjacent areas
        // This reduces API calls when user pans the map slightly
        const expandedBounds = expandBounds(bounds, 1.5);

        // Update bounding box when user moves/zooms the map
        setBoundingBox((prev) => {
            if (
                prev &&
                Math.abs(prev.min_lat - expandedBounds.min_lat) < 0.0001 &&
                Math.abs(prev.min_lon - expandedBounds.min_lon) < 0.0001 &&
                Math.abs(prev.max_lat - expandedBounds.max_lat) < 0.0001 &&
                Math.abs(prev.max_lon - expandedBounds.max_lon) < 0.0001
            ) {
                return prev;
            }
            console.log('[MapWithSidebar] Updating bounding box (expanded 1.5x for prefetching)');
            return expandedBounds;
        });
    }, []);

    const handleMarkerClick = useCallback((beachId: number) => {
        setSelectedBeachId(beachId);
        const beachCard = document.querySelector(`[data-beach-id="${beachId}"]`);
        if (beachCard && beachCardsContainerRef.current) {
            beachCard.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
            });
        }
    }, []);

    const getContainerWidth = () => {
        const cardWidth = 410;
        const gap = 16;
        const padding = 32;

        return columnLayout === 2
            ? cardWidth * 2 + gap + padding
            : cardWidth + padding;
    };

    return (
        <div className="min-h-screen w-full overflow-x-hidden md:h-screen md:overflow-hidden">
            <div className="h-full w-full flex flex-col md:flex-row gap-2">
                {/* Left Sidebar - Filters (desktop) */}
                <div className="hidden md:block w-full md:w-80 md:h-screen md:overflow-y-auto md:flex-shrink-0">
                    <div className="md:h-full shadow-md rounded-lg" style={{ backgroundColor: '#F6F6F5' }}>
                        <LeftSidebarFilters
                            beachesCount={beaches.length}
                            beachesLoading={isLoading}
                            onFiltersChange={handleFiltersChange}
                            currentFilters={filters}
                            onFilterOptionsChange={setFilterOptions}
                            onFilterOptionsLoadingChange={setFilterOptionsLoading}
                        />
                    </div>
                </div>

                {/* Right side: mobile controls + list + map */}
                <div className="flex-1 flex flex-col gap-2">
                    {/* Mobile controls to toggle list/map visibility */}
                    <div className="w-full flex items-center justify-between gap-2 px-3 py-2 md:hidden">
                        <button
                            type="button"
                            className="flex-1 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm"
                            onClick={() => setIsListVisible((prev) => !prev)}
                        >
                            {isListVisible ? 'Hide list' : 'Show list'}
                        </button>
                        <button
                            type="button"
                            className="flex-1 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm"
                            onClick={() => setIsMobileMapOpen(true)}
                        >
                            {t('openMap')}
                        </button>
                    </div>

                    {/* Main content: list + map */}
                    <div className="flex flex-col md:flex-row gap-2">
                        {/* Middle Column - Beach Cards List */}
                        <div
                            ref={beachCardsContainerRef}
                            className={`bg-gray-50 rounded-lg scrollbar-hide w-full overflow-x-hidden md:flex-shrink-0 md:h-screen md:overflow-y-auto ${isListVisible ? 'block' : 'hidden'} md:block`}
                            style={{
                                width: `${getContainerWidth()}px`,
                                maxWidth: '100%',
                                scrollbarWidth: 'none',
                                msOverflowStyle: 'none',
                            }}
                        >
                            {/* Column Layout Toggle (desktop only) */}
                            <div className='sticky top-0 z-10 bg-white p-3 hidden md:flex items-center justify-end'>
                                <div className="flex">
                                    <button
                                        onClick={() => setColumnLayout(1)}
                                        className='py-1.5 pl-1.5 pr-0.5 transition-all hover:bg-gray-50'
                                        aria-label='Single column layout'
                                    >
                                        <SingleColumnIcon isActive={columnLayout === 1} />
                                    </button>
                                    <button
                                        onClick={() => setColumnLayout(2)}
                                        className='py-1.5 pl-0.5 pr-1.5 transition-all hover:bg-gray-50'
                                        aria-label='Double column layout'
                                    >
                                        <DoubleColumnIcon isActive={columnLayout === 2} />
                                    </button>
                                </div>
                            </div>

                            <div className="p-4">
                                {/* Only show loading on initial load when no beaches exist */}
                                {isLoading && beaches.length === 0 && (
                                    <div className="text-center py-8">
                                        <p className="text-gray-600">{t('loadingFilters')}</p>
                                    </div>
                                )}

                                {(error ?? mapBoundsError) && (
                                    <div className="text-center py-8">
                                        <p className="text-red-600">{error ?? mapBoundsError}</p>
                                    </div>
                                )}

                                {!isLoading && !error && beaches.length === 0 && (
                                    <div className="text-center py-8">
                                        <p className="text-gray-600">{t('noBeachesFound')}</p>
                                    </div>
                                )}

                                {/* Show grid whenever we have beaches, even while loading new data */}
                                {!error && beaches.length > 0 && (
                                    <div
                                        className={`grid gap-4 grid-cols-1 ${columnLayout === 2 ? 'md:grid-cols-2' : 'md:grid-cols-1'}`}
                                    >
                                        {beaches.map((beach, index) => (
                                            <div key={`${beach.id ?? index}-${index}`} data-beach-id={beach.id}>
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

                        {/* Right Side - Map (desktop only, mobile uses popup) */}
                        <div className="hidden md:block flex-1 h-screen">
                            <div ref={mapContainerRef} className='h-full w-full rounded-lg overflow-hidden'>
                                {mapCenter ? (
                                    <ReactLeafletMap
                                        beaches={beaches}
                                        center={mapCenter}
                                        zoom={mapZoom}
                                        selectedBeachId={selectedBeachId}
                                        boundingBox={
                                            viewportChangedByUserRef.current
                                                ? null
                                                : boundingBoxMeta?.bounding_box
                                        }
                                        onViewportChange={handleMapViewportChange}
                                        onMarkerClick={handleMarkerClick}
                                    />
                                ) : (
                                    <div className="h-full w-full bg-white flex items-center justify-center rounded-lg">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className='w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin' />
                                            <p className="text-gray-700 font-medium">{t('loadingBeaches')}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mobile full-screen map popup */}
                {isMobileMapOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 md:hidden">
                        <div className="relative w-full h-full p-2 flex items-center justify-center">
                            <div className="relative h-full w-full">
                                <div className="h-full w-full rounded-lg overflow-hidden bg-white">
                                    {mapCenter ? (
                                        <ReactLeafletMap
                                            beaches={beaches}
                                            center={mapCenter}
                                            zoom={mapZoom}
                                            selectedBeachId={selectedBeachId}
                                            boundingBox={
                                                viewportChangedByUserRef.current
                                                    ? null
                                                    : boundingBoxMeta?.bounding_box
                                            }
                                            onViewportChange={handleMapViewportChange}
                                            onMarkerClick={handleMarkerClick}
                                        />
                                    ) : (
                                        <div className="h-full w-full bg-white flex items-center justify-center rounded-lg">
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                                                <p className="text-gray-700 font-medium">{t('loadingBeaches')}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setIsMobileMapOpen(false)}
                                    className="absolute -top-4 right-4 z-30 flex h-9 w-9 items-center justify-center rounded-full bg-white text-xl font-bold text-gray-800 shadow"
                                    aria-label="Close map"
                                >
                                    X
                                </button>
                            </div>
                        </div>
	                    </div>
	                )}

                {/* Mobile slide-in filters panel */}
                {isMobileFiltersOpen && (
                    <div className="fixed inset-0 z-40 flex justify-end bg-black/40 md:hidden">
                        <div className="relative h-full w-4/5 max-w-xs bg-[#F6F6F5] shadow-lg">
                            <button
                                type="button"
                                onClick={() => setIsMobileFiltersOpen(false)}
                                className="absolute top-3 right-3 z-50 flex h-8 w-8 items-center justify-center rounded-full bg-white text-lg font-bold text-gray-800 shadow"
                                aria-label="Close filters"
                            >
                                X
                            </button>
                            <div className="h-full overflow-y-auto pt-12 px-3 pb-4">
                                <LeftSidebarFilters
                                    beachesCount={beaches.length}
                                    beachesLoading={isLoading}
                                    onFiltersChange={handleFiltersChange}
                                    currentFilters={filters}
                                    onFilterOptionsChange={setFilterOptions}
                                    onFilterOptionsLoadingChange={setFilterOptionsLoading}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Floating filters button on mobile */}
                {!isMobileFiltersOpen && !isMobileMapOpen && (
                    <button
                        type="button"
                        onClick={() => setIsMobileFiltersOpen(true)}
                        className="fixed top-1/2 right-4 -translate-y-1/2 z-40 flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white shadow md:hidden"
                        aria-label={t('filters')}
                    >
                        F
                    </button>
                )}

                {/* Scroll-to-top button for long list on mobile */}
                {showScrollTop && !isMobileMapOpen && (
                    <button
                        type="button"
                        onClick={() => {
                            if (typeof window !== 'undefined') {
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                            }
                        }}
                        className="fixed bottom-4 right-4 z-40 flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white shadow md:hidden"
                        aria-label={t('scrollToTop')}
                    >
                        ↑
                    </button>
                )}
            </div>
        </div>
    );
};

export default MapWithSidebar;
