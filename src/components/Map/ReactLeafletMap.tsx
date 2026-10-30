'use client';

import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import { useEffect, useRef, useMemo, memo } from 'react';
import type { Beach } from '@/types';
import MapSearch from './MapSearch';
import { getMarkerIcon } from '@/lib/utils/icons';
import { debounce } from '@/lib/utils/debounce';
import BeachMarkerTooltip from './BeachMarkerTooltip';

// Performance logging (disabled - map renders are naturally slow ~200ms)
const ENABLE_MAP_PERF_LOGGING = false;
let mapRenderCount = 0;

interface ReactLeafletMapProps {
  beaches: Beach[];
  center?: [number, number];
  zoom?: number;
  radius?: number;
  selectedBeachId?: number | null;
  hoveredBeachId?: number | null;
  boundingBox?: {
    min_latitude?: number;
    min_longitude?: number;
    max_latitude?: number;
    max_longitude?: number;
  } | null;
  isLoading?: boolean; // Disable map interactions while loading
  onViewportChange?: (
    center: [number, number],
    zoom: number,
    radius: number,
    bounds: { min_lat: number; min_lon: number; max_lat: number; max_lon: number }
  ) => void;
  onMarkerClick?: (beachId: number) => void;
  /** Beach open in the beach panel: orange pin with its name, outside the clusters, kept in view. */
  activeBeach?: ActiveBeach | null;
  /** Pixels of the map's left edge covered by the beach panel (the pin is kept right of them). */
  coveredLeft?: () => number;
}

export interface ActiveBeach {
  id: number;
  lat: number;
  lng: number;
  name: string;
}

// Same pin shape as the mockup (approved variant A), orange and larger than the other markers.
const ACTIVE_PIN_HTML =
  '<svg width="40" height="54" viewBox="0 0 26 36" aria-hidden="true"><path d="M13 1C6.4 1 1 6.2 1 12.7 1 21.5 13 35 13 35s12-13.5 ' +
  '12-22.3C25 6.2 19.6 1 13 1z" fill="#FF8000" stroke="#FFFFFF" stroke-width="2"/><circle cx="13" cy="13" r="4.5" fill="#FFFFFF"/></svg>';

const activeBeachIcon = L.divIcon({
  className: 'beach-div-icon beach-active-pin',
  html: ACTIVE_PIN_HTML,
  iconSize: [40, 54],
  iconAnchor: [20, 54],
  tooltipAnchor: [0, -54],
});

/**
 * The beach open in the panel: its own marker (not clustered, so it shows at any zoom) and a pan that keeps it
 * inside the visible part of the map. The marker popup is closed: the panel shows the beach.
 */
