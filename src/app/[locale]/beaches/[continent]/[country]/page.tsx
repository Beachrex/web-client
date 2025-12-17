'use client';

import AccommodationSection from '@/components/AccommodationCard/AccommodationsSection';
import BannerSection from '@/components/BannerSection/BannerSection';
import CountryDestinationsSection from '@/components/CountryPage/CountryDestinationsSection';
import DynamicSearchBeaches from '@/components/DynamicSearchBeaches';
import DynamicTopBar from '@/components/DynamicTopBar';
import PropertySection, { type Property } from '@/components/PropertySection';
import { usePathname } from '@/i18n/routing';
import { buildCdnUrl } from '@/lib/utils/beach-images';
import { buildCountryUrlFromNavigation } from '@/lib/utils/beach-urls';
import { ChevronRight } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import { useCities } from '@/hooks/useCities';
import { useCountryDetails } from '@/hooks/useCountryDetails';
import { useIslands } from '@/hooks/useIslands';
import { useMostVisitedBeaches } from '@/hooks/useMostVisitedBeaches';
import { useRegions } from '@/hooks/useRegions';

interface PageProps {
  params: {
    locale: string;
    continent: string;
    country: string;
  };
  searchParams?: Record<string, string | string[] | undefined>;
}

/* ---------------------------------------------
   BUILD GALLERY IMAGES
---------------------------------------------- */
interface GalleryItem {
  url?: string;
  order?: number | null;
}

