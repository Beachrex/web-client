'use client';

import { useBeachPage, type BeachSort } from '@/hooks/useBeaches';
import type { BeachListResponseSchema, BeachSchema } from '@/lib/api-client/types.gen';
import { hasMainImage } from '@/lib/utils/beach-cards';
import { cardTags } from '@/lib/utils/beach-properties';
import { buildCdnUrl, buildSphereTourUrl } from '@/lib/utils/beach-images';
import { buildBeachVideoUrl } from '@/lib/utils/beach-video';
import { parseWebcamUrl } from '@/lib/utils/webcam';
import { buildBeachMapUrl, buildBeachUrlFromSchema, buildCityUrlFromSchema } from '@/lib/utils/beach-urls';
import { Pagination } from 'flowbite-react';
import { useLocale, useTranslations, type TranslationValues } from 'next-intl';
import Image from 'next/image';
import { Suspense, useEffect, useState } from 'react';

import { PropertyMediaContext } from '@/components/PropertySection';

import Dropdown from './Dropdown';
import type { PropertyCardProps } from './PropertyCard/PropertyCard';
import PropertyCard from './PropertyCard/PropertyCard';
import Link from 'next/link';
import { useBeachFiltersController } from '@/hooks/useBeachFiltersController';
import StyledSelect from './ui/StyledSelect';
import FilterCard from './ui/FilterCard';
import { ALL_BEACHES_SECTION_ID } from './AllBeachesLink';

/* -------------------------------------------------------------
   BUILD GALLERY
-------------------------------------------------------------- */

interface GalleryItem {
  url?: string;
  order?: number | null;
}

interface BeachMediaInput {
  media?: {
    gallery?: { url?: string; order?: number | null }[];
    spheres_360?: { tour_url?: string }[];
    videos?: { url?: string; is_primary?: boolean }[];
    embeds?: { video_url?: string | null } | null;
  };
}

function buildGallery(beach: BeachMediaInput) {
  const gallery = beach.media?.gallery ?? [];

  return gallery
    .filter((img): img is GalleryItem & { url: string } => typeof img.url === 'string')
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .slice(0, 5)
    .map((img) => buildCdnUrl(img.url, 'gallery'))
    .filter((u): u is string => Boolean(u));
}

/** Beach → card props (beaches without a main image are skipped: QA #55, #56). */
function useBeachCards(beaches: BeachSchema[]): PropertyCardProps[] {
  const locale = useLocale();
  const tCommon = useTranslations('Common');

  return beaches.filter(hasMainImage).map((b) => {
    const mainImage = buildCdnUrl(b.main_image, 'list')!;
    const sphere = b.media?.spheres_360?.[0] ?? null;

    return {
      id: String(b.id),
      beachUrl: buildBeachUrlFromSchema(b, locale) ?? undefined,
      image: mainImage,
      galleryImages: buildGallery(b),
      sphereThumbnail: sphere ? mainImage : undefined,
      sphereTourUrl: buildSphereTourUrl(sphere?.tour_url) ?? undefined,
      videoEmbedUrl: buildBeachVideoUrl(b.media?.embeds?.video_url, b.media?.videos) ?? undefined,
      webcamEmbed: parseWebcamUrl(b.media?.embeds?.webcam),
      features: b.features ?? null,
      title: b.name ?? tCommon('unknownBeach'),
      location: b.city_name ?? b.country_name ?? '',
      locationUrl: buildCityUrlFromSchema(b, locale) ?? undefined,
      price: 0,
      rating: 0,
      reviews: 0,
      countryCode: b.country_code,
      tags: cardTags(b),
    };
  });
}

/* -------------------------------------------------------------
   COMPONENT
-------------------------------------------------------------- */

interface DynamicSearchBeachesProps {
  translationNamespace: string;
  filterNamespace?: string;
  titleKey: string;
  titleParams?: TranslationValues;
  filterButtonColor: string;
  baseFilters: Record<string, string | number>;
  hiddenFilterKeys?: string[];
  optionScopeFilters?: Record<string, string | number>;
  /** First page for `baseFilters`, fetched on the server: in the HTML at once, no client request for it. */
  initialPage?: BeachListResponseSchema | null;
}

