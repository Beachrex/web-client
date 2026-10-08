import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

interface FeatureCard {
  id: number;
  title: string;
  backgroundImageUrl: string;
  buttonLabel: string;
  buttonIconUrl: string;
  buttonBgColor: string;
  buttonTextColor: string;
  buttonUrl: string;
}

interface ExploreSectionProps {
  items: FeatureCard[];
  tagline: string;
}

const ExploreSection: React.FC<ExploreSectionProps> = ({ items, tagline }) => {
  return (
    <section className="bg-white py-12 sm:py-16 lg:py-20">
      <div className="container mx-auto">
        {/* First row */}
        <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2 lg:gap-8">
          {items.slice(0, 2).map((item) => (
            <div
              key={item.id}
              className="relative h-64 overflow-hidden rounded-lg sm:h-72 lg:h-80"
            >
              {item.backgroundImageUrl && (
                <Image
                  src={item.backgroundImageUrl}
                  alt={item.title}
                  fill
                  className="object-cover"
                />
              )}
              <div className="absolute inset-0 bg-black/30" />

              {/* Overlay content */}
              <div className="absolute inset-0 flex items-center justify-center p-4">
                <div className="text-center">
                  <h3 className="mb-4 text-xl font-bold leading-tight text-white sm:mb-6 sm:text-2xl lg:text-3xl">
                    {item.title}
                  </h3>
                  {/* No button when the target is hidden for launch (empty url) */}
                  {item.buttonUrl && (
                    <Link
                      href={item.buttonUrl}
                      className="inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-bold transition-colors sm:gap-3 sm:px-5 sm:py-3 sm:text-base"
                      style={{
                        backgroundColor: item.buttonBgColor,
                        color: item.buttonTextColor,
                      }}
                    >
                      {item.buttonIconUrl && (
                        <Image
                          src={item.buttonIconUrl}
                          alt="Button icon"
                          width={20}
                          height={20}
                          className="sm:h-6 sm:w-6"
                        />
                      )}
                      <span>{item.buttonLabel}</span>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Second row */}
        <div className="mt-4 grid grid-cols-1 gap-4 sm:mt-6 sm:gap-6 lg:mt-8 lg:grid-cols-2 lg:gap-8">
          {items.slice(2, 4).map((item) => (
            <div
              key={item.id}
              className="relative h-64 overflow-hidden rounded-lg sm:h-72 lg:h-80"
            >
              {item.backgroundImageUrl && (
                <Image
                  src={item.backgroundImageUrl}
                  alt={item.title}
                  fill
                  className="object-cover"
                />
              )}
              <div className="absolute inset-0 bg-black/30" />

              {/* Overlay content */}
              <div className="absolute inset-0 flex items-center justify-center p-4">
                <div className="text-center">
                  <h3 className="mb-4 text-xl font-bold leading-tight text-white sm:mb-6 sm:text-2xl lg:text-3xl">
                    {item.title}
                  </h3>
                  {/* No button when the target is hidden for launch (empty url) */}
                  {item.buttonUrl && (
                    <Link
                      href={item.buttonUrl}
                      className="inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-bold transition-colors sm:gap-3 sm:px-5 sm:py-3 sm:text-base"
                      style={{
                        backgroundColor: item.buttonBgColor,
                        color: item.buttonTextColor,
                      }}
                    >
                      {item.buttonIconUrl && (
                        <Image
                          src={item.buttonIconUrl}
                          alt="Button icon"
                          width={20}
                          height={20}
                          className="sm:h-6 sm:w-6"
                        />
                      )}
                      <span>{item.buttonLabel}</span>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom tagline */}
        <div className="mt-12 text-center sm:mt-16 lg:mt-20">
          <h2
            className="text-3xl font-normal leading-tight text-variable-collection-temno-modro sm:text-4xl lg:text-5xl xl:text-6xl"
            style={{ fontFamily: 'Damion, cursive' }}
          >
            {tagline}
          </h2>
        </div>
      </div>
    </section>
  );
};

export default ExploreSection;
