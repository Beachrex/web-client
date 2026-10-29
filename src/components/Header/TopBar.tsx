'use client';

import { Heart, UserCircle, ChevronDown } from 'lucide-react';
import Image from 'next/image';
import { Dropdown } from 'flowbite-react';
import { locales, languageNames } from '@/app/config/locales';
import { Link, usePathname } from '@/i18n/routing';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';
import { useLocalizedPath } from '@/hooks/useLocalizedPath';
import { FEATURES } from '@/lib/constants/features';

const CDN_ASSETS = process.env.NEXT_PUBLIC_CDN_ASSETS ?? '';

const IconButton = ({
  icon: Icon,
  label,
}: {
  icon: React.ElementType;
  label: string;
}) => (
  <button className="flex items-center space-x-1">
    <Icon className="h-[20px] w-[20px]" />
    <span className="hidden text-[10px] font-semibold sm:inline">{label}</span>
  </button>
);

const TopBar = () => {
  const locale = useLocale();
  const t = useTranslations('Common');
  const pathname = usePathname();
  const router = useRouter();
  const { getLocalizedPath } = useLocalizedPath();
  const [_isPending, startTransition] = useTransition();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleLocaleChange = (newLocale: string) => {
    startTransition(async () => {

      // Get the localized path for the new locale
      const localizedPath = await getLocalizedPath(newLocale);

      // Construct the full URL with locale prefix
      const fullPath = `/${newLocale}${localizedPath}`;

      // Navigate using Next.js router
      router.push(fullPath);
    });
  };

  return (
    <div className="bg-variable-collection-temno-modro px-2 py-2 text-sm text-white sm:px-4">
      <div className="container mx-auto">
        {/* Mobile Layout (< md) */}
        <div className="flex items-center justify-between md:hidden">
          {/* Left: Language Selector (Compact) */}
          <div className="flex items-center space-x-1">
            <Image
              width="16"
              height="12"
              alt=""
              src={`${CDN_ASSETS}img/icon/globeTranslate.svg`}
            />
            {isClient ? (
              <Dropdown
                arrowIcon={false}
                inline
                className="z-[9999]"
                label={
                  <span className="inline-flex cursor-pointer items-center text-[9px] font-semibold text-white">
                    {(languageNames[locale] ?? locale)
                      .slice(0, 2)
                      .toUpperCase()}
                    <ChevronDown className="ml-1 h-3 w-3 text-white" />
                  </span>
                }
              >
                {locales?.map((loc) => (
                  <Dropdown.Item
                    key={`${loc}-${pathname}`}
                    onClick={() => handleLocaleChange(loc)}
                  >
                    {languageNames[loc] ?? loc}
                  </Dropdown.Item>
                ))}
              </Dropdown>
            ) : (
              <span className="inline-flex cursor-pointer items-center text-[9px] font-semibold text-white">
                {(languageNames[locale] ?? locale).slice(0, 2).toUpperCase()}
                <ChevronDown className="ml-1 h-3 w-3 text-white" />
              </span>
            )}
          </div>

          {/* Center: spacer (the hardcoded Slovenian placeholder message was removed) */}
          <div className="flex-1" />

          {/* Right: Icons Only (favorites and account are hidden for launch) */}
          <div className="flex items-center space-x-2">
            {FEATURES.favorites && (
              <Link href="/favorites" className="flex items-center" aria-label={t('favorite_beaches')}>
                <Heart className="h-[18px] w-[18px]" />
              </Link>
            )}
            {FEATURES.account && (
              <button className="flex items-center">
                <UserCircle className="h-[18px] w-[18px]" />
              </button>
            )}
          </div>
        </div>

        {/* Desktop Layout (>= md) */}
        <div className="hidden items-center justify-between md:flex">
          {/* Left Section */}
          <div className="flex items-center space-x-2">
            <Image
              width="20"
              height="16"
              alt=""
              src={`${CDN_ASSETS}img/icon/globeTranslate.svg`}
            />
            {isClient ? (
              <Dropdown
                arrowIcon={false}
                inline
                className="z-[9999]"
                label={
                  <span className="inline-flex cursor-pointer items-center text-[10px] font-semibold text-white">
                    {languageNames[locale] ?? locale}
                    <ChevronDown className="ml-2 h-4 w-4 text-white" />
                  </span>
                }
              >
                {locales?.map((loc) => (
                  <Dropdown.Item
                    key={`${loc}-${pathname}`}
                    onClick={() => handleLocaleChange(loc)}
                  >
                    {languageNames[loc] ?? loc}
                  </Dropdown.Item>
                ))}
              </Dropdown>
            ) : (
              <span className="inline-flex cursor-pointer items-center text-[10px] font-semibold text-white">
                {languageNames[locale] ?? locale}
                <ChevronDown className="ml-2 h-4 w-4 text-white" />
              </span>
            )}
          </div>

          {/* Center Section: spacer (the hardcoded Slovenian placeholder message was removed) */}
          <div className="flex-1" />

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {/* Favorites and account: hidden for launch */}
            {FEATURES.favorites && (
              <Link href="/favorites" className="flex items-center space-x-1">
                <Heart className="h-[20px] w-[20px]" />
                <span className="text-[10px] font-semibold">{t('favorite_beaches')}</span>
              </Link>
            )}
            {FEATURES.account && <IconButton icon={UserCircle} label={t('my_account')} />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