function DynamicSearchBeachesInner({
  translationNamespace,
  filterNamespace = 'Filters',
  titleKey,
  titleParams,
  filterButtonColor,
  baseFilters,
  hiddenFilterKeys,
  optionScopeFilters,
  initialPage,
}: DynamicSearchBeachesProps) {
  const t = useTranslations(translationNamespace);
  const tf = useTranslations(filterNamespace);
  const locale = useLocale();
  const tCommon = useTranslations('Common');

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  const {
    filters,
    filterOptions: _filterOptions,
    setUserFilters: _setUserFilters,
    resetFilters: _resetFilters,
  } = useBeachFiltersController({
    baseFilters,
    hiddenFilterKeys,
    optionScopeFilters,
  });

  const [sort, setSort] = useState<BeachSort>('popular');
  const [currentPage, setCurrentPage] = useState(1);

  // Only the current page comes from the server (filters, page and sort are API parameters).
  const { beaches, total, lastPage, loading, fetching } = useBeachPage(
    filters,
    currentPage,
    sort,
    initialPage ? { filters: baseFilters, response: initialPage } : null,
  );

  // A new filter or order starts again at page 1.
  const filtersKey = JSON.stringify(filters);
  useEffect(() => {
    setCurrentPage(1);
  }, [filtersKey, sort]);

  const goToPage = (page: number) => {
    setCurrentPage(page);
    document.getElementById(ALL_BEACHES_SECTION_ID)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
const [mediaMode] =
  useState<'gallery' | 'sphere' | 'video' | 'webcam'>('gallery');

  // Build map URL with current filters
  // Locale-prefixed: a bare '/beach-map' let the NEXT_LOCALE cookie pick the language (QA #24)
  const buildMapUrl = () => {
    if (!baseFilters) return buildBeachMapUrl(locale);

    const params = new URLSearchParams();
    Object.entries(baseFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value));
      }
    });

    const queryString = params.toString();
    return buildBeachMapUrl(locale, queryString || undefined);
  };


  // Listen for custom event to open filter sidebar
  useEffect(() => {
    const handleOpenFilters = () => {
      setIsFilterOpen(true);
    };

    window.addEventListener('openFilterSidebar', handleOpenFilters);
    return () => {
      window.removeEventListener('openFilterSidebar', handleOpenFilters);
    };
  }, []);

  const properties = useBeachCards(beaches);

  const filteredProperties = properties.filter((p) => {
    if (mediaMode === 'sphere') return Boolean(p.sphereTourUrl);
    if (mediaMode === 'video') return Boolean(p.videoEmbedUrl);
    if (mediaMode === 'webcam') return Boolean(p.webcamEmbed);
    return true;
  });

  const totalPages = lastPage;
  const paginatedItems = filteredProperties;

  return (
    <section
      id={ALL_BEACHES_SECTION_ID}
      className="relative scroll-mt-4 bg-[#F5F5F5] py-12 sm:py-16 lg:py-20"
    >

      {/* ================= FILTER DRAWER ================= */}
      {isFilterOpen && (
        <div
          className="fixed inset-0 z-[100] bg-black/40"
          onClick={() => setIsFilterOpen(false)}
        >
          <div
            className="
  absolute left-0 top-0 z-[110] h-full
  w-full
  bg-[#F5F5F5] p-6 overflow-y-auto shadow-lg
  sm:max-w-[360px]
"

            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-lg font-bold">{tf('filtersTitle')}</h3>
              <button
                type="button"
                onClick={() => setIsFilterOpen(false)}
                className="text-sm font-semibold text-gray-500"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>
                  {loading
                    ? tf('loadingFilters')
                    : `${tf('found')} (${total})`}
                </span>
                <button
                  type="button"
                  onClick={_resetFilters}
                  className="text-[#1A3C68] hover:text-blue-800"
                >
                  {tf('resetFilters')}
                </button>
              </div>

              {!hiddenFilterKeys?.includes('country') &&
  _filterOptions?.country?.options && (
                <FilterCard
                  title={tf('filterCountry')}
                  isOpen={expandedSections.country ?? false}
                  onToggle={() =>
                    setExpandedSections(p => ({ ...p, country: !p.country }))
                  }
                >
                  <StyledSelect
                    value={filters.country ? String(filters.country) : ''}
                    onChange={(v) =>
                      _setUserFilters(p => ({ ...p, country: v || undefined }))
                    }
                    placeholder={tf('allCountries')}
                    options={_filterOptions.country.options.map(opt => ({
                      value: String(opt.code ?? opt.slug),
                      label: String(opt.name ?? opt.slug ?? ''),
                    }))}
                  />
                </FilterCard>
              )}

              {!hiddenFilterKeys?.includes('region') &&
  _filterOptions?.region?.options && (
                <FilterCard
                  title={tf('filterRegion')}
                  isOpen={expandedSections.region ?? false}
                  onToggle={() =>
                    setExpandedSections(p => ({ ...p, region: !p.region }))
                  }
                >
                  <StyledSelect
                    value={filters.region ? String(filters.region) : ''}
                    onChange={(v) =>
                      _setUserFilters(p => ({ ...p, region: v || undefined }))
                    }
                    placeholder={tf('allRegions')}
                    options={_filterOptions.region.options.map(opt => ({
                      value: String(opt.slug ?? opt.id),
                      label: String(opt.name ?? opt.slug ?? ''),
                    }))}
                  />
                </FilterCard>
              )}

          {!hiddenFilterKeys?.includes('city') &&
  _filterOptions?.city?.options && (
  <FilterCard
    title={tf('filterCity')}
    isOpen={expandedSections.city ?? false}
    onToggle={() =>
      setExpandedSections(p => ({ ...p, city: !p.city }))
    }
  >
    <StyledSelect
      value={filters.city ? String(filters.city) : ''}
      onChange={(v) =>
        _setUserFilters(p => ({ ...p, city: v || undefined }))
      }
      placeholder={tf('allCities')}
      options={_filterOptions.city.options.map(opt => ({
        value: String(opt.slug ?? opt.id),
        label: String(opt.name ?? opt.slug ?? ''),
      }))}
    />
  </FilterCard>
)}


{!hiddenFilterKeys?.includes('island') &&
  _filterOptions?.island?.options && (
  <FilterCard
    title={tf('filterIsland')}
    isOpen={expandedSections.island ?? false}
    onToggle={() =>
      setExpandedSections(p => ({ ...p, island: !p.island }))
    }
  >
    <StyledSelect
      value={filters.island ? String(filters.island) : ''}
      onChange={(v) =>
        _setUserFilters(p => ({ ...p, island: v || undefined }))
      }
      placeholder={tf('allIslands')}
      options={_filterOptions.island.options.map(opt => ({
        value: String(opt.slug ?? opt.id),
        label: String(opt.name ?? opt.slug ?? ''),
      }))}
    />
  </FilterCard>
)}
{_filterOptions?.beach_type?.options && (
 <FilterCard
  title={
    <span className="flex items-center gap-2">
      <Image
        src="/images/beach-black.png"
        alt=""
        width={20}
        height={20}
      />
      {tf('filterBeachType')}
    </span>
  }
  isOpen={expandedSections.beach_type ?? false}
  onToggle={() =>
    setExpandedSections(p => ({ ...p, beach_type: !p.beach_type }))
  }
 >

    <div className="space-y-2">
      {_filterOptions.beach_type.options.map(opt => {
        const value = String(opt.code ?? opt.slug);
        if (!value) return null;

        const values =
          typeof filters.beach_type === 'string'
            ? filters.beach_type.split(',')
            : [];

        const selected = values.includes(value);

        return (
          <label
            key={value}
            className="flex items-center gap-2 text-sm text-gray-700"
          >
            <input
              type="checkbox"
              checked={selected}
              onChange={() => {
                const next = selected
                  ? values.filter(v => v !== value)
                  : [...values, value];

                _setUserFilters(p => ({
                  ...p,
                  beach_type: next.length ? next.join(',') : undefined,
                }));
              }}
              className="!text-[#1A3C68] focus:ring-[#1A3C68]"
            />
            <span>{opt.name ?? value}</span>
          </label>
        );
      })}
    </div>
  </FilterCard>
)}

{_filterOptions?.user_type?.options && (
  <FilterCard
  title={
    <span className="flex items-center gap-2">
      <Image
        src="/images/beachicons/people.png"
        alt=""
        width={20}
        height={20}
      />
      {tf('filterUserType')}
    </span>
  }
  isOpen={expandedSections.user_type ?? false}
  onToggle={() =>
    setExpandedSections(p => ({ ...p, user_type: !p.user_type }))
  }
  >

    <div className="space-y-2">
      {_filterOptions.user_type.options.map(opt => {
        const value = String(opt.code ?? opt.slug);
        if (!value) return null;

        const values =
          typeof filters.user_type === 'string'
            ? filters.user_type.split(',')
            : [];

        const selected = values.includes(value);

        return (
          <label
            key={value}
            className="flex items-center gap-2 text-sm text-gray-700"
          >
            <input
              type="checkbox"
              checked={selected}
              onChange={() => {
                const nextValues = selected
                  ? values.filter(v => v !== value)
                  : [...values, value];

                _setUserFilters(p => ({
                  ...p,
                  user_type: nextValues.length
                    ? nextValues.join(',')
                    : undefined,
                }));
              }}
              className="!text-[#1A3C68] focus:ring-[#1A3C68]"
            />
            <span>{opt.name ?? value}</span>
          </label>
        );
      })}
    </div>
  </FilterCard>
)}


{_filterOptions?.waterbody?.options && (
  <FilterCard
  title={
    <span className="flex items-center gap-2">
      <Image
        src="/images/beachicons/wave.png"
        alt=""
        width={20}
        height={20}
      />
      {tf('filterWaterbody')}
    </span>
  }
  isOpen={expandedSections.waterbody ?? false}
  onToggle={() =>
    setExpandedSections(p => ({ ...p, waterbody: !p.waterbody }))
  }
  >

    <StyledSelect
      value={filters.waterbody ? String(filters.waterbody) : ''}
      onChange={(v) =>
        _setUserFilters(p => ({ ...p, waterbody: v || undefined }))
      }
      placeholder={tf('allWaterbodies')}
      options={_filterOptions.waterbody.options.map(opt => ({
        value: String(opt.code ?? opt.slug),
        label: String(opt.name ?? opt.slug ?? ''),
      }))}
    />
  </FilterCard>
)}


            </div>
          </div>
        </div>
      )}

      {/* ================= HEADER ================= */}
      <div className="container mx-auto">
        <div id="filters-section" className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <h2 className="text-[26px] font-bold text-[#222]">
            {t(titleKey, titleParams)}
          </h2>

          <div className="flex flex-wrap gap-3 items-center">
            <button
              type="button"
              onClick={() => setIsFilterOpen(true)}
              className="inline-flex h-[40px] items-center gap-2 rounded-md px-5 font-bold text-white"
              style={{ backgroundColor: filterButtonColor }}
            >
              <Image
src="/images/filters.png" width={20} height={20}
alt=""
              />
              <span>{tf('filterButton')}</span>
            </button>

            <Link
              href={buildMapUrl()}
              className="inline-flex h-[40px] items-center gap-2 rounded-md bg-[#1A3C68] px-6 font-bold text-white"
            >
              <Image
src="/images/map.png" width={20} height={20}
alt=""
              />
              <span>{t('mapButton')}</span>
            </Link>

            <Dropdown
              value={sort}
              onChange={(v) => setSort(v as BeachSort)}
              showIcons={false}
              buttonBg="#FFFFFF"
              menuBg="#FFFFFF"
              ariaLabel={t('sortPopular')}
              options={[
                { value: 'popular', label: t('sortPopular') },
                { value: 'newest', label: t('sortNewest') },
              ]}
            />
          </div>
        </div>

     <PropertyMediaContext.Provider
  value={{
    mediaMode,
    openSphere: () => undefined,
    openVideo: () => undefined,
  }}
     >

          <div
            className={`grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 transition-opacity ${fetching ? 'opacity-60' : ''}`}
            aria-busy={fetching}
          >
            {!loading &&
              paginatedItems.map((p, i) => (
                <PropertyCard key={`${p.title}-${i}`} {...p} />
              ))}
          </div>
        </PropertyMediaContext.Provider>

        {totalPages > 1 && (
          <div className="mt-10 flex justify-center">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={goToPage}
              previousLabel={tCommon('paginationPrevious')}
              nextLabel={tCommon('paginationNext')}
              showIcons
            />
          </div>
        )}
      </div>
    </section>
  );
}

