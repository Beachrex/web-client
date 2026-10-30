'use client';

import type { BeachSchema } from '@/lib/api-client/types.gen';
import { buildCdnUrl } from '@/lib/utils/beach-images';
import { buildBeachUrlFromSchema, buildCityUrlFromSchema, buildCountryUrl } from '@/lib/utils/beach-urls';
import Image from 'next/image';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import React from 'react';
import { useBeachPanelLinkClick } from './MapBeachPanelContext';

interface BeachMarkerTooltipProps {
    beach: BeachSchema;
}

/**
 * Compact beach card tooltip for map marker popups
 * Uses same design language as PropertyCard
 */
export const BeachMarkerTooltip = React.memo(({ beach }: BeachMarkerTooltipProps) => {
    const locale = useLocale();
    const t = useTranslations('BeachesMap');
    const beachUrl = buildBeachUrlFromSchema(beach, locale) ?? undefined;
    // Owner 2026-10-30: the beach opens in the map's beach panel (plain click), not in a new tab; the links stay
    // real links, so Ctrl/Cmd/middle click still open a new tab.
    const openInPanel = useBeachPanelLinkClick(beach.id);
    const onBeachLinkClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.stopPropagation();
        openInPanel(e);
    };

    // Get the main image using CDN URL builder
    const mainImage = buildCdnUrl(beach.main_image ?? null, 'list')
        ?? '/images/placeholder-beach.jpg';

    // Get country flag
    const flagUrl = beach.country_code
        ? buildCdnUrl(`img/flag/${beach.country_code.toLowerCase()}.svg`, 'icon')
        : null;

    const cityUrl = buildCityUrlFromSchema(beach, locale) ?? undefined;
    const countryUrl =
        beach.continent_slug && beach.country_slug
            ? buildCountryUrl(locale, beach.continent_slug, beach.country_slug)
            : undefined;

    const location = beach.city_name ?? beach.country_name ?? '';
    const title = beach.name ?? 'Beach';

    return (
        <div className="w-[280px] flex flex-col overflow-hidden rounded-[10px] bg-white shadow-md">
            {/* Image section - matches PropertyCard structure */}
            <div className="relative h-[140px] w-full overflow-hidden">
                <Image
                    src={mainImage}
                    alt={title}
                    fill
                    className="object-cover"
                    sizes="280px"
                />

                {/* No rating badge: beaches have no rating source yet, and a hardcoded "0.0" read as a bad
                    rating (owner, 2026-10-29; same as PropertyCard since 2026-10-09). */}

                {/* BOTTOM LABELS - same style as PropertyCard */}
                <div className="absolute bottom-2 left-2 right-2 flex justify-between pointer-events-none z-20">
                    <div className="pointer-events-auto flex items-center gap-1">
                        {location && (cityUrl ? (
                            <Link
                                href={cityUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="flex h-[32px] items-center justify-center rounded-[6px] bg-[#FF8000] px-[10px] transition-colors hover:bg-[#e67300] focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                            >
                                <span className="text-[11px] font-bold text-white">{location}</span>
                            </Link>
                        ) : (
                            <div className="flex h-[32px] items-center justify-center rounded-[6px] bg-[#FF8000] px-[10px]">
                                <span className="text-[11px] font-bold text-white">{location}</span>
                            </div>
                        ))}

                        {flagUrl && (countryUrl ? (
                            <Link
                                href={countryUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                title={beach.country_name ?? undefined}
                                className="block h-[32px] w-[40px] overflow-hidden rounded-[6px] transition-opacity hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                            >
                                <Image
                                    src={flagUrl}
                                    width={40}
                                    height={32}
                                    alt={beach.country_name ?? 'flag'}
                                    className="h-full w-full object-cover"
                                />
                            </Link>
                        ) : (
                            <div className="h-[32px] w-[40px] overflow-hidden rounded-[6px]">
                                <Image
                                    src={flagUrl}
                                    width={40}
                                    height={32}
                                    alt={beach.country_name ?? 'flag'}
                                    className="h-full w-full object-cover"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* BOTTOM DETAILS - same style as PropertyCard */}
            <div className="relative z-30 pointer-events-auto bg-[#E5F2FB] px-3 py-2 rounded-b-[10px] flex flex-col gap-[2px]">
                <div className="flex justify-between items-center">
                    <h3 className="text-[#0069AB] text-[16px] font-bold leading-tight">
                        {beachUrl ? (
                            <Link
                                href={beachUrl}
                                prefetch={false}
                                onClick={onBeachLinkClick}
                                className="hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1A3C68] rounded"
                            >
                                {title}
                            </Link>
                        ) : (
                            title
                        )}
                    </h3>

                    {beachUrl && (
                        <Link
                            href={beachUrl}
                            prefetch={false}
                            onClick={onBeachLinkClick}
                            className="text-[11px] text-[#0069AB] font-medium hover:underline whitespace-nowrap ml-2"
                        >
                            {t('viewDetails')}
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
});

BeachMarkerTooltip.displayName = 'BeachMarkerTooltip';

export default BeachMarkerTooltip;
