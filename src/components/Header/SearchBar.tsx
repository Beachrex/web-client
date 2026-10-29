import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { Map } from 'lucide-react';
import { buildCdnUrl } from '@/lib/utils/beach-images';
import { buildBeachMapUrl } from '@/lib/utils/beach-urls';
import GlobalSearch from './GlobalSearch';
import { FEATURES } from '@/lib/constants/features';

/** CGP v1.0 colour horizontal logo (min. 140 px wide on screen). */
const HEADER_LOGO = '/brand/BeachRex_CGP/01_Logo/Horizontal/SVG/beachrex_horizontal_color.svg';

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
    const locale = useLocale();

    return (
        <div className="bg-white shadow-sm py-3 sm:py-4">
            <div className="container mx-auto">
                {/* Mobile Layout (< md): logo + map on one row, search below (saves a row above the content) */}
                <div className="md:hidden flex flex-col gap-3 px-4">
                    <div className="flex items-center justify-between">
                        <Link href={`/${locale}`}>
                            <Image
                                src={HEADER_LOGO}
                                alt="BeachRex"
                                width={150}
                                height={29}
                                priority
                                className="h-[29px] w-auto cursor-pointer"
                            />
                        </Link>
                        <Link
                            href={buildBeachMapUrl(locale)}
                            className="inline-flex items-center gap-2 rounded-[6px] bg-variable-collection-temno-modro px-4 py-2 text-sm font-semibold text-white shadow-[0px_0px_4px_0px_rgba(0,0,0,0.20)]"
                        >
                            <Map size={18} className="text-white" />
                            {t('map')}
                        </Link>
                    </div>

                    {/* Search Bar */}
                    <GlobalSearch
                        className="w-full"
                        inputClassName="text-xs sm:text-sm"
                        buttonClassName="h-[36px] sm:h-[41px] px-3 py-0 whitespace-nowrap"
                    />

                    {/* Accommodation and shop are hidden for launch */}
                    {(FEATURES.accommodation || FEATURES.shop) && (
                        <div className="flex items-center justify-center w-full gap-2">
                            {FEATURES.accommodation && (
                                <div className="flex flex-col items-center flex-1">
                                    <Image
                                        src={buildCdnUrl('img/icon/accomodation.svg', 'icon') ?? ''}
                                        alt=""
                                        width={24}
                                        height={24}
                                    />
                                    <span className="text-xs text-gray-600 mt-1 text-center">{t('accommodations')}</span>
                                </div>
                            )}
                            {FEATURES.shop && (
                                <div className="flex flex-col items-center flex-1">
                                    <Image
                                        src={buildCdnUrl('img/icon/store.svg', 'icon') ?? ''}
                                        alt=""
                                        width={24}
                                        height={24}
                                    />
                                    <span className="text-xs text-gray-600 mt-1 text-center">{t('shop')}</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Tablet Layout (md to lg) */}
                <div className="hidden md:flex lg:hidden flex-col space-y-3">
                    {/* Top Row: Logo and Map Button */}
                    <div className="flex items-center justify-between">
                        <Link href={`/${locale}`}>
                            <Image
                                src={HEADER_LOGO}
                                alt="BeachRex"
                                width={160}
                                height={31}
                                priority
                                className="h-[31px] w-auto cursor-pointer"
                            />
                        </Link>
                        <Link href={buildBeachMapUrl(locale)} className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-variable-collection-temno-modro text-white rounded-[6px] shadow-[0px_0px_4px_0px_rgba(0,0,0,0.20)] hover:bg-variable-collection-morje">
                            <Image
                                src={buildCdnUrl('img/icon/map.svg', 'icon') ?? ''}
                                alt=""
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

                        {/* Compact Navigation Icons (accommodation and shop are hidden for launch) */}
                        <div className="flex items-center space-x-2">
                            {FEATURES.accommodation && (
                                <NavIcon
                                    src={buildCdnUrl('img/icon/accomodation.svg', 'icon') ?? ''}
                                    alt=""
                                    label=""
                                />
                            )}
                            {FEATURES.shop && (
                                <NavIcon
                                    src={buildCdnUrl('img/icon/store.svg', 'icon') ?? ''}
                                    alt=""
                                    label=""
                                />
                            )}
                        </div>
                    </div>
                </div>

                {/* Desktop Layout (>= lg) */}
                <div className="hidden lg:flex items-center justify-between">
                    {/* Left Section (Logo) */}
                    <div className="flex items-center">
                        <Link href={`/${locale}`}>
                            <Image
                                src={HEADER_LOGO}
                                alt="BeachRex"
                                width={176}
                                height={34}
                                priority
                                className="h-[34px] w-auto cursor-pointer"
                            />
                        </Link>
                    </div>

                    {/* Middle Section (Search Bar + Icons) */}
                    <div className="flex items-center justify-center flex-1 space-x-4 mx-6">
                        {/* Search Bar */}
                        <GlobalSearch
                            className="max-w-[500px] w-full"
                            inputClassName="px-3 py-2 text-sm"
                            buttonClassName="w-[113px] h-[41px] px-[34px] py-[11px]"
                        />

                        {/* Navigation Icons (accommodation and shop are hidden for launch) */}
                        {FEATURES.accommodation && (
                            <NavIcon
                                src={buildCdnUrl('img/icon/accomodation.svg', 'icon') ?? ''}
                                alt=""
                                label={t('accommodations')}
                            />
                        )}
                        {FEATURES.shop && (
                            <NavIcon
                                src={buildCdnUrl('img/icon/store.svg', 'icon') ?? ''}
                                alt=""
                                label={t('shop')}
                            />
                        )}
                    </div>

                    {/* Right Section (Map Button) */}
                    <div className="flex items-center">
                        <Link href={buildBeachMapUrl(locale)} className="inline-flex items-center justify-center gap-5 px-10 py-[10px] bg-variable-collection-temno-modro text-white rounded-[6px] shadow-[0px_0px_4px_0px_rgba(0,0,0,0.20)] flex-shrink-0 hover:bg-variable-collection-morje">
                            <Image
                                src={buildCdnUrl('img/icon/map.svg', 'icon') ?? ''}
                                alt=""
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
