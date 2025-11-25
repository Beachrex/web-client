'use client';

import { Heart, Star } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

const TopBarBeachRight: React.FC = () => {
  const t = useTranslations('Common');

  return (
    <div className="flex items-center gap-[14px]">
      {/* Google reviews */}
      <button
        type="button"
        className="hidden cursor-pointer items-center gap-[8px] rounded-full bg-[#F5F5F5] px-[18px] py-[8px] text-[14px] shadow-sm transition-all hover:bg-[#E8E8E8] sm:flex"
        title={t('reviews')}
      >
        <span className="font-figtree text-[14px] font-semibold leading-[100%] text-[#4D4D4D]">
          Google {t('reviews')}
        </span>
        <Star size={22} strokeWidth={2} color="#8D8D8D" />
        <span className="font-figtree text-[14px] font-semibold leading-[100%] text-[#4D4D4D]">
          7.2
        </span>
      </button>

      {/* Save (heart) */}
      <button
        type="button"
        className="flex cursor-pointer items-center gap-[8px] rounded-full bg-[#F5F5F5] px-[18px] py-[8px] text-[14px] shadow-sm transition-all hover:bg-[#E8E8E8]"
        title={t('save')}
      >
        <span className="font-figtree text-[14px] font-semibold leading-[100%] text-[#4D4D4D]">
          {t('save')}
        </span>
        <Heart size={22} strokeWidth={2} color="#CFCFCF" />
      </button>

      {/* Share */}
      <button
        type="button"
        className="flex cursor-pointer items-center gap-[8px] rounded-full bg-[#F5F5F5] px-[18px] py-[8px] text-[14px] shadow-sm transition-all hover:bg-[#E8E8E8]"
        title={t('share')}
      >
        <span className="font-figtree text-[14px] font-semibold leading-[100%] text-[#4D4D4D]">
          {t('share')}
        </span>
        <Image
          src="/images/share.png"
          alt={t('share')}
          width={22}
          height={22}
          className="object-contain"
        />
      </button>
    </div>
  );
};

export default TopBarBeachRight;
