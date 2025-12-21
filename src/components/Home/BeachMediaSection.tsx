import Image from 'next/image';
import React from 'react';

interface MediaItem {
  id: number;
  title: string;
  iconUrl: string;
  backgroundUrl: string;
}

interface BeachMediaSectionProps {
  title: string;
  items: MediaItem[];
}

/**
 * Memoized BeachMediaSection component to prevent unnecessary re-renders
 * Only re-renders when title or items array changes
 */
const BeachMediaSection = React.memo<BeachMediaSectionProps>(function BeachMediaSection({
  title,
  items,
}) {
  return (
    <section className="bg-[#F5F5F5] py-12 sm:py-16 lg:py-20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <h2 className="mb-10 text-[30px] font-bold text-[#0A2342]">
          {title}
        </h2>

        {/* Grid */}
        <div className="grid grid-cols-1 gap-[26px] sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => (
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
});

export default BeachMediaSection;
