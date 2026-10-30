import '@/lib/server/api-client-server';
import type { MetadataRoute } from 'next';
import { locales, toHtmlLang } from '@/app/config/locales';
import { env } from '@/env';
import { getStaticPagesForFooter } from '@/lib/api-client/sdk.gen';
import type { AcceptLanguage } from '@/lib/api-client/types.gen';

/**
 * Static Pages Sitemap
 *
 * Includes all static pages across all 19 locales with:
 * - Proper lastModified dates
 * - Change frequency hints for search engines
 * - Priority values (0.0 to 1.0)
 * - Alternate language links (hreflang)
 *
 * Pages included:
 * - Homepage (/)
 * - Beaches listing (/beaches)
 * - Beach map (/beach-map)
 * - CMS pages (/p/{slug})
 *
 * Not included (TASK-004): /beach-type and /user-type (placeholders, noindex) and /about
 * (redirects to the CMS page `about-us`).
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
    da: 'straande',
    pt: 'praias',
    nl: 'stranden',
    el: 'paralies',
    sq: 'plazhet',
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
    da: 'strandkort',
    pt: 'mapa-praias',
    nl: 'strandkaart',
    el: 'chartis-paralion',
    sq: 'harta-plazheve',
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

export async function GET() {
  const baseUrl = env.NEXT_PUBLIC_BASE_URL;
  const staticPages: MetadataRoute.Sitemap = [];

  // Fetch CMS-managed static pages per locale (footer-enabled, active).
  // The 'p' prefix is constant across all locales; only the slug is localized.
  // We fetch every locale once so we can build correct hreflang alternates
  // (pairing the same page code across locales via its localized slug).
  // Errors/empty results degrade gracefully (that locale simply contributes no URLs).
  const cmsPagesByLocale: Record<string, Map<string, string>> = {};
  await Promise.all(
    locales.map(async (locale) => {
      let pages: { code?: string; slug?: string }[] = [];
      try {
        const { data } = await getStaticPagesForFooter({
          headers: { 'Accept-Language': locale as AcceptLanguage },
        });
        pages = data?.data ?? [];
      } catch {
        pages = [];
      }
      // Map: page code -> localized slug (for this locale, EN fallback applied by API)
      const byCode = new Map<string, string>();
      for (const page of pages) {
        if (page.code && page.slug) {
          byCode.set(page.code, page.slug);
        }
      }
      cmsPagesByLocale[locale] = byCode;
    }),
  );

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

    // CMS-managed static pages — '/p' prefix is constant across locales,
    // only the slug is localized. Emit one URL per (locale, page) and build
    // hreflang alternates by pairing the same page code across locales.
    const cmsPagesForLocale = cmsPagesByLocale[locale];
    if (cmsPagesForLocale) {
      for (const [code, slug] of cmsPagesForLocale.entries()) {
        const alternates: Record<string, string> = {};
        for (const altLocale of locales) {
          const altSlug = cmsPagesByLocale[altLocale]?.get(code);
          if (altSlug) {
            alternates[altLocale] = `${baseUrl}/${altLocale}/p/${altSlug}`;
          }
        }
        staticPages.push({
          url: `${baseUrl}/${locale}/p/${slug}`,
          lastModified: new Date(),
          changeFrequency: 'monthly',
          priority: 0.4,
          alternates: { languages: alternates },
        });
      }
    }
  }

  // Generate XML sitemap
  const sitemap = generateSitemapXML(staticPages);

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  });
}

/**
 * Generate XML sitemap from MetadataRoute.Sitemap entries
 */
function generateSitemapXML(entries: MetadataRoute.Sitemap): string {
  const urls = entries
    .map((entry) => {
      const alternates = entry.alternates?.languages
        ? Object.entries(entry.alternates.languages)
            .map(
              ([lang, url]) =>
                `    <xhtml:link rel="alternate" hreflang="${toHtmlLang(lang)}" href="${url}" />`,
            )
            .join('\n')
        : '';

      return `  <url>
    <loc>${entry.url}</loc>${alternates ? '\n' + alternates : ''}
    <lastmod>${entry.lastModified instanceof Date ? entry.lastModified.toISOString() : entry.lastModified}</lastmod>
    <changefreq>${entry.changeFrequency}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls}
</urlset>`;
}

// Revalidate every 24 hours (ISR)
export const revalidate = 86400;

