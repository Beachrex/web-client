'use client';

import { DynamicPropertyCard } from '@/components/PropertyCard/DynamicPropertyCard';
import type { BeachSchema } from '@/lib/api-client/types.gen';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { List } from 'react-window';
import { useTranslations } from 'next-intl';

// Performance logging
const ENABLE_PERF_LOGGING = false;
let renderCount = 0;
let totalRowsCreated = 0;

const vblModuleLoadStart = performance.now();

// Persistent cache for beaches that have already been seen/rendered
// This prevents the "flash" when switching between 1 and 2 column layouts
const seenBeachesCache = new Set<number>();

// Lazy beach card that only renders full content when in viewport
const LazyBeachCard = React.memo(function LazyBeachCard({
  beach,
  onLocationClick,
  onBeachHover,
}: {
  beach: BeachSchema;
  onLocationClick: (latitude: string, longitude: string, beachId?: number) => void;
  onBeachHover?: (beachId: number | null) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  // Initialize with true if this specific beach has already been rendered before
  const [isInView, setIsInView] = useState(() => (beach?.id ? seenBeachesCache.has(beach.id) : false));

  useEffect(() => {
    // If already in view from cache, no need for observer
    if (isInView || !beach?.id) return;

    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          if (beach.id) seenBeachesCache.add(beach.id);
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' } // Increased margin to trigger earlier and avoid flash
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [beach.id, isInView]);

  // If there's no valid beach ID, we don't render anything
  if (!beach?.id) return null;

  return (
    <div
      ref={ref}
      data-beach-id={beach.id}
      style={{ minHeight: isInView ? 'auto' : 395 }}
      onMouseEnter={() => beach?.id && onBeachHover?.(beach.id)}
      onMouseLeave={() => onBeachHover?.(null)}
    >
      {isInView ? (
        <DynamicPropertyCard beach={beach} onLocationClick={onLocationClick} openInNewTab />
      ) : null}
    </div>
  );
}, (prev, next) => prev.beach.id === next.beach.id);

interface VirtualizedBeachListProps {
  beaches: BeachSchema[];
  columnLayout: 1 | 2;
  onLocationClick: (latitude: string, longitude: string, beachId?: number) => void;
  onBeachHover?: (beachId: number | null) => void;
  containerHeight: number;
  containerWidth: number;
  scrollContainerRef?: React.RefObject<HTMLDivElement | null>;
}

// Type for react-window List ref
interface ListRef {
  readonly element: HTMLDivElement | null;
  scrollToRow(config: {
    align?: 'auto' | 'center' | 'end' | 'start' | 'smart';
    behavior?: 'auto' | 'instant' | 'smooth';
    index: number;
  }): void;
}

const CARD_HEIGHT = 295; // Height of PropertyCard
const GAP = 16; // gap-4 = 16px
const MOBILE_BREAKPOINT = 768; // md breakpoint
// Phones scroll the whole page, so the list has no fixed height and react-window rendered every row
// (2 876 beaches, an 894 000 px tall element): taps and scrolling stalled on an iPhone 16 Pro (owner video
// 2026-10-10). On phones the list shows a page of cards and a "show more" button instead.
export const MOBILE_PAGE_SIZE = 20;

// Log module load completion
if (ENABLE_PERF_LOGGING) {
  console.log(`✅ [VirtualizedBeachList Module] Loaded in ${(performance.now() - vblModuleLoadStart).toFixed(2)}ms`);
}

// Inner component that handles the virtualization
const VirtualizedBeachListInner = ({
  beaches,
  columnLayout,
  onLocationClick,
  onBeachHover,
  containerHeight,
  containerWidth,
  scrollContainerRef: _scrollContainerRef,
}: VirtualizedBeachListProps) => {
  const tUi = useTranslations('UI');
  const tFilter = useTranslations('FilterModal');
  const [mobileVisible, setMobileVisible] = useState(MOBILE_PAGE_SIZE);
  // The screen, not the list column, decides: on desktop the column is narrow too, but it has its own
  // fixed-height scroll area where react-window works.
  const [isPhone, setIsPhone] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`).matches
  );
  useEffect(() => {
    const query = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const update = () => setIsPhone(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);
  const listRef = React.useRef<ListRef | null>(null);
  const renderStartTime = useRef(performance.now());
  const currentRenderCount = useRef(++renderCount);

  // Performance: Log render start
  if (ENABLE_PERF_LOGGING) {
    renderStartTime.current = performance.now();
    console.log(`⏱️ [VirtualizedBeachList] RENDER #${currentRenderCount.current} START`, {
      beachesCount: beaches.length,
      columnLayout,
      containerHeight,
      containerWidth,
    });
  }

  // Performance: Log render completion
  useEffect(() => {
    if (ENABLE_PERF_LOGGING) {
      const renderTime = performance.now() - renderStartTime.current;
      console.log(`✅ [VirtualizedBeachList] RENDER #${currentRenderCount.current} COMPLETE`, {
        renderTimeMs: renderTime.toFixed(2),
        beachesCount: beaches.length,
        rowCount: Math.ceil(beaches.length / (containerWidth < MOBILE_BREAKPOINT ? 1 : columnLayout)),
      });

      if (renderTime > 100) {
        console.warn(
          `⚠️ [VirtualizedBeachList] Slow render: ${renderTime.toFixed(2)}ms`,
        );
      }
    }
  });

  // Determine if we're in mobile view
  const isMobile = containerWidth < MOBILE_BREAKPOINT;

  // Calculate columns based on layout and screen size
  const columns = isMobile ? 1 : columnLayout;

  // Calculate number of rows needed
  const rowCount = Math.ceil(beaches.length / columns);

  // Calculate row height (card height + gap)
  const rowHeight = CARD_HEIGHT + GAP;

  // Use refs to access data without causing RowComponent recreation
  const beachesRef = React.useRef(beaches);
  beachesRef.current = beaches;

  // Track rendered rows for performance analysis
  const renderedRowsRef = useRef<Set<number>>(new Set());

  // Row renderer - stable callback that uses refs
  const RowComponent = useCallback((props: {
    index: number;
    style: React.CSSProperties;
    ariaAttributes: {
      'aria-posinset': number;
      'aria-setsize': number;
      role: 'row';
    };
  }) => {
    const { index, style, ariaAttributes } = props;
    const startIndex = index * columns;
    const currentBeaches = beachesRef.current;
    const rowBeaches = currentBeaches.slice(startIndex, startIndex + columns);

    // Performance: Log row render (only first time each row is rendered)
    if (ENABLE_PERF_LOGGING && !renderedRowsRef.current.has(index)) {
      renderedRowsRef.current.add(index);
      totalRowsCreated++;
      const rowStart = performance.now();
      console.log(`📦 [VirtualizedBeachList] Row ${index} CREATING`, {
        beachIds: rowBeaches.map(b => b.id),
        totalRowsRendered: renderedRowsRef.current.size,
        totalRowsCreated,
        totalBeaches: currentBeaches.length,
      });
      // Log after microtask to see creation time
      queueMicrotask(() => {
        console.log(`📦 [VirtualizedBeachList] Row ${index} CREATED in ${(performance.now() - rowStart).toFixed(2)}ms`);
      });
    }

    // Remove width from style to prevent overflow
    const { width: _width, ...styleWithoutWidth } = style;

    return (
      <div
        style={styleWithoutWidth}
        {...ariaAttributes}
        className={`grid gap-4 px-4 justify-center ${
          columns === 2 ? 'grid-cols-2' : 'grid-cols-1'
        }`}
      >
        {rowBeaches.map((beach, colIndex) => {
          const beachIndex = index * columns + colIndex;
          return (
            <div key={`${beach.id ?? beachIndex}-${beachIndex}`} className="w-[410px] max-w-full mx-auto">
              <LazyBeachCard
                beach={beach}
                onLocationClick={onLocationClick}
                onBeachHover={onBeachHover}
              />
            </div>
          );
        })}
      </div>
    );
  }, [columns, onLocationClick, onBeachHover]); // Only recreate when columns or callbacks change

  // Reset rendered rows tracking when beaches change
  useEffect(() => {
    if (ENABLE_PERF_LOGGING) {
      console.log('🔄 [VirtualizedBeachList] Beaches changed', {
        previousRowsRendered: renderedRowsRef.current.size,
        newBeachesCount: beaches.length,
      });
    }
    renderedRowsRef.current.clear();
    setMobileVisible(MOBILE_PAGE_SIZE);
  }, [beaches]);

  if (beaches.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">{tUi('noBeachesInArea')}</p>
      </div>
    );
  }

  if (isPhone) {
    const remaining = beaches.length - mobileVisible;
    return (
      <div className="flex flex-col gap-4 px-4 pb-4">
        {beaches.slice(0, mobileVisible).map((beach, index) => (
          <div key={`${beach.id ?? index}-${index}`} className="w-[410px] max-w-full mx-auto">
            <LazyBeachCard beach={beach} onLocationClick={onLocationClick} onBeachHover={onBeachHover} />
          </div>
        ))}
        {remaining > 0 && (
          <button
            type="button"
            onClick={() => setMobileVisible((visible) => visible + MOBILE_PAGE_SIZE)}
            className="mx-auto w-full max-w-[410px] rounded-md border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm"
          >
            {tFilter('showMore', { count: Math.min(MOBILE_PAGE_SIZE, remaining) })}
          </button>
        )}
      </div>
    );
  }

  return (
    <List
      listRef={listRef}
      defaultHeight={containerHeight}
      rowCount={rowCount}
      rowHeight={rowHeight}
      overscanCount={2}
      rowComponent={RowComponent}
      rowProps={{} as never}
      className="scrollbar-hide"
      style={{
        width: containerWidth,
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
      }}
    />
  );
};

VirtualizedBeachListInner.displayName = 'VirtualizedBeachListInner';

// Export the memoized component with ref forwarding
export const VirtualizedBeachList = React.memo(VirtualizedBeachListInner);

VirtualizedBeachList.displayName = 'VirtualizedBeachList';
