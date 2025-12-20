import type { MetadataRoute } from 'next';
import { locales } from '@/app/config/locales';
import { env } from '@/env';

/**
 * Main sitemap for static pages
 *
 * Includes all static pages across all 14 locales with:
 * - Proper lastModified dates
 * - Change frequency hints for search engines
 * - Priority values (0.0 to 1.0)
 * - Alternate language links (hreflang)
 *
 * Dynamic content (beaches, countries, etc.) are in separate sitemaps:
 * - sitemap-beaches.xml
 * - sitemap-countries.xml
 * - sitemap-regions.xml
 * - sitemap-cities.xml
 * - sitemap-islands.xml
 */

// Localized route translations
const routeTranslations = {
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
    bg: 'tip-na-plyazh',
    sk: 'typ-plaze',
  },
  userType: {
    en: 'user-type',
    si: 'tip-uporabnika',
    de: 'benutzertyp',
    hr: 'tip-korisnika',
    fr: 'type-utilisateur',
    es: 'tipo-de-usuario',
    it: 'tipo-di-utente',
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

/**
 * Generate alternate language links for a given route
 */
function generateAlternates(
  routeKey: keyof typeof routeTranslations | 'home',
): Record<string, string> {
  const baseUrl = env.NEXT_PUBLIC_BASE_URL;
  const alternates: Record<string, string> = {};

  for (const locale of locales) {
    if (routeKey === 'home') {
      alternates[locale] = `${baseUrl}/${locale}`;
    } else {
      const localizedPath = routeTranslations[routeKey][locale];
      alternates[locale] = `${baseUrl}/${locale}/${localizedPath}`;
    }
  }

  return alternates;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = env.NEXT_PUBLIC_BASE_URL;
  const staticPages: MetadataRoute.Sitemap = [];

  // Generate entries for all locales
  for (const locale of locales) {
    // Homepage - Highest priority, changes daily
    staticPages.push({
      url: `${baseUrl}/${locale}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
      alternates: {
        languages: generateAlternates('home'),
      },
    });

    // Beaches listing page - Very high priority, changes daily
    staticPages.push({
      url: `${baseUrl}/${locale}/${routeTranslations.beaches[locale]}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
      alternates: {
        languages: generateAlternates('beaches'),
      },
    });

    // Beach map - High priority, changes weekly
    staticPages.push({
      url: `${baseUrl}/${locale}/${routeTranslations.beachMap[locale]}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
      alternates: {
        languages: generateAlternates('beachMap'),
      },
    });

    // Beach type index - Medium priority, changes weekly
    staticPages.push({
      url: `${baseUrl}/${locale}/${routeTranslations.beachType[locale]}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
      alternates: {
        languages: generateAlternates('beachType'),
      },
    });

    // User type index - Medium priority, changes weekly
    staticPages.push({
      url: `${baseUrl}/${locale}/${routeTranslations.userType[locale]}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
      alternates: {
        languages: generateAlternates('userType'),
      },
    });

    // About page - Lower priority, changes monthly
    staticPages.push({
      url: `${baseUrl}/${locale}/${routeTranslations.about[locale]}`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
      alternates: {
        languages: generateAlternates('about'),
      },
    });
  }

  return staticPages;
}

// Revalidate every 24 hours (ISR)
export const revalidate = 86400;

