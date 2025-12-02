'use client';

import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import { MapContainer, TileLayer, Marker, Tooltip, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import { useEffect, useRef, useMemo, memo } from 'react';
import type { Beach } from '@/types';
import MapSearch from './MapSearch';
import { getMarkerIcon } from '@/lib/utils/icons';
import { debounce } from '@/lib/utils/debounce';

interface ReactLeafletMapProps {
  beaches: Beach[];
  center?: [number, number];
  zoom?: number;
  radius?: number;
  selectedBeachId?: number | null;
  boundingBox?: {
    min_latitude?: number;
    min_longitude?: number;
    max_latitude?: number;
    max_longitude?: number;
  } | null;
  onViewportChange?: (
    center: [number, number],
    zoom: number,
    radius: number,
    bounds: { min_lat: number; min_lon: number; max_lat: number; max_lon: number }
  ) => void;
  onMarkerClick?: (beachId: number) => void;
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
      }, 600), // 600ms debounce - wait for user to stop moving (increased to reduce API calls)
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

// Memoized beach marker component to prevent unnecessary re-renders
const BeachMarker = memo(({
  beach,
  isSelected,
  beachIcon,
  selectedBeachIcon,
  onMarkerClick,
}: {
  beach: Beach;
  isSelected: boolean;
  beachIcon: L.Icon;
  selectedBeachIcon: L.Icon;
  onMarkerClick?: (beachId: number) => void;
}) => {
  const lat = typeof beach.latitude === 'string' ? parseFloat(beach.latitude) : beach.latitude;
  const lng = typeof beach.longitude === 'string' ? parseFloat(beach.longitude) : beach.longitude;

  if (!beach?.latitude || !beach?.longitude || !beach?.id || !lat || !lng || isNaN(lat) || isNaN(lng)) {
    return null;
  }

  const markerIcon = isSelected ? selectedBeachIcon : beachIcon;

  return (
    <Marker
      position={[lat, lng]}
      icon={markerIcon}
      zIndexOffset={isSelected ? 1000 : 0}
      eventHandlers={{
        click: () => {
          if (onMarkerClick && beach.id) {
            onMarkerClick(beach.id);
          }
        },
      }}
    >
      <Tooltip offset={[10, -10]}>
        <div>
          <h3 className="font-bold">{beach.name ?? 'Beach'}</h3>
        </div>
      </Tooltip>
    </Marker>
  );
}, (prevProps, nextProps) =>
  prevProps.beach.id === nextProps.beach.id &&
  prevProps.isSelected === nextProps.isSelected
);

BeachMarker.displayName = 'BeachMarker';

const ReactLeafletMap = ({
  beaches,
  center = [46.861505, 2.496587],
  zoom = 6,
  radius: _radius = 100,
  selectedBeachId,
  boundingBox,
  onViewportChange,
  onMarkerClick,
}: ReactLeafletMapProps) => {

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

  // Memoize icons to prevent recreation on every render
  const beachIcon = useMemo(() => L.icon({
    iconUrl: getMarkerIcon('beach'),
    iconSize: [28, 30],
    iconAnchor: [14, 30],
    popupAnchor: [0, -30],
  }), []);

  const selectedBeachIcon = useMemo(() => L.icon({
    iconUrl: getMarkerIcon('beach'),
    iconSize: [42, 45],
    iconAnchor: [21, 45],
    popupAnchor: [0, -45],
  }), []);

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
          <MapSearch />
          {/* <MapRadiusControl radius={radius} /> */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
          />

          {/* Marker clustering for better performance with many beaches */}
          <MarkerClusterGroup
            chunkedLoading
            maxClusterRadius={50}
            spiderfyOnMaxZoom={true}
            showCoverageOnHover={false}
            zoomToBoundsOnClick={true}
          >
            {uniqueBeaches.map((beach) => (
              <BeachMarker
                key={beach.id}
                beach={beach}
                isSelected={selectedBeachId === beach.id}
                beachIcon={beachIcon}
                selectedBeachIcon={selectedBeachIcon}
                onMarkerClick={onMarkerClick}
              />
            ))}
          </MarkerClusterGroup>
        </MapContainer>
        {/* Loading overlay removed - markers update in background for smooth UX */}
      </div>
    </div>
  );
};
export default ReactLeafletMap;
