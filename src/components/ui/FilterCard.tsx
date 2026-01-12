'use client';

import Image from 'next/image';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface FilterCardProps {
  title: React.ReactNode;
  icon?: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

export default function FilterCard({
  title,
  icon,
  isOpen,
  onToggle,
  children,
}: FilterCardProps) {
  return (
    <div
className="
  w-full
  border border-gray-200
  rounded-lg
  overflow-visible
  sm:max-w-[300px]
"

    onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex justify-between items-center px-4 py-3 hover:bg-gray-50 transition-colors rounded-lg"
      >
        <div className="flex items-center gap-2">
          {icon && (
            <Image
              src={icon}
              alt=""
              width={20}
              height={20}
              className="object-contain"
            />
          )}
          <h3 className="font-semibold text-sm">{title}</h3>
        </div>

        {isOpen ? (
          <ChevronUp className="text-gray-500" />
        ) : (
          <ChevronDown className="text-gray-500" />
        )}
      </button>

      {isOpen && <div className="px-4 pb-3">{children}</div>}
    </div>
  );
}
