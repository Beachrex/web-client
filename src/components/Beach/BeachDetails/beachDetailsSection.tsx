'use client';

import { Carousel } from 'flowbite-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import React from 'react';

import type { BeachDetailsSchema } from '@/lib/api-client/types.gen';
import { buildCdnUrl } from '@/lib/utils/beach-images';
import { useBeachEmbedded } from '@/components/Beach/BeachEmbedContext';
import { formatCoordinates, googleMapsNavigationUrl, parseCoordinates } from '@/lib/utils/geo';
import { seabedLabelKey, waterKind } from '@/lib/utils/waterbody';

import InfoRow from './InfoRow';
import SingleValue from './SingleValue';

interface BeachDetailsSectionProps {
  beachDetails: BeachDetailsSchema;
}

/* -------------------------------------------
 * Safe helpers for extracting values
 * ------------------------------------------- */
const getName = (input: unknown): string | null => {
  if (typeof input === 'object' && input !== null && 'name' in input) {
    const val = (input as { name?: unknown }).name;
    return typeof val === 'string' ? val : null;
  }
  return null;
};

const getNameList = (input: unknown): string[] => {
  if (!Array.isArray(input)) return [];
  return input
    .map((item) => getName(item))
    .filter((n): n is string => Boolean(n));
};

/* -------------------------------------------
 * Helper for rendering image or carousel
 * ------------------------------------------- */
const MediaBlock = ({ images }: { images: { url?: string | null }[] }) => {
  if (!images || images.length === 0) return null;

  const validImages = images.filter((i) => Boolean(i?.url));

  if (validImages.length === 0) return null;

  if (validImages.length === 1) {
    const src = buildCdnUrl(validImages[0]?.url, 'carousel');
    if (!src) return null;

    return (
      <Image
        src={src}
        alt=""
        width={1200}
        height={800}
        className="max-h-[300px] w-full rounded-lg object-cover shadow-md"
      />
    );
  }

  return (
    <div className="h-[300px] w-full overflow-hidden rounded-lg shadow-md">
      <Carousel slide={false}>
        {validImages.map((img, index) => {
          const src = buildCdnUrl(img.url, 'carousel');
          if (!src) return null;

          return (
            <div key={index} className="relative h-[300px] w-full">
              <Image
src={src} alt="" fill
className="object-cover"
              />
            </div>
          );
        })}
      </Carousel>
    </div>
  );
};

