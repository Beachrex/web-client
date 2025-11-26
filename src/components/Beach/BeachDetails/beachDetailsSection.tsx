'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import React from 'react';

import type { BeachDetailsSchema } from '@/lib/api-client/types.gen';
import InfoRow from './InfoRow';
import SingleValue from './SingleValue';

interface BeachDetailsSectionProps {
  beachDetails: BeachDetailsSchema;
}

/** Helper: safely extract string `name` from unknown object */
const getName = (input: unknown): string | null => {
  if (typeof input === 'object' && input !== null && 'name' in input) {
    const value = (input as { name?: unknown }).name;
    if (typeof value === 'string') {
      return value;
    }
  }
  return null;
};

/** Helper: safely extract all string `name` values from unknown array-like */
const getNameList = (input: unknown): string[] => {
  if (!Array.isArray(input)) return [];
  return input
    .map((item) => getName(item))
    .filter((n): n is string => Boolean(n));
};

const BeachDetailsSection: React.FC<BeachDetailsSectionProps> = ({
  beachDetails,
}) => {
  const tMain = useTranslations('BeachDetails');
  const tGroups = useTranslations('BeachDetails.groups');
  const tButtons = useTranslations('BeachDetails.buttons');

  const accessibility = beachDetails.accessibility;
  const characteristics = beachDetails.characteristics;
  const dimensions = beachDetails.dimensions;
  const facilities = beachDetails.facilities;
  const natural = beachDetails.natural_conditions;
  const activities = beachDetails.activities;

  /* ----------------------- BEACH (API) ----------------------- */
  const beachFromApi = {
    type: getName(characteristics?.beach_type),
    naturalFeatures: getNameList(natural?.natural_location_conditions),
    occupancy: getName(dimensions?.occupancy_rate),
    access: getName(accessibility?.accessibility),
    paid: null as string | null, // Option C – skip row entirely
    length: getName(dimensions?.location_length),
    width: getName(dimensions?.bay_length),
    slope: getName(dimensions?.beach_inclination),
    swimmingArea: getName(dimensions?.swimming_depth_of_one_m),
    seabed: getNameList(natural?.underwater_characteristics),
  };

  /* ----------------------- USER TYPES ----------------------- */
  const userTypesFromApi: string[] = getNameList(activities?.user_types);

  /* ----------------------- INFRASTRUCTURE ----------------------- */
  const beachInfrastructureFromApi: string[] = getNameList(
    facilities?.location_infrastructure,
  );

  /* ----------------------- ACCOMMODATION ----------------------- */
  const accommodationFromApi: string[] = getNameList(
    facilities?.accommodation_around,
  );

  /* ----------------------- FOOD & DRINKS ----------------------- */
  const culinaryFromApi: string[] = getNameList(facilities?.culinary_offers);

  /* ----------------------- SPORTS ----------------------- */
  const sportsFromApi: string[] = getNameList(activities?.sporting_activities);

  /* ----------------------- PARKING ----------------------- */
  const parkingFromApi = {
    spots: getName(accessibility?.parking_capacity),
    wayToParking: getName(accessibility?.road_to_parking_type),
    recommendedAccess: getNameList(accessibility?.recommended_transport_types),
  };

  /* ----------------------- PATH TO BEACH ----------------------- */
  const pathToBeachFromApi = {
    distance: getName(accessibility?.parking_beach_distance),
    elevation: getName(accessibility?.parking_beach_height),
  };

  /* ----------------------- MEDIA: PATH IMAGE & MAP ----------------------- */
  const pathImages = beachDetails.media?.spot_images ?? [];
  const pathImageUrl = pathImages[0]?.url ?? null;

  const mapUrl =
    typeof beachDetails.embeds?.map_url === 'string'
      ? beachDetails.embeds.map_url
      : null;

  /* ----------------------- RENDER TICK LIST ----------------------- */
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

  /* ----------------------- ACTION BUTTON ----------------------- */
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

  /* ----------------------- PARKING IMAGE ----------------------- */
  const parkingImages = beachDetails.media?.parking_images ?? [];
  const parkingImageUrl = parkingImages[0]?.url ?? null;

  const [showParkingPhoto, setShowParkingPhoto] = React.useState(false);

  /* ----------------------- PATH VIEW STATE ----------------------- */
  const [pathView, setPathView] = React.useState<'photo' | 'map' | null>(null);

  /* ----------------------- JSX ----------------------- */

  return (
    <section className="w-full bg-[#F5F5F5] py-8">
      <div className="container mx-auto px-4">
        <h1 className="mb-8 font-figtree text-[30px] font-bold text-[#222222]">
          {tMain('title')}
        </h1>

        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {/* ---------------- BEACH + USER TYPE ---------------- */}
          <div>
            {/* Beach */}
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

              {/* paid hidden by rule C */}

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

              <InfoRow labelKey="seabed">
                {renderTickList(beachFromApi.seabed)}
              </InfoRow>
            </div>

            {/* User type */}
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

          {/* ---------------- INFRASTRUCTURE ---------------- */}
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
            <div className="mt-4">
              {renderTickList(beachInfrastructureFromApi)}
            </div>
          </div>

          {/* ---------------- ACCOMMODATION, FOOD, SPORTS ---------------- */}
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
              <div className="mt-4">{renderTickList(accommodationFromApi)}</div>
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
              <div className="mt-4">{renderTickList(culinaryFromApi)}</div>
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
              <div className="mt-4">{renderTickList(sportsFromApi)}</div>
            </div>
          </div>

          {/* ---------------- PARKING + PATH TO BEACH ---------------- */}
          <div>
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
                {parkingImageUrl ? (
                  <div className="flex items-center md:absolute md:right-0 md:top-1/2 md:-translate-y-1/2">
                    <ActionButton
                      icon="/images/beachicons/pic-gallery.png"
                      label={tButtons('photo')}
                      onClick={() => setShowParkingPhoto((prev) => !prev)}
                    />
                  </div>
                ) : null}
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

                {/* PARKING PHOTO PREVIEW */}
                {showParkingPhoto && parkingImageUrl ? (
                  <div className="mt-4">
                    <Image
                      src={parkingImageUrl}
                      alt="Parking image"
                      width={1200}
                      height={800}
                      className="max-h-[300px] w-full rounded-lg object-cover shadow-md"
                    />
                  </div>
                ) : null}
              </div>
            </div>

            {/* Path to beach */}
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
                  {pathImageUrl ? (
                    <ActionButton
                      icon="/images/beachicons/pic-gallery.png"
                      label={tButtons('photo')}
                      onClick={() =>
                        setPathView((prev) =>
                          prev === 'photo' ? null : 'photo',
                        )
                      }
                    />
                  ) : null}

                  {mapUrl ? (
                    <ActionButton
                      icon="/images/beachicons/pathway.png"
                      label={tButtons('map')}
                      onClick={() =>
                        setPathView((prev) => (prev === 'map' ? null : 'map'))
                      }
                    />
                  ) : null}
                </div>
              </div>

              <div className="mt-3 border-b border-[#E7E7E7]" />

              <div className="mt-4 flex flex-col">
                <InfoRow labelKey="distance">
                  <SingleValue valueRaw={pathToBeachFromApi.distance} />
                </InfoRow>

                <InfoRow labelKey="elevationDiff">
                  <SingleValue valueRaw={pathToBeachFromApi.elevation} />
                </InfoRow>

                {/* PATH PREVIEW (PHOTO or MAP) */}
                {pathView === 'photo' && pathImageUrl ? (
                  <div className="mt-4">
                    <Image
                      src={pathImageUrl}
                      alt="Path image"
                      width={1200}
                      height={800}
                      className="max-h-[300px] w-full rounded-lg object-cover shadow-md"
                    />
                  </div>
                ) : null}

                {pathView === 'map' && mapUrl ? (
                  <div className="mt-4 h-[300px] w-full overflow-hidden rounded-lg shadow-md">
                    <iframe
                      src={mapUrl}
                      title="Path to the beach map"
                      className="h-full w-full border-0"
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BeachDetailsSection;
