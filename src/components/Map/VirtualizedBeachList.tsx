'use client';

import { DynamicPropertyCard } from '@/components/PropertyCard/DynamicPropertyCard';
import type { BeachSchema } from '@/lib/api-client/types.gen';
import React, { useCallback } from 'react';
import { List } from 'react-window';

interface VirtualizedBeachListProps {
  beaches: BeachSchema[];
  columnLayout: 1 | 2;
  onLocationClick: (latitude: string, longitude: string, beachId?: number) => void;
  containerHeight: number;
  containerWidth: number;
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

const CARD_HEIGHT = 395; // Height of PropertyCard
const GAP = 16; // gap-4 = 16px
const MOBILE_BREAKPOINT = 768; // md breakpoint

export const VirtualizedBeachList = React.memo(({
  beaches,
  columnLayout,
  onLocationClick,
  containerHeight,
  containerWidth,
}: VirtualizedBeachListProps) => {
  const listRef = React.useRef<ListRef | null>(null);

  // Determine if we're in mobile view
  const isMobile = containerWidth < MOBILE_BREAKPOINT;

  // Calculate columns based on layout and screen size
  const columns = isMobile ? 1 : columnLayout;

  // Calculate number of rows needed
  const rowCount = Math.ceil(beaches.length / columns);

  // Calculate row height (card height + gap)
  const rowHeight = CARD_HEIGHT + GAP;

  // OPTIMIZATION: Reset scroll position when beaches change significantly
  // But don't reset on minor updates (prevents blinking)
  const prevBeachCountRef = React.useRef(beaches.length);
  React.useEffect(() => {
    const beachCountChanged = Math.abs(prevBeachCountRef.current - beaches.length) > 10;
    if (beachCountChanged && listRef.current?.scrollToRow) {
      // Only reset scroll if beach count changed significantly (>10 beaches)
      try {
        listRef.current.scrollToRow({ index: 0, align: 'start' });
      } catch (error) {
        // Silently fail if scrollToRow doesn't work
        console.debug('Could not scroll to top:', error);
      }
    }
    prevBeachCountRef.current = beaches.length;
  }, [beaches.length]);

  // Row renderer component - uses closure to access beaches, columns, onLocationClick
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
    const rowBeaches = beaches.slice(startIndex, startIndex + columns);

    // FIX: Remove width from style to prevent overflow
    // The grid will naturally fit within the container
    const { width: _width, ...styleWithoutWidth } = style;

    return (
      <div
        style={styleWithoutWidth}
        {...ariaAttributes}
        className={`grid gap-4 px-4 ${
          columns === 2 ? 'grid-cols-2' : 'grid-cols-1'
        }`}
      >
        {rowBeaches.map((beach, colIndex) => {
          const beachIndex = index * columns + colIndex;
          return (
            <div key={`${beach.id ?? beachIndex}-${beachIndex}`} data-beach-id={beach.id}>
              <DynamicPropertyCard
                beach={beach}
                onLocationClick={onLocationClick}
              />
            </div>
          );
        })}
      </div>
    );
  }, [beaches, columns, onLocationClick]);

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
      overscanCount={1}
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
});

VirtualizedBeachList.displayName = 'VirtualizedBeachList';

