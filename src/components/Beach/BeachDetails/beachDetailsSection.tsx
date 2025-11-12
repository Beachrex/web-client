'use client';

import { useBeachDetailsFixture } from '@/hooks/useBeachDetailsFixture';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import React from 'react';

import InfoRow from './InfoRow';
import SingleValue from './SingleValue';
import TickValueList from './TickValueList';

const BeachDetailsSection: React.FC = () => {
  const tMain = useTranslations('BeachDetails');
  const tGroups = useTranslations('BeachDetails.groups');
  const tValues = useTranslations('BeachDetails.values');
  const tButtons = useTranslations('BeachDetails.buttons');

  const { data } = useBeachDetailsFixture();
  const beach = data.beach;

  // Render an inline, comma-separated list (e.g., recommendedAccess)
  const renderInlineList = (keys: string[]) => (
    <span className="font-figtree text-[14px] font-medium leading-[100%] text-[#4D4D4D]">
      {keys.map((k, i) => (
        <React.Fragment key={k}>
          {tValues(k)}
          {i < keys.length - 1 ? ', ' : ''}
        </React.Fragment>
      ))}
    </span>
  );

  // Reusable dark-blue button with icon
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
      className="inline-flex items-center gap-2 rounded-md bg-[#1A3C68] px-3 py-2 transition-colors hover:bg-[#214a7f] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1A3C68] focus-visible:ring-offset-2"
      aria-label={label}
    >
      <Image
        src={icon}
        alt=""
        width={20}
        height={20}
        className="object-contain"
      />
      <span className="font-figtree text-[14px] font-bold leading-[100%] text-white">
        {label}
      </span>
    </button>
  );

  return (
    <section className="w-full bg-[#F5F5F5] py-8">
      <div className="container mx-auto px-4">
        {/* === Section title === */}
        <h1 className="mb-8 font-figtree text-[30px] font-bold leading-[100%] text-[#222222]">
          {tMain('title')}
        </h1>
        {/* 4 columns on md+; stack on mobile */}
        <div className="grid gap-10 md:grid-cols-4">
          {/* COLUMN 1 — Beach + User type */}
          <div>
            {/* Beach */}
            <div className="flex items-center gap-3">
              <Image
                src="/images/beachicons/wave.png"
                alt={tGroups('beach')}
                width={30}
                height={30}
              />
              <h2 className="font-figtree text-[16px] font-bold leading-[100%] text-[#222222]">
                {tGroups('beach')}
              </h2>
            </div>
            <div className="mt-3 border-b border-[#E7E7E7]" />

            <div className="mt-4 flex flex-col">
              <InfoRow labelKey="type">
                <SingleValue valueKey={beach.type} />
              </InfoRow>

              <InfoRow labelKey="naturalFeatures">
                <TickValueList itemKeys={beach.naturalFeatures} />
              </InfoRow>

              <InfoRow labelKey="occupancy">
                <SingleValue valueKey={beach.occupancy} />
              </InfoRow>

              <InfoRow labelKey="access">
                <SingleValue valueKey={beach.access} />
              </InfoRow>

              <InfoRow labelKey="paid">
                <SingleValue valueKey={beach.paid} />
              </InfoRow>

              <InfoRow labelKey="length">
                <SingleValue valueRaw={beach.lengthMeters} unitKey="meters" />
              </InfoRow>

              <InfoRow labelKey="width">
                <SingleValue valueRaw={beach.widthMeters} unitKey="meters" />
              </InfoRow>

              <InfoRow labelKey="slope">
                <SingleValue valueKey={beach.slope} />
              </InfoRow>

              <InfoRow labelKey="swimmingArea">
                <SingleValue
                  valueRaw={beach.swimmingAreaMeters}
                  unitKey="meters"
                />
              </InfoRow>

              <InfoRow labelKey="seabed">
                <TickValueList itemKeys={beach.seabed} />
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
                  className="object-contain"
                />
                <h2 className="font-figtree text-[16px] font-bold leading-[100%] text-[#222222]">
                  {tGroups('userType')}
                </h2>
              </div>
              <div className="mt-3 border-b border-[#E7E7E7]" />

              <div className="mt-4 flex flex-col">
                {/* No left pill here — only tick list */}
                <InfoRow labelVariant="none">
                  <TickValueList itemKeys={data.userType} />
                </InfoRow>
              </div>
            </div>
          </div>

          {/* COLUMN 2 — Beach infrastructure */}
          <div>
            <div className="flex items-center gap-3">
              <Image
                src="/images/beachicons/shower.png"
                alt={tGroups('infrastructure')}
                width={30}
                height={30}
                className="object-contain"
              />
              <h2 className="font-figtree text-[16px] font-bold leading-[100%] text-[#222222]">
                {tGroups('infrastructure')}
              </h2>
            </div>
            <div className="mt-3 border-b border-[#E7E7E7]" />

            <div className="mt-4 flex flex-col">
              {/* No left pill for each infrastructure item */}
              <InfoRow labelVariant="none">
                <TickValueList itemKeys={data.infrastructure} />
              </InfoRow>
            </div>
          </div>

          {/* COLUMN 3 — Accommodation, Food, Sports */}
          <div>
            {/* Accommodation */}
            <div>
              <div className="flex items-center gap-3">
                <Image
                  src="/images/accommodation-black.png"
                  alt={tGroups('accommodation')}
                  width={30}
                  height={30}
                  className="object-contain"
                />
                <h2 className="font-figtree text-[16px] font-bold leading-[100%] text-[#222222]">
                  {tGroups('accommodation')}
                </h2>
              </div>
              <div className="mt-3 border-b border-[#E7E7E7]" />
              <div className="mt-4 flex flex-col">
                <InfoRow labelVariant="none">
                  <TickValueList itemKeys={data.accommodation} />
                </InfoRow>
              </div>
            </div>

            {/* Food & drinks */}
            <div className="mt-8">
              <div className="flex items-center gap-3">
                <Image
                  src="/images/beachicons/dish.png"
                  alt={tGroups('food')}
                  width={30}
                  height={30}
                  className="object-contain"
                />
                <h2 className="font-figtree text-[16px] font-bold leading-[100%] text-[#222222]">
                  {tGroups('food')}
                </h2>
              </div>
              <div className="mt-3 border-b border-[#E7E7E7]" />
              <div className="mt-4 flex flex-col">
                <InfoRow labelVariant="none">
                  <TickValueList itemKeys={data.food} />
                </InfoRow>
              </div>
            </div>

            {/* Sports activities */}
            <div className="mt-8">
              <div className="flex items-center gap-3">
                <Image
                  src="/images/beachicons/surf-board.png"
                  alt={tGroups('sports')}
                  width={30}
                  height={30}
                  className="object-contain"
                />
                <h2 className="font-figtree text-[16px] font-bold leading-[100%] text-[#222222]">
                  {tGroups('sports')}
                </h2>
              </div>
              <div className="mt-3 border-b border-[#E7E7E7]" />
              <div className="mt-4 flex flex-col">
                <InfoRow labelVariant="none">
                  <TickValueList itemKeys={data.sports} />
                </InfoRow>
              </div>
            </div>
          </div>

          {/* COLUMN 4 — Parking + Path to the beach (with real buttons) */}
          <div>
            {/* Parking */}
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Image
                    src="/images/beachicons/parking-gray.png"
                    alt={tGroups('parking')}
                    width={30}
                    height={30}
                    className="object-contain"
                  />
                  <h2 className="font-figtree text-[16px] font-bold leading-[100%] text-[#222222]">
                    {tGroups('parking')}
                  </h2>
                </div>
                <ActionButton
                  icon="/images/beachicons/pic-gallery.png"
                  label={tButtons('photo')}
                />
              </div>

              <div className="mt-3 border-b border-[#E7E7E7]" />

              <div className="mt-4 flex flex-col">
                {/* These rows use left pill labels */}
                <InfoRow labelKey="parkingSpots">
                  <SingleValue valueRaw={data.parking.spots} />
                </InfoRow>

                <InfoRow labelKey="wayToParking">
                  <SingleValue valueKey={data.parking.wayToParking} />
                </InfoRow>

                <InfoRow labelKey="recommendedAccess">
                  {renderInlineList(data.parking.recommendedAccess)}
                </InfoRow>
              </div>
            </div>

            {/* Path to the beach */}
            <div className="mt-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Image
                    src="/images/beachicons/beach-path.png"
                    alt={tGroups('pathToBeach')}
                    width={30}
                    height={30}
                    className="object-contain"
                  />
                  <h2 className="font-figtree text-[16px] font-bold leading-[100%] text-[#222222]">
                    {tGroups('pathToBeach')}
                  </h2>
                </div>
                <div className="flex items-center gap-3">
                  <ActionButton
                    icon="/images/beachicons/pic-gallery.png"
                    label={tButtons('photo')}
                  />
                  <ActionButton
                    icon="/images/beachicons/pathway.png"
                    label={tButtons('map')}
                  />
                </div>
              </div>

              <div className="mt-3 border-b border-[#E7E7E7]" />

              <div className="mt-4 flex flex-col">
                {/* These rows also use left pill labels */}
                <InfoRow labelKey="distance">
                  <SingleValue
                    valueRaw={data.pathToBeach.distanceMetersFromParking}
                    unitKey="meters"
                  />
                </InfoRow>

                <InfoRow labelKey="elevationDiff">
                  <SingleValue
                    valueRaw={data.pathToBeach.elevationDiffMeters}
                    unitKey="meters"
                  />
                </InfoRow>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BeachDetailsSection;
