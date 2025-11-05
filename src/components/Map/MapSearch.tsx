/*
import { useMap } from 'react-leaflet';
// @ts-ignore: no type declarations for 'leaflet-geosearch'
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';
// @ts-ignore: importing CSS without type declarations
import 'leaflet-geosearch/dist/geosearch.css';
import { useEffect } from 'react';

const MapSearch: React.FC = () => {
  const map = useMap();
  useEffect(() => {
    const provider = new OpenStreetMapProvider();

    const searchControl = GeoSearchControl({
      provider,
      showMarker: false,
      autoClose: true,
      style: 'bar',
    });

    map.addControl(searchControl);

    return () => {
      map.removeControl(searchControl);
    };
  }, [map]);
  return null;
};

export default MapSearch;
*/
