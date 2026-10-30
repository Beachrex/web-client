'use client';

import { DoubleColumnIcon, SingleColumnIcon } from '@/components/Icons/LayoutIcons';
import { PropertyMediaContext } from '@/components/PropertySection';
import { useBeachesBoundingBox, useBeachesMapBounds, type BoundingBoxSearchFilters } from '@/hooks/useBeaches';
import type { BeachSchema, GetBeachFiltersResponse } from '@/lib/api-client/types.gen';
import { useTranslations } from 'next-intl';
import { nextDisplayedBeaches } from '@/lib/utils/map-results';
import { focusCenter, parseBeachFocus, withFocusedBeach } from '@/lib/utils/map-focus';
import { getBeachByIdentifierOptions } from '@/lib/api-client/@tanstack/react-query.gen';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Map as MapIcon, SlidersHorizontal, X } from 'lucide-react';
import Dropdown, { MediaToggleInline } from '../Dropdown';
import LeftSidebarFilters from './LeftSidebarFilters';
import ReactLeafletMap from './ReactLeafletMap';
import { VirtualizedBeachList } from './VirtualizedBeachList';
import { optionMatches, type FilterOptionLike } from '@/lib/utils/filter-options';
import { buildMapPanelUrl, panelMapInset, parseMapBeachParam } from '@/lib/utils/map-beach-panel';
import { beachPanelQueryOptions, useBeachPanelDetails } from '@/hooks/useBeachPanelDetails';
import { MapBeachPanelContext, type MapBeachPanelApi } from './MapBeachPanelContext';
import MapBeachPanel from './MapBeachPanel';
import type { ActiveBeach } from './ReactLeafletMap';

type ColumnLayout = 1 | 2;

// Zoom level that guarantees markers are ungrouped (disableClusteringAtZoom is 15)
const BEACH_DETAIL_ZOOM = 16;

// History entries pushed for the beach panel carry this flag, so closing knows it may go back.
const PANEL_HISTORY_KEY = '__beachPanel';

function historyEntryIsPanel(): boolean {
    const state = window.history.state as Record<string, unknown> | null;
    return Boolean(state?.[PANEL_HISTORY_KEY]);
}

interface Bounds {
    min_lat: number;
    min_lon: number;
    max_lat: number;
    max_lon: number;
}