/**
 * The browse list reads the URL filters (`useSearchParams`). Pages are cached as static HTML (ISR), and Next 14 needs
 * a Suspense boundary around `useSearchParams` there, otherwise the page fails with a 500.
 */
export default function DynamicSearchBeaches(props: DynamicSearchBeachesProps) {
  return (
    <Suspense fallback={<FirstPageFallback {...props} />}>
      <DynamicSearchBeachesInner {...props} />
    </Suspense>
  );
}

/**
 * What the cached HTML contains: the title and the server-fetched first page of cards (visible at once and
 * readable by search engines). The interactive list replaces it in the browser with the same data.
 */
function FirstPageFallback({ translationNamespace, titleKey, titleParams, initialPage }: DynamicSearchBeachesProps) {
  const t = useTranslations(translationNamespace);
  const cards = useBeachCards(initialPage?.data ?? []);

  return (
    <section id={ALL_BEACHES_SECTION_ID} className="relative min-h-[400px] bg-[#F5F5F5] py-12 sm:py-16 lg:py-20" aria-busy="true">
      <div className="container mx-auto">
        <h2 className="mb-8 text-[26px] font-bold text-[#222]">{t(titleKey, titleParams)}</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {cards.map((p, i) => (
            <PropertyCard key={`${p.title}-${i}`} {...p} />
          ))}
        </div>
      </div>
    </section>
  );
}
