'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { resolveBadgeIcon } from '@/lib/utils/beach-badge-icons';
import type { BeachBadge } from '@/lib/utils/beach-badges';
import React from 'react';
import { useBeachEmbedded } from '@/components/Beach/BeachEmbedContext';

interface BottomBadgesBeachProps {
  badges: BeachBadge[];
  description?: string;
  onReadMore?: () => void;
  readMoreHref?: string;
}

const BottomBadgesBeach: React.FC<BottomBadgesBeachProps> = ({
  badges,
  description,
  onReadMore,
  readMoreHref = '#beach-details',
}) => {
  const t = useTranslations('BottomBadgesBeach');
  const tCommon = useTranslations('Common');
  // Beach map panel (≤ 720px): the phone layout (description card only; the badges are in the details below)
  const embedded = useBeachEmbedded();

  const desc = description?.trim();

  const renderReadMore = () => {
    const label = tCommon('readMore');
    const [left, right] = label.split('>');
    return (
      <span className="inline-flex items-center gap-1 font-figtree text-[10px] font-medium leading-[100%] text-[#8D8D8D] underline">
        <span>{left?.trim()}</span>
        <span className="text-[12px]">{'>'}</span>
        {right ? <span>{right}</span> : null}
      </span>
    );
  };

  return (
    <div className="w-full">
      <div className="container mx-auto px-4">
        {/* Fixed height 100px so 50/50 overlap is stable */}
        <div
          className={`grid h-[100px] grid-cols-1 gap-3 rounded-[10px] sm:gap-4 ${
            embedded ? '' : 'lg:grid-cols-[auto_minmax(260px,1fr)]'
          }`}
        >
          {/* Badges (hidden below lg). On lg show first 6; on xl show up to 9. */}
          <div className={embedded ? 'hidden' : 'hidden h-full w-full overflow-hidden lg:flex'}>
            <div className="flex h-full flex-nowrap items-stretch gap-2 sm:gap-3">
              {badges.map((b, i) => {
                const label = b.labelKey ? t(`badges.${b.labelKey}`) : (b.label ?? '');
                const visibility = i < 6 ? 'flex' : 'hidden xl:flex'; // Show only first 6 on lg, all 9 on xl

                return (
    <div
      key={b.key}
      className={`
        ${visibility}
        flex flex-col items-center justify-center
        h-full w-[100px] max-w-[100px]
        rounded-[10px] bg-[#E8F6FF] px-2 shadow-sm
      `}
    >
      <Image
        src={resolveBadgeIcon(b.icon)}
        alt={label}
        width={35}
        height={35}
        className="mx-auto h-[35px] w-[35px] object-contain"
      />
      <span className="mt-1 text-center font-figtree text-[14px] font-bold leading-[100%] text-[#0069AB]">
        {label}
      </span>
    </div>
  );
})}
            </div>
          </div>

          {/* Right text card (full width below lg; always 100px tall; read-more pinned).
              Only when the beach has a description; most beaches have none yet. */}
          {desc && (
          <div className="flex h-[100px] flex-col overflow-hidden rounded-[10px] bg-[#F5F5F5] p-3 sm:p-4">
            <p
              className="overflow-hidden text-ellipsis font-figtree text-[12px] leading-4 text-[#4D4D4D]"
              style={{
                display: '-webkit-box',
                WebkitBoxOrient: 'vertical',
                WebkitLineClamp: 2,
                maxHeight: '3rem',
              }}
            >
              {desc}
            </p>
            <div className="mt-auto">
              {onReadMore ? (
                <button type="button" onClick={onReadMore}>
                  {renderReadMore()}
                </button>
              ) : (
                <a href={readMoreHref} className="inline-block">
                  {renderReadMore()}
                </a>
              )}
            </div>
          </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BottomBadgesBeach;
