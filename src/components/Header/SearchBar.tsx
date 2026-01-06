import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Map } from 'lucide-react';
import { buildCdnUrl } from '@/lib/utils/beach-images';
import GlobalSearch from './GlobalSearch';

const NavIcon = ({ src, alt, label }: { src: string; alt: string; label: string }) => (
    <button className="flex flex-col items-center text-sm text-gray-600 hover:text-gray-900">
        <Image
            src={src}
            alt={alt}
            width={26}
            height={26}
        />
        <span className="text-[10px] font-semibold text-variable-collection-middle-grey">{label}</span>
    </button>
);

const SearchBar = () => {
    const t = useTranslations('Common');
    const tRoutes = useTranslations('routes');

    return (
        <div className="bg-white shadow-sm py-3 sm:py-4">
            <div className="container mx-auto">
                {/* Mobile Layout (< md) */}
                <div className="md:hidden flex flex-col items-center">
                    {/* Logo Row */}
                    <div className="flex items-center justify-center px-4 mb-3">
                        <Image
                            src={buildCdnUrl('js/assets/img/logo_dark.png', 'icon') ?? '/images/logo_dark.png'}
                            alt="BeachRex Logo"
                            width={80}
                            height={26}
                            className="flex-shrink-0 mix-blend-luminosity sm:w-[90px] sm:h-[30px]"
                        />
                    </div>

                    {/* Search Bar */}
                    <GlobalSearch
                        className="w-[95%] sm:w-[90%]"
                        inputClassName="text-xs sm:text-sm"
                        buttonClassName="h-[36px] sm:h-[41px] px-3 py-0 whitespace-nowrap"

                    />

                    {/* Quick Action Icons (Mobile Only) */}
                    <div className="flex items-center justify-center mt-3 w-full px-4">
                        <div className="flex flex-col items-center flex-1">
                            <Image
                                src={buildCdnUrl('img/icon/accomodation.svg', 'icon') ?? ''}
                                alt="Accommodations"
                                width={24}
                                height={24}
                            />
                            <span className="text-xs text-gray-600 mt-1 text-center">{t('accommodations')}</span>
                        </div>
                        <div className="flex flex-col items-center flex-1">
                            <Image
                                src={buildCdnUrl('img/icon/store.svg', 'icon') ?? ''}
                                alt="Shop"
                                width={24}
                                height={24}
                            />
                            <span className="text-xs text-gray-600 mt-1 text-center">{t('shop')}</span>
                        </div>
                        <Link href={tRoutes('beachMap')} className="flex flex-col items-center flex-1">
                            <Map size={24} className="text-gray-600" />
                            <span className="text-xs text-gray-600 mt-1 text-center">{t('map')}</span>
                        </Link>
                    </div>
                </div>

                {/* Tablet Layout (md to lg) */}
                <div className="hidden md:flex lg:hidden flex-col space-y-3">
                    {/* Top Row: Logo and Map Button */}
                    <div className="flex items-center justify-between">
                        <Image
                            src={buildCdnUrl('js/assets/img/logo_dark.png', 'icon') ?? '/images/logo_dark.png'}
                            alt="BeachRex Logo"
                            width={90}
                            height={36}
                            className="mix-blend-luminosity"
                        />
                        <Link href={tRoutes('beachMap')} className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-variable-collection-temno-modro text-white rounded-[6px] shadow-[0px_0px_4px_0px_rgba(0,0,0,0.20)] hover:bg-variable-collection-morje">
                            <Image
                                src={buildCdnUrl('img/icon/map.svg', 'icon') ?? ''}
                                alt={`${t('map')} ${t('icon')}`}
                                width={20}
                                height={20}
                            />
                            <span className="text-sm">{t('map')}</span>
                        </Link>
                    </div>

                    {/* Bottom Row: Search Bar and Icons */}
                    <div className="flex items-center space-x-3">
                        {/* Search Bar */}
                        <GlobalSearch
                            className="flex-1"
                            inputClassName="text-sm"
                            buttonClassName="w-[80px] h-[36px] px-3 py-2"
                        />

                        {/* Compact Navigation Icons */}
                        <div className="flex items-center space-x-2">
                            <NavIcon
                                src={buildCdnUrl('img/icon/accomodation.svg', 'icon') ?? ''}
                                alt={`${t('accommodations')} ${t('icon')}`}
                                label=""
                            />
                            <NavIcon
                                src={buildCdnUrl('img/icon/store.svg', 'icon') ?? ''}
                                alt={`${t('shop')} ${t('icon')}`}
                                label=""
                            />
                        </div>
                    </div>
                </div>

                {/* Desktop Layout (>= lg) */}
                <div className="hidden lg:flex items-center justify-between">
                    {/* Left Section (Logo) */}
                    <div className="flex items-center">
                        <Image
                            src={buildCdnUrl('js/assets/img/logo_dark.png', 'icon') ?? '/images/logo_dark.png'}
                            alt="BeachRex Logo"
                            width={100}
                            height={40}
                            className="mix-blend-luminosity"
                        />
                    </div>

                    {/* Middle Section (Search Bar + Icons) */}
                    <div className="flex items-center justify-center flex-1 space-x-4 mx-6">
                        {/* Search Bar */}
                        <GlobalSearch
                            className="max-w-[500px] w-full"
                            inputClassName="px-3 py-2 text-sm"
                            buttonClassName="w-[113px] h-[41px] px-[34px] py-[11px]"
                        />

                        {/* Navigation Icons */}
                        <NavIcon
                            src={buildCdnUrl('img/icon/accomodation.svg', 'icon') ?? ''}
                            alt={`${t('accommodations')} ${t('icon')}`}
                            label={t('accommodations')}
                        />
                        <NavIcon
                            src={buildCdnUrl('img/icon/store.svg', 'icon') ?? ''}
                            alt={`${t('shop')} ${t('icon')}`}
                            label={t('shop')}
                        />
                    </div>

                    {/* Right Section (Map Button) */}
                    <div className="flex items-center">
                        <Link href={tRoutes('beachMap')} className="inline-flex items-center justify-center gap-5 px-10 py-[10px] bg-variable-collection-temno-modro text-white rounded-[6px] shadow-[0px_0px_4px_0px_rgba(0,0,0,0.20)] flex-shrink-0 hover:bg-variable-collection-morje">
                            <Image
                                src={buildCdnUrl('img/icon/map.svg', 'icon') ?? ''}
                                alt={`${t('map')} ${t('icon')}`}
                                width={26}
                                height={26}
                            />
                            {t('map')}
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SearchBar;