function ActiveBeachLayer({ beach, coveredLeft }: { beach: ActiveBeach | null; coveredLeft?: () => number }) {
  const map = useMap();
  const id = beach?.id;
  const lat = beach?.lat;
  const lng = beach?.lng;

  useEffect(() => {
    if (id == null || lat == null || lng == null) return;
    map.closePopup();
    const inset = coveredLeft?.() ?? 0;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    map.panInside([lat, lng], {
      paddingTopLeft: [inset + 48, 80],
      paddingBottomRight: [48, 48],
      animate: !reduced,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, lat, lng, map]);

  if (!beach) return null;
  return (
    <Marker
      position={[beach.lat, beach.lng]}
      icon={activeBeachIcon}
      zIndexOffset={2000}
      interactive={false}
      keyboard={false}
    >
      <Tooltip
        permanent
        direction="top"
        offset={[0, -4]}
        className="beach-active-label"
      >
        {beach.name}
      </Tooltip>
    </Marker>
  );
}

// Extended map type with custom properties for fitBounds coordination
interface ExtendedMap extends L.Map {
  __isFittingBounds?: () => boolean;
  __resetFitBoundsFlag?: () => void;
}

// Component to update map view
function MapUpdater({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();

  useEffect(() => {
    const currentCenter = map.getCenter();
    const currentZoom = map.getZoom();

    // Only update if center or zoom actually changed (with small tolerance for floating point)
    const centerChanged = Math.abs(currentCenter.lat - center[0]) > 0.0001 ||
                         Math.abs(currentCenter.lng - center[1]) > 0.0001;
    const zoomChanged = currentZoom !== zoom;

    if (centerChanged || zoomChanged) {
      map.setView(center, zoom, {
        animate: true,
        duration: 1, // 1 second animation
      });
    }
  }, [center, zoom, map]);

  return null;
}

// Component to fit bounds when bounding box changes (from API)
function FitBounds({
  boundingBox,
}: {
  boundingBox?: {
    min_latitude?: number;
    min_longitude?: number;
    max_latitude?: number;
    max_longitude?: number;
  } | null;
}) {
  const map = useMap();
  const fitBoundsRef = useRef(false);
  const lastFittedBoundsRef = useRef<string | null>(null);

  useEffect(() => {
    // Store flag checker on map for MapEventHandler to check
    const extendedMap = map as ExtendedMap;
    extendedMap.__isFittingBounds = () => {
      return fitBoundsRef.current;
    };
    // Store reset function to allow MapEventHandler to reset the flag after skipping
    extendedMap.__resetFitBoundsFlag = () => {
      fitBoundsRef.current = false;
    };
  }, [map]);

  useEffect(() => {
    if (
      !boundingBox?.min_latitude ||
      !boundingBox?.min_longitude ||
      !boundingBox?.max_latitude ||
      !boundingBox?.max_longitude
    ) {
      return;
    }

    // Create a string key to check if this bounding box was already fitted
    const boundsKey = `${boundingBox.min_latitude},${boundingBox.min_longitude},` +
      `${boundingBox.max_latitude},${boundingBox.max_longitude}`;

    // Skip if we already fitted to this exact bounding box
    if (lastFittedBoundsRef.current === boundsKey) {
      return;
    }

    // Skip if we're currently fitting bounds (prevent multiple simultaneous calls)
    if (fitBoundsRef.current) {
      return;
    }

    fitBoundsRef.current = true;
    lastFittedBoundsRef.current = boundsKey;

    const bounds = L.latLngBounds(
      [boundingBox.min_latitude, boundingBox.min_longitude],
      [boundingBox.max_latitude, boundingBox.max_longitude]
    );

    map.fitBounds(bounds, { padding: [50, 50], animate: true, duration: 1 });
  }, [boundingBox, map]);

  return null;
}

// Component to listen to map viewport changes and extract bounding box
function MapEventHandler({
  onViewportChange,
}: {
  onViewportChange?: (
    center: [number, number],
    zoom: number,
    radius: number,
    bounds: { min_lat: number; min_lon: number; max_lat: number; max_lon: number }
  ) => void;
}) {
  const map = useMap();
  const lastBoundsRef = useRef<string | null>(null);
  const lastZoomRef = useRef<number | null>(null);

  // Memoize the debounced handler to prevent recreation on every render
  const debouncedViewportChange = useMemo(
    () =>
      debounce((
        center: [number, number],
        zoom: number,
        radius: number,
        bounds: { min_lat: number; min_lon: number; max_lat: number; max_lon: number }
      ) => {
        if (onViewportChange) {
          onViewportChange(center, zoom, radius, bounds);
        }
      }, 150), // 150ms debounce - quick API response, just enough to batch rapid events
    [onViewportChange]
  );

  useEffect(() => {
    if (!onViewportChange) return;

    let resetTimeout: NodeJS.Timeout | null = null;

    const handleMoveEnd = () => {
      // Skip if this was triggered by fitBounds
      const extendedMap = map as ExtendedMap;
      const isFitting = extendedMap.__isFittingBounds?.();
      if (isFitting) {
        // Clear any existing reset timeout
        if (resetTimeout) {
          clearTimeout(resetTimeout);
        }

        // Reset the flag after a delay to allow all fitBounds events to be processed
        resetTimeout = setTimeout(() => {
          extendedMap.__resetFitBoundsFlag?.();
          resetTimeout = null;
        }, 500); // 500ms delay to catch all fitBounds events

        return;
      }

      const center = map.getCenter();
      const zoom = map.getZoom();

      // Get viewport bounding box
      const bounds = map.getBounds();
      const southwest = bounds.getSouthWest();
      const northeast = bounds.getNorthEast();

      // Clamp coordinates to valid ranges
      const clampLat = (lat: number) => Math.max(-90, Math.min(90, lat));
      const clampLng = (lng: number) => {
        let normalized = lng;
        while (normalized > 180) normalized -= 360;
        while (normalized < -180) normalized += 360;
        return normalized;
      };

      // Extract and clamp bounding box coordinates
      let min_lon = clampLng(southwest.lng);
      let max_lon = clampLng(northeast.lng);

      // If viewport crosses the international date line, use full world span
      if (min_lon > max_lon) {
        min_lon = -180;
        max_lon = 180;
      }

      const boundingBox = {
        min_lat: clampLat(southwest.lat),
        min_lon: min_lon,
        max_lat: clampLat(northeast.lat),
        max_lon: max_lon,
      };

      // Calculate radius from viewport bounds
      const northwest = bounds.getNorthWest();
      const radiusInMeters = center.distanceTo([northwest.lat, northwest.lng]);
      const radiusInKm = Math.round(radiusInMeters / 1000);

      // Create a string representation of bounds for comparison
      const boundsString = [
        boundingBox.min_lat.toFixed(4),
        boundingBox.min_lon.toFixed(4),
        boundingBox.max_lat.toFixed(4),
        boundingBox.max_lon.toFixed(4),
      ].join(',');

      // Only trigger if bounds or zoom changed significantly
      const zoomChanged = lastZoomRef.current !== null && Math.abs((lastZoomRef.current ?? 0) - zoom) >= 1;
      const boundsChanged = lastBoundsRef.current !== boundsString;

      if (boundsChanged || zoomChanged) {
        lastBoundsRef.current = boundsString;
        lastZoomRef.current = zoom;

        // Call debounced handler
        debouncedViewportChange([center.lat, center.lng], zoom, radiusInKm, boundingBox);
      }
    };

    // Listen to both moveend (pan) and zoomend (zoom) events
    map.on('moveend', handleMoveEnd);
    map.on('zoomend', handleMoveEnd);

    return () => {
      map.off('moveend', handleMoveEnd);
      map.off('zoomend', handleMoveEnd);
      if (resetTimeout) {
        clearTimeout(resetTimeout);
      }
    };
  }, [map, onViewportChange, debouncedViewportChange]);

  return null;
}

// Component to disable/enable map interactions based on loading state
function MapInteractionController({ isLoading }: { isLoading: boolean }) {
  const map = useMap();

  useEffect(() => {
    if (isLoading) {
      // Disable all map interactions while loading
      map.dragging.disable();
      map.touchZoom.disable();
      map.doubleClickZoom.disable();
      map.scrollWheelZoom.disable();
      map.boxZoom.disable();
      map.keyboard.disable();
    } else {
      // Re-enable all map interactions
      map.dragging.enable();
      map.touchZoom.enable();
      map.doubleClickZoom.enable();
      map.scrollWheelZoom.enable();
      map.boxZoom.enable();
      map.keyboard.enable();
    }
  }, [isLoading, map]);

  return null;
}

// Memoized beach marker component to prevent unnecessary re-renders
const BeachMarker = memo(({
  beach,
  isSelected,
  isHovered,
  beachIcon,
  selectedBeachIcon,
  onMarkerClick,
}: {
  beach: Beach;
  isSelected: boolean;
  isHovered: boolean;
  beachIcon: L.DivIcon;
  selectedBeachIcon: L.DivIcon;
  onMarkerClick?: (beachId: number) => void;
}) => {
  const markerRef = useRef<L.Marker | null>(null);
  const lat = typeof beach.latitude === 'string' ? parseFloat(beach.latitude) : beach.latitude;
  const lng = typeof beach.longitude === 'string' ? parseFloat(beach.longitude) : beach.longitude;

  // Auto-open popup when this marker is pre-selected (e.g. navigating from a beach page).
  // The small delay ensures Leaflet has fully mounted the marker before openPopup() is called.
  useEffect(() => {
    if (!isSelected) return;
    const timer = setTimeout(() => {
      markerRef.current?.openPopup();
    }, 300);
    return () => clearTimeout(timer);
  }, [isSelected]);

  // Bounce the marker pin when the corresponding beach card is hovered in the list.
  // We toggle a CSS class directly on the Leaflet marker's icon DOM element so we
  // don't have to remount/recreate the marker (which would break clustering).
  useEffect(() => {
    const marker = markerRef.current;
    if (!marker) return;

    const iconEl = marker.getElement();
    if (!iconEl) return;

    if (isHovered) {
      iconEl.classList.add('beach-marker-bounce');
      // Raise the hovered marker above its neighbours so the bounce is visible
      marker.setZIndexOffset(900);
    } else {
      iconEl.classList.remove('beach-marker-bounce');
      // Restore z-index: selected marker stays on top (1000), others go to 0
      marker.setZIndexOffset(isSelected ? 1000 : 0);
    }
  }, [isHovered, isSelected]);

  if (!beach?.latitude || !beach?.longitude || !beach?.id || !lat || !lng || isNaN(lat) || isNaN(lng)) {
    return null;
  }

  const markerIcon = isSelected ? selectedBeachIcon : beachIcon;

  return (
    <Marker
      ref={markerRef}
      position={[lat, lng]}
      icon={markerIcon}
      zIndexOffset={isSelected ? 1000 : 0}
      eventHandlers={{
        click: () => {
          // Update selected marker style
          if (onMarkerClick && beach.id) {
            onMarkerClick(beach.id);
          }
          // Open popup on click
          markerRef.current?.openPopup();
        },
      }}
    >
      {/* Popup - opens on click, closes with X button or clicking another marker */}
      <Popup
        offset={[0, -10]}
        autoPan={true}
        closeButton={false}
        className="beach-marker-popup"
      >
        <BeachMarkerTooltip beach={beach} />
      </Popup>
    </Marker>
  );
}, (prevProps, nextProps) =>
  prevProps.beach.id === nextProps.beach.id &&
  prevProps.isSelected === nextProps.isSelected &&
  prevProps.isHovered === nextProps.isHovered
);

BeachMarker.displayName = 'BeachMarker';

const ReactLeafletMap = ({
  beaches,
  center = [46.861505, 2.496587],
  zoom = 6,
  radius: _radius = 100,
  selectedBeachId,
  hoveredBeachId,
  boundingBox,
  isLoading = false,
  onViewportChange,
  onMarkerClick,
  activeBeach = null,
  coveredLeft,
}: ReactLeafletMapProps) => {
  const renderStart = useRef(performance.now());
  const currentRenderCount = useRef(++mapRenderCount);

  // Performance logging
  if (ENABLE_MAP_PERF_LOGGING) {
    renderStart.current = performance.now();
    console.log(`🗺️ [ReactLeafletMap] RENDER #${currentRenderCount.current} START`, {
      beachesCount: beaches?.length ?? 0,
      isLoading,
      center,
      zoom,
    });
  }

  // Log render completion
  useEffect(() => {
    if (ENABLE_MAP_PERF_LOGGING) {
      const renderTime = performance.now() - renderStart.current;
      console.log(`✅ [ReactLeafletMap] RENDER #${currentRenderCount.current} COMPLETE in ${renderTime.toFixed(2)}ms`, {
        beachesCount: beaches?.length ?? 0,
      });
      if (renderTime > 100) {
        console.warn(`⚠️ [ReactLeafletMap] Slow render: ${renderTime.toFixed(2)}ms`);
      }
    }
  });

  // Check for duplicate beach IDs and log them
  const uniqueBeaches = useMemo(() => {
    // Ensure beaches is always an array
    const safeBeaches = Array.isArray(beaches) ? beaches : [];

    const seenIds = new Map<number, number>();
    const duplicateIds = new Set<number>();

    // First filter out beaches without IDs
    const beachesWithIds = safeBeaches.filter(beach => beach.id !== undefined);

    beachesWithIds.forEach((beach, index) => {
      const beachId = beach.id!; // Safe to use ! because we filtered above

      if (seenIds.has(beachId)) {
        duplicateIds.add(beachId);
        const firstIndex = seenIds.get(beachId);
        if (firstIndex !== undefined) {
          console.warn(
            `⚠️ Duplicate beach ID detected: ${beachId}`,
            `\nFirst occurrence at index ${firstIndex}:`,
            beachesWithIds[firstIndex],
            `\nDuplicate at index ${index}:`,
            beach
          );
        }
      } else {
        seenIds.set(beachId, index);
      }
    });

    if (duplicateIds.size > 0) {
      console.error(
        `❌ Found ${duplicateIds.size} duplicate beach ID(s):`,
        Array.from(duplicateIds).join(', ')
      );
    }

    // Remove duplicates by keeping only the first occurrence of each ID
    const uniqueMap = new Map<number, Beach>();
    beachesWithIds.forEach(beach => {
      const beachId = beach.id!;
      if (!uniqueMap.has(beachId)) {
        uniqueMap.set(beachId, beach);
      }
    });

    return Array.from(uniqueMap.values());
  }, [beaches]);

  // Memoize icons to prevent recreation on every render.
  // We use L.divIcon (a <div> wrapper containing an <img>) instead of L.icon
  // because Leaflet applies its positioning `transform` to the marker element,
  // and with a plain L.icon that element IS the <img>. To bounce the pin we
  // animate the inner <img> via CSS (.beach-marker-bounce img) while leaving
  // Leaflet's positioning transform on the outer <div> untouched.
  const markerIconUrl = getMarkerIcon('beach');

  const beachIcon = useMemo(() => L.divIcon({
    className: 'beach-div-icon',
    html: `<img src="${markerIconUrl}" style="width:28px;height:30px;display:block;" alt="" />`,
    iconSize: [28, 30],
    iconAnchor: [14, 30],
    popupAnchor: [0, -30],
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [markerIconUrl]);

  const selectedBeachIcon = useMemo(() => L.divIcon({
    className: 'beach-div-icon',
    html: `<img src="${markerIconUrl}" style="width:42px;height:45px;display:block;" alt="" />`,
    iconSize: [42, 45],
    iconAnchor: [21, 45],
    popupAnchor: [0, -45],
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [markerIconUrl]);

  return (
    <div className="h-full w-full p-0 flex flex-col bg-white shadow-lg">
      <div className="flex-1 relative rounded-lg overflow-hidden">
        <MapContainer
          center={center}
          zoom={zoom}
          className="h-full w-full"
          zoomControl={true}
        >
          <MapUpdater center={center} zoom={zoom} />
          <MapEventHandler onViewportChange={onViewportChange} />
          <FitBounds boundingBox={boundingBox} />
          <MapInteractionController isLoading={isLoading} />
          <MapSearch />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
          />

          {/* Marker clustering for better performance with many beaches */}
          <MarkerClusterGroup
            chunkedLoading
            chunkInterval={200}
            chunkDelay={50}
            maxClusterRadius={50}
            spiderfyOnMaxZoom={true}
            showCoverageOnHover={false}
            zoomToBoundsOnClick={true}
            disableClusteringAtZoom={15}
            animate={true}
            animateAddingMarkers={false}
          >
            {uniqueBeaches.map((beach) => (
              <BeachMarker
                key={beach.id}
                beach={beach}
                isSelected={selectedBeachId === beach.id}
                isHovered={hoveredBeachId === beach.id}
                beachIcon={beachIcon}
                selectedBeachIcon={selectedBeachIcon}
                onMarkerClick={onMarkerClick}
              />
            ))}
          </MarkerClusterGroup>
          <ActiveBeachLayer beach={activeBeach} coveredLeft={coveredLeft} />
        </MapContainer>
      </div>
    </div>
  );
};
export default ReactLeafletMap;
