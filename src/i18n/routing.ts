// src/i18n/routing.ts
import { defineRouting } from 'next-intl/routing';
import { createSharedPathnamesNavigation } from 'next-intl/navigation';
import { locales } from '@/app/config/locales';

const globalRoutes = {
    beaches: {
        en: 'beaches',
        si: 'plaze',
        de: 'strande',
        hr: 'plaze',
        fr: 'plages',
        es: 'playas',
        it: 'spiagge',
        ua: 'plyazhi',
        ru: 'plyazhi',
        pl: 'plaze',
        cs: 'plaze',
        hu: 'strandok',
        bg: 'plyazhove',
        sk: 'plaze',
    },
    beachMap: {
        en: 'beach-map',
        si: 'zemljevid-plaz',
        de: 'strand-karte',
        hr: 'karta-plaza',
        fr: 'carte-des-plages',
        es: 'mapa-de-playas',
        it: 'mappa-spiagge',
        ua: 'karta-plyazhiv',
        ru: 'karta-plyazhey',
        pl: 'mapa-plaz',
        cs: 'mapa-plazi',
        hu: 'strand-terkep',
        bg: 'karta-na-plyazhovete',
        sk: 'mapa-plazi',
    },
    beachType: {
        en: 'beach-type',
        si: 'tip-plaze',
        de: 'strand-typ',
        hr: 'tip-plaze',
        fr: 'type-de-plage',
        es: 'tipo-de-playa',
        it: 'tipo-di-spiaggia',
        ua: 'typ-plyazhu',
        ru: 'tip-plyazha',
        pl: 'typ-plazy',
        cs: 'typ-plaze',
        hu: 'strand-tipus',
        bg: 'tip-plyazh',
        sk: 'typ-plaze',
    },
    userType: {
        en: 'user-type',
        si: 'tip-uporabnika',
        de: 'benutzer-typ',
        hr: 'tip-korisnika',
        fr: 'type-utilisateur',
        es: 'tipo-de-usuario',
        it: 'tipo-utente',
        ua: 'typ-korystuvacha',
        ru: 'tip-polzovatelya',
        pl: 'typ-uzytkownika',
        cs: 'typ-uzivatele',
        hu: 'felhasznalo-tipus',
        bg: 'tip-potrebitel',
        sk: 'typ-pouzivatela',
    },
    about: {
        en: 'about',
        si: 'o-nas',
        de: 'uber-uns',
        hr: 'o-nama',
        fr: 'a-propos',
        es: 'acerca-de',
        it: 'chi-siamo',
        ua: 'pro-nas',
        ru: 'o-nas',
        pl: 'o-nas',
        cs: 'o-nas',
        hu: 'rolunk',
        bg: 'za-nas',
        sk: 'o-nas',
    },
};

