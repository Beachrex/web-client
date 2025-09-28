import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in Next.js
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

interface LeafletMapComponentProps {
    places: Place[];
}

const LeafletMapComponent: React.FC<LeafletMapComponentProps> = ({ places }) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<L.Map | null>(null);
    const [mapStatus, setMapStatus] = useState<string>('Initializing...');

    useEffect(() => {
        if (!mapRef.current || mapInstanceRef.current) return;

        try {
            setMapStatus('Creating map...');
            console.log('Creating Leaflet map...');

            // Initialize the map
            const map = L.map(mapRef.current, {
                center: [45.1, 15.2],
                zoom: 10,
                scrollWheelZoom: true,
                zoomControl: true,
            });

            setMapStatus('Adding tiles...');
            console.log('Adding tile layer...');

            // Try CartoDB tile layer (more reliable than OSM)
            const tileLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
                maxZoom: 20,
                minZoom: 1,
                subdomains: 'abcd',
                updateWhenIdle: true,
                updateWhenZooming: false,
                keepBuffer: 4,
            });

            tileLayer.on('loading', () => {
                console.log('Tiles loading...');
                setMapStatus('Loading tiles...');
            });

            tileLayer.on('load', () => {
                console.log('Tiles loaded successfully!');
                setMapStatus('Map ready!');
            });

            tileLayer.on('tileerror', (e) => {
                console.error('Tile error:', e);
                setMapStatus('Tile loading error');
            });

            tileLayer.addTo(map);

            setMapStatus('Adding markers...');
            console.log('Adding markers...');

            // Add markers with default icons first
            places.forEach((place) => {
                L.marker([place.lat, place.lon])
                    .addTo(map)
                    .bindPopup(`
                        <div>
                            <h3 style="font-weight: bold; font-size: 16px; margin-bottom: 4px;">${place.title}</h3>
                            <p style="font-size: 14px; color: #666; margin: 0;">${place.description}</p>
                        </div>
                    `);
            });

            mapInstanceRef.current = map;
            setMapStatus('Map ready!');
            console.log('Map initialization complete!');

        } catch (error) {
            console.error('Error initializing map:', error);
            setMapStatus(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }

        // Cleanup function
        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, [places]);

    return (
        <div style={{ height: '100%', width: '100%', position: 'relative' }}>
            {/* Debug status overlay */}
            <div style={{
                position: 'absolute',
                top: '10px',
                left: '10px',
                background: 'rgba(0,0,0,0.7)',
                color: 'white',
                padding: '8px',
                borderRadius: '4px',
                zIndex: 1000,
                fontSize: '12px'
            }}>
                Status: {mapStatus}
            </div>

            <div
                ref={mapRef}
                style={{
                    height: '100%',
                    width: '100%',
                    minHeight: '400px',
                    background: '#e0e0e0'
                }}
            />
        </div>
    );
};

export default LeafletMapComponent;
