'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import React from 'react';

interface TickValueListProps {
  /** Array of BeachDetails.values.* keys */
  itemKeys: string[];
  /** Path to tick icon (as requested: /images/beachicon/tick.png) */
  tickSrc?: string;
  tickW?: number;
  tickH?: number;
  className?: string;
}

const TickValueList: React.FC<TickValueListProps> = ({
  itemKeys,
  tickSrc = '/images/beachicons/tick.png', // as you specified
  tickW = 16,
  tickH = 16,
  className = '',
}) => {
  const tValues = useTranslations('BeachDetails.values');

  if (!itemKeys || itemKeys.length === 0) return null;

  return (
    <ul className={`grid gap-2 ${className}`}>
      {itemKeys.map((k) => (
        <li key={k} className="flex items-center gap-2">
          <Image
            src={tickSrc}
            alt=""
            width={tickW}
            height={tickH}
            className="inline-block object-contain"
            aria-hidden
          />
          <span className="font-figtree text-[14px] font-medium leading-[100%] text-[#4D4D4D]">
            {tValues(k)}
          </span>
        </li>
      ))}
    </ul>
  );
};

export default TickValueList;
