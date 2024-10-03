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
        // If all locales use the same pathname, a single
        // external path can be used for all locales
        '/': '/',
        // '/blog': '/blog',

        // If locales use different paths, you can
        // specify each external path per locale
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
