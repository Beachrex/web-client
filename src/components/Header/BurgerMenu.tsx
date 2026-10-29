'use client';

import { useMemo, useState } from 'react';
import { HiX } from 'react-icons/hi';
import { type CustomFlowbiteTheme, Sidebar } from 'flowbite-react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import QuickMenu from './QuickMenu';
import Image from 'next/image';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useContinents } from '@/hooks/useContinents';
import { useCountries } from '@/hooks/useCountries';
import { staticPageUrl, useFooterStaticPages } from '@/hooks/useStaticPages';
import { FEATURES } from '@/lib/constants/features';
import { buildMenuItems, type MenuItem } from '@/lib/utils/menu-items';
import { useSiteSettings } from '@/contexts/SiteSettingsContext';
import { buildBeachMapUrl } from '@/lib/utils/beach-urls';
import { useQuery } from '@tanstack/react-query';
import { getBeachFiltersOptions } from '@/lib/api-client/@tanstack/react-query.gen';
import { MENU_FILTER_GROUPS } from '@/config/menuBeachFilters';
import { resolveAllFilterOptions, resolveQuickFilters } from '@/lib/utils/quick-filters';

const sidebarTheme: CustomFlowbiteTheme['sidebar'] = {
  root: {
    base: 'fixed inset-y-0 left-0 z-50',
    inner: 'h-full overflow-y-auto overflow-x-hidden bg-[#F5F5F5] p-0',
  },
};

/** CGP v1.0 colour horizontal logo. */
const MENU_LOGO = '/brand/BeachRex_CGP/01_Logo/Horizontal/SVG/beachrex_horizontal_color.svg';

// Recursive component for rendering nested menu
const NestedMenu = ({
  items,
  closeMenu,
  level = 0,
}: {
  items: MenuItem[];
  closeMenu: () => void;
  level?: number;
}) => {
  return (
    <ul className={level > 0 ? 'bg-white/70' : ''}>
      {items.map((item, index) => (
        <MenuItemComponent
key={index} item={item} closeMenu={closeMenu}
level={level}
        />
      ))}
    </ul>
  );
};

const MenuIcon = ({ item }: { item: MenuItem }) =>
  typeof item.icon === 'string' && item.icon !== '' ? (
    <Image
src={item.icon} alt="" width={24}
height={24} className="h-6 w-6 shrink-0 object-contain"
    />
  ) : (
    <span className="h-6 w-6 shrink-0" aria-hidden />
  );

// Individual menu item component: full-width rows; groups expand in place, links close the menu.
const MenuItemComponent: React.FC<{
  item: MenuItem;
  closeMenu: () => void;
  level: number;
}> = ({ item, closeMenu, level }) => {
  const [isOpen, setIsOpen] = useState(false);
  const isGroup = Boolean(item.subItems?.length);
  const indent = level > 0 ? 'pl-12' : 'pl-5';
  const row = `flex w-full items-center gap-3 border-b border-[#E7E7E7] py-3 pr-5 text-left hover:bg-white ${indent}`;
  const label = (
    <span
      className={`flex-1 font-figtree leading-tight text-[#222222] ${level > 0 ? 'text-[14px] font-semibold' : 'text-[15px] font-bold'}`}
    >
      {item.label}
    </span>
  );

  return (
    <li>
      {isGroup ? (
        <button
type="button" onClick={() => setIsOpen((prev) => !prev)} aria-expanded={isOpen}
className={row}
        >
          <MenuIcon item={item} />
          {label}
          <ChevronDown
            size={18}
            className={`shrink-0 text-[#8D8D8D] transition-transform ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>
      ) : (
        <Link href={item.href} onClick={closeMenu} className={row}>
          <MenuIcon item={item} />
          {label}
          <ChevronRight size={18} className="shrink-0 text-[#B0B0B0]" />
        </Link>
      )}

      {isOpen && item.subItems && (
        <NestedMenu items={item.subItems} closeMenu={closeMenu} level={level + 1} />
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
  const tUi = useTranslations('UI');
  const { continents } = useContinents();
  const { countries } = useCountries();
  const staticPages = useFooterStaticPages();
  const { aiAssistantEnabled } = useSiteSettings();
  // Same query as the home category tiles (shared cache); labels in the visitor's language.
  const { data: filtersData } = useQuery(getBeachFiltersOptions({ query: {} as never }));
  const filterOptions = filtersData?.data as Parameters<typeof resolveQuickFilters>[1];

  // Built from API data: continents and countries with beaches, CMS pages by code.
  const menuItems = useMemo(
    () =>
      buildMenuItems({
        locale,
        continents,
        countries,
        aboutUrl: staticPageUrl(staticPages, 'about-us', locale),
        contactUrl: staticPageUrl(staticPages, 'contact', locale),
        showAi: aiAssistantEnabled,
        filterGroups: MENU_FILTER_GROUPS.map((group) => ({
          label: t(group.labelKey),
          icon: group.icon,
          tiles: group.allOptions
            ? resolveAllFilterOptions(
                group.allOptions.filterKey,
                group.allOptions.icons,
                group.allOptions.fallbackIcon,
                filterOptions,
              )
            : resolveQuickFilters(group.picks, filterOptions),
        })),
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
    [locale, continents, countries, staticPages, filterOptions, t, tCommon, tAI, aiAssistantEnabled],
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
        className={`w-full max-w-[420px] shadow-[0_0_4px_0_#00000033] transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'} `}
      >
        <Sidebar.Items className="h-full">
          <Sidebar.ItemGroup className="flex h-full flex-col">
            {/* HEADER */}
            <div className="flex items-center justify-between border-b border-[#E7E7E7] px-5 py-4">
              <Link href={`/${locale}`} onClick={closeMenu} aria-label="BeachRex">
                <Image
src={MENU_LOGO} alt="BeachRex" width={150}
height={29} className="h-[29px] w-auto"
                />
              </Link>
              <button
type="button" onClick={closeMenu} aria-label={tUi('closeMenu')}
className="-mr-2 rounded-full p-2 hover:bg-white"
              >
                <HiX className="h-6 w-6 text-gray-800" />
              </button>
            </div>

            {/* MENU (SCROLL) */}
            <div className="flex-1 overflow-y-auto pb-8">
              <NestedMenu items={menuItems} closeMenu={closeMenu} />

              {/* CTA (NOT STICKY, PART OF CONTENT) */}
              <div className="mt-6 flex flex-col gap-3 px-5">
                <Link
                  href={buildBeachMapUrl(locale)}
                  onClick={closeMenu}
                  className="flex h-[44px] items-center justify-center gap-3 rounded-lg bg-[#1A3C68] text-white transition-all duration-200 hover:bg-[#162f4f] hover:shadow-[0_4px_10px_rgba(26,60,104,0.25)] active:scale-[0.98]"
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
