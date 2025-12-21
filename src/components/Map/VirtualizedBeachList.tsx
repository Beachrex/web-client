'use client';

import { DynamicPropertyCard } from '@/components/PropertyCard/DynamicPropertyCard';
import type { BeachSchema } from '@/lib/api-client/types.gen';
import React, { useCallback } from 'react';
import { List, type ListImperativeAPI } from 'react-window';

interface VirtualizedBeachListProps {
  beaches: BeachSchema[];
  columnLayout: 1 | 2;
  onLocationClick: (latitude: string, longitude: string, beachId?: number) => void;
  containerHeight: number;
  containerWidth: number;
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
  const listRef = React.useRef<ListImperativeAPI | null>(null);

  // Determine if we're in mobile view
  const isMobile = containerWidth < MOBILE_BREAKPOINT;

  // Calculate columns based on layout and screen size
  const columns = isMobile ? 1 : columnLayout;

  // Calculate number of rows needed
  const rowCount = Math.ceil(beaches.length / columns);

  // Calculate row height (card height + gap)
  const rowHeight = CARD_HEIGHT + GAP;

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

    return (
      <div
        style={style}
        {...ariaAttributes}
        className={`grid gap-4 px-1 ${
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

