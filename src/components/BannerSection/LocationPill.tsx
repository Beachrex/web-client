import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

interface LocationPillProps {
  /** Full place name: shown when the pill opens, and the accessible name of the link. */
  name: string;
  /** Page of this place; without it the pill is not a link and does not open. */
  href?: string | null;
  /** Background colour class of this level (continent purple, country red, …). */
  colorClass: string;
  /** Text colour class of this level, for the level word and the count (same as the place page's main bar). */
  accentTextClass: string;
  /** Level word shown in the white pill of the open tab ("Država", "Regija", …). */
  levelLabel: string;
  /** Published beaches in this place; omitted or null: the tab has no count box (never a wrong number). */
  beachCount?: number | null;
  /** Label before the count ("Plaže:"). */
  beachCountLabel: string;
  /** First pill in the row: no overlap with a previous pill. */
  first?: boolean;
  /** Collapsed content: an icon, or a short label. */
  children: React.ReactNode;
}

/**
 * One location pill on a place or beach banner (owner, 2026-10-29). Collapsed it shows the icon or the short
 * label; on hover or keyboard focus a tab in the same colour slides open over the following pills and looks like
 * the main bar of that place's own page: the level word in a white pill, the full name, and the beach count box.
 * A click opens the place.
 *
 * The tab is drawn on top (absolute, clip-path animation) and ignores the pointer, so nothing in the layout moves:
 * moving the mouse to the next pill opens that one instead of shifting the row under the cursor. `w-max` lets the
 * tab size to its content rather than to the pill (the containing block), so the name is never cut and the tab
 * fully covers the pills it overlaps. No animation with `prefers-reduced-motion`.
 */
export default function LocationPill({
  name,
  href,
  colorClass,
  accentTextClass,
  levelLabel,
  beachCount,
  beachCountLabel,
  first = false,
  children,
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
      className={[
        box,
        'group/pill relative cursor-pointer hover:z-20 focus-visible:z-20',
        // The focus ring is drawn on the open tab (below), which covers the pill; here it would be half hidden.
        'focus-visible:outline-none',
      ].join(' ')}
    >
      <span aria-hidden="true" className="flex items-center">
        {children}
      </span>
      <span
        aria-hidden="true"
        data-pill-tab=""
        className={[
          'pointer-events-none absolute inset-y-0 left-0 flex w-max items-center gap-[10px] rounded-[10px] px-[12px]',
          'shadow-[0_2px_8px_rgba(0,0,0,0.25)]',
          colorClass,
          '[clip-path:inset(0_100%_0_0_round_10px)] opacity-0',
          'transition-[clip-path,opacity] duration-300 ease-out motion-reduce:transition-none',
          'group-hover/pill:[clip-path:inset(0_0_0_0_round_10px)] group-hover/pill:opacity-100',
          'group-focus-visible/pill:[clip-path:inset(0_0_0_0_round_10px)] group-focus-visible/pill:opacity-100',
          'group-focus-visible/pill:ring-2 group-focus-visible/pill:ring-inset group-focus-visible/pill:ring-white',
        ].join(' ')}
      >
        {/* Same pieces as TopBar's main bar, one step smaller so the tab reads well over the row. */}
        <span
          className={[
            'flex items-center justify-center rounded-full bg-white px-[10px] py-[3px]',
            'font-figtree text-[16px] font-bold leading-[100%]',
            accentTextClass,
          ].join(' ')}
        >
          {levelLabel}
        </span>
        <span className="font-figtree text-[24px] font-bold leading-[100%] text-white">{name}</span>
        {typeof beachCount === 'number' && (
          <span className="flex h-[36px] items-center gap-[6px] rounded-[6px] bg-white px-[10px]">
            <Image
src="/images/beach-black.png" alt="" width={22}
height={22} />
            <span className="font-figtree text-[14px] font-medium leading-[100%] text-[#222222]">
              {beachCountLabel}
            </span>
            <span className={['font-figtree text-[14px] font-bold', accentTextClass].join(' ')}>{beachCount}</span>
          </span>
        )}
      </span>
    </Link>
  );
}
