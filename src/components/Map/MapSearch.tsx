import { useMap } from 'react-leaflet';
// @ts-expect-error - leaflet-geosearch doesn't have proper TypeScript types
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';
import 'leaflet-geosearch/dist/geosearch.css';
import { useEffect } from 'react';
import type { Control } from 'leaflet';

const MapSearch: React.FC = () => {
  const map = useMap();
  useEffect(() => {
    // @ts-expect-error - OpenStreetMapProvider is not typed
    const provider = new OpenStreetMapProvider();

    // @ts-expect-error - GeoSearchControl is not typed
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

export default MapSearch;
