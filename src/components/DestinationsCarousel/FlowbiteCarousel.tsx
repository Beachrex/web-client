'use client';

import { Carousel } from 'flowbite-react';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import React from 'react';

interface FlowbiteCarouselProps {
  children: React.ReactNode;
  leftControl?: React.ReactNode;
  rightControl?: React.ReactNode;
  indicators?: boolean;
  slide?: boolean;
  className?: string;
}

/**
 * Flowbite Carousel wrapper component
 * This component is dynamically imported to reduce initial bundle size
 */
export const FlowbiteCarousel: React.FC<FlowbiteCarouselProps> = ({
  children,
  leftControl,
  rightControl,
  indicators = false,
  slide = false,
  className = 'h-full',
}) => {
  const defaultLeftControl = (
    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-lg">
      <ChevronLeft className="h-5 w-5 text-gray-600" />
    </div>
  );

  const defaultRightControl = (
    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-lg">
      <ChevronRight className="h-5 w-5 text-gray-600" />
    </div>
  );

  return (
    <Carousel
      indicators={indicators}
      slide={slide}
      className={className}
      leftControl={leftControl ?? defaultLeftControl}
      rightControl={rightControl ?? defaultRightControl}
    >
      {children}
    </Carousel>
  );
};

export default FlowbiteCarousel;