export const routing = defineRouting({
    // A list of all locales that are supported
    locales,

    // Used when no locale matches
    defaultLocale: 'en',
    pathnames: {
        // Home page
        '/': '/',

        // Beach map
        '/beach-map': {
            en: `/${globalRoutes.beachMap.en}`,
            si: `/${globalRoutes.beachMap.si}`,
            de: `/${globalRoutes.beachMap.de}`,
            hr: `/${globalRoutes.beachMap.hr}`,
            fr: `/${globalRoutes.beachMap.fr}`,
            es: `/${globalRoutes.beachMap.es}`,
            it: `/${globalRoutes.beachMap.it}`,
            ua: `/${globalRoutes.beachMap.ua}`,
            ru: `/${globalRoutes.beachMap.ru}`,
            pl: `/${globalRoutes.beachMap.pl}`,
            cs: `/${globalRoutes.beachMap.cs}`,
            hu: `/${globalRoutes.beachMap.hu}`,
            bg: `/${globalRoutes.beachMap.bg}`,
            sk: `/${globalRoutes.beachMap.sk}`,
        },

        // Beaches listing
        '/beaches': {
            en: `/${globalRoutes.beaches.en}`,
            si: `/${globalRoutes.beaches.si}`,
            de: `/${globalRoutes.beaches.de}`,
            hr: `/${globalRoutes.beaches.hr}`,
            fr: `/${globalRoutes.beaches.fr}`,
            es: `/${globalRoutes.beaches.es}`,
            it: `/${globalRoutes.beaches.it}`,
            ua: `/${globalRoutes.beaches.ua}`,
            ru: `/${globalRoutes.beaches.ru}`,
            pl: `/${globalRoutes.beaches.pl}`,
            cs: `/${globalRoutes.beaches.cs}`,
            hu: `/${globalRoutes.beaches.hu}`,
            bg: `/${globalRoutes.beaches.bg}`,
            sk: `/${globalRoutes.beaches.sk}`,
        },

        // Beaches by continent (dynamic)
        '/beaches/[continent]': {
            en: `/${globalRoutes.beaches.en}/[continent]`,
            si: `/${globalRoutes.beaches.si}/[continent]`,
            de: `/${globalRoutes.beaches.de}/[continent]`,
            hr: `/${globalRoutes.beaches.hr}/[continent]`,
            fr: `/${globalRoutes.beaches.fr}/[continent]`,
            es: `/${globalRoutes.beaches.es}/[continent]`,
            it: `/${globalRoutes.beaches.it}/[continent]`,
            ua: `/${globalRoutes.beaches.ua}/[continent]`,
            ru: `/${globalRoutes.beaches.ru}/[continent]`,
            pl: `/${globalRoutes.beaches.pl}/[continent]`,
            cs: `/${globalRoutes.beaches.cs}/[continent]`,
            hu: `/${globalRoutes.beaches.hu}/[continent]`,
            bg: `/${globalRoutes.beaches.bg}/[continent]`,
            sk: `/${globalRoutes.beaches.sk}/[continent]`,
        },

        // Beaches by continent and city (dynamic)
        '/beaches/[continent]/[city]': {
            en: `/${globalRoutes.beaches.en}/[continent]/[city]`,
            si: `/${globalRoutes.beaches.si}/[continent]/[city]`,
            de: `/${globalRoutes.beaches.de}/[continent]/[city]`,
            hr: `/${globalRoutes.beaches.hr}/[continent]/[city]`,
            fr: `/${globalRoutes.beaches.fr}/[continent]/[city]`,
            es: `/${globalRoutes.beaches.es}/[continent]/[city]`,
            it: `/${globalRoutes.beaches.it}/[continent]/[city]`,
            ua: `/${globalRoutes.beaches.ua}/[continent]/[city]`,
            ru: `/${globalRoutes.beaches.ru}/[continent]/[city]`,
            pl: `/${globalRoutes.beaches.pl}/[continent]/[city]`,
            cs: `/${globalRoutes.beaches.cs}/[continent]/[city]`,
            hu: `/${globalRoutes.beaches.hu}/[continent]/[city]`,
            bg: `/${globalRoutes.beaches.bg}/[continent]/[city]`,
            sk: `/${globalRoutes.beaches.sk}/[continent]/[city]`,
        },

        // Beach type filter
        '/beach-type/[type]': {
            en: `/${globalRoutes.beachType.en}/[type]`,
            si: `/${globalRoutes.beachType.si}/[type]`,
            de: `/${globalRoutes.beachType.de}/[type]`,
            hr: `/${globalRoutes.beachType.hr}/[type]`,
            fr: `/${globalRoutes.beachType.fr}/[type]`,
            es: `/${globalRoutes.beachType.es}/[type]`,
            it: `/${globalRoutes.beachType.it}/[type]`,
            ua: `/${globalRoutes.beachType.ua}/[type]`,
            ru: `/${globalRoutes.beachType.ru}/[type]`,
            pl: `/${globalRoutes.beachType.pl}/[type]`,
            cs: `/${globalRoutes.beachType.cs}/[type]`,
            hu: `/${globalRoutes.beachType.hu}/[type]`,
            bg: `/${globalRoutes.beachType.bg}/[type]`,
            sk: `/${globalRoutes.beachType.sk}/[type]`,
        },

        // User type filter
        '/user-type/[type]': {
            en: `/${globalRoutes.userType.en}/[type]`,
            si: `/${globalRoutes.userType.si}/[type]`,
            de: `/${globalRoutes.userType.de}/[type]`,
            hr: `/${globalRoutes.userType.hr}/[type]`,
            fr: `/${globalRoutes.userType.fr}/[type]`,
            es: `/${globalRoutes.userType.es}/[type]`,
            it: `/${globalRoutes.userType.it}/[type]`,
            ua: `/${globalRoutes.userType.ua}/[type]`,
            ru: `/${globalRoutes.userType.ru}/[type]`,
            pl: `/${globalRoutes.userType.pl}/[type]`,
            cs: `/${globalRoutes.userType.cs}/[type]`,
            hu: `/${globalRoutes.userType.hu}/[type]`,
            bg: `/${globalRoutes.userType.bg}/[type]`,
            sk: `/${globalRoutes.userType.sk}/[type]`,
        },

        // About page
        '/about': {
            en: `/${globalRoutes.about.en}`,
            si: `/${globalRoutes.about.si}`,
            de: `/${globalRoutes.about.de}`,
            hr: `/${globalRoutes.about.hr}`,
            fr: `/${globalRoutes.about.fr}`,
            es: `/${globalRoutes.about.es}`,
            it: `/${globalRoutes.about.it}`,
            ua: `/${globalRoutes.about.ua}`,
            ru: `/${globalRoutes.about.ru}`,
            pl: `/${globalRoutes.about.pl}`,
            cs: `/${globalRoutes.about.cs}`,
            hu: `/${globalRoutes.about.hu}`,
            bg: `/${globalRoutes.about.bg}`,
            sk: `/${globalRoutes.about.sk}`,
        },
    },
});

// Lightweight wrappers around Next.js' navigation APIs
// that will consider the routing configuration
export const { Link, redirect, usePathname, useRouter } = createSharedPathnamesNavigation(routing);
