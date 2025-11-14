import { useMap } from 'react-leaflet';
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';
import 'leaflet-geosearch/dist/geosearch.css';
import { useEffect } from 'react';
import type { Control } from 'leaflet';
import { useTranslations } from 'next-intl';

const MapSearch: React.FC = () => {
    const map = useMap();
    const t = useTranslations('BeachesMap');

    useEffect(() => {
        const provider = new OpenStreetMapProvider();

        const searchControl = GeoSearchControl({
            provider,
            showMarker: false,
            autoClose: true,
            style: 'bar',
            searchLabel: t('searchForBeaches'),
        }) as Control;

        map.addControl(searchControl);

        return () => {
            map.removeControl(searchControl);
        };
    }, [map, t]);
    return null;
};

export default MapSearch;
