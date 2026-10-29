'use client';

import type { Country } from '@/lib/api-client/types.gen';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import dynamic from 'next/dynamic';
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import DestinationCard from './DestinationCard';
import { useTranslations } from 'next-intl';

const FlowbiteCarousel = dynamic(
  () => import('./DestinationsCarousel/FlowbiteCarousel'),
  {
    loading: () => (
      <div className="h-96 bg-gray-100 animate-pulse rounded-lg flex items-center justify-center">
        <div className="h-full w-full animate-pulse rounded-lg bg-gray-200" />
      </div>
    ),
    ssr: false,
  }
);

type CountryWithUrl = Country & { url: string; mapUrl?: string };

interface DestinationsCarouselProps {
  items: CountryWithUrl[];
  title: string;
  countLabel?: string;
  badgeLabel?: string;
  cardVariant?: 'default' | 'city' | 'island' | 'region';
  backgroundClassName?: string;
  titleClassName?: string;
  showFlag?: boolean;
  headerActions?: React.ReactNode;
}

const DestinationsCarousel = React.memo<DestinationsCarouselProps>(function DestinationsCarousel(props) {
  const {
    items,
    title,
    countLabel,
    badgeLabel,
    cardVariant = 'default',
    backgroundClassName = 'bg-white',
    titleClassName = 'text-[#222222]',
    showFlag = false,
    headerActions,
  } = props;

  const [itemsPerSlide, setItemsPerSlide] = useState(1);
  const [expanded, setExpanded] = useState(false);
  const tCommon = useTranslations('Common');


  const handleResize = useCallback(() => {
    const w = window.innerWidth;
    if (w >= 1280) setItemsPerSlide(5);
    else if (w >= 1024) setItemsPerSlide(3);
    else if (w >= 640) setItemsPerSlide(2);
    else setItemsPerSlide(1);
  }, []);

  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  const slides = useMemo(() => {
    const result: CountryWithUrl[][] = [];
    for (let i = 0; i < items.length; i += itemsPerSlide) {
      result.push(items.slice(i, i + itemsPerSlide));
    }
    return result;
  }, [items, itemsPerSlide]);

  return (
    <section className={`${backgroundClassName} py-12`}>
      <div className="container mx-auto">
        <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <h2 className={`font-figtree text-[30px] font-bold leading-[1] tracking-[0] ${titleClassName}`}>
            {title}
          </h2>

          <div className="flex flex-wrap items-center gap-4">
          {headerActions}
          {countLabel && items.length > itemsPerSlide && (
<button
  type="button"
  aria-expanded={expanded}
  onClick={() => setExpanded(v => !v)}
  className="flex items-center gap-1 font-figtree text-[14px] font-bold text-[#8D8D8D] underline underline-offset-[2px] hover:text-[#555]"
>

    {expanded ? tCommon('showLess') : countLabel}
    <ChevronRight
      className={`h-4 w-4 transition-transform ${
        expanded ? 'rotate-90' : ''
      }`}
    />
  </button>
)}
          </div>

        </div>

       {!expanded ? (
  <div className="h-[340px] lg:h-[350px]">
    <FlowbiteCarousel
      className="h-full pb-8 [&>div>div>div:last-child]:!bottom-[-30px]"
    leftControl={
  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-lg">
    <ChevronLeft className="h-5 w-5 text-gray-600" />
  </div>
}
rightControl={
  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-lg">
    <ChevronRight className="h-5 w-5 text-gray-600" />
  </div>
}

      indicators={false}
      slide={false}
    >
      {slides.map((chunk, i) => (
        <div key={i} className="h-full px-0">
          <div className="grid h-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {chunk.map((c) => (
              <DestinationCard
                key={c.code}
                country={c}
                url={c.url}
                mapUrl={c.mapUrl}
                badgeLabel={badgeLabel}
                bottomVariant={cardVariant}
                showFlag={showFlag}
              />
            ))}
          </div>
        </div>
      ))}
    </FlowbiteCarousel>
  </div>
) : (
  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
    {items.map((c) => (
      <DestinationCard
        key={c.code}
        country={c}
        url={c.url}
        mapUrl={c.mapUrl}
        badgeLabel={badgeLabel}
        bottomVariant={cardVariant}
        showFlag={showFlag}
      />
    ))}
  </div>
)}

      </div>
    </section>
  );
});

export default DestinationsCarousel;
