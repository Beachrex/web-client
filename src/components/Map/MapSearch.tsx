/* import { useMap } from 'react-leaflet';
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';
import 'leaflet-geosearch/dist/geosearch.css';
import { useEffect } from 'react';
import type { Control } from 'leaflet';

const MapSearch: React.FC = () => {
  const map = useMap();
  useEffect(() => {
    const provider = new OpenStreetMapProvider();

    const searchControl = GeoSearchControl({
      provider,
      showMarker: false,
      autoClose: true,
      style: 'bar',
    }) as Control;

    map.addControl(searchControl);

    return () => {
      map.removeControl(searchControl);
    };
  }, [map]);
  return null;
};

export default MapSearch;*/
