import { useMap } from 'react-leaflet';
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';
import 'leaflet-geosearch/dist/geosearch.css';
import { useEffect } from 'react';
import type { Control } from 'leaflet';
import { useTranslations, useLocale } from 'next-intl';

// Map next-intl locale codes to BCP-47 language tags for Nominatim.
// NOTE: Some locales have historical place names in OSM that override modern
// names (e.g. IT → Zadar becomes "Zara / Città di Zara"). To avoid this, we
// always prepend "en" so English (modern, neutral) names take priority, and
// the UI language is used as a secondary preference for surrounding context
// (county/region names). Italian is excluded from the fallback chain because
// its OSM entries use historical Austro-Hungarian/Venetian names.
const LOCALE_TO_LANGUAGE: Record<string, string> = {
    en: 'en',
    si: 'en,sl',
    de: 'en,de',
    hr: 'hr,en',
    fr: 'en,fr',
    es: 'en,es',
    it: 'en',       // intentionally no "it": avoids "Zara", "Spalato", etc.
    ua: 'en,uk',
    ru: 'en,ru',
    pl: 'en,pl',
    cs: 'en,cs',
    hu: 'en,hu',
    bg: 'en,bg',
    sk: 'en,sk',
};

const MapSearch: React.FC = () => {
    const map = useMap();
    const t = useTranslations('BeachesMap');
    const locale = useLocale();

    useEffect(() => {
        const language = LOCALE_TO_LANGUAGE[locale] ?? 'en';
        const provider = new OpenStreetMapProvider({
            params: {
                // Explicit accept-language prevents Nominatim from using the
                // browser's Accept-Language header, which caused historical names
                // (e.g. "Zara" instead of "Zadar" for Italian-language browsers).
                'accept-language': language,
            },
        });

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
    }, [map, t, locale]);
    return null;
};

export default MapSearch;
