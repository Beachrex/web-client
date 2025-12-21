'use client';

import { DoubleColumnIcon, SingleColumnIcon } from '@/components/Icons/LayoutIcons';
import { PropertyMediaContext } from '@/components/PropertySection';
import { useBeachesBoundingBox, useBeachesMapBounds, type BoundingBoxSearchFilters } from '@/hooks/useBeaches';
import type { BeachSchema, GetBeachFiltersResponse } from '@/lib/api-client/types.gen';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Dropdown, { MediaToggleInline } from '../Dropdown';
import LeftSidebarFilters from './LeftSidebarFilters';
import ReactLeafletMap from './ReactLeafletMap';
import { VirtualizedBeachList } from './VirtualizedBeachList';

type ColumnLayout = 1 | 2;


const MapWithSidebar = () => {
    const t = useTranslations('BeachesMap');
    const d = useTranslations('BeachDetails');
    const c = useTranslations('SearchBeach');


const mediaOptions = [
  {
    value: 'gallery',
    label: d('beachMediaGallery'),
    icon: '/images/beachmedia/photo.png',
  },
  {
    value: 'sphere',
    label: d('beachMedia360'),
    icon: '/images/beachmedia/360-degree-white.png',
  },
  {
    value: 'video',
    label: d('beachMediaVideo'),
    icon: '/images/beachmedia/play-button-arrowhead-white.png',
  },
  {
    value: 'webcam',
    label: d('beachMediaLiveCam'),
    icon: '/images/beachmedia/video-icon-white.png',
  },
];


const [mediaMode, setMediaMode] =
  useState<'gallery' | 'sphere' | 'video' | 'webcam'>('gallery');

const [sort, setSort] =
  useState<'popular' | 'rating' | 'newest'>('popular');


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
    // Container dimensions for virtualization
    const [containerDimensions, setContainerDimensions] = useState({ width: 0, height: 0 });
    // Show scroll-to-top button on mobile when page scrolled down
    // OPTIMIZATION: Throttle scroll event to reduce re-renders
    useEffect(() => {
        let ticking = false;

        const handleScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    const y = window.scrollY || document.documentElement.scrollTop || 0;
                    setShowScrollTop(y > 50);
                    ticking = false;
                });
                ticking = true;
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    // Track container dimensions for virtualization
    // OPTIMIZATION: Debounce resize updates to reduce re-renders
    useEffect(() => {
        if (!beachCardsContainerRef.current) return;

        let resizeTimeout: NodeJS.Timeout;

        const updateDimensions = () => {
            if (beachCardsContainerRef.current) {
                const rect = beachCardsContainerRef.current.getBoundingClientRect();
                const newWidth = rect.width;
                const newHeight = rect.height || window.innerHeight;

                // Only update if dimensions actually changed (avoid unnecessary re-renders)
                setContainerDimensions(prev => {
                    if (Math.abs(prev.width - newWidth) > 5 || Math.abs(prev.height - newHeight) > 5) {
                        return { width: newWidth, height: newHeight };
                    }
                    return prev;
                });
            }
        };

        const debouncedUpdate = () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(updateDimensions, 150);
        };

        // Initial measurement
        updateDimensions();

        // Use ResizeObserver to track size changes
        const resizeObserver = new ResizeObserver(debouncedUpdate);
        resizeObserver.observe(beachCardsContainerRef.current);

        // Also listen to window resize
        window.addEventListener('resize', debouncedUpdate);

        return () => {
            clearTimeout(resizeTimeout);
            resizeObserver.disconnect();
            window.removeEventListener('resize', debouncedUpdate);
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
        // If viewport hasn't changed by user (filters changed/reset), use initial bounding box
        // Otherwise, use current viewport bounding box (user panned/zoomed)
        const boundingBoxToUse = !viewportChangedByUserRef.current && initialBoundingBoxRef.current
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
    // PERFORMANCE: Limit beaches to 500 max to prevent browser crashes
    const MAX_BEACHES = 500;
    const newBeaches = useMemo(() => {
        const allBeaches = boundingBoxResult.data?.data ?? [];
        return allBeaches.length > MAX_BEACHES ? allBeaches.slice(0, MAX_BEACHES) : allBeaches;
    }, [boundingBoxResult.data?.data]);

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


    // OPTIMIZATION: Debounce viewport changes to reduce API calls
    const viewportDebounceRef = useRef<NodeJS.Timeout>();

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

        // Debounce bounding box updates to avoid excessive API calls during pan/zoom
        clearTimeout(viewportDebounceRef.current);
        viewportDebounceRef.current = setTimeout(() => {
            // Update bounding box when user moves/zooms the map
            // Use exact viewport bounds to ensure list matches map markers
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
        }, 300); // Wait 300ms after user stops panning/zooming
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
                            className={`rounded-lg scrollbar-hide w-full overflow-x-hidden md:flex-shrink-0 md:h-screen md:overflow-y-auto ${isListVisible ? 'block' : 'hidden'} md:block`}
                            style={{
                                width: `${getContainerWidth()}px`,
                                maxWidth: '100%',
                                scrollbarWidth: 'none',
                                msOverflowStyle: 'none',
                            }}
                        >


{/* MAP LIST HEADER */}
<div
  className="
    sticky top-0 z-40 hidden md:flex
    items-center justify-between
    bg-white px-3 py-2
  "
>
  {/* LEFT SIDE: dropdowns */}
  <div className="flex items-center gap-3">
    <Dropdown
      value={sort}
      onChange={(v) =>
        setSort(v as 'popular' | 'rating' | 'newest')
      }
      showIcons={false}
      buttonBg="#F5F5F5"
      menuBg="#F5F5F5"
      options={[
        { value: 'popular', label: c('sortPopular') },
        { value: 'newest', label: c('sortNewest') },
        { value: 'rating', label: c('sortTopRated') },
      ]}
      ariaLabel={c('sortPopular')}
    />

  {columnLayout === 2 ? (
  <MediaToggleInline
    mediaMode={mediaMode}
    setMediaMode={setMediaMode}
    label={c('displayLabel')}
  />
) : (
  <Dropdown
    value={mediaMode}
    onChange={(v) =>
      setMediaMode(v as 'gallery' | 'sphere' | 'video' | 'webcam')
    }
    options={mediaOptions}
    buttonBg="#E7E7E7"
    menuBg="#E7E7E7"
    hideActiveLabel
    hideShadow
    ariaLabel={t('displayLabel')}
  />
)}

  </div>

  {/* RIGHT SIDE: layout toggle */}
  <div className="flex items-center">
    <button
      onClick={() => setColumnLayout(1)}
      className="py-1.5 pl-1.5 pr-0.5 hover:bg-gray-50 rounded"
      aria-label="Single column layout"
    >
      <SingleColumnIcon isActive={columnLayout === 1} />
    </button>

    <button
      onClick={() => setColumnLayout(2)}
      className="py-1.5 pl-0.5 pr-1.5 hover:bg-gray-50 rounded"
      aria-label="Double column layout"
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

                                {/* Subtle loading indicator - doesn't hide the list */}
                                {loading && beaches.length > 0 && (
                                    <div className="mb-2 p-2 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />
                                        <p className="text-xs text-blue-800">{t('loadingBeaches')}</p>
                                    </div>
                                )}

                                {/* Warning when beaches are limited for performance */}
                                {!error && beaches.length === MAX_BEACHES && (
                                    <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                        <p className="text-sm text-yellow-800">
                                            <strong>{t('performanceLimitNote')}</strong> {t('performanceLimitMessage', { count: MAX_BEACHES })}
                                        </p>
                                    </div>
                                )}

                                {/* Show virtualized list whenever we have beaches, even while loading new data */}
                           {!error && beaches.length > 0 && (
  <PropertyMediaContext.Provider
    value={{
      mediaMode,
      openSphere: () => void 0,
openVideo: () => void 0,

    }}
  >
    <VirtualizedBeachList
      beaches={beaches}
      columnLayout={columnLayout}
      onLocationClick={handleLocationClick}
      containerHeight={containerDimensions.height}
      containerWidth={containerDimensions.width}
    />
  </PropertyMediaContext.Provider>
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
