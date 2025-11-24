'use client';

import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useEffect, useRef } from 'react';
import type { Beach } from '@/types';
import MapSearch from './MapSearch';
import { getMarkerIcon } from '@/lib/utils/icons';
import { useTranslations } from 'next-intl';

interface ReactLeafletMapProps {
  beaches: Beach[];
  center?: [number, number];
  zoom?: number;
  radius?: number;
  selectedBeachId?: number | null;
  loading?: boolean;
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
      console.log('Fit bounds flag reset by MapEventHandler');
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
      console.log('Fit bounds skipped - already fitted to this bounding box');
      return;
    }

    // Skip if we're currently fitting bounds (prevent multiple simultaneous calls)
    if (fitBoundsRef.current) {
      console.log('Fit bounds skipped - already fitting bounds');
      return;
    }

    console.log('Fit bounds called with boundingBox:', boundingBox);
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

  useEffect(() => {
    if (!onViewportChange) return;

    let lastBounds: string | null = null;
    let resetTimeout: NodeJS.Timeout | null = null;

    const handleMoveEnd = () => {
      // Skip if this was triggered by fitBounds
      const extendedMap = map as ExtendedMap;
      const isFitting = extendedMap.__isFittingBounds?.();
      if (isFitting) {
        console.log('[MapEventHandler] Skipping viewport change - came from fitBounds');

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

      console.log('[MapEventHandler] Processing viewport change (user interaction)');
      const center = map.getCenter();
      const zoom = map.getZoom();

      // Get viewport bounding box
      const bounds = map.getBounds();
      const southwest = bounds.getSouthWest();
      const northeast = bounds.getNorthEast();

      // Clamp coordinates to valid ranges
      // Latitude: -90 to 90
      // Longitude: -180 to 180
      const clampLat = (lat: number) => Math.max(-90, Math.min(90, lat));
      const clampLng = (lng: number) => {
        // Normalize longitude to -180 to 180 range
        let normalized = lng;
        while (normalized > 180) normalized -= 360;
        while (normalized < -180) normalized += 360;
        return normalized;
      };

      // Extract and clamp bounding box coordinates
      let min_lon = clampLng(southwest.lng);
      let max_lon = clampLng(northeast.lng);

      // If viewport crosses the international date line, swap the values
      // This happens when the map wraps around (e.g., from 170°E to -170°W)
      if (min_lon > max_lon) {
        // The viewport crosses the date line, so we need to handle it differently
        // For now, we'll use the full world span as a fallback
        // In the future, this could be split into two queries
        min_lon = -180;
        max_lon = 180;
      }

      const boundingBox = {
        min_lat: clampLat(southwest.lat),
        min_lon: min_lon,
        max_lat: clampLat(northeast.lat),
        max_lon: max_lon,
      };

      // Calculate radius from viewport bounds (for backward compatibility)
      const northwest = bounds.getNorthWest();
      const radiusInMeters = center.distanceTo([northwest.lat, northwest.lng]);
      const radiusInKm = Math.round(radiusInMeters / 1000);

      // Create a string representation of bounds for comparison
      const boundsString =
        `${boundingBox.min_lat},${boundingBox.min_lon},${boundingBox.max_lat},${boundingBox.max_lon}`;

      // Only call callback if bounds actually changed
      if (lastBounds !== boundsString) {
        lastBounds = boundsString;
        onViewportChange([center.lat, center.lng], zoom, radiusInKm, boundingBox);
      }
    };

    // Listen to both moveend (pan) and zoomend (zoom) events
    // Don't call on initial mount - only trigger on actual user interactions
    map.on('moveend', handleMoveEnd);
    map.on('zoomend', handleMoveEnd);

    return () => {
      map.off('moveend', handleMoveEnd);
      map.off('zoomend', handleMoveEnd);
      if (resetTimeout) {
        clearTimeout(resetTimeout);
      }
    };
  }, [map, onViewportChange]);

  return null;
}

const ReactLeafletMap = ({
  beaches,
  center = [46.861505, 2.496587],
  zoom = 6,
  radius: _radius = 100,
  selectedBeachId,
  loading = false,
  boundingBox,
  onViewportChange,
  onMarkerClick,
}: ReactLeafletMapProps) => {
  const t = useTranslations('BeachesMap');

  // Ensure beaches is always an array
  const safeBeaches = Array.isArray(beaches) ? beaches : [];

  // Create custom beach marker icons (normal and selected)
  const beachIcon = L.icon({
    iconUrl: getMarkerIcon('beach'),
    iconSize: [28, 30],
    iconAnchor: [14, 30], // Point of the icon which will correspond to marker's location
    popupAnchor: [0, -30], // Point from which the popup should open relative to the iconAnchor
  });

  const selectedBeachIcon = L.icon({
    iconUrl: getMarkerIcon('beach'),
    iconSize: [42, 45], // 1.5x larger for selected marker
    iconAnchor: [21, 45], // Adjusted anchor point
    popupAnchor: [0, -45], // Adjusted popup anchor
  });

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

          {safeBeaches.map((beach, index) => {
            if (!beach?.latitude || !beach?.longitude || !beach?.id) return null;
            const lat =
              typeof beach.latitude === 'string' ? parseFloat(beach.latitude) : beach.latitude;
            const lng =
              typeof beach.longitude === 'string' ? parseFloat(beach.longitude) : beach.longitude;
            if (isNaN(lat) || isNaN(lng)) return null;

            // Use larger icon for selected beach
            const isSelected = selectedBeachId === beach.id;
            const markerIcon = isSelected ? selectedBeachIcon : beachIcon;

            return (
              <Marker
                key={`${beach.id}-${index}`}
                position={[lat, lng]}
                icon={markerIcon}
                zIndexOffset={isSelected ? 1000 : 0} // Bring selected marker to front
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
                    {beach.description && <p className="text-sm">{beach.description}</p>}
                  </div>
                </Tooltip>
              </Marker>
            );
          })}
        </MapContainer>
        {loading && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-sm z-[1000] flex items-center justify-center rounded-lg">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-gray-700 font-medium">{t('loadingBeaches')}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default ReactLeafletMap;
