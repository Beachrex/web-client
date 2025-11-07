'use client';
import { Heart, MapPin } from 'lucide-react';
import { env } from '@/env';
import type { BeachSchema } from '@/lib/api-client/types.gen';

interface DynamicPropertyCardProps {
  beach: BeachSchema;
  size?: 'small' | 'big';
  onLocationClick?: (latitude: string, longitude: string) => void;
}

export function DynamicPropertyCard({ beach, size = 'big', onLocationClick }: DynamicPropertyCardProps) {
  const cdnEndpoint = env.NEXT_PUBLIC_CDN_ENDPOINT;

  // Define size-specific classes
  const sizeClasses = {
    small: 'w-[289px] max-w-[289px]',
    big: 'w-[410px] max-w-[410px]',
  };

  const cardWidth = sizeClasses[size];

  // Build the image URL
  const imageUrl = beach.main_image
    ? `${cdnEndpoint}${beach.main_image}`
    : '/images/propertycard/card-banner.jpg'; // fallback image

  // Get display values with fallbacks
  const beachName = beach.name ?? 'Unknown Beach';
  const countryName = beach.country_name ?? 'Unknown Country';
  const latitude = beach.latitude ?? '0';
  const longitude = beach.longitude ?? '0';

  // Handle location icon click
  const handleLocationClick = () => {
    if (onLocationClick) {
      onLocationClick(latitude, longitude);
    }
  };

  return (
    <div
      className={`${cardWidth} overflow-hidden rounded-[10px] 
        bg-white shadow-md transition-all duration-300 hover:-translate-y-[3px] hover:shadow-lg`}
    >
      {/* Top banner */}
      <div
        className="relative h-[278px] w-full bg-cover bg-center"
        style={{
          backgroundImage: `url('${imageUrl}')`,
        }}
      >
        {/* Top left badges - can be added later if needed */}
        <div className="absolute left-2 top-2 flex gap-1">
          {/* Placeholder for badges */}
        </div>

        {/* Top right heart */}
        <div className="absolute right-2 top-2 cursor-pointer">
          <Heart
            size={22}
            className="text-white drop-shadow-[0_0_3px_rgba(0,0,0,0.5)] hover:fill-red-500 transition-colors"
          />
        </div>

        {/* Bottom overlay with location */}
        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-end">
          {/* Location tag with country */}
          <div className="flex items-center gap-2 rounded-[8px] bg-[#FF8000] px-[8px] py-[6px]">
            <span className="text-[12px] font-bold text-white">
              {countryName}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom section */}
      <div className="flex flex-col gap-[2px] rounded-b-[10px] bg-[#E5F2FB] px-3 py-2">
        {/* Title row */}
        <div className="flex items-center justify-between">
          <h3 className="font-figtree text-[16px] font-bold text-[#0069AB] line-clamp-1">
            {beachName}
          </h3>
          <MapPin
            size={24}
            className="text-[#FF8000] flex-shrink-0 ml-2 cursor-pointer hover:text-[#CC6600] transition-colors"
            strokeWidth={2}
            onClick={handleLocationClick}
          />
        </div>

        {/* Content row - placeholder for future details */}
        <div className="flex items-center justify-between">

          {/* Right icons - placeholder for beach attributes */}
          <div className="flex gap-1">
            {/* Placeholder for beach type icons */}
          </div>
        </div>

        {/* Description if available */}
        {beach.description && (
          <p className="text-[10px] text-[#4D4D4D] line-clamp-2 mt-1">
            {beach.description}
          </p>
        )}
      </div>
    </div>
  );
}

export default DynamicPropertyCard;