const BeachDetailsSection: React.FC<BeachDetailsSectionProps> = ({ beachDetails }) => {
  const tMain = useTranslations('BeachDetails');
  const tUi = useTranslations('UI');
  const tGroups = useTranslations('BeachDetails.groups');
  const tButtons = useTranslations('BeachDetails.buttons');
  const embedded = useBeachEmbedded();

  const accessibility = beachDetails.accessibility;
  // Owner 2026-10-28: GPS position + Google Maps navigation above Parking.
  const position = parseCoordinates(beachDetails.basic_info?.latitude, beachDetails.basic_info?.longitude);
  const characteristics = beachDetails.characteristics;
  const description = beachDetails.basic_info?.description?.trim();
  const dimensions = beachDetails.dimensions;
  const facilities = beachDetails.facilities;
  const natural = beachDetails.natural_conditions;
  const activities = beachDetails.activities;

  /* -------------------------------------------
   * Build BEACH data
   * ------------------------------------------- */
  const beachFromApi = {
    type: getName(characteristics?.beach_type),
    naturalFeatures: getNameList(natural?.natural_location_conditions),
    occupancy: getName(dimensions?.occupancy_rate),
    access: getName(accessibility?.accessibility),
    paid: null as string | null, // hidden row
    length: getName(dimensions?.location_length),
    width: getName(dimensions?.bay_length),
    slope: getName(dimensions?.beach_inclination),
    swimmingArea: getName(dimensions?.swimming_depth_of_one_m),
    seabed: getNameList(natural?.underwater_characteristics),
    waterbody: getName(characteristics?.waterbody),
    areaDescription: getName(characteristics?.area_description),
    boatOnly: characteristics?.boat_only === true ? 'Yes' : 'No',
  };

  const userTypesFromApi = getNameList(activities?.user_types);
  const beachInfrastructure = getNameList(facilities?.location_infrastructure);
  const accommodation = getNameList(facilities?.accommodation_around);
  const culinary = getNameList(facilities?.culinary_offers);
  const sports = getNameList(activities?.sporting_activities);

  /* -------------------------------------------
   * Parking
   * ------------------------------------------- */
  const parkingFromApi = {
    spots: getName(accessibility?.parking_capacity),
    wayToParking: getName(accessibility?.road_to_parking_type),
    recommendedAccess: getNameList(accessibility?.recommended_transport_types),
  };

  const parkingImages = beachDetails.media?.parking_images ?? [];
  const [showParkingPhoto, setShowParkingPhoto] = React.useState(false);

  /* -------------------------------------------
   * Path to Beach
   * ------------------------------------------- */
  const pathFromApi = {
    distance: getName(accessibility?.parking_beach_distance),
    elevation: getName(accessibility?.parking_beach_height),
  };

  const pathImages = beachDetails.media?.spot_images ?? [];

  const mapUrl =
    typeof beachDetails.embeds?.map_url === 'string'
      ? beachDetails.embeds.map_url
      : null;

  const [pathView, setPathView] = React.useState<'photo' | 'map' | null>(null);

  /* -------------------------------------------
   * Helper: Tick list
   * ------------------------------------------- */
  const renderTickList = (items: string[]) =>
    items.length > 0 ? (
      <ul className="flex flex-col gap-2">
        {items.map((txt, i) => (
          <li key={i} className="flex items-center gap-2">
            <Image
              src="/images/beachicons/tick.png"
              alt=""
              width={16}
              height={16}
              className="inline-block object-contain"
            />
            <span className="font-figtree text-[14px] font-medium text-[#4D4D4D]">
              {txt}
            </span>
          </li>
        ))}
      </ul>
    ) : null;

  /* -------------------------------------------
   * Helper: Action button
   * ------------------------------------------- */
  const ActionButton = ({
    icon,
    label,
    onClick,
  }: {
    icon: string;
    label: string;
    onClick?: () => void;
  }) => (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-md bg-[#1A3C68] px-3 py-2 text-white hover:bg-[#214a7f]"
    >
      <Image
src={icon} alt="" width={20}
height={20}
      />
      <span className="font-figtree text-[14px] font-bold">{label}</span>
    </button>
  );

  /* -------------------------------------------
   * RENDER
   * ------------------------------------------- */
  return (
    <section id="beach-details" className="w-full scroll-mt-24 bg-[#F5F5F5] py-8">
      <div className="container mx-auto px-4">
        {/* h2: the beach name in the banner is the page's h1 */}
        <h2 className="mb-8 font-figtree text-[30px] font-bold text-[#222222]">
          {tMain('title')}
        </h2>

        {/* Full description: the banner card shows only two lines and links here ("read more") */}
        {description && (
          <p className="mb-8 max-w-4xl whitespace-pre-line font-figtree text-[16px] leading-6 text-[#4D4D4D]">
            {description}
          </p>
        )}

        {/* Beach map panel (≤ 720px on any screen): two columns at most */}
        <div className={embedded ? 'grid gap-10 sm:grid-cols-2' : 'grid gap-10 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4'}>
          {/* -------------------------------------------
           * BEACH + USER TYPE
           * ------------------------------------------- */}
          <div>
            <div className="flex items-center gap-3">
              <Image
                src="/images/beachicons/wave.png"
                alt={tGroups('beach')}
                width={30}
                height={30}
              />
              <h2 className="font-figtree text-[16px] font-bold">
                {tGroups('beach')}
              </h2>
            </div>
            <div className="mt-3 border-b border-[#E7E7E7]" />

            <div className="mt-4 flex flex-col">
              <InfoRow labelKey="type">
                <SingleValue valueRaw={beachFromApi.type} />
              </InfoRow>

              <InfoRow labelKey="naturalFeatures">
                {renderTickList(beachFromApi.naturalFeatures)}
              </InfoRow>

              <InfoRow labelKey="occupancy">
                <SingleValue valueRaw={beachFromApi.occupancy} />
              </InfoRow>

              <InfoRow labelKey="access">
                <SingleValue valueRaw={beachFromApi.access} />
              </InfoRow>

              <InfoRow labelKey="length">
                <SingleValue valueRaw={beachFromApi.length} />
              </InfoRow>

              <InfoRow labelKey="width">
                <SingleValue valueRaw={beachFromApi.width} />
              </InfoRow>

              <InfoRow labelKey="slope">
                <SingleValue valueRaw={beachFromApi.slope} />
              </InfoRow>

              <InfoRow labelKey="swimmingArea">
                <SingleValue valueRaw={beachFromApi.swimmingArea} />
              </InfoRow>

              <InfoRow labelKey={seabedLabelKey(waterKind(characteristics?.waterbody?.code))}>
                {renderTickList(beachFromApi.seabed)}
              </InfoRow>
            </div>

            <div className="mt-8">
              <div className="flex items-center gap-3">
                <Image
                  src="/images/beachicons/people.png"
                  alt={tGroups('userType')}
                  width={30}
                  height={30}
                />
                <h2 className="font-figtree text-[16px] font-bold">
                  {tGroups('userType')}
                </h2>
              </div>
              <div className="mt-3 border-b border-[#E7E7E7]" />
              <div className="mt-4">{renderTickList(userTypesFromApi)}</div>
            </div>
          </div>

          {/* -------------------------------------------
           * INFRASTRUCTURE
           * ------------------------------------------- */}
          <div>
            <div className="flex items-center gap-3">
              <Image
                src="/images/beachicons/shower.png"
                alt={tGroups('infrastructure')}
                width={30}
                height={30}
              />
              <h2 className="font-figtree text-[16px] font-bold">
                {tGroups('infrastructure')}
              </h2>
            </div>
            <div className="mt-3 border-b border-[#E7E7E7]" />

            <div className="mt-4">{renderTickList(beachInfrastructure)}</div>
          </div>

          {/* -------------------------------------------
           * ACCOMMODATION, FOOD, SPORTS
           * ------------------------------------------- */}
          <div>
            {/* Accommodation */}
            <div>
              <div className="flex items-center gap-3">
                <Image
                  src="/images/accommodation-black.png"
                  alt={tGroups('accommodation')}
                  width={30}
                  height={30}
                />
                <h2 className="font-figtree text-[16px] font-bold">
                  {tGroups('accommodation')}
                </h2>
              </div>
              <div className="mt-3 border-b border-[#E7E7E7]" />
              <div className="mt-4">{renderTickList(accommodation)}</div>
            </div>

            {/* Food */}
            <div className="mt-8">
              <div className="flex items-center gap-3">
                <Image
                  src="/images/beachicons/dish.png"
                  alt={tGroups('food')}
                  width={30}
                  height={30}
                />
                <h2 className="font-figtree text-[16px] font-bold">
                  {tGroups('food')}
                </h2>
              </div>
              <div className="mt-3 border-b border-[#E7E7E7]" />
              <div className="mt-4">{renderTickList(culinary)}</div>
            </div>

            {/* Sports */}
            <div className="mt-8">
              <div className="flex items-center gap-3">
                <Image
                  src="/images/beachicons/surf-board.png"
                  alt={tGroups('sports')}
                  width={30}
                  height={30}
                />
                <h2 className="font-figtree text-[16px] font-bold">
                  {tGroups('sports')}
                </h2>
              </div>
              <div className="mt-3 border-b border-[#E7E7E7]" />
              <div className="mt-4">{renderTickList(sports)}</div>
            </div>
          </div>

          {/* -------------------------------------------
           * PARKING + PATH (original block)
           * ------------------------------------------- */}
          <div>
            {/* GPS location + navigation */}
            {position && (
              <div className="mb-8" data-testid="beach-gps">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Image
                      src="/images/beachicons/location-icon-orange.svg"
                      alt=""
                      width={30}
                      height={30}
                    />
                    <h2 className="font-figtree text-[16px] font-bold">
                      {tGroups('gpsLocation')}:{' '}
                      <span className="select-all font-normal tabular-nums">{formatCoordinates(position)}</span>
                    </h2>
                  </div>
                  <a
                    href={googleMapsNavigationUrl(position)}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={tMain('navigationAria', { name: beachDetails.basic_info?.name ?? '' })}
                    className="inline-flex items-center gap-2 rounded-md bg-[#1A3C68] px-3 py-2 text-white hover:bg-[#214a7f]"
                  >
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 24 24"
                      width="18"
                      height="18"
                      fill="currentColor"
                    >
                      <path d="M21.7 2.3a1 1 0 0 0-1.06-.22l-18 7a1 1 0 0 0 .1 1.9l7.6 2.04 2.04 7.6a1 1 0 0 0 1.9.1l7-18a1 1 0 0 0-.22-1.06z" />
                    </svg>
                    <span className="font-figtree text-[14px] font-bold">{tButtons('navigation')}</span>
                  </a>
                </div>
                <div className="mt-3 border-b border-[#E7E7E7]" />
              </div>
            )}

            {/* Parking */}
            <div>
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Image
                    src="/images/beachicons/parking-gray.png"
                    alt={tGroups('parking')}
                    width={30}
                    height={30}
                  />
                  <h2 className="font-figtree text-[16px] font-bold">
                    {tGroups('parking')}
                  </h2>
                </div>

                {parkingImages.length > 0 && (
                  <div className="flex items-center md:absolute md:right-0 md:top-1/2 md:-translate-y-1/2">
                    <ActionButton
                      icon="/images/beachicons/pic-gallery.png"
                      label={tButtons('photo')}
                      onClick={() => setShowParkingPhoto((prev) => !prev)}
                    />
                  </div>
                )}
              </div>

              <div className="mt-3 border-b border-[#E7E7E7]" />

              <div className="mt-4 flex flex-col">
                <InfoRow labelKey="parkingSpots">
                  <SingleValue valueRaw={parkingFromApi.spots} />
                </InfoRow>

                <InfoRow labelKey="wayToParking">
                  <SingleValue valueRaw={parkingFromApi.wayToParking} />
                </InfoRow>

                <InfoRow labelKey="recommendedAccess">
                  {parkingFromApi.recommendedAccess.length > 0
                    ? renderTickList(parkingFromApi.recommendedAccess)
                    : null}
                </InfoRow>

                {showParkingPhoto && (
                  <div className="mt-4">
                    <MediaBlock images={parkingImages} />
                  </div>
                )}
              </div>
            </div>

            {/* Path */}
            <div className="mt-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Image
                    src="/images/beachicons/beach-path.png"
                    alt={tGroups('pathToBeach')}
                    width={30}
                    height={30}
                  />
                  <h2 className="font-figtree text-[16px] font-bold">
                    {tGroups('pathToBeach')}
                  </h2>
                </div>

                <div className="flex items-center gap-3">
                  {pathImages.length > 0 && (
                    <ActionButton
                      icon="/images/beachicons/pic-gallery.png"
                      label={tButtons('photo')}
                      onClick={() =>
                        setPathView((prev) => (prev === 'photo' ? null : 'photo'))
                      }
                    />
                  )}

                  {mapUrl && (
                    <ActionButton
                      icon="/images/beachicons/pathway.png"
                      label={tButtons('map')}
                      onClick={() =>
                        setPathView((prev) => (prev === 'map' ? null : 'map'))
                      }
                    />
                  )}
                </div>
              </div>

              <div className="mt-3 border-b border-[#E7E7E7]" />

              <div className="mt-4 flex flex-col">
                <InfoRow labelKey="distance">
                  <SingleValue valueRaw={pathFromApi.distance} />
                </InfoRow>

                <InfoRow labelKey="elevationDiff">
                  <SingleValue valueRaw={pathFromApi.elevation} />
                </InfoRow>

                {pathView === 'photo' && (
                  <div className="mt-4">
                    <MediaBlock images={pathImages} />
                  </div>
                )}

                {pathView === 'map' && mapUrl && (
                  <div className="mt-4 h-[300px] w-full overflow-hidden rounded-lg shadow-md">
                    <iframe
                      src={mapUrl}
                      title={tUi('beachRouteMapTitle')}
                      className="h-full w-full border-0"
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BeachDetailsSection;
