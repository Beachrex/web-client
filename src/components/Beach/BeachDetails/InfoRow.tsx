'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import React from 'react';

interface InfoRowProps {
  labelKey?: string;
  labelVariant?: 'pill' | 'text' | 'none'; // <— NOVO
  iconSrc?: string;
  iconAlt?: string;
  iconW?: number;
  iconH?: number;
  children: React.ReactNode;
  hideIfEmpty?: boolean;
  className?: string;
}

const InfoRow: React.FC<InfoRowProps> = ({
  labelKey,
  labelVariant = 'pill',           // privzeto pill za Plaža / Parkirišče / Pot do plaže
  iconSrc,
  iconAlt,
  iconW = 16,
  iconH = 16,
  children,
  hideIfEmpty = true,
  className = '',
}) => {
  const tLabels = useTranslations('BeachDetails.labels');

  if (hideIfEmpty && (children === null || children === undefined)) return null;

  const showLeft = labelVariant !== 'none' && labelKey;

  return (
    <div className={`flex items-center gap-4 py-2 ${className}`}>
      {/* LEFT */}
      {showLeft ? (
        <div className="shrink-0">
          {labelVariant === 'pill' ? (
            <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1">
              {iconSrc ? (
                <Image
                  src={iconSrc}
                  alt={iconAlt ?? tLabels(labelKey)}
                  width={iconW}
                  height={iconH}
                  className="inline-block object-contain"
                />
              ) : null}
              <span className="font-figtree text-[14px] font-bold leading-[100%] text-[#4D4D4D]">
                {tLabels(labelKey)}
              </span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-2">
              {iconSrc ? (
                <Image
                  src={iconSrc}
                  alt={iconAlt ?? tLabels(labelKey)}
                  width={iconW}
                  height={iconH}
                  className="inline-block object-contain"
                />
              ) : null}
              <span className="font-figtree text-[14px] font-bold leading-[100%] text-[#4D4D4D]">
                {tLabels(labelKey)}
              </span>
            </span>
          )}
        </div>
      ) : null}

      {/* RIGHT */}
      <div className={`min-w-0 ${showLeft ? 'flex-1' : ''}`}>
        {children}
      </div>
    </div>
  );
};


export default InfoRow;
