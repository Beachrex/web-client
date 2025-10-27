'use client';

import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import type { BeachSchema } from '@/lib/api-client/models/BeachSchema';
import MapSearch from './MapSearch';

interface ReactLeafletMapProps {
  beaches: BeachSchema[];
}

const ReactLeafletMap = ({ beaches }: ReactLeafletMapProps) => {
  // Ensure beaches is always an array
  const safeBeaches = Array.isArray(beaches) ? beaches : [];

  return (
    <div className="h-full w-full p-0 flex flex-col bg-white shadow-lg">
      <div className="flex-1 relative rounded-lg overflow-hidden">
        <MapContainer
          center={[46.861505, 2.496587]}
          zoom={6}
          className="h-full w-full"
        >
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
