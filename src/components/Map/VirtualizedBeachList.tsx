'use client';

import { DynamicPropertyCard } from '@/components/PropertyCard/DynamicPropertyCard';
import type { BeachSchema } from '@/lib/api-client/types.gen';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { List } from 'react-window';

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
}: {
  beach: BeachSchema;
  onLocationClick: (latitude: string, longitude: string, beachId?: number) => void;
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
    <div ref={ref} data-beach-id={beach.id} style={{ minHeight: isInView ? 'auto' : 395 }}>
      {isInView ? (
        <DynamicPropertyCard beach={beach} onLocationClick={onLocationClick} />
      ) : null}
    </div>
  );
}, (prev, next) => prev.beach.id === next.beach.id);

interface VirtualizedBeachListProps {
  beaches: BeachSchema[];
  columnLayout: 1 | 2;
  onLocationClick: (latitude: string, longitude: string, beachId?: number) => void;
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

// Log module load completion
if (ENABLE_PERF_LOGGING) {
  console.log(`✅ [VirtualizedBeachList Module] Loaded in ${(performance.now() - vblModuleLoadStart).toFixed(2)}ms`);
}

// Inner component that handles the virtualization
const VirtualizedBeachListInner = ({
  beaches,
  columnLayout,
  onLocationClick,
  containerHeight,
  containerWidth,
  scrollContainerRef: _scrollContainerRef,
}: VirtualizedBeachListProps) => {
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
              />
            </div>
          );
        })}
      </div>
    );
  }, [columns, onLocationClick]); // Only recreate when columns or callback changes

  // Reset rendered rows tracking when beaches change
  useEffect(() => {
    if (ENABLE_PERF_LOGGING) {
      console.log('🔄 [VirtualizedBeachList] Beaches changed', {
        previousRowsRendered: renderedRowsRef.current.size,
        newBeachesCount: beaches.length,
      });
    }
    renderedRowsRef.current.clear();
  }, [beaches]);

  if (beaches.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">No beaches found in this area</p>
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
