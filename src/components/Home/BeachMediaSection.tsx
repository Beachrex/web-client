'use client';
import Image from 'next/image';
import React, { useMemo } from 'react';
import { useBeachViews } from '@/hooks/useFirstPageContent';

const BeachMediaSection: React.FC = () => {
  const { content: beachViews, loading } = useBeachViews();

  // Process items from API
  const mediaItems = useMemo(() => {
    if (!beachViews?.items) return [];

    return beachViews.items.map(item => {
      // Find icon (type: 'icon') and background image (type: 'image')
      const icon = item.media?.find(m => m.type === 'icon');
      const backgroundImage = item.media?.find(m => m.type === 'image');

      return {
        id: item.id,
        title: item.title ?? '',
        iconUrl: icon?.url ?? '',
        backgroundUrl: backgroundImage?.url ?? '',
      };
    });
  }, [beachViews]);

  if (loading) {
    return (
      <section className="bg-[#F5F5F5] py-12 sm:py-16 lg:py-20">
        <div className="container mx-auto px-4">
          <div className="mb-10 h-10 w-1/2 animate-pulse rounded bg-gray-300" />
          <div className="grid grid-cols-1 gap-[26px] sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div
                key={idx}
                className="h-[233px] w-full animate-pulse rounded-lg bg-gray-300"
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!beachViews || mediaItems.length === 0) return null;

  return (
    <section className="bg-[#F5F5F5] py-12 sm:py-16 lg:py-20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <h2 className="mb-10 text-[30px] font-bold text-[#0A2342]">
          {beachViews.title}
        </h2>

        {/* Grid */}
        <div className="grid grid-cols-1 gap-[26px] sm:grid-cols-2 lg:grid-cols-4">
          {mediaItems.map((item) => (
            <div
              key={item.id}
              className="relative flex h-[233px] w-full items-center justify-center overflow-hidden rounded-lg"
            >
              {item.backgroundUrl && (
                <Image
                  src={item.backgroundUrl}
                  alt={item.title}
                  fill
                  className="object-cover"
                />
              )}
              <div className="absolute inset-0 bg-black/20" />
              <button className="relative z-10 flex h-[45px] items-center gap-[10px] rounded-[8px] bg-white px-[16px] py-[9px] text-center font-figtree text-[14px] font-bold leading-none text-gray-700 shadow">
                {item.iconUrl && (
                  <Image
                    src={item.iconUrl}
                    alt={`${item.title} icon`}
                    width={20}
                    height={20}
                  />
                )}
                <span>{item.title}</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BeachMediaSection;
