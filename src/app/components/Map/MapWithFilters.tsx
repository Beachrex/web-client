"use client";
import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import BeachCard from "@/app/components/BeachCard/BeachCard";
import LeftSidebarFilters from "@/app/components/Map/LeftSidebarFilters";
import 'leaflet/dist/leaflet.css';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

const MapWithFilters = () => {
    const places = [
        { lat: 45.1, lon: 15.2, title: 'Plaža Haludovo', description: 'Great beach with clear water.', id: 1 },
        { lat: 45.2, lon: 15.3, title: 'Pine Beach', description: 'A nice beach with pine trees.', id: 2 },
        { lat: 45.3, lon: 15.4, title: 'Sunset Beach', description: 'Amazing sunset view.', id: 3 },
    ];

    const SetMap = () => {
        const map = useMap();
            map.setView([45.0, 15.2], 13);
        return null;
    };

    const customIcon = new L.Icon({
        iconUrl: `${process.env.NEXT_PUBLIC_CDN_ENDPOINT}/img/icon/marker-icon-default.svg`,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
    });

    return (
        <div className="flex w-full h-[100vh]">
            <div className="bg-variable-collection-ultra-light-grey p-4">
                <LeftSidebarFilters/>
            </div>

            <div className="bg-white p-4">
                <BeachCard/>
            </div>
            <div className="flex-1">
                <MapContainer
                    style={{ height: '100%' }}
                >
                    <SetMap />
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    {places.map((place) => (
                        <Marker
                            key={place.id}
                            position={[place.lat, place.lon]}
                            icon={customIcon}
                        >
                            <Popup>
                                <div>
                                    <h3>{place.title}</h3>
                                    <p>{place.description}</p>
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>
            </div>
        </div>
    );
};

export default MapWithFilters;