'use client';

import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import LeftSidebarFilters from './LeftSidebarFilters';
import ReactLeafletMap from './ReactLeafletMap';
import { useBeachesBoundingBox, useBeachesMapBounds, type BoundingBoxSearchFilters } from '@/hooks/useBeaches';
import type { GetBeachFiltersResponse } from '@/lib/api-client/types.gen';
import { DynamicPropertyCard } from '@/components/PropertyCard/DynamicPropertyCard';
import { useTranslations } from 'next-intl';
import { SingleColumnIcon, DoubleColumnIcon } from '@/components/Icons/LayoutIcons';

type ColumnLayout = 1 | 2;

const MapWithSidebar = () => {
    const t = useTranslations('BeachesMap');
    const [mapCenter, setMapCenter] = useState<[number, number] | null>(null);
    const [mapZoom, setMapZoom] = useState<number>(6);
    const [columnLayout, setColumnLayout] = useState<ColumnLayout>(1);
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
    const beachCardsContainerRef = useRef<HTMLDivElement>(null);
    const mapContainerRef = useRef<HTMLDivElement>(null);
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

    const beaches = boundingBoxResult.data?.data ?? [];
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

        // Update bounding box when user moves/zooms the map
        setBoundingBox((prev) => {
            if (
                prev &&
                Math.abs(prev.min_lat - bounds.min_lat) < 0.0001 &&
                Math.abs(prev.min_lon - bounds.min_lon) < 0.0001 &&
                Math.abs(prev.max_lat - bounds.max_lat) < 0.0001 &&
                Math.abs(prev.max_lon - bounds.max_lon) < 0.0001
            ) {
                return prev;
            }
            return bounds;
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
        <div className="h-screen w-full overflow-hidden">
            <div className="h-full w-full flex flex-col md:flex-row gap-2">
                {/* Left Sidebar - Filters */}
                <div className="w-full md:w-80 h-full overflow-y-auto flex-shrink-0">
                    <div className="h-full shadow-md rounded-lg" style={{ backgroundColor: '#F6F6F5' }}>
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
                    <div className='sticky top-0 z-10 bg-white p-3 flex items-center justify-end'>
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
                        {isLoading && (
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

                        {!isLoading && !error && beaches.length > 0 && (
                            <div
                                className='grid gap-4'
                                style={{
                                    gridTemplateColumns: `repeat(${columnLayout}, minmax(0, 1fr))`,
                                }}
                            >
                                {beaches.map((beach, index) => (
                                <div key={`${beach.id}-${index}`} data-beach-id={beach.id}>
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
                    <div ref={mapContainerRef} className='h-full w-full rounded-lg overflow-hidden'>
                        {mapCenter ? (
                            <ReactLeafletMap
                                beaches={beaches}
                                center={mapCenter}
                                zoom={mapZoom}
                                selectedBeachId={selectedBeachId}
                                loading={isLoading}
                                boundingBox={viewportChangedByUserRef.current ? null : boundingBoxMeta?.bounding_box}
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
    );
};

export default MapWithSidebar;
