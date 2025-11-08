'use client';

import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useEffect } from 'react';
import type { Beach } from '@/types';
import MapSearch from './MapSearch';
import MapRadiusControl from './MapRadiusControl';
import { getMarkerIcon } from '@/lib/utils/icons';

interface ReactLeafletMapProps {
  beaches: Beach[];
  center?: [number, number];
  zoom?: number;
  radius?: number;
  selectedBeachId?: number | null;
  onViewportChange?: (center: [number, number], zoom: number, radius: number) => void;
  onMarkerClick?: (beachId: number) => void;
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

// Component to listen to map viewport changes and calculate radius
function MapEventHandler({
  onViewportChange,
}: {
  onViewportChange?: (center: [number, number], zoom: number, radius: number) => void;
}) {
  const map = useMap();

  useEffect(() => {
    if (!onViewportChange) return;

    let lastRadius: number | null = null;

    const handleMoveEnd = () => {
      const center = map.getCenter();
      const zoom = map.getZoom();

      // Calculate radius from viewport bounds
      const bounds = map.getBounds();
      const northwest = bounds.getNorthWest(); // Top-left corner

      // Calculate distance from center to top-left corner (in meters)
      const radiusInMeters = center.distanceTo([northwest.lat, northwest.lng]);
      const radiusInKm = Math.round(radiusInMeters / 1000);

      // Only call callback if radius actually changed
      if (lastRadius !== radiusInKm) {
        lastRadius = radiusInKm;
        onViewportChange([center.lat, center.lng], zoom, radiusInKm);
      }
    };

    // Listen to both moveend (pan) and zoomend (zoom) events
    map.on('moveend', handleMoveEnd);
    map.on('zoomend', handleMoveEnd);

    // Calculate initial viewport and radius once
    const timer = setTimeout(handleMoveEnd, 100);

    return () => {
      clearTimeout(timer);
      map.off('moveend', handleMoveEnd);
      map.off('zoomend', handleMoveEnd);
    };
  }, [map, onViewportChange]);

  return null;
}

const ReactLeafletMap = ({
  beaches,
  center = [46.861505, 2.496587],
  zoom = 6,
  radius = 100,
  selectedBeachId,
  onViewportChange,
  onMarkerClick,
}: ReactLeafletMapProps) => {
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
          <MapSearch />
          <MapRadiusControl radius={radius} />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
          />

          {safeBeaches.map((beach) => {
            if (!beach?.latitude || !beach?.longitude || !beach?.id) return null;
            const lat = typeof beach.latitude === 'string' ? parseFloat(beach.latitude) : beach.latitude;
            const lng = typeof beach.longitude === 'string' ? parseFloat(beach.longitude) : beach.longitude;
            if (isNaN(lat) || isNaN(lng)) return null;

            // Use larger icon for selected beach
            const isSelected = selectedBeachId === beach.id;
            const markerIcon = isSelected ? selectedBeachIcon : beachIcon;

            return (
              <Marker
                key={beach.id}
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
      </div>
    </div>
  );
};
export default ReactLeafletMap;
