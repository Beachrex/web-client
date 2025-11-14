'use client';

import { useTranslations } from 'next-intl';
import React from 'react';

interface SingleValueProps {
  /** BeachDetails.values.* key (e.g. "easy", "high") */
  valueKey?: string;
  /** Or raw value (e.g. 750). If provided, it has priority. */
  valueRaw?: React.ReactNode;
  /** Optional unit under BeachDetails.values.unit.*, e.g. "meters" */
  unitKey?: string;
  className?: string;
}

const SingleValue: React.FC<SingleValueProps> = ({
  valueKey,
  valueRaw,
  unitKey,
  className = '',
}) => {
  const tValues = useTranslations('BeachDetails.values');

  const content =
    valueRaw !== undefined && valueRaw !== null && valueRaw !== '' ? (
      <>
        {valueRaw}
        {unitKey ? <> {tValues(`unit.${unitKey}`)}</> : null}
      </>
    ) : valueKey ? (
      <>{tValues(valueKey)}</>
    ) : null;

  if (content === null) return null;

  return (
    <span className={`block font-figtree text-[14px] font-medium leading-[100%] text-[#4D4D4D] ${className}`}>
      {content}
    </span>
  );
};

export default SingleValue;
