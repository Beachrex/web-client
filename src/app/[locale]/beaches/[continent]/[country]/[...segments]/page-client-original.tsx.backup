'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { notFound } from 'next/navigation';
import { useBeachDetails } from '@/hooks/useBeachDetails';
import { getBeachDetails, resolveSlug, getCountries } from '@/lib/api-client';
import type { AcceptLanguage, BeachDetailsSchema, Country } from '@/lib/api-client/types.gen';
import { buildBeachUrl } from '@/lib/utils/beach-urls';
import React from 'react';

// Import page components
import BeachDetailPage from '@/components/Pages/BeachDetailPage';

type PageType = 'region' | 'island' | 'city' | 'beach' | 'unknown';

interface PageState {
  type: PageType;
  slug: string;
  loading: boolean;
}

export default function FlexibleGeographyPage() {
  const params = useParams();
  const router = useRouter();
  const locale = (params?.locale as string) || 'en';
  const country = (params?.country as string) || '';

  const [pageState, setPageState] = useState<PageState>({
    type: 'unknown',
    slug: '',
    loading: true,
  });

  // Determine what type of page this is
  useEffect(() => {
    const segments = (params?.segments as string[]) || [];

    async function determinePage() {
      console.log('🔍 Segments:', segments);

      if (segments.length === 0) {
        setPageState({ type: 'unknown', slug: '', loading: false });
        return;
      }

      const lastSegment: string = segments[segments.length - 1] ?? '';

      // Get country code from country slug (needed for resolve-slug API)
      let countryCode: string | undefined;
      try {
        const countriesResponse = await getCountries({
          headers: { 'Accept-Language': locale as AcceptLanguage },
        });

        const countryData = countriesResponse.data?.data?.find(
          (c: Country) => c.slug?.toLowerCase() === country.toLowerCase()
        ) ?? null;

        countryCode = countryData?.code;
      } catch {
        // Ignore error - countryCode will remain undefined
      }

      // Strategy: Use resolve-slug API FIRST to determine entity type
      // This is fast and optimized with segment_count parameter
      try {
        // Prepare query parameters for resolve-slug API
        // segment_count helps optimize the search order
        // parent_slug helps resolve ambiguity (e.g., island and city with same name)
        const queryParams: {
          country_code?: string;
          segment_count?: number;
          parent_slug?: string;
        } = {};

        if (countryCode) {
          queryParams.country_code = countryCode;
        }

        // Pass segment count to optimize search
        queryParams.segment_count = segments.length;

        // If we have 2+ segments, pass the parent slug for context
        // Example: /island-cres/cres → parent_slug=island-cres helps identify it's a city
        if (segments.length >= 2) {
          queryParams.parent_slug = segments[segments.length - 2];
        }

        console.log('🔍 Resolving slug with params:', {
          slug: lastSegment,
          ...queryParams,
        });

        // Call the resolve-slug API with optimized parameters
        const resolveResponse = await resolveSlug({
          path: { slug: lastSegment },
          query: queryParams,
          headers: { 'Accept-Language': locale as AcceptLanguage },
        });

        if (resolveResponse.data?.success && resolveResponse.data.data) {
          const { type } = resolveResponse.data.data;
          console.log('✅ Resolved page type:', type, 'for slug:', lastSegment);

          // If it's a beach, validate the URL matches the beach location hierarchy
          if (type === 'beach') {
            try {
              const beachResponse = await getBeachDetails({
                path: { identifier: lastSegment },
                headers: { 'Accept-Language': locale as AcceptLanguage },
              });

              if (beachResponse.data?.data) {
                const beach = beachResponse.data.data;

                console.log('🏖️ Beach data received:', {
                  beach_slug: beach.basic_info?.slug,
                  region_slug: beach.location?.region?.slug,
                  island_slug: beach.location?.island?.slug,
                  city_slug: beach.location?.city?.slug,
                });

                // Verify URL matches beach location hierarchy
                if (urlMatchesBeachLocation(segments, beach)) {
                  console.log('✅ Beach URL validated:', lastSegment);
                  setPageState({ type: 'beach', slug: lastSegment, loading: false });
                  return;
                } else {
                  // URL doesn't match - redirect to canonical URL
                  console.log('⚠️ Beach URL mismatch - redirecting to canonical URL');
                  const canonicalUrl = buildBeachUrl(beach, locale);
                  console.log('🔀 Redirecting to:', canonicalUrl);
                  void router.replace(canonicalUrl);
                  return;
                }
              }
            } catch (error) {
              console.error('Error fetching beach details:', error);
              setPageState({ type: 'unknown', slug: '', loading: false });
              return;
            }
          }

          // For non-beach types (region, island, city), use the resolved type directly
          setPageState({ type: type as PageType, slug: lastSegment, loading: false });
          return;
        }
      } catch (error) {
        console.error('Error resolving slug:', error);
      }

      // Not found
      console.log('❌ Unknown page type');
      setPageState({ type: 'unknown', slug: '', loading: false });
    }

    void determinePage();
  }, [params?.segments, locale, country, router]);

  // Fetch beach details if this is a beach page
  const { beachDetails, loading: beachLoading, error: beachError } = useBeachDetails(
    pageState.slug,
    pageState.type === 'beach'
  );

  // Loading state
  if (pageState.loading || (pageState.type === 'beach' && beachLoading)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600 mx-auto" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Beach detail page
  if (pageState.type === 'beach') {
    if (beachError || !beachDetails) {
      notFound();
    }

    return <BeachDetailPage beachDetails={beachDetails} />;
  }

  // Listing pages (region, island, city)
  if (pageState.type === 'region') {
    // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-member-access
    const RegionListingPage = require('@/components/Pages/RegionListingPage').default as React.ComponentType<{ regionSlug: string }>;
    return <RegionListingPage regionSlug={pageState.slug} />;
  }

  if (pageState.type === 'island') {
    // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-member-access
    const IslandListingPage = require('@/components/Pages/IslandListingPage').default as React.ComponentType<{ islandSlug: string }>;
    return <IslandListingPage islandSlug={pageState.slug} />;
  }

  if (pageState.type === 'city') {
    // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-member-access
    const CityListingPage = require('@/components/Pages/CityListingPage').default as React.ComponentType<{ citySlug: string }>;
    return <CityListingPage citySlug={pageState.slug} />;
  }

  // Unknown page type
  notFound();
}

// Helper function to verify URL matches beach location
function urlMatchesBeachLocation(segments: string[], beach: BeachDetailsSchema): boolean {
  const expectedSegments: string[] = [];

  if (beach.location?.region?.slug) {
    expectedSegments.push(beach.location.region.slug);
  }

  if (beach.location?.island?.slug) {
    expectedSegments.push(beach.location.island.slug);
  }

  if (beach.location?.city?.slug) {
    expectedSegments.push(beach.location.city.slug);
  }

  if (beach.basic_info?.slug) {
    expectedSegments.push(beach.basic_info.slug);
  }

  console.log('🔍 URL Match Check:', {
    segments,
    expectedSegments,
    lengthMatch: segments.length === expectedSegments.length,
  });

  // Check if segments match expected hierarchy
  if (segments.length !== expectedSegments.length) {
    console.log('❌ Length mismatch:', segments.length, '!==', expectedSegments.length);
    return false;
  }

  // Check each segment
  for (let i = 0; i < segments.length; i++) {
    if (segments[i] !== expectedSegments[i]) {
      console.log(`❌ Segment mismatch at index ${i}:`, segments[i], '!==', expectedSegments[i]);
      return false;
    }
  }

  console.log('✅ All segments match!');
  return true;
}

