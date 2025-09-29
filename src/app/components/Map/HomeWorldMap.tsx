'use client';
import React, { useEffect, useRef } from 'react';

// Declare global Leaflet types
import type * as L from 'leaflet';

declare global {
    interface Window {
        L: typeof L;
    }
}

interface BeachLocation {
    lat: number;
    lon: number;
    count: number;
    region: string;
    id: string;
}

interface HomeWorldMapProps {
    beachLocations?: BeachLocation[];
}

const HomeWorldMap: React.FC<HomeWorldMapProps> = ({
    beachLocations = [
        { lat: 45.1, lon: 15.2, count: 1689, region: 'Europe', id: 'europe' },
        { lat: 35.0, lon: 25.0, count: 1693, region: 'Mediterranean', id: 'mediterranean' },
        { lat: 25.0, lon: 55.0, count: 2689, region: 'Middle East', id: 'middle-east' },
        { lat: -15.0, lon: -60.0, count: 2669, region: 'South America', id: 'south-america' },
        { lat: -25.0, lon: 135.0, count: 2669, region: 'Australia', id: 'australia' },
    ],
}) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<L.Map | null>(null);

    useEffect(() => {
        const initMap = () => {
            if (typeof window !== 'undefined' && mapRef.current && !mapInstanceRef.current) {
                const L = window.L;
                if (L) {
                    console.log('Leaflet is available for home map:', L.version);

                    // Create map with world view
                    const map = L.map(mapRef.current, {
                        center: [20, 0],
                        zoom: 2,
                        minZoom: 2,
                        maxZoom: 6,
                        zoomControl: false,
                        attributionControl: false,
                        dragging: true,
                        scrollWheelZoom: false,
                        doubleClickZoom: false,
                        boxZoom: false,
                        keyboard: false,
                    });
                    mapInstanceRef.current = map;

                    // Add tile layer with a clean style
                    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
                        attribution: '',
                        maxZoom: 6,
                        subdomains: 'abcd',
                    }).addTo(map);

                    // Custom marker style
                    const createCustomMarker = (count: number): L.DivIcon => {
                        return L.divIcon({
                            className: 'custom-beach-marker',
                            html: `
                                <div class="beach-marker-container">
                                    <div class="beach-marker-content">
                                        <span class="beach-count">${count}</span>
                                    </div>
                                    <div class="beach-marker-arrow"></div>
                                </div>
                            `,
                            iconSize: [60, 40],
                            iconAnchor: [30, 40],
                        });
                    };

                    // Add markers for each beach location
                    beachLocations.forEach((location) => {
                        const marker = L.marker([location.lat, location.lon], {
                            icon: createCustomMarker(location.count),
                        }).addTo(map);

                        // Add click handler
                        marker.on('click', () => {
                            console.log(`Clicked on ${location.region} with ${location.count} beaches`);
                            // You can add navigation logic here
                        });
                    });

                    console.log('Home world map created successfully');
                } else {
                    console.error('Leaflet is not available for home map, retrying...');
                    setTimeout(initMap, 200);
                }
            }
        };

        // Wait for Leaflet to load
        setTimeout(initMap, 500);

        // Cleanup function
        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, [beachLocations]);

    return (
        <div className="relative w-full h-full">
            {/* Map container */}
            <div
                ref={mapRef}
                className="w-full h-full rounded-lg"
                style={{
                    minHeight: '400px',
                    background: '#f8fafc',
                }}
            />

            {/* Custom CSS for markers */}
            <style jsx>{`
                .beach-marker-container {
                    position: relative;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }
                
                .beach-marker-content {
                    background: #1e40af;
                    color: white;
                    padding: 4px 8px;
                    border-radius: 4px;
                    font-size: 12px;
                    font-weight: bold;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                    min-width: 40px;
                    text-align: center;
                }
                
                .beach-marker-arrow {
                    width: 0;
                    height: 0;
                    border-left: 6px solid transparent;
                    border-right: 6px solid transparent;
                    border-top: 8px solid #1e40af;
                    margin-top: -1px;
                }
                
                .beach-count {
                    color: white;
                    font-size: 11px;
                    font-weight: bold;
                }
                
                .custom-beach-marker {
                    background: transparent !important;
                    border: none !important;
                }
            `}</style>
        </div>
    );
};

export default HomeWorldMap;
