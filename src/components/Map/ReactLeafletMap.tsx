'use client';

import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useEffect } from 'react';
import type { Beach } from '@/types';
import MapSearch from './MapSearch';
import { getMarkerIcon } from '@/lib/utils/icons';

interface ReactLeafletMapProps {
  beaches: Beach[];
  center?: [number, number];
  zoom?: number;
}

// Component to update map view
function MapUpdater({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();

  useEffect(() => {
    map.setView(center, zoom, {
      animate: true,
      duration: 1, // 1 second animation
    });
  }, [center, zoom, map]);

  return null;
}

const ReactLeafletMap = ({ beaches, center = [46.861505, 2.496587], zoom = 6 }: ReactLeafletMapProps) => {
  // Ensure beaches is always an array
  const safeBeaches = Array.isArray(beaches) ? beaches : [];

  // Create custom beach marker icon
  const beachIcon = L.icon({
    iconUrl: getMarkerIcon('beach'),
    iconSize: [28, 30],
    iconAnchor: [14, 30], // Point of the icon which will correspond to marker's location
    popupAnchor: [0, -30], // Point from which the popup should open relative to the iconAnchor
  });

  return (
    <div className="h-full w-full p-0 flex flex-col bg-white shadow-lg">
      <div className="flex-1 relative rounded-lg overflow-hidden">
        <MapContainer
          center={center}
          zoom={zoom}
          className="h-full w-full"
        >
          <MapUpdater center={center} zoom={zoom} />
          <MapSearch />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
          />

          {safeBeaches.map((beach) => {
            if (!beach?.latitude || !beach?.longitude || !beach?.id) return null;
            const lat = typeof beach.latitude === 'string' ? parseFloat(beach.latitude) : beach.latitude;
            const lng = typeof beach.longitude === 'string' ? parseFloat(beach.longitude) : beach.longitude;
            if (isNaN(lat) || isNaN(lng)) return null;
            return (
              <Marker
                key={beach.id}
                position={[lat, lng]}
                icon={beachIcon}
              >
                <Popup>
                  <div>
                    <h3 className="font-bold">{beach.name ?? 'Beach'}</h3>
                    {beach.description && <p className="text-sm">{beach.description}</p>}
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
};
export default ReactLeafletMap;
