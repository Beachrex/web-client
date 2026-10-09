/**
 * World beaches page — /[locale]/beaches (/si/plaze, /de/strande, …). Server component (SSR).
 *
 * QA #48 / TASK-004: the page rendered placeholder beaches and countries, invented world totals and
 * buttons without a function. It now shows real data from the API with the same cards and search as
 * the continent and country pages.
 */

import ContinentCountriesSection from '@/components/Continent/ContinentCountriesSection';
import DynamicSearchBeaches from '@/components/DynamicSearchBeaches';
import { PropertySection } from '@/components/PropertySection';
import WorldBannerSection from '@/components/WorldPage/WorldBanner/WorldBannerSection';
import { getContinents, getCountries, getFirstPageContent, getMostVisitedBeaches } from '@/lib/api-client/sdk.gen';
import type { AcceptLanguage } from '@/lib/api-client/types.gen';
import { beachesToProperties } from '@/lib/utils/beach-properties';
import { buildCdnUrl } from '@/lib/utils/beach-images';
import { getBeachesWord } from '@/lib/utils/beach-urls';
import { buildBreadcrumbSchema, renderJsonLd } from '@/lib/utils/json-ld-helpers';
import { buildCanonicalUrl, buildCompleteMetadata, buildLocalizedAlternates } from '@/lib/utils/metadata-helpers';
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

interface PageProps {
  params: { locale: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'SEO' });
  return buildCompleteMetadata({
    title: t('beachesPageTitle'),
    description: t('beachesPageDescription'),
    locale,
    path: `/${getBeachesWord(locale)}`,
    type: 'website',
    alternateLanguages: buildLocalizedAlternates((l) => `/${getBeachesWord(l)}`),
  });
}

/** World totals from the API; a failed request leaves the stat empty (hidden) instead of breaking the page. */
async function loadWorldData(locale: string) {
  const headers = { 'Accept-Language': locale as AcceptLanguage };
  const [continents, countries, mostVisited, sections] = await Promise.all([
    getContinents({ headers }).then((r) => r.data?.data ?? []).catch(() => []),
    getCountries({ headers }).then((r) => r.data?.data ?? []).catch(() => []),
    getMostVisitedBeaches({ query: { limit: 20 }, headers }).then((r) => r.data?.data ?? []).catch(() => []),
    getFirstPageContent({ headers }).then((r) => r.data?.data ?? []).catch(() => []),
  ]);

  // Banner image: the home hero background from the admin (the previous static image file did not exist)
  const hero = sections.find((s) => s.code === 'hero_banner');
  const heroMedia = hero?.media?.find((m) => m.collection === 'background_image') ?? hero?.media?.find((m) => m.is_primary) ?? hero?.media?.[0];
  const bannerImage = heroMedia?.url ? buildCdnUrl(heroMedia.url, 'hero') : null;

  const totalBeaches = continents.reduce((sum, c) => sum + (c.beaches_count ?? 0), 0);
  const countriesWithBeaches = countries.filter((c) => (c.beaches_count ?? 0) > 0).length;

  return {
    totalBeaches: totalBeaches > 0 ? totalBeaches : undefined,
    countriesWithBeaches: countriesWithBeaches > 0 ? countriesWithBeaches : undefined,
    mostVisited,
    bannerImage,
  };
}

export default async function WorldBeachesPage({ params }: PageProps) {
  const { locale } = params;
  setRequestLocale(locale);
  const tWorld = await getTranslations({ locale, namespace: 'WorldTopBar' });
  const tSEO = await getTranslations({ locale, namespace: 'WorldSEO' });
  const tSchema = await getTranslations({ locale, namespace: 'SEO' });

  const { totalBeaches, countriesWithBeaches, mostVisited, bannerImage } = await loadWorldData(locale);
  const properties = beachesToProperties(mostVisited, locale);

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: tSchema('breadcrumbHome'), url: buildCanonicalUrl(locale, '/') },
    { name: tWorld('worldLabel'), url: buildCanonicalUrl(locale, `/${getBeachesWord(locale)}`) },
  ]);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: renderJsonLd(breadcrumbSchema) }} />

      {/* Banner with real world totals; stats without data are hidden */}
      <WorldBannerSection
        image={bannerImage}
        totalCountriesWithBeaches={countriesWithBeaches}
        totalBeaches={totalBeaches}
      />

      {/* Most visited beaches worldwide: same cards and media switch as the continent pages */}
      {properties.length > 0 && (
        <PropertySection
          title={tWorld('popularBeachesTitle')}
          totalCount={properties.length}
          properties={properties}
        />
      )}

      {/* Countries with beaches */}
      <ContinentCountriesSection title={tWorld('destinationsTitle')} />

      {/* Search all beaches (filters, list, map) */}
      <DynamicSearchBeaches
        translationNamespace="WorldTopBar"
        titleKey="browseBeachesTitle"
        filterButtonColor="#0B99C2"
        baseFilters={{}}
      />

      {/* SEO text */}
      <section className="bg-white py-12 sm:py-16 lg:py-20">
        <div className="container mx-auto max-w-4xl px-4">
          <h2 className="mb-4 font-figtree text-[28px] font-bold leading-[120%] text-[#222] sm:text-[32px]">
            {tSEO('title')}
          </h2>
          <p className="mb-6 font-figtree text-[16px] leading-[26px] text-[#4D4D4D]">{tSEO('paragraph1')}</p>
          <p className="mb-6 font-figtree text-[16px] leading-[26px] text-[#4D4D4D]">{tSEO('paragraph2')}</p>
          <p className="font-figtree text-[16px] leading-[26px] text-[#4D4D4D]">{tSEO('paragraph3')}</p>
        </div>
      </section>
    </>
  );
}

/** ISR: refresh hourly, like the continent pages. */
export const revalidate = 3600;
