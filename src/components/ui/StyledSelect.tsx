'use client';

import clsx from 'clsx';

interface Option {
  value: string;
  label: string;
}

interface StyledSelectProps {
  value?: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  className?: string;
}

export default function StyledSelect({
  value,
  onChange,
  options,
  placeholder = 'Select an option',
  className,
}: StyledSelectProps) {
  return (
   <select
  value={value ?? ''}
  onChange={(e) => onChange(e.target.value)}
  className={clsx(
    `
    w-full
    px-3 py-2
    text-sm
    rounded-lg
    bg-white
    outline-none
    transition
    border
    `,
    value
      ? 'border-[#1A3C68] ring-1 ring-[#1A3C68]'
      : 'border-gray-300',
    className
  )}
   >


      <option value="">{placeholder}</option>

      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
