'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

export interface DropdownOption {
  value: string;
  label: string;
  icon?: string;
}

interface DropdownProps {
  value: string;
  options: DropdownOption[];
  onChange: (value: string) => void;

  buttonBg?: string;
  menuBg?: string;
  showIcons?: boolean;
  hideShadow?: boolean;
  hideActiveLabel?: boolean;

  ariaLabel?: string;
}

export default function Dropdown({
  value,
  options,
  onChange,
  buttonBg = '#E7E7E7',
  menuBg = '#E7E7E7',
  showIcons = true,
  hideActiveLabel = false,
  hideShadow = false,
  ariaLabel,
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const active = options.find(o => o.value === value);

  // close on outside click
  useEffect(() => {
    if (!open) return;

    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      {/* BUTTON */}
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={() => setOpen(v => !v)}
      className={`
  flex h-[41px] items-center gap-2
  rounded-[8px]
  px-3
  whitespace-nowrap
  font-figtree text-[14px] font-semibold text-[#4D4D4D]
  ${hideShadow ? '' : 'shadow-[0px_0px_4px_0px_#00000033]'}
  focus:outline-none
  focus-visible:ring-2
  focus-visible:ring-[#FF8000]
`}

        style={{ backgroundColor: buttonBg }}
      >
      {showIcons && active?.icon && (
  <Image
    src={active.icon}
    width={20}
    height={20}
    alt=""
  />
)}

{!hideActiveLabel && (
  <span>{active?.label}</span>
)}


        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          className={`ml-1 transition-transform ${open ? 'rotate-180' : ''}`}
        >
          <polyline
            points="6 9 12 15 18 9"
            fill="none"
            stroke="#4D4D4D"
            strokeWidth="2"
          />
        </svg>
      </button>

      {/* MENU */}
      {open && (
        <div
          role="menu"
          className="
            absolute left-0 mt-2
            min-w-full
            w-max
            rounded-[10px]
            shadow-[0px_0px_4px_0px_#00000033]
            overflow-hidden
            z-50
          "
          style={{ backgroundColor: menuBg }}
        >
          {options.map(opt => (
            <button
              key={opt.value}
              type="button"
              role="menuitem"
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className={`
  flex w-full items-center gap-3 px-4 py-2
  whitespace-nowrap
  text-[14px] font-medium text-[#4D4D4D]
  hover:bg-[#E5F2FB]
  ${opt.value === value ? 'bg-[#E5F2FB]' : ''}
`}

            >
              {showIcons && opt.icon && (
                <Image
                  src={opt.icon}
                  width={18}
                  height={18}
                  alt=""
                />
              )}
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}


export function MediaToggleInline({
  mediaMode,
  setMediaMode,
  label,
}: {
  mediaMode: 'gallery' | 'sphere' | 'video' | 'webcam';
  setMediaMode: (m: 'gallery' | 'sphere' | 'video' | 'webcam') => void;
  label: string;
}) {
  return (
    <div className="flex items-center gap-[10px] rounded-[6px] bg-[#E7E7E7] px-[8px] py-[6px]">
      <span className="font-figtree text-[14px] font-semibold text-[#4D4D4D]">
        {label}
      </span>

      <div className="flex items-center gap-[10px]">
        <MediaButton
          active={mediaMode === 'gallery'}
          icon="/images/beachmedia/photo.png"
          onClick={() => setMediaMode('gallery')}
        />

        <Divider />

        <MediaButton
          active={mediaMode === 'webcam'}
          icon="/images/beachmedia/video-icon-white.png"
          onClick={() => setMediaMode('webcam')}
        />

        <Divider />

        <MediaButton
          active={mediaMode === 'sphere'}
          icon="/images/beachmedia/360-degree-white.png"
          onClick={() => setMediaMode('sphere')}
        />

        <Divider />

        <MediaButton
          active={mediaMode === 'video'}
          icon="/images/beachmedia/play-button-arrowhead-white.png"
          onClick={() => setMediaMode('video')}
        />
      </div>
    </div>
  );
}


function MediaButton({
  active,
  icon,
  onClick,
}: {
  active: boolean;
  icon: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative p-1 rounded-[6px] transition-all ${
        active
          ? 'bg-[#D9EBF6] shadow-inner'
          : 'opacity-60 hover:opacity-100'
      }`}
    >
      <Image
        src={icon}
        width={24}
        height={24}
        alt=""
      />
      {active && (
        <span className="absolute left-0 right-0 -bottom-[3px] mx-auto h-[2px] w-[14px] bg-[#1A3C68] rounded-full" />
      )}
    </button>
  );
}

function Divider() {
  return <div className="h-[25px] w-[1px] bg-white" />;
}
