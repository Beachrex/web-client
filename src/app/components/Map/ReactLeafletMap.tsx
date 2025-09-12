'use client';
import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
// CSS is loaded globally in layout.tsx

// Fix for default markers in Next.js
import L from 'leaflet';
delete (L.Icon.Default.prototype as L.Icon.Default & { _getIconUrl?: () => string })._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface Place {
    lat: number;
    lon: number;
    title: string;
    description: string;
    id: number;
}

interface ReactLeafletMapProps {
    places: Place[];
}

const ReactLeafletMap: React.FC<ReactLeafletMapProps> = ({ places }) => {
    return (
        <MapContainer
            center={[45.1, 15.2]}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom={true}
            zoomControl={true}
            attributionControl={true}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                maxZoom={20}
                subdomains="abcd"
            />
            {places.map((place) => (
                <Marker key={place.id} position={[place.lat, place.lon]}>
                    <Popup>
                        <div>
                            <strong>{place.title}</strong><br />
                            {place.description}
                        </div>
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
};

export default ReactLeafletMap;
