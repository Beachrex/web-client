'use client';

import { useTranslations } from 'next-intl';
import React from 'react';

interface Props {
  /** i18n key under BeachDetails.labels.* (e.g. "naturalFeatures") */
  labelKey?: string;
  /** Array of value keys under BeachDetails.values.* (e.g. ["sand","pebble","grass"]) */
  itemKeys: string[];
  /** Optional icon at the label line */
  icon?: React.ReactNode;
  /** When empty, hide the whole block (default true) */
  hideIfEmpty?: boolean;
  className?: string;
}

const PillList: React.FC<Props> = ({
  labelKey,
  itemKeys,
  icon,
  hideIfEmpty = true,
  className,
}) => {
  const tLabels = useTranslations('BeachDetails.labels');
  const tValues = useTranslations('BeachDetails.values');

  if (hideIfEmpty && (!itemKeys || itemKeys.length === 0)) return null;

  return (
    <div className={className}>
      {labelKey ? (
        <div className="mb-2 flex items-center gap-2">
          {icon ? <span aria-hidden>{icon}</span> : null}
          <span className="font-figtree text-sm font-semibold text-[#4D4D4D]">
            {tLabels(labelKey)}
          </span>
        </div>
      ) : null}

      <ul className="flex flex-wrap items-center gap-2">
        {itemKeys.map((k) => (
          <li key={k}>
            <span
              className="
                inline-flex items-center rounded-full
                px-3 py-1
                text-xs font-figtree font-bold
                text-[#0069AB] bg-[#E8F6FF]
              "
            >
              {tValues(k)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PillList;
