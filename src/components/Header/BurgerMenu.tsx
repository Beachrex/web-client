'use client';

import { ChevronRight } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import Image from 'next/image';
import { useState } from 'react';


import { Link } from '@/i18n/routing';

import enMenu from 'public/menu_en.json';
import siMenu from 'public/menu_si.json';
import QuickMenu from './QuickMenu';

/* ------------------------------------------------------------------
 * Types
 * ------------------------------------------------------------------ */

interface MenuItem {
  label: string;
  href: string;
  icon?: string;
  subItems?: MenuItem[];
  enabled?: boolean;
}

/* ------------------------------------------------------------------
 * Component
 * ------------------------------------------------------------------ */

const BurgerMenu = () => {
  const [isOpen, setIsOpen] = useState(false);

  const locale = useLocale();
  const tCommon = useTranslations('Common');

  const menuItems: MenuItem[] =
    locale === 'si' ? siMenu.MenuItems : enMenu.MenuItems;

  const toggleMenu = () => setIsOpen(prev => !prev);
  const closeMenu = () => setIsOpen(false);

  return (
    <div className="relative bg-variable-collection-ultra-light-grey">
      {/* ================= HEADER ================= */}
      <QuickMenu isOpen={isOpen} toggleMenu={toggleMenu} />

      {/* ================= BURGER PANEL ================= */}
      <div
        className={`
          absolute left-0 top-full z-50
          w-full max-w-[400px]
          bg-variable-collection-ultra-light-grey
          border-t border-[#E7E7E7]
          h-auto
          ${isOpen ? 'menu-enter pointer-events-auto' : 'menu-exit pointer-events-none'}
        `}
        style={{ boxShadow: 'var(--drop)' }}
      >
        {/* FULL HEIGHT LAYOUT */}
        <div className="flex flex-col h-full pl-[100px] pr-[50px]">
          {/* ================= TOP ================= */}
          <div className="flex flex-col">
            {/* MENU LINKS */}
            <nav className="flex flex-col mt-6">
             {menuItems
  .filter(item => item.enabled !== false)
  .map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMenu}
                  className={`
                    flex items-center justify-between
                    py-2
                    border-b border-[#E7E7E7]
                    hover:bg-white/60
                    transition-colors
                  `}
                >
                  <div className="flex items-center gap-6">
                    {item.icon && (
                      <Image
                        src={item.icon}
                        alt={item.label}
                        width={26}
                        height={26}
                      />
                    )}

                    <span className="font-figtree text-[14px] font-bold leading-[100%] text-[#4D4D4D]">
                      {item.label}
                    </span>
                  </div>

                  <ChevronRight size={18} className="text-[#B0B0B0]" />
                </Link>
              ))}
            </nav>

            {/* CTA BUTTONS */}
            <div className="flex flex-col gap-3 mt-12">
              <Link
                href="/beach-map"
                onClick={closeMenu}
                className={`
                  flex items-center justify-center gap-3
                  w-full h-[41px] rounded-lg
                  bg-[#1A3C68]
                `}
              >
                <Image
src="/images/map.png" alt="" width={26}
height={26}
                />
                <span className="text-white font-figtree text-[14px] font-bold leading-[100%]">
                  {tCommon('mapButtonFilter')}
                </span>
              </Link>
              {/*
              <Link
                href="/nastanitev"
                onClick={closeMenu}
                className={`
                  flex items-center justify-center gap-3
                  w-full h-[41px] rounded-lg
                  bg-[#008260]
                `}
              >
                <Image
                  src="/images/accomodation.svg"
                  alt=""
                  width={26}
                  height={26}
                />
                <span className="text-white font-figtree text-[14px] font-bold leading-[100%]">
                  {tCommon('accommodations')}
                </span>
              </Link>
              */}
            </div>
          </div>

          {/* ================= BOTTOM ================= */}
          <div className="mt-24 flex flex-col items-center gap-10 pb-8">
            {/*
            <Link
              href="/mobilna-aplikacija"
              onClick={closeMenu}
              className={`
                flex items-center justify-center gap-3
                w-full h-[41px] rounded-lg
                bg-white
              `}
            >
              <Image
                src="/images/menu/app.svg"
                alt=""
                width={26}
                height={26}
              />
              <span className="text-[#4D4D4D] font-figtree text-[14px] font-bold leading-[100%]">
                {tCommon('mobileApp')}
              </span>
            </Link>
            */}
          {/*
<div className="flex items-center gap-4">
  <Image src="/images/menu/FB.svg" alt="Facebook" width={26} height={26} />
  <Image src="/images/menu/INSTA.svg" alt="Instagram" width={26} height={26} />
  <Image src="/images/menu/YT.svg" alt="YouTube" width={26} height={26} />
</div>
*/}

          </div>
        </div>
      </div>
    </div>
  );
};

export default BurgerMenu;
