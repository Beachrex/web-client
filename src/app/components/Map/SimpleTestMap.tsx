'use client';
import React, { useEffect, useRef } from 'react';

// Declare global Leaflet types
import type * as L from 'leaflet';

declare global {
    interface Window {
        L: typeof L;
    }
}

const SimpleTestMap: React.FC = () => {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<L.Map | null>(null);

    useEffect(() => {
        const initMap = () => {
            if (typeof window !== 'undefined' && mapRef.current && !mapInstanceRef.current) {
                // Check if Leaflet is available globally
                const L = window.L;
                if (L) {
                    console.log('Leaflet is available:', L.version);

                    // Create map using global Leaflet
                    const map = L.map(mapRef.current).setView([45.1, 15.2], 13);
                    mapInstanceRef.current = map;

                    // Try different tile providers to see if one works better
                    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                        maxZoom: 19,
                    }).addTo(map);

                    // Add a marker
                    L.marker([45.1, 15.2]).addTo(map)
                        .bindPopup('Test marker')
                        .openPopup();

                    console.log('Map created successfully');
                } else {
                    console.error('Leaflet is not available globally, retrying...');
                    // Retry with longer delay
                    setTimeout(initMap, 200);
                }
            }
        };

        // Wait longer for Next.js Script to load
        setTimeout(initMap, 500);

        // Cleanup function
        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, []);

    return (
        <div style={{ height: '100%', width: '100%' }}>
            <div
                ref={mapRef}
                style={{
                    height: '100%',
                    width: '100%',
                    background: '#e0e0e0',
                }}
            />
        </div>
    );
};

export default SimpleTestMap;
