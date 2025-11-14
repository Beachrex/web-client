'use client';

import { Check } from 'lucide-react';
import { useTranslations } from 'next-intl';
import React from 'react';

interface Props {
  /** i18n key under BeachDetails.labels.* (e.g. "userType") */
  labelKey?: string;
  /** Array of value keys under BeachDetails.values.* (e.g. ["familyBeach"]) */
  itemKeys: string[];
  /** Optional icon at the label line */
  icon?: React.ReactNode;
  /** When empty, hide the whole block (default true) */
  hideIfEmpty?: boolean;
  className?: string;
}

const TickList: React.FC<Props> = ({
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

      {/* Semantic list for accessibility */}
      <ul className="grid gap-2 sm:grid-cols-2">
        {itemKeys.map((k) => (
          <li key={k} className="flex items-start gap-2">
            <Check className="mt-[2px] h-4 w-4 shrink-0 text-[#1A9E4A]" aria-hidden />
            <span className="font-figtree text-sm font-medium text-[#222]">
              {tValues(k)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TickList;