const MapWithSidebar = () => {
    const t = useTranslations('BeachesMap');
    const tUi = useTranslations('UI');
    const d = useTranslations('BeachDetails');
    const c = useTranslations('SearchBeach');
    const searchParams = useSearchParams();

    // Same order as the beach page and the inline toggle: photos, video, 360, webcam.
    const mediaOptions = [
        {
            value: 'gallery',
            label: d('beachMediaGallery'),
            icon: '/images/beachmedia/photo.png',
        },
        {
            value: 'video',
            label: d('beachMediaVideo'),
            icon: '/images/beachmedia/play-button-arrowhead-white.png',
        },
        {
            value: 'sphere',
            label: d('beachMedia360'),
            icon: '/images/beachmedia/360-degree-white.png',
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
    const [isMobileMapOpen, setIsMobileMapOpen] = useState(false);
    const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
    const [showScrollTop, setShowScrollTop] = useState(false);
    // The side map is only mounted on md+ screens: hidden with CSS alone, phones still rendered
    // thousands of markers in an invisible map, which made the whole page stutter.
    const [isDesktop, setIsDesktop] = useState(false);
    useEffect(() => {
        const query = window.matchMedia('(min-width: 768px)');
        const update = () => setIsDesktop(query.matches);
        update();
        query.addEventListener('change', update);
        return () => query.removeEventListener('change', update);
    }, []);
    // Beach panel layout: side panel from lg (1024px, approved variant A), bottom sheet below.
    const [isWide, setIsWide] = useState(
        () => typeof window !== 'undefined' && window.matchMedia('(min-width: 1024px)').matches,
    );
    useEffect(() => {
        const query = window.matchMedia('(min-width: 1024px)');
        const update = () => setIsWide(query.matches);
        update();
        query.addEventListener('change', update);
        return () => query.removeEventListener('change', update);
    }, []);
    const [boundingBox, setBoundingBox] = useState<{
        min_lat: number;
        min_lon: number;
        max_lat: number;
        max_lon: number;
    } | null>(null);
    const [selectedBeachId, setSelectedBeachId] = useState<number | null>(null);
    const [hoveredBeachId, setHoveredBeachId] = useState<number | null>(null);
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
    const skipNextBoundingBoxUpdateRef = useRef(false); // Skip API call when zooming to beach
    const hasInitialBoundsRef = useRef(false);
    const initialBeachAppliedRef = useRef(false);

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

    // "Focus this beach" (`beach_id`, optional `lat`/`lng`; see src/lib/utils/map-focus.ts): sent by the beach
    // banner and the pin on beach cards. The beach itself is loaded so its marker is shown even when the
    // current filters or viewport do not contain it, and to center on it when the URL has no coordinates.
    const focus = useMemo(() => parseBeachFocus(searchParams), [searchParams]);
    const { data: focusedBeachResponse } = useQuery({
        ...getBeachByIdentifierOptions({ path: { identifier: focus?.id ?? 0 } }),
        enabled: focus !== null,
        staleTime: 5 * 60 * 1000,
    });
    const focusedBeach = focus && focusedBeachResponse?.data?.id === focus.id ? focusedBeachResponse.data : null;

    // Once the map has initialised (mapCenter is set), center on the focused beach and select it so its
    // popup auto-opens. We intentionally do NOT set ignoreNextViewportChangeRef / skipNextBoundingBoxUpdateRef
    // so the viewport change triggers a bounding-box fetch for the beach's area.
    useEffect(() => {
        if (initialBeachAppliedRef.current || !mapCenter || !focus) return;

        const center = focusCenter(focus, focusedBeach);
        if (!center) return; // no coordinates in the URL: wait for the beach to load

        initialBeachAppliedRef.current = true;
        // The beach decides the view: the bounding box of the first result must not zoom the map back out.
        viewportChangedByUserRef.current = true;
        setMapCenter(center);
        setMapZoom(BEACH_DETAIL_ZOOM);
        setSelectedBeachId(focus.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mapCenter, focus, focusedBeach]);

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
                    return options.some((opt: FilterOptionLike) => optionMatches(opt, val));
                });
                if (validValues.length > 0) {
                    validated[filterKey] = validValues.join(',');
                }
            } else {
                // Single value - check if it exists in options
                const isValid = options.some((opt: FilterOptionLike) => optionMatches(opt, filterValue));
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

    // Store last valid bounding box filters to use when skipping updates
    const lastBoundingBoxFiltersRef = useRef<BoundingBoxSearchFilters | null>(null);

    // Prepare bounding box filters with validated filters only
    // When filters change, use initial bounding box instead of current viewport bounding box
    const boundingBoxFilters: BoundingBoxSearchFilters = useMemo(() => {
        // If we should skip this update (e.g., zooming to a beach), return previous filters
        if (skipNextBoundingBoxUpdateRef.current && lastBoundingBoxFiltersRef.current) {
            skipNextBoundingBoxUpdateRef.current = false; // Reset flag
            return lastBoundingBoxFiltersRef.current;
        }

        // Determine which bounding box to use
        // If viewport hasn't changed by user (filters changed/reset), use initial bounding box
        // Otherwise, use current viewport bounding box (user panned/zoomed)
        const boundingBoxToUse = !viewportChangedByUserRef.current && initialBoundingBoxRef.current
            ? initialBoundingBoxRef.current
            : boundingBox;

        if (!boundingBoxToUse) {
            return lastBoundingBoxFiltersRef.current ?? { min_lat: 0, min_lon: 0, max_lat: 0, max_lon: 0 };
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

        const newFilters = {
            ...boundingBoxCopy,
            ...(validatedFilters as Partial<BoundingBoxSearchFilters>),
        };

        // Store for future skips
        lastBoundingBoxFiltersRef.current = newFilters;

        return newFilters;
    }, [boundingBox, validatedFilters]);

    // Call bounding box API when we have a bounding box
    // Don't call API while filter options are loading (wait for validation)
    const boundingBoxResult = useBeachesBoundingBox(
        boundingBoxFilters,
        boundingBox !== null && !filterOptionsLoading
    );

    // Keep previous beaches visible while loading new data (smooth UX)
    // PERFORMANCE: Limit beaches to prevent browser performance issues

    // OPTIMIZATION: Use state instead of ref to properly trigger re-renders
    // and ensure we never show empty list while loading
    const [displayedBeaches, setDisplayedBeaches] = useState<BeachSchema[]>([]);

    // Update displayed beaches whenever a response arrives, including an empty one: a filter with
    // no matches (e.g. waterbody=pool) must show 0 beaches, not keep the previous result.
    // While a new query is loading `data` is undefined, so the previous beaches stay visible.
    useEffect(() => {
        setDisplayedBeaches((prev) => nextDisplayedBeaches(prev, boundingBoxResult.data?.data));
    }, [boundingBoxResult.data?.data]);

    const beaches = displayedBeaches;
    // Map markers: the focused beach is always among them (its popup must open even outside the filters).
    const mapBeaches = useMemo(() => withFocusedBeach(beaches, focusedBeach), [beaches, focusedBeach]);

    // ---------------------------------------------------------------------------------------------
    // Beach panel (owner 2026-10-30): beaches open over the map instead of in a new tab.
    // The open beach is `?beach=<id>` on the map URL (see src/lib/utils/map-beach-panel.ts): pushed on open,
    // so Back closes the panel and the URL can be shared; the filters in the query string stay untouched.
    // ---------------------------------------------------------------------------------------------
    const panelBeachId = parseMapBeachParam(searchParams);
    const panelTriggerRef = useRef<HTMLElement | null>(null);
    const lastPanelBeachRef = useRef<number | null>(null);

    const openBeachPanel = useCallback((beachId: number, trigger?: HTMLElement | null) => {
        panelTriggerRef.current = trigger ?? null;
        const url = buildMapPanelUrl(window.location, beachId);
        if (parseMapBeachParam(new URLSearchParams(window.location.search)) === null) {
            window.history.pushState({ [PANEL_HISTORY_KEY]: true }, '', url);
        } else {
            // Another beach while the panel is open: swap the content, one history entry for the panel.
            // Only our flag: Next.js copies its own history state in (passing its `__NA` state back would make
            // its patched replaceState skip the router update, and useSearchParams would keep the old beach).
            window.history.replaceState({ [PANEL_HISTORY_KEY]: historyEntryIsPanel() }, '', url);
        }
    }, []);

    const closeBeachPanel = useCallback(() => {
        if (historyEntryIsPanel()) {
            window.history.back();
        } else {
            // Opened by a direct link to the panel URL: nothing to go back to on this page.
            window.history.replaceState(null, '', buildMapPanelUrl(window.location, null));
        }
    }, []);

    // Closed (X, Escape, Back): focus returns to the card or marker link that opened the panel.
    useEffect(() => {
        if (panelBeachId !== null) {
            lastPanelBeachRef.current = panelBeachId;
            return;
        }
        const lastId = lastPanelBeachRef.current;
        if (lastId === null) return;
        lastPanelBeachRef.current = null;
        const trigger = panelTriggerRef.current;
        panelTriggerRef.current = null;
        const target = trigger?.isConnected
            ? trigger
            : document.querySelector<HTMLElement>(`[data-beach-id="${lastId}"] h3 a`);
        target?.focus({ preventScroll: true });
    }, [panelBeachId]);

    const queryClient = useQueryClient();
    const prefetchBeachPanel = useCallback((beachId: number) => {
        if (beachId > 0) void queryClient.prefetchQuery(beachPanelQueryOptions(beachId));
    }, [queryClient]);
    const beachPanelApi = useMemo<MapBeachPanelApi>(
        () => ({ open: openBeachPanel, prefetch: prefetchBeachPanel }),
        [openBeachPanel, prefetchBeachPanel],
    );

    const panelPreview = useMemo(
        () => (panelBeachId === null ? null : mapBeaches.find((b) => b.id === panelBeachId) ?? null),
        [mapBeaches, panelBeachId],
    );
    // Same query as the panel (shared cache, one request): coordinates and name for the map's highlighted pin.
    const { details: panelDetails } = useBeachPanelDetails(panelBeachId);
    const activeBeach = useMemo<ActiveBeach | null>(() => {
        if (panelBeachId === null) return null;
        const lat = Number(panelDetails?.basic_info?.latitude ?? panelPreview?.latitude);
        const lng = Number(panelDetails?.basic_info?.longitude ?? panelPreview?.longitude);
        if (!Number.isFinite(lat) || !Number.isFinite(lng) || (lat === 0 && lng === 0)) return null;
        return { id: panelBeachId, lat, lng, name: panelDetails?.basic_info?.name ?? panelPreview?.name ?? '' };
    }, [panelBeachId, panelDetails, panelPreview]);

    // Map pixels hidden under the desktop panel (none in the usual layout: the panel covers filters + list).
    const panelAreaRef = useRef<HTMLDivElement>(null);
    const panelCoveredLeft = useCallback(() => {
        const map = mapContainerRef.current;
        const panel = document.querySelector<HTMLElement>('[data-beach-panel="desktop"]');
        if (!map || !isWide || !panel) return 0;
        // offsetWidth: the width without the slide-in transform
        return panelMapInset(panel.getBoundingClientRect().left + panel.offsetWidth, map.getBoundingClientRect().left);
    }, [isWide]);

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


    // OPTIMIZATION: Memoize to prevent VirtualizedBeachList re-renders

    const handleLocationClick = useCallback((latitude: string, longitude: string, beachId?: number) => {
        const lat = parseFloat(latitude);
        const lng = parseFloat(longitude);
        if (!isNaN(lat) && !isNaN(lng)) {
            // Ignore the next viewport change event (caused by programmatic center change)
            // Also skip bounding box update to prevent API refetch - we're just zooming to a beach
            ignoreNextViewportChangeRef.current = true;
            skipNextBoundingBoxUpdateRef.current = true;
            setMapCenter([lat, lng]);
            setMapZoom(BEACH_DETAIL_ZOOM);
            // Setting selectedBeachId will trigger popup via isSelected effect in BeachMarker
            setSelectedBeachId(beachId ?? null);
        }
    }, []);

    // OPTIMIZATION: Memoize context value to prevent re-renders when mediaMode doesn't change
    const mediaContextValue = useMemo(() => ({
        mediaMode,
        openSphere: () => undefined,
        openVideo: () => undefined,
    }), [mediaMode]);


    // OPTIMIZATION: Debounce + Throttle viewport changes to reduce API calls
    const viewportDebounceRef = useRef<NodeJS.Timeout>();
    const lastBoundingBoxUpdateRef = useRef<number>(0);
    const pendingBoundsRef = useRef<Bounds | null>(null);
    const throttleTimeoutRef = useRef<NodeJS.Timeout>();

    // Minimum time between API calls (in ms)
    const API_THROTTLE_MS = 1000;
    // Debounce delay - wait for user to stop interacting
    const DEBOUNCE_MS = 500;

    // Cleanup timeouts on unmount to prevent memory leaks
    useEffect(() => {
        return () => {
            clearTimeout(viewportDebounceRef.current);
            clearTimeout(throttleTimeoutRef.current);
        };
    }, []);

    const applyBoundingBoxUpdate = useCallback((bounds: Bounds) => {
        const now = Date.now();
        const timeSinceLastUpdate = now - lastBoundingBoxUpdateRef.current;

        // Check if we're within throttle window
        if (timeSinceLastUpdate < API_THROTTLE_MS) {
            // Store pending bounds and schedule update after throttle expires
            pendingBoundsRef.current = bounds;
            clearTimeout(throttleTimeoutRef.current);
            throttleTimeoutRef.current = setTimeout(() => {
                if (pendingBoundsRef.current) {
                    const pendingBounds = pendingBoundsRef.current;
                    pendingBoundsRef.current = null;
                    lastBoundingBoxUpdateRef.current = Date.now();
                    setBoundingBox((prev) => {
                        if (
                            prev &&
                            Math.abs(prev.min_lat - pendingBounds.min_lat) < 0.0001 &&
                            Math.abs(prev.min_lon - pendingBounds.min_lon) < 0.0001 &&
                            Math.abs(prev.max_lat - pendingBounds.max_lat) < 0.0001 &&
                            Math.abs(prev.max_lon - pendingBounds.max_lon) < 0.0001
                        ) {
                            return prev;
                        }
                        return pendingBounds;
                    });
                }
            }, API_THROTTLE_MS - timeSinceLastUpdate);
            return;
        }

        // Not throttled - update immediately
        lastBoundingBoxUpdateRef.current = now;
        pendingBoundsRef.current = null;
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

    const handleMapViewportChange = useCallback(
        (
            center: [number, number],
            zoom: number,
            radius: number,
        bounds: { min_lat: number; min_lon: number; max_lat: number; max_lon: number }
    ) => {
        // radius parameter is available but not used in current implementation
        void radius;
        void center;
        void zoom;

        // Check if we should ignore this viewport change (e.g., from handleLocationClick)
        if (ignoreNextViewportChangeRef.current) {

            ignoreNextViewportChangeRef.current = false;
            // Also reset skip flag since both were set together - no debounce runs when we return early
            skipNextBoundingBoxUpdateRef.current = false;
            return;
        }

        // Mark that viewport changed by user - don't fit bounds from this change
        viewportChangedByUserRef.current = true;

        // Debounce bounding box updates - wait for user to stop panning/zooming
        clearTimeout(viewportDebounceRef.current);
        viewportDebounceRef.current = setTimeout(() => {
            // Check skip flag again in case it was set during debounce
            if (skipNextBoundingBoxUpdateRef.current) {

                skipNextBoundingBoxUpdateRef.current = false;
                return;
            }

            // Apply bounding box update with throttling
            applyBoundingBoxUpdate(bounds);
        }, DEBOUNCE_MS);
    }, [applyBoundingBoxUpdate]);

       const handleBeachHover = useCallback((beachId: number | null) => {
        setHoveredBeachId(beachId);
    }, []);

    const handleMarkerClick = useCallback((beachId: number) => {
        // Select the beach for highlighting - popup will open via isSelected effect
        setSelectedBeachId(beachId);
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
        <MapBeachPanelContext.Provider value={beachPanelApi}>
        <div ref={panelAreaRef} className="relative min-h-screen w-full overflow-x-hidden md:h-screen md:overflow-hidden">
            <div className="h-full w-full flex flex-col md:flex-row gap-2">
                {/* Left Sidebar - Filters (desktop) */}
                <div className="hidden md:block w-full md:w-80 md:h-screen md:flex-shrink-0">
                    <div className="h-full shadow-md rounded-lg overflow-hidden" style={{ backgroundColor: '#F6F6F5' }}>
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
                    {/* Mobile controls: filters panel and full-screen map */}
                    <div className="w-full flex items-center justify-between gap-2 px-3 py-2 md:hidden">
                        <button
                            type="button"
                            className="flex flex-1 items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm"
                            onClick={() => setIsMobileFiltersOpen(true)}
                        >
                            <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
                            {t('filters')}
                        </button>
                        <button
                            type="button"
                            className="flex flex-1 items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm"
                            onClick={() => setIsMobileMapOpen(true)}
                        >
                            <MapIcon className="h-4 w-4" aria-hidden="true" />
                            {t('openMap')}
                        </button>
                    </div>

                    {/* Main content: list + map */}
                    <div className="flex flex-col md:flex-row gap-2">
                        {/* Middle Column - Beach Cards List */}
                        <div
                            ref={beachCardsContainerRef}
                            className="rounded-lg scrollbar-hide w-full overflow-x-hidden md:flex-shrink-0 md:h-screen md:overflow-y-auto"
                            style={{
                                width: `${getContainerWidth()}px`,
                                maxWidth: '100%',
                                scrollbarWidth: 'none',
                                msOverflowStyle: 'none',
                            }}
                        >
                            {/* MAP LIST HEADER */}
                            <div className="sticky top-0 z-40 hidden md:flex items-center justify-between bg-white px-3 py-2">
                                {/* LEFT SIDE: dropdowns */}
                                <div className="flex items-center gap-3">
                                    <Dropdown
                                        value={sort}
                                        onChange={(v) => setSort(v as 'popular' | 'rating' | 'newest')}
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
                                            onChange={(v) => setMediaMode(v as 'gallery' | 'sphere' | 'video' | 'webcam')}
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
                                        aria-label={tUi('singleColumn')}
                                    >
                                        <SingleColumnIcon isActive={columnLayout === 1} />
                                    </button>
                                    <button
                                        onClick={() => setColumnLayout(2)}
                                        className="py-1.5 pl-0.5 pr-1.5 hover:bg-gray-50 rounded"
                                        aria-label={tUi('doubleColumn')}
                                    >
                                        <DoubleColumnIcon isActive={columnLayout === 2} />
                                    </button>
                                </div>
                            </div>


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


                                {!isLoading && !error && !mapBoundsError && beaches.length === 0 && (
                                    <div className="text-center py-8">
                                        <p className="text-gray-600">{t('noBeachesFound')}</p>
                                    </div>
                                )}

                                {/* Show virtualized list whenever we have beaches, even while loading new data */}
                                {!error && beaches.length > 0 && (
                                    <PropertyMediaContext.Provider value={mediaContextValue}>
                                        <VirtualizedBeachList
                                            beaches={beaches}
                                            columnLayout={columnLayout}
                                            onLocationClick={handleLocationClick}
                                            onBeachHover={handleBeachHover}
                                            containerHeight={containerDimensions.height}
                                            containerWidth={containerDimensions.width}
                                            scrollContainerRef={beachCardsContainerRef}
                                        />
                                    </PropertyMediaContext.Provider>
                                )}


                        </div>

                        {/* Right Side - Map (desktop only, mobile uses popup) */}
                        <div className="hidden md:block flex-1 h-screen">
                            <div ref={mapContainerRef} className='h-full w-full rounded-lg overflow-hidden'>
                                {!isDesktop ? null : mapCenter ? (
                                    <ReactLeafletMap
                                        beaches={mapBeaches}
                                        center={mapCenter}
                                        zoom={mapZoom}
                                        selectedBeachId={selectedBeachId}
                                        hoveredBeachId={hoveredBeachId}
                                        boundingBox={
                                            viewportChangedByUserRef.current
                                                ? null
                                                : boundingBoxMeta?.bounding_box
                                        }
                                        isLoading={loading}
                                        onViewportChange={handleMapViewportChange}
                                        onMarkerClick={handleMarkerClick}
                                        activeBeach={activeBeach}
                                        coveredLeft={panelCoveredLeft}
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
                    // z-[1060]: above the site header (1050), below the beach sheet (1070) and media overlays (1100)
                    <div className="fixed inset-0 z-[1060] flex items-center justify-center bg-black/60 md:hidden">
                        <div className="relative w-full h-full p-2 flex items-center justify-center">
                            <div className="relative h-full w-full">
                                <div className="h-full w-full rounded-lg overflow-hidden bg-white">
                                    {mapCenter ? (
                                        <ReactLeafletMap
                                            beaches={mapBeaches}
                                            center={mapCenter}
                                            zoom={mapZoom}
                                            selectedBeachId={selectedBeachId}
                                            hoveredBeachId={hoveredBeachId}
                                            boundingBox={
                                                viewportChangedByUserRef.current
                                                    ? null
                                                    : boundingBoxMeta?.bounding_box
                                            }
                                            isLoading={loading}
                                            onViewportChange={handleMapViewportChange}
                                            onMarkerClick={handleMarkerClick}
                                            activeBeach={activeBeach}
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
                                    className="absolute top-3 right-3 z-[1100] flex h-11 w-11 items-center justify-center rounded-full bg-white text-gray-800 shadow-lg"
                                    aria-label={tUi('closeMap')}
                                >
                                    <X className="h-6 w-6" aria-hidden="true" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Mobile slide-in filters panel */}
                {isMobileFiltersOpen && (
                    <div className="fixed inset-0 z-[1060] flex justify-end bg-black/40 md:hidden">
                        <div className="relative h-full w-4/5 max-w-xs bg-[#F6F6F5] shadow-lg">
                            <button
                                type="button"
                                onClick={() => setIsMobileFiltersOpen(false)}
                                className="absolute top-3 right-3 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-white text-gray-800 shadow"
                                aria-label={tUi('closeFilters')}
                            >
                                <X className="h-5 w-5" aria-hidden="true" />
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

                {/* Scroll-to-top button for long list on mobile */}
                {showScrollTop && !isMobileMapOpen && !isMobileFiltersOpen && panelBeachId === null && (
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

                {/* Beach panel: side panel over filters + list (lg+), bottom sheet over the map below lg */}
                {panelBeachId !== null && (
                    <MapBeachPanel
                        beachId={panelBeachId}
                        preview={panelPreview}
                        desktop={isWide}
                        onClose={closeBeachPanel}
                        areaRef={panelAreaRef}
                        mapRef={mapContainerRef}
                    />
                )}
            </div>
        </div>
        </MapBeachPanelContext.Provider>
    );
};

export default MapWithSidebar;
