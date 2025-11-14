'use client';

import React from 'react';

export interface DistanceOption {
  value: string | number;
  label: string;
}

interface DistanceDropdownProps {
  value?: string | number;
  options: DistanceOption[];
  onChange?: (value: string | number) => void;
  ariaLabel: string;
  className?: string;

  renderOptionLabel?: (option: DistanceOption) => string;
}

const DistanceDropdown: React.FC<DistanceDropdownProps> = ({
  value,
  options,
  onChange,
  ariaLabel,
  className = '',
  renderOptionLabel,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const raw = e.target.value;

    onChange?.(raw);
  };

  return (
    <label className={`flex items-center gap-2 ${className}`}>
      <span className="sr-only">{ariaLabel}</span>

      <select
        className="rounded-md border border-gray-300 bg-white px-4 py-2 font-figtree text-[14px] font-semibold text-[#4D4D4D] focus:outline-none focus:ring-2 focus:ring-[#5E1CA5]"
        value={value ?? options[0]?.value ?? ''}
        onChange={handleChange}
        aria-label={ariaLabel}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {renderOptionLabel ? renderOptionLabel(opt) : opt.label}
          </option>
        ))}
      </select>
    </label>
  );
};

export default DistanceDropdown;
