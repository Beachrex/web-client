import React from 'react';
import Image from 'next/image';
import { SlBriefcase } from 'react-icons/sl';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';

const CDN_ASSETS = process.env.NEXT_PUBLIC_CDN_ASSETS ?? '';

const NavIcon = ({
  src,
  alt,
  label,
  horizontal = false,
  className = '',
  onClick,
}: {
  src: string;
  alt: string;
  label: string;
  horizontal?: boolean;
  className?: string;
  onClick?: () => void;
}) => {
  const defaultStyles = `h-6 items-center justify-center flex ${
    horizontal ? 'flex-row space-x-2' : 'flex-col items-center'
  } text-sm text-variable-collection-dark-grey ${onClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`;

  const appliedClassName = className || defaultStyles;

  return (
    <button className={appliedClassName} onClick={onClick}>
      <Image
src={src} alt={alt} width={26}
height={26}
      />
      <span className={appliedClassName}>
        <span className="text-sm leading-tight text-variable-collection-semi-dark-grey">
          {label}
        </span>
      </span>
    </button>
  );
};

// Quick menu category to filter mapping
interface QuickMenuCategory {
  icon: string;
  labelKey: string;
  filters?: Record<string, string[]>; // Filter key -> option codes
}

const QuickMenu = ({ toggleMenu }: { toggleMenu: () => void }) => {
  const t = useTranslations('Common');
  const locale = useLocale();
  const router = useRouter();

  // Localized beach-map routes (same as in BeachCategorySearch)
  const beachMapRoutes: Record<string, string> = {
    en: 'beach-map',
    si: 'zemljevid-plaz',
    de: 'strand-karte',
    hr: 'karta-plaza',
    fr: 'carte-des-plages',
    es: 'mapa-de-playas',
    it: 'mappa-spiagge',
    ua: 'karta-plyazhiv',
    ru: 'karta-plyazhey',
    pl: 'mapa-plaz',
    cs: 'mapa-plazi',
    hu: 'strand-terkep',
    bg: 'karta-na-plyazhovete',
    sk: 'mapa-plazi',
  };

  const getLocalizedMapRoute = () => {
    return beachMapRoutes[locale] ?? 'beach-map';
  };

  // Navigate to map with filters
  const navigateToMapWithFilters = (filters?: Record<string, string[]>) => {
    const queryParams = new URLSearchParams();

    if (filters) {
      Object.entries(filters).forEach(([filterKey, optionCodes]) => {
        if (optionCodes.length > 0) {
          queryParams.set(filterKey, optionCodes.join(','));
        }
      });
    }

    const mapRoute = getLocalizedMapRoute();
    const queryString = queryParams.toString();
    const mapUrl = `/${locale}/${mapRoute}${queryString ? `?${queryString}` : ''}`;

    router.push(mapUrl);
  };

  // Define quick menu categories with their filter mappings
  const quickMenuCategories: QuickMenuCategory[] = [
    {
      icon: 'globe.svg',
      labelKey: 'quickMenuWorldBeaches',
      // No filters - shows all beaches worldwide
    },
    {
      icon: 'beachType.svg',
      labelKey: 'quickMenuBeachType',
      // Show all beach types (sand, stones, grass, etc.)
      filters: {
        beach_type: ['sand', 'small_stones', 'grass_beach', 'large_stones'],
      },
    },
    {
      icon: 'userType.svg',
      labelKey: 'quickMenuUserType',
      filters: {
        user_type: ['adventurer', 'family', 'youth'],
      },
    },
    {
      icon: 'beachShowType.svg',
      labelKey: 'quickMenuBeachDisplay',
      // Natural conditions and views
      filters: {
        natural_location_condition: ['natural_shade', 'scenic_view'],
      },
    },
    {
      icon: 'shower.svg',
      labelKey: 'quickMenuBeachServices',
      // Beach services and infrastructure
      filters: {
        location_infrastructure: [
          'shower',
          'changing_cabins',
          'toilets',
          'restaurants',
        ],
      },
    },
    {
      icon: 'baseBeachIcon.svg',
      labelKey: 'quickMenuTopBeaches',
      // Top rated beaches
      // TODO: Add rating/popularity filter when available
    },
  ];

  return (
    <div className="flex min-h-[61px] items-center border-b border-t border-variable-collection-light-grey bg-variable-collection-ultra-light-grey">
      <div className="container mx-auto">
        {/* Mobile Layout (< md) */}
        <div className="flex items-center justify-between md:hidden">
          {/* Left: Hamburger Menu */}
          <div className="flex items-center">
            <NavIcon
              src={`${CDN_ASSETS}img/icon/hamburgerMenu.svg`}
              alt="Hamburger Menu"
              label=""
              horizontal={true}
              className="cursor-pointer"
              onClick={toggleMenu}
            />
          </div>

          {/* Center: Most important icons only */}
          <div className="flex flex-1 items-center justify-center space-x-3">
            {quickMenuCategories.slice(0, 3).map((category, index) => (
              <button
                key={index}
                className="flex flex-col items-center"
                onClick={() => navigateToMapWithFilters(category.filters)}
              >
                <Image
                  src={`${CDN_ASSETS}img/icon/${category.icon}`}
                  alt={t(category.labelKey)}
                  width={40}
                  height={40}
                />
                <span className="xs:block mt-1 hidden text-xs text-variable-collection-semi-dark-grey">
                  {t(category.labelKey)}
                </span>
              </button>
            ))}
          </div>

          {/* Right: Social icons (minimal) */}
          <div className="flex items-center space-x-2">
            <NavIcon
              src={`${CDN_ASSETS}img/icon/facebook.svg`}
              alt="Facebook"
              label=""
              className="h-5 w-5"
            />
            <NavIcon
              src={`${CDN_ASSETS}img/icon/instagram.svg`}
              alt="Instagram"
              label=""
              className="h-5 w-5"
            />
          </div>
        </div>

        {/* Desktop Layout (>= md) */}
        <div className="hidden items-center justify-between md:flex">
          {/* Left Section (Menu) */}
          <div className="flex items-center space-x-4 lg:space-x-6">
            <NavIcon
              src={`${CDN_ASSETS}img/icon/hamburgerMenu.svg`}
              alt="Hamburger Menu"
              label=""
              horizontal={true}
              className="cursor-pointer"
              onClick={toggleMenu}
            />
          </div>

          {/* Middle Section (Icons and Labels) */}
          <div className="flex flex-1 flex-wrap items-center justify-center space-x-3 lg:space-x-6">
            {quickMenuCategories.map((category, index) => (
              <div key={index} className="flex items-center space-x-2">
                <NavIcon
                  src={`${CDN_ASSETS}img/icon/${category.icon}`}
                  alt={t(category.labelKey)}
                  label={t(category.labelKey)}
                  horizontal={true}
                  onClick={() => navigateToMapWithFilters(category.filters)}
                />
              </div>
            ))}
          </div>

          {/* Right Section (Social Icons) */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center gap-2 pr-6">
              <SlBriefcase className="h-[26px] w-[26px] text-variable-collection-dark-grey" />
              <span className="cursor-pointer text-sm font-bold text-variable-collection-middle-grey">
                {t('quickMenuAboutUs')}
              </span>
            </div>

            <div className="flex items-center space-x-3">
              <NavIcon
                src={`${CDN_ASSETS}img/icon/facebook.svg`}
                alt="Facebook"
                label=""
              />
              <NavIcon
                src={`${CDN_ASSETS}img/icon/instagram.svg`}
                alt="Instagram"
                label=""
              />
              <NavIcon
                src={`${CDN_ASSETS}img/icon/youtube.svg`}
                alt="YouTube"
                label=""
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickMenu;
