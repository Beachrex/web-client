import Link from 'next/link';
import React from 'react';

interface LocationPillProps {
  /** Full place name: shown when the pill opens, and the accessible name of the link. */
  name: string;
  /** Page of this place; without it the pill is not a link and does not open. */
  href?: string | null;
  /** Background colour class of this level (continent purple, country red, …). */
  colorClass: string;
  /** First pill in the row: no overlap with a previous pill. */
  first?: boolean;
  /** Collapsed content: an icon, or a short label. */
  children: React.ReactNode;
  /** True when `children` is a short text label (the open tab shows only the full name); false for an icon. */
  textLabel?: boolean;
}

/**
 * One location pill on a place or beach banner (owner, 2026-10-29). Collapsed it shows the icon or the short
 * label as before; on hover or keyboard focus a tab in the same colour slides open over the following pills
 * with the full name, and a click opens the place.
 *
 * The tab is drawn on top (absolute, clip-path animation) and ignores the pointer, so nothing in the layout moves:
 * moving the mouse to the next pill opens that one instead of shifting the row under the cursor.
 * No animation with `prefers-reduced-motion`.
 */
export default function LocationPill({
  name,
  href,
  colorClass,
  first = false,
  children,
  textLabel = false,
}: LocationPillProps) {
  const box = [
    'flex h-full min-w-[54px] shrink-0 items-center justify-center rounded-l-[10px] px-[10px]',
    'font-figtree text-[14px] font-bold text-white whitespace-nowrap',
    colorClass,
    first ? '' : '-ml-[7px]',
  ].join(' ');

  if (!href) {
    return (
      <div className={box} title={name}>
        {children}
      </div>
    );
  }

  return (
    <Link
      href={href}
      aria-label={name}
      title={name}
      className={[
        box,
        'group/pill relative cursor-pointer hover:z-20 focus-visible:z-20',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white',
      ].join(' ')}
    >
      <span aria-hidden="true" className="flex items-center">
        {children}
      </span>
      <span
        aria-hidden="true"
        className={[
          'pointer-events-none absolute inset-y-0 left-0 flex items-center gap-[8px] rounded-[10px] px-[12px]',
          'shadow-[0_2px_8px_rgba(0,0,0,0.25)]',
          colorClass,
          '[clip-path:inset(0_100%_0_0_round_10px)] opacity-0',
          'transition-[clip-path,opacity] duration-300 ease-out motion-reduce:transition-none',
          'group-hover/pill:[clip-path:inset(0_0_0_0_round_10px)] group-hover/pill:opacity-100',
          'group-focus-visible/pill:[clip-path:inset(0_0_0_0_round_10px)] group-focus-visible/pill:opacity-100',
        ].join(' ')}
      >
        {!textLabel && children}
        {name}
      </span>
    </Link>
  );
}
