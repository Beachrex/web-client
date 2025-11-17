'use client';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import React from 'react';

interface InfoCard {
  title: string;
  subtitle: string;
  image: string;
  link?: string;
}

interface InfoCardsSectionProps {
  cards: InfoCard[];
  /** Controls accent color for the title */
  variant?: 'continent' | 'region';
}

const InfoCardsSection: React.FC<InfoCardsSectionProps> = ({
  cards,
  variant = 'continent',
}) => {
  const t = useTranslations('BannerSection');

  const titleColorClass =
    variant === 'region' ? 'text-[#FF2877]' : 'text-[#5E1CA5]';

  return (
    <div className="container mx-auto">
      <div className="relative z-20 -mt-[60px] mb-[32px] sm:-mt-[80px]">
        <div className="grid grid-cols-1 gap-[16px] sm:grid-cols-2 sm:gap-[20px] lg:grid-cols-3 xl:grid-cols-4">
          {cards.map((card, index) => (
            <div
              key={index}
              className="flex h-auto w-full flex-col overflow-hidden rounded-[10px] bg-white shadow-md sm:h-[158px] sm:flex-row"
            >
              {/* Image */}
              <div className="mx-[10px] mb-[5px] mt-[10px] flex h-[120px] w-auto flex-shrink-0 overflow-hidden rounded-[8px] sm:m-[10px] sm:h-[138px] sm:w-[135px]">
                <Image
                  src={card.image}
                  alt={card.title}
                  width={135}
                  height={138}
                  className="h-full w-full object-cover"
                />
              </div>

              {/* Content */}
              <div className="flex flex-col justify-between px-[10px] pb-[10px] pt-[5px] sm:py-[10px] sm:pl-0 sm:pr-[10px]">
                <div>
                  <h3
                    className={`font-figtree text-[16px] font-bold sm:text-[20px] ${titleColorClass}`}
                  >
                    {card.title}
                  </h3>
                  <p className="mt-[4px] line-clamp-2 font-figtree text-[12px] font-normal leading-[16px] text-[#4D4D4D] sm:line-clamp-3">
                    {card.subtitle}
                  </p>
                </div>
                <a
                  href={card.link ?? '#'}
                  className="mt-[8px] font-figtree text-[10px] font-medium text-[#8D8D8D] underline"
                >
                  {t('readMore')}
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InfoCardsSection;