interface BeachMediaInput {
  media?: {
    gallery?: GalleryItem[];
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

/* ---------------------------------------------
   FIX: YOUTUBE URL → EMBED URL
---------------------------------------------- */
function toYouTubeEmbed(raw?: string | null) {
  if (!raw) return undefined;

  if (raw.includes('youtu.be/')) {
    return raw.replace('youtu.be/', 'www.youtube.com/embed/');
  }

  if (raw.includes('watch?v=')) {
    const u = new URL(raw);
    const v = u.searchParams.get('v');
    if (v) return `https://www.youtube.com/embed/${v}`;
  }

  return undefined;
}

export default function Page({ params }: PageProps) {
  const pathname = usePathname();
  const locale = useLocale();
  const { country: countryParam } = params;

  const { countryDetails } = useCountryDetails(countryParam);

  const { regions } = useRegions(countryDetails?.code ?? '');
  const { cities } = useCities(countryDetails?.code ?? '');
  const { islands } = useIslands(countryDetails?.code ?? '');

  const tCountry = useTranslations('countryPage');
  const tProperty = useTranslations('PropertySection');

  const countryName =
    countryDetails?.name ??
    countryDetails?.full_name ??
    countryParam.toUpperCase();

  const countryBeachesCount = countryDetails?.beaches_count ?? 0;
  const countryAccommodationsCount = 0;

  const { data: mostVisited = [] } = useMostVisitedBeaches({
    country_code: countryDetails?.code,
    limit: 20,
  });

  const cap = (str?: string | null) =>
    str ? str.charAt(0).toUpperCase() + str.slice(1) : '';

  const { data: mostVisitedTop = [] } = useMostVisitedBeaches({
    country_code: countryDetails?.code,
    limit: 20,
  });
  const mostVisitedSet = new Set(mostVisitedTop.map((b) => b.id));

  /* ---------------------------------------------
     MAP BEACHES → PROPERTY CARD OBJECTS
  ---------------------------------------------- */
  const beachProperties: Property[] = mostVisited.map((beach) => {
    const mainImage = buildCdnUrl(beach.main_image, 'list');
    const galleryImages = buildGallery(beach);

    if (!mainImage) throw new Error(`Beach ID ${beach.id} missing main_image`);

    /* Sphere */
    const sphere = beach.media?.spheres_360?.[0] ?? null;

    const sphereThumbnail = sphere ? mainImage : undefined;

    const sphereTourUrl = sphere
      ? `${process.env.NEXT_PUBLIC_CDN_ASSETS}${sphere.tour_url}`
      : undefined;

    /* VIDEO SUPPORT (FIX) */
    const rawVideo = beach.media?.embeds?.video_url ?? null;
    const videoEmbedUrl = toYouTubeEmbed(rawVideo);
/* WEBCAM SUPPORT */
const webcamEmbed = beach.media?.embeds?.webcam ?? null;

    return {
      id: String(beach.id),
      image: mainImage,
      galleryImages,

      sphereThumbnail,
      sphereTourUrl,

      videoEmbedUrl, // ← FINAL FIX
webcamEmbed,
      title: beach.name ?? 'Unknown beach',
      location: cap(beach.city_slug ?? beach.region_slug),
      price: 0,
      originalPrice: 0,
      rating: 0,
      reviews: 0,
      discount: '0',
      isFreeBreakfast: false,
      isFreeCancellation: true,
      isMostVisited: mostVisitedSet.has(beach.id),
      countryCode: beach.country_code,
    };
  });

  /* Regions / Cities / Islands */
  const regionItems =
    regions?.map((r) => ({
      ...r,
      image: buildCdnUrl(r.main_image, 'list'),
    })) ?? [];

  const cityItems =
    cities?.map((c) => ({
      ...c,
      image: buildCdnUrl(c.main_image, 'list'),
    })) ?? [];

  const islandItems =
    islands?.map((i) => ({
      ...i,
      image: buildCdnUrl(i.main_image, 'list'),
    })) ?? [];

  const bannerImage = buildCdnUrl(countryDetails?.main_image, 'banner');

  const bottomBadges =
    countryDetails?.badges
      ?.filter((b) => b.name)
      ?.map((b) => ({
        label: b.name!,
        icon: b.icon ? buildCdnUrl(b.icon, 'icon') : null,
      })) ?? [];

  const topBarCountry = countryDetails
    ? {
        code: countryDetails.code,
        name: countryDetails.name,
      }
    : undefined;

  const infoCards =
    countryDetails?.articles
      ?.filter((a) => a.title && a.excerpt && a.feature_image)
      ?.map((a) => {
        const image = buildCdnUrl(a.feature_image, 'list');
        if (!image)
          throw new Error(`Missing feature_image for article ${a.title}`);
        return {
          title: a.title!,
          subtitle: a.excerpt!,
          image,
          link: a.slug ? `/${locale}/articles/${a.slug}` : undefined,
        };
      }) ?? [];

  /* ---------------------------------------------
     RENDER PAGE
  ---------------------------------------------- */
  return (
    <>
      <DynamicTopBar
        pathname={pathname ?? ''}
        navigation={countryDetails?.navigation}
        buildUrl={(item) =>
          buildCountryUrlFromNavigation(
            {
              slug: item.slug ?? undefined,
              location: item.location ?? undefined,
            },
            locale
          )
        }
      />

      <BannerSection
        image={bannerImage}
        title={countryName}
        topBarVariant="country"
        country={topBarCountry}
        continent={countryDetails?.continent}
        accommodationCount={countryAccommodationsCount}
        beachCount={countryBeachesCount}
        badges={bottomBadges.length ? bottomBadges : undefined}
        infoCards={infoCards.length ? infoCards : undefined}
      />

      {/* --------------------------
          POPULAR BEACHES SECTION
      --------------------------- */}
      <PropertySection
        title={tCountry('popularBeachesTitle', { country: countryName })}
        totalCount={beachProperties.length}
        properties={beachProperties}
        headerRight={
          <a
            href="#"
            className="flex items-center font-figtree text-[14px] font-bold text-[#8D8D8D] underline underline-offset-[2px] hover:text-[#555]"
          >
            {tProperty('allBeachesLink', {
              count: beachProperties.length,
            })}
            <ChevronRight className="h-4 w-4" />
          </a>
        }
      />

      <AccommodationSection
        title={tCountry('featuredAccommodationTitle', { country: countryName })}
        totalCount={countryAccommodationsCount}
        showDropdown
        selectedDistance={{ value: 1, label: '1 km' }}
        onDistanceChange={(v) => console.log('distance', v)}
        onFilterClick={() => console.log('filter')}
        onMapClick={() => console.log('map')}
      />

      <CountryDestinationsSection
        countryName={countryName}
        regionItems={regionItems}
        cityItems={cityItems}
        islandItems={islandItems}
      />

      <DynamicSearchBeaches
        translationNamespace="countryPage"
        titleKey="browseBeachesTitle"
        titleParams={{ country: countryName }}
        filterButtonColor="#DD0000"
        filters={{
          country: countryDetails?.code,
          limit: 20,
        }}
      />
    </>
  );
}
