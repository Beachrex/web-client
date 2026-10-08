'use client';

import { useMemo, useState } from 'react';
import { HiX } from 'react-icons/hi';
import { type CustomFlowbiteTheme, Sidebar } from 'flowbite-react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import QuickMenu from './QuickMenu';
import Image from 'next/image';
import { ChevronRight } from 'lucide-react';
import { useContinents } from '@/hooks/useContinents';
import { useCountries } from '@/hooks/useCountries';
import { staticPageUrl, useFooterStaticPages } from '@/hooks/useStaticPages';
import { FEATURES } from '@/lib/constants/features';
import { buildMenuItems, type MenuItem } from '@/lib/utils/menu-items';
import { buildBeachMapUrl } from '@/lib/utils/beach-urls';

const sidebarTheme: CustomFlowbiteTheme['sidebar'] = {
  root: {
    base: 'fixed inset-y-0 left-0 z-50',
    inner: 'h-full overflow-y-auto overflow-x-hidden bg-[#F5F5F5] p-0',
  },
};

// Recursive component for rendering nested menu
const NestedMenu = ({
  items,
  closeMenu,
}: {
  items: MenuItem[];
  closeMenu: () => void;
}) => {
  return (
    <ul className="pl-4">
      {items.map((item, index) => (
        <MenuItemComponent key={index} item={item} closeMenu={closeMenu} />
      ))}
    </ul>
  );
};

// Individual menu item component
const MenuItemComponent: React.FC<{
  item: MenuItem;
  closeMenu: () => void;
}> = ({ item, closeMenu }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    if (item.subItems && item.subItems.length > 0) {
      setIsOpen((prev) => !prev);
    } else {
      closeMenu();
    }
  };

  return (
    <li className="mb-1">
      <div
        onClick={toggleMenu}
        className="relative ml-[100px] mr-[50px] flex w-[250px] cursor-pointer items-center justify-between border-b border-[#E7E7E7] py-2 pl-6 transition-colors hover:bg-white/60"
      >
        {item.subItems?.length ? (
          <span
            className={`absolute left-0 top-1/2 -translate-y-1/2 text-xs transition-transform ${isOpen ? 'rotate-90' : ''} `}
          >
            ➔
          </span>
        ) : null}

        {item.subItems?.length ? (
          <span className="flex flex-1 items-center gap-2">
            {typeof item.icon === 'string' && item.icon !== '' && (
              <Image
                src={item.icon}
                alt={item.label}
                width={26}
                height={26}
                className="shrink-0"
              />
            )}
            <span className="font-figtree text-[14px] font-bold leading-[100%] text-[#4D4D4D]">
              {item.label}
            </span>
          </span>
        ) : (
          <Link
            href={item.href}
            className="flex flex-1 items-center gap-2"
            onClick={closeMenu}
          >
            {typeof item.icon === 'string' && item.icon !== '' && (
              <Image
                src={item.icon}
                alt={item.label}
                width={26}
                height={26}
                className="shrink-0"
              />
            )}
            <span className="font-figtree text-[14px] font-bold leading-[100%] text-[#4D4D4D]">
              {item.label}
            </span>
          </Link>
        )}

        <ChevronRight size={18} className="text-[#B0B0B0]" />
      </div>

      {isOpen && item.subItems && (
        <NestedMenu items={item.subItems} closeMenu={closeMenu} />
      )}
    </li>
  );
};

/* ------------------------------------------------------------------ */
/* Burger menu                                                         */
/* ------------------------------------------------------------------ */

const BurgerMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const locale = useLocale();
  const t = useTranslations('Menu');
  const tCommon = useTranslations('Common');
  const tAI = useTranslations('AI.landing');
  const { continents } = useContinents();
  const { countries } = useCountries();
  const staticPages = useFooterStaticPages();

  // Built from API data: continents and countries with beaches, CMS pages by code.
  const menuItems = useMemo(
    () =>
      buildMenuItems({
        locale,
        continents,
        countries,
        aboutUrl: staticPageUrl(staticPages, 'about-us', locale),
        contactUrl: staticPageUrl(staticPages, 'contact', locale),
        labels: {
          browseBeaches: t('browseBeaches'),
          topCountries: t('topCountries'),
          aiAssistant: tAI('title'),
          aiChat: t('aiChat'),
          aiItinerary: t('aiItinerary'),
          about: tCommon('quickMenuAboutUs'),
          contact: t('contact'),
        },
      }),
    [locale, continents, countries, staticPages, t, tCommon, tAI],
  );

  const closeMenu = () => setIsOpen(false);

  return (
    <div className="relative h-[61px] bg-variable-collection-ultra-light-grey">
      <QuickMenu toggleMenu={() => setIsOpen((prev) => !prev)} />

      {isOpen && (
        <div className="fixed inset-0 z-40 bg-black/60" onClick={closeMenu} />
      )}

      <Sidebar
        id="sidebar"
        theme={sidebarTheme}
        className={`w-full max-w-[450px] shadow-[0_0_4px_0_#00000033] transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'} `}
      >
        <Sidebar.Items className="h-full">
          <Sidebar.ItemGroup className="flex h-full flex-col">
            {/* HEADER */}
            <div className="flex justify-end p-4">
              <button onClick={closeMenu}>
                <HiX className="h-6 w-6 text-gray-800" />
              </button>
            </div>

            {/* MENU (SCROLL) */}
            <div className="flex-1 overflow-y-auto">
              <NestedMenu items={menuItems} closeMenu={closeMenu} />

              {/* CTA (NOT STICKY, PART OF CONTENT) */}
              <div className="ml-[100px] mr-[50px] mt-10 flex w-[250px] flex-col gap-3">
                <Link
                  href={buildBeachMapUrl(locale)}
                  onClick={closeMenu}
                  className="flex h-[41px] items-center justify-center gap-3 rounded-lg bg-[#1A3C68] text-white transition-all duration-200 hover:bg-[#162f4f] hover:shadow-[0_4px_10px_rgba(26,60,104,0.25)] active:scale-[0.98]"
                >
                  <Image
src="/images/map.png" alt="" width={26}
height={26}
                  />
                  <span className="text-[14px] font-bold">
                    {tCommon('mapButtonFilter')}
                  </span>
                </Link>

                {/* Accommodation: hidden for launch (no route yet) */}
                {FEATURES.accommodation && (
                <Link
                  href={`/${locale}/accommodations`}
                  onClick={closeMenu}
                  className="flex h-[41px] items-center justify-center gap-3 rounded-lg bg-[#008260] text-white transition-all duration-200 hover:bg-[#006b4f] hover:shadow-[0_4px_10px_rgba(0,130,96,0.25)] active:scale-[0.98]"
                >
                  <Image
                    src="/images/accomodation.svg"
                    alt=""
                    width={26}
                    height={26}
                  />
                  <span className="text-[14px] font-bold">{tCommon('accommodations')}</span>
                </Link>
                )}
              </div>
            </div>

          </Sidebar.ItemGroup>
        </Sidebar.Items>
      </Sidebar>
    </div>
  );
};

export default BurgerMenu;
