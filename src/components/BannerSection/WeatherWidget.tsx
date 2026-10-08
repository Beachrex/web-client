'use client';
import Image from 'next/image';
import React from 'react';

interface SimpleWeather {
  temperature?: number | null;
  description?: string | null;
  icon_url?: string | null;
  location_name?: string | null;
}

interface WeatherWidgetProps {
  weather?: SimpleWeather | null;
  locationName?: string;
  isLoading?: boolean;
}

const WeatherWidget: React.FC<WeatherWidgetProps> = ({
  weather,
  locationName,
  isLoading = false,
}) => {
  // Use weather data if available, otherwise show placeholder
  const temperature = weather?.temperature ?? null;
  const location = locationName ?? weather?.location_name ?? '';
  const weatherIcon = weather?.icon_url;

  // Show loading state
  if (isLoading) {
    return (
      <div className="relative h-[144px] w-[144px] overflow-hidden rounded-[10px] bg-black/30 font-figtree text-white">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-white/20 border-t-white" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-[144px] w-[144px] overflow-hidden rounded-[10px] bg-black/30 font-figtree text-white">
      {/* Weather Icon (top right) */}
      {weatherIcon && (
  <Image
    src={weatherIcon}
    alt={weather?.description ?? 'weather icon'}
    width={45}
    height={45}
    className="absolute right-[14px] top-[14px]"
  />
)}


      {/* Content bottom-left */}
      <div className="absolute bottom-[14px] left-[14px] z-10 flex flex-col items-start justify-end">
        {/* Temperature */}
        <div className="flex items-start">
          <span className="text-[50px] font-bold leading-[100%]">
            {temperature !== null ? Math.round(temperature) : '--'}
          </span>
          {temperature !== null && (
            <span className="ml-[2px] mt-[10px] text-[12px] font-semibold">
              °C
            </span>
          )}
        </div>

        {/* Location */}
        <div className="mt-[4px] flex items-center gap-[4px]">
          <Image
            src="/images/banner/rotated-arrow.png"
            alt="location"
            width={10}
            height={10}
          />
          <span className="max-w-[100px] truncate text-[12px] font-bold leading-[100%]">
            {location}
          </span>
        </div>
      </div>
    </div>
  );
};

export default WeatherWidget;
