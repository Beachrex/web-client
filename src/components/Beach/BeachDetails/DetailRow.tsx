'use client';

import { useTranslations } from 'next-intl';
import React from 'react';

interface Props {
  /** i18n key under BeachDetails.labels.* (e.g. "type", "length") */
  labelKey: string;
  /**
   * Value key under BeachDetails.values.* (e.g. "sand", "medium").
   * If you already have a formatted raw value, use `valueRaw` instead.
   */
  valueKey?: string | null;
  /**
   * Raw printed value (e.g. numeric 750). Takes precedence when provided.
   * Will be rendered as-is (optionally with unit).
   */
  valueRaw?: React.ReactNode;
  /**
   * Optional unit key under BeachDetails.values.unit.* (e.g. "meters").
   * Used only when valueRaw is provided.
   */
  unitKey?: string;
  /** Optional left icon */
  icon?: React.ReactNode;
  /** Optional custom formatter when you want full control over the value render */
  renderValue?: () => React.ReactNode;
  /** Hide the whole row if there is no value */
  hideIfEmpty?: boolean;
  className?: string;
}

const DetailRow: React.FC<Props> = ({
  labelKey,
  valueKey,
  valueRaw,
  unitKey,
  icon,
  renderValue,
  hideIfEmpty = true,
  className,
}) => {
  const tLabels = useTranslations('BeachDetails.labels');
  const tValues = useTranslations('BeachDetails.values');

  // Resolve value
  let content: React.ReactNode = null;

  if (renderValue) {
    content = renderValue();
  } else if (valueRaw !== undefined && valueRaw !== null && valueRaw !== '') {
    // Raw value path, optionally append translated unit
    content = (
      <>
        {valueRaw}
        {unitKey ? <> {tValues(`unit.${unitKey}`)}</> : null}
      </>
    );
  } else if (valueKey) {
    // Translate from values dictionary
    content = tValues(valueKey);
  }

  if (
    hideIfEmpty &&
    (content === null || content === undefined || content === '')
  ) {
    return null;
  }

  return (
    <div
      className={`flex w-full items-start justify-between gap-3 rounded-md ${className ?? ''}`}
      role="group"
      aria-label={tLabels(labelKey)}
    >
      <div className="flex min-w-0 items-center gap-2">
        {icon ? (
          <span aria-hidden className="shrink-0">
            {icon}
          </span>
        ) : null}
        <span className="shrink-0 font-figtree text-sm font-semibold text-[#4D4D4D]">
          {tLabels(labelKey)}
        </span>
      </div>

      <div className="min-w-0">
        <span className="block truncate text-right font-figtree text-sm font-bold text-[#222]">
          {content}
        </span>
      </div>
    </div>
  );
};

export default DetailRow;
