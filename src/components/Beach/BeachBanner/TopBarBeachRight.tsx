'use client';

import { Heart, Star } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

const TopBarBeachRight: React.FC = () => {
  const t = useTranslations('Common');

  return (
    <div className="flex items-center gap-[10px]">
      {/* Google reviews */}
      <div
        className="flex cursor-pointer items-center gap-[6px] rounded-[30px] bg-[#F5F5F5] px-[10px] py-[5px] transition-all hover:bg-[#E8E8E8] hover:shadow-sm"
        title={t('reviews')}
      >
        <span className="font-figtree text-[13px] font-semibold leading-[100%] text-[#4D4D4D]">
          Google {t('reviews')}
        </span>
        <Star size={20} strokeWidth={2} color="#8D8D8D" />
        <span className="font-figtree text-[13px] font-semibold leading-[100%] text-[#4D4D4D]">
          7.2
        </span>
      </div>

      {/* Save (heart) */}
      <div
        className="flex cursor-pointer items-center gap-[6px] rounded-[30px] bg-[#F5F5F5] px-[14px] py-[7px] transition-all hover:bg-[#E8E8E8] hover:shadow-sm"
        title={t('save')}
      >
        <span className="font-figtree text-[13px] font-semibold leading-[100%] text-[#4D4D4D]">
          {t('save')}
        </span>

        <Heart size={20} strokeWidth={2} color="#CFCFCF" />
      </div>

      {/* Share */}
      <div
        className="flex cursor-pointer items-center gap-[6px] rounded-[30px] bg-[#F5F5F5] px-[14px] py-[7px] transition-all hover:bg-[#E8E8E8] hover:shadow-sm"
        title={t('share')}
      >
        <span className="font-figtree text-[13px] font-semibold leading-[100%] text-[#4D4D4D]">
          {t('share')}
        </span>
        <Image
          src="/images/share.png"
          alt={t('share')}
          width={20}
          height={20}
          className="object-contain"
        />
      </div>
    </div>
  );
};

export default TopBarBeachRight;
