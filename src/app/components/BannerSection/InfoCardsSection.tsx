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
}

const InfoCardsSection: React.FC<InfoCardsSectionProps> = ({ cards }) => {
  const t = useTranslations('BannerSection');

  return (
    <div className="relative z-20 -mt-[60px] sm:-mt-[80px] mb-[32px] px-[20px] sm:px-[50px] lg:px-[100px]">
      <div className="grid grid-cols-1 gap-[16px] sm:gap-[20px] sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {cards.map((card, index) => (
          <div
            key={index}
            className="flex flex-col sm:flex-row h-auto sm:h-[158px] w-full overflow-hidden rounded-[10px] bg-white shadow-md"
          >
            {/* Slika */}
            <div className="m-[10px] h-[120px] sm:h-[138px] w-full sm:w-[135px] flex-shrink-0 overflow-hidden rounded-[8px]">
              <Image
                src={card.image}
                alt={card.title}
                width={135}
                height={138}
                className="h-full w-full object-cover"
              />
            </div>

            {/* Vsebina */}
            <div className="flex flex-col justify-between p-[10px] sm:py-[10px] sm:pr-[10px] sm:pl-0">
              <div>
                <h3 className="font-figtree text-[16px] sm:text-[20px] font-bold text-[#5E1CA5]">
                  {card.title}
                </h3>
                <p className="mt-[4px] line-clamp-2 sm:line-clamp-3 font-figtree text-[12px] font-normal leading-[16px] text-[#4D4D4D]">
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
  );
};

export default InfoCardsSection;
