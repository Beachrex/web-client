// src/i18n/routing.ts
import { defineRouting } from 'next-intl/routing';
import { createSharedPathnamesNavigation } from 'next-intl/navigation';
import { locales } from '@/app/utils/locales'; // Import the centralized locales

export const routing = defineRouting({
    // A list of all locales that are supported
    locales,

    // Used when no locale matches
    defaultLocale: 'en',
    pathnames: {
        //how to: https://next-intl-docs.vercel.app/docs/routing

        '/': '/',
        // '/blog': '/blog',
        '/beach-map': {
            en: '/beach-map',
            si: '/zemljevid-plaz' // Assume this is the Slovenian translation for "beach map"
        },
        '/beaches': {
            en: '/beaches',
            si: '/plaze' // Assume this is the Slovenian translation for "beaches"
        },
        // Dynamic beaches by region
        '/beaches/[region]': {
            en: '/beaches/[region]',
            si: '/plaze/[region]' // The region will be dynamically replaced in the Slovenian path
        },
        // '/beaches/europe': {
        //     en: '/beaches/europe',
        //     si: '/plaze/evropa' // Če dodamo to, bo na podstrani, ko zamenjaš jezik delal url pravilno.
        // },
        '/beach-type/[type]': {
            en: '/beach-type/[type]',
            si: '/tip-plaze/[type]'
        },
        '/user-type/[type]': {
            en: '/user-type/[type]',
            si: '/tip-uporabnika/[type]'
        },
        // '/beach-type/sandy': {
        //     en: '/beach-type/sandy',
        //     si: '/tip-plaze/pescena'
        // },
        '/about': {
            en: '/about',
            si: '/o-nas' ///si/o-nas will be handled by the page at /[locale]/about/page.tsx
        }
        //
        // // Dynamic params are supported via square brackets
        // '/news/[articleSlug]-[articleId]': {
        //     en: '/news/[articleSlug]-[articleId]',
        //     de: '/neuigkeiten/[articleSlug]-[articleId]'
        // },
        //
        // // Static pathnames that overlap with dynamic segments
        // // will be prioritized over the dynamic segment
        // '/news/just-in': {
        //     en: '/news/just-in',
        //     de: '/neuigkeiten/aktuell'
        // },
        //
        // // Also (optional) catch-all segments are supported
        // '/categories/[...slug]': {
        //     en: '/categories/[...slug]',
        //     de: '/kategorien/[...slug]'
        // }
    }
});

// Lightweight wrappers around Next.js' navigation APIs
// that will consider the routing configuration
export const { Link, redirect, usePathname, useRouter } = createSharedPathnamesNavigation(routing);
