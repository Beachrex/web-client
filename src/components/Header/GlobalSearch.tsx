'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, X, Mountain, Globe } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
// next/navigation, not the next-intl router: buildSearchResultUrl already returns the locale-prefixed path
import { useRouter } from 'next/navigation';
import { useDebounce } from '@/hooks/useDebounce';
import { useQuery } from '@tanstack/react-query';
import { globalSearchOptions } from '@/lib/api-client/@tanstack/react-query.gen';
import { buildCdnUrl } from '@/lib/utils/beach-images';
import { buildSearchResultUrl } from '@/lib/utils/search-result-url';
import { resultsForTab, searchTabs, type SearchTab } from '@/lib/utils/search-tabs';
import Image from 'next/image';

// Unified search result type
interface UnifiedSearchResult {
    id: number;
    type: 'beach' | 'city' | 'island' | 'region' | 'country';
    name: string;
    slug: string;
    location?: string;
    main_image?: string;
    // URL building slugs
    continent_slug?: string;
    country_slug?: string;
    region_slug?: string;
    island_slug?: string;
    city_slug?: string;
}

interface GlobalSearchProps {
    className?: string;
    placeholder?: string;
    buttonClassName?: string;
    inputClassName?: string;
}

const GlobalSearch: React.FC<GlobalSearchProps> = ({
    className = '',
    placeholder,
    buttonClassName = '',
    inputClassName = '',
}) => {
    const t = useTranslations('Common');
    const tSearch = useTranslations('Search');
    const router = useRouter();
    const locale = useLocale();

    const [query, setQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const [activeTab, setActiveTab] = useState<SearchTab>('all');

    const searchRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const debouncedQuery = useDebounce(query, 300);

    // Use the generated React Query hook for search
    const { data: searchData, isLoading } = useQuery({
        ...globalSearchOptions({
            query: {
                q: debouncedQuery,
                limit: 10,
            },
        }),
        enabled: debouncedQuery.length >= 2,
    });

    // Transform API response to unified format
    const results: UnifiedSearchResult[] = React.useMemo(() => {
        if (!searchData?.data) return [];

        const unified: UnifiedSearchResult[] = [];

        // Beaches
        searchData.data.beaches?.forEach((beach) => {
            unified.push({
                id: beach.id ?? 0,
                type: 'beach',
                name: beach.name ?? '',
                slug: beach.slug ?? '',
                location: [beach.city_name, beach.region_name, beach.country_name]
                    .filter(Boolean)
                    .join(', '),
                main_image: beach.main_image,
                continent_slug: beach.continent_slug,
                country_slug: beach.country_slug,
                region_slug: beach.region_slug,
                island_slug: beach.island_slug,
                city_slug: beach.city_slug,
            });
        });

        // Cities
        searchData.data.cities?.forEach((city) => {
            unified.push({
                id: city.id ?? 0,
                type: 'city',
                name: city.name ?? '',
                slug: city.slug ?? '',
                location: [city.region_name, city.country_name].filter(Boolean).join(', '),
                main_image: city.main_image,
                continent_slug: city.continent_slug,
                country_slug: city.country_slug,
                region_slug: city.region_slug,
                island_slug: city.island_slug,
            });
        });

        // Islands
        searchData.data.islands?.forEach((island) => {
            unified.push({
                id: (island as Record<string, unknown>).id as number ?? 0,
                type: 'island',
                name: (island as Record<string, unknown>).name as string ?? '',
                slug: (island as Record<string, unknown>).slug as string ?? '',
                location: [
                    (island as Record<string, unknown>).region_name,
                    (island as Record<string, unknown>).country_name,
                ].filter(Boolean).join(', '),
                main_image: (island as Record<string, unknown>).main_image as string | undefined,
                continent_slug: island.continent_slug,
                country_slug: island.country_slug,
                region_slug: island.region_slug,
            });
        });

        // Regions
        searchData.data.regions?.forEach((region) => {
            unified.push({
                id: (region as Record<string, unknown>).id as number ?? 0,
                type: 'region',
                name: (region as Record<string, unknown>).name as string ?? '',
                slug: (region as Record<string, unknown>).slug as string ?? '',
                location: (region as Record<string, unknown>).country_name as string ?? '',
                main_image: (region as Record<string, unknown>).main_image as string | undefined,
                continent_slug: region.continent_slug,
                country_slug: region.country_slug,
            });
        });

        // Countries
        searchData.data.countries?.forEach((country) => {
            unified.push({
                id: (country as Record<string, unknown>).id as number ?? 0,
                type: 'country',
                name: (country as Record<string, unknown>).name as string ?? '',
                slug: (country as Record<string, unknown>).slug as string ?? '',
                location: '',
                main_image: (country as Record<string, unknown>).main_image as string | undefined,
                continent_slug: country.continent_slug,
            });
        });

        return unified;
    }, [searchData]);

    // Tabs per result type (owner 2026-10-22); a new search starts on "All".
    const tabs = React.useMemo(() => searchTabs(results), [results]);
    const currentTab: SearchTab = tabs.some((tab) => tab.tab === activeTab) ? activeTab : 'all';
    const visibleResults = React.useMemo(
        () => resultsForTab(results, currentTab, debouncedQuery),
        [results, currentTab, debouncedQuery],
    );

    useEffect(() => {
        setActiveTab('all');
        setSelectedIndex(-1);
    }, [debouncedQuery]);

    const selectTab = (tab: SearchTab) => {
        setActiveTab(tab);
        setSelectedIndex(-1);
        inputRef.current?.focus();
    };

    // Open dropdown when results are available
    useEffect(() => {
        if (results.length > 0 && debouncedQuery.length >= 2) {
            setIsOpen(true);
        } else if (debouncedQuery.length < 2) {
            setIsOpen(false);
        }
    }, [results, debouncedQuery]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Handle keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!isOpen || visibleResults.length === 0) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setSelectedIndex((prev) => (prev < visibleResults.length - 1 ? prev + 1 : prev));
                break;
            case 'ArrowUp':
                e.preventDefault();
                setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
                break;
            case 'Enter':
                e.preventDefault();
                if (selectedIndex >= 0 && visibleResults[selectedIndex]) {
                    handleResultClick(visibleResults[selectedIndex]);
                }
                break;
            case 'Escape':
                setIsOpen(false);
                setSelectedIndex(-1);
                break;
        }
    };

    // Handle result click
    const handleResultClick = (result: UnifiedSearchResult) => {
        const url = buildResultUrl(result);
        setIsOpen(false);
        setQuery('');
        setSelectedIndex(-1);
        router.push(url);
    };

    // Full localized URL (/si/plaze/...), see buildSearchResultUrl (QA #52, #53, #54)
    const buildResultUrl = (result: UnifiedSearchResult): string => buildSearchResultUrl(result, locale);

    // Get icon for result type
    const getTypeIcon = (type: string) => {
        const iconClass = 'text-blue-600';
        const iconSize = 20;

        switch (type) {
            case 'beach':
                return <MapPin className={iconClass} size={iconSize} />;
            case 'city':
                return <MapPin className={iconClass} size={iconSize} />;
            case 'island':
                return <Mountain className={iconClass} size={iconSize} />;
            case 'region':
                return <Mountain className={iconClass} size={iconSize} />;
            case 'country':
                return <Globe className={iconClass} size={iconSize} />;
            default:
                return <MapPin className={iconClass} size={iconSize} />;
        }
    };

    // Get type label
    const getTypeLabel = (type: string): string => {
        const labels: Record<string, string> = {
            beach: tSearch('typeBeach'),
            city: tSearch('typeCity'),
            island: tSearch('typeIsland'),
            region: tSearch('typeRegion'),
            country: tSearch('typeCountry'),
        };
        return labels[type] ?? type;
    };

    const getTabLabel = (tab: SearchTab): string => {
        const labels: Record<SearchTab, string> = {
            all: tSearch('tabAll'),
            beach: tSearch('tabBeaches'),
            city: tSearch('tabCities'),
            island: tSearch('tabIslands'),
            region: tSearch('tabRegions'),
            country: tSearch('tabCountries'),
        };
        return labels[tab];
    };

    // Clear search
    const handleClear = () => {
        setQuery('');
        setIsOpen(false);
        setSelectedIndex(-1);
        inputRef.current?.focus();
    };

    return (
        <div ref={searchRef} className={`relative ${className}`}>
            {/* Search Input */}
            <div className="flex items-center border rounded-lg shadow-sm bg-white">
                <Search className="text-gray-500 ml-3" size={20} />
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => {
                        if (results.length > 0) setIsOpen(true);
                    }}
                    placeholder={placeholder ?? t('search_placeholder')}
                    aria-label={t('search_placeholder')}
                    className={`flex-1 bg-transparent border-none focus:ring-0 \
focus:outline-none px-3 py-2 text-sm text-gray-600 placeholder-gray-400 ${inputClassName}`}
                />

                {/* Clear button */}
                {query && (
                    <button
                        onClick={handleClear}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        aria-label="Clear search"
                    >
                        <X className="text-gray-400" size={18} />
                    </button>
                )}

                {/* Search button */}
                <button
                    onClick={() => {
                        if (results.length > 0) {
                            setIsOpen(true);
                        }
                    }}
                    className={`px-6 py-2 bg-[#e6e6e6] rounded-md hover:bg-gray-300 \
transition-colors ${buttonClassName}`}
                    aria-label={t('search')}
                >
                    <div className="text-center text-[#8d8d8d] text-sm font-bold">
                        {isLoading ? '...' : t('search')}
                    </div>
                </button>
            </div>

            {/* Search Results Dropdown */}
            {isOpen && results.length > 0 && (
                <div
                    className="absolute top-full left-0 right-0 mt-2 bg-white border \
border-gray-200 rounded-lg shadow-xl max-h-[500px] overflow-y-auto z-[10000] \
animate-fadeIn search-results-scroll"
                >
                    {tabs.length > 0 && (
                        <div
                            role="tablist"
                            aria-label={tSearch('tabsLabel')}
                            className="sticky top-0 z-10 flex gap-1.5 overflow-x-auto border-b border-gray-100 bg-white px-2 pb-2 pt-2 \
[scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                            data-testid="search-tabs"
                        >
                            {tabs.map(({ tab, count }) => {
                                const active = tab === currentTab;
                                return (
                                    <button
                                        key={tab}
                                        type="button"
                                        role="tab"
                                        aria-selected={active}
                                        // Keep the input focused so typing and arrow keys keep working
                                        onMouseDown={(e) => e.preventDefault()}
                                        onClick={() => selectTab(tab)}
                                        className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 \
text-xs font-semibold transition-colors ${
                                            active ? 'bg-[#1A3C68] text-white' : 'bg-gray-100 text-gray-700 hover:bg-blue-50'
                                        }`}
                                    >
                                        {getTabLabel(tab)}
                                        <span
                                            className={`rounded-full px-1.5 text-[11px] ${active ? 'bg-white/20' : 'bg-white text-gray-500'}`}
                                        >
                                            {count}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                    <div className="p-2" role={tabs.length > 0 ? 'tabpanel' : undefined}>
                        {visibleResults.map((result, index) => (
                            <button
                                key={`${result.type}-${result.id}`}
                                onClick={() => handleResultClick(result)}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 \
rounded-lg hover:bg-blue-50 transition-all duration-150 ${
                                    index === selectedIndex ? 'bg-blue-50 ring-2 ring-blue-200' : ''
                                }`}
                            >
                                {/* Image or Icon */}
                                {result.main_image ? (
                                    <div className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden bg-gray-100">
                                        <Image
                                            src={`${buildCdnUrl(result.main_image, 'list')}`}
                                            alt={result.name}
                                            width={48}
                                            height={48}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                ) : (
                                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
                                        {getTypeIcon(result.type)}
                                    </div>
                                )}

                                {/* Content */}
                                <div className="flex-1 text-left min-w-0">
                                    <div className="font-semibold text-gray-900 truncate text-sm">
                                        {result.name}
                                    </div>
                                    <div className="text-xs text-gray-500 flex items-center gap-2 mt-0.5">
                                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full font-medium">
                                            {getTypeLabel(result.type)}
                                        </span>
                                        {result.location && (
                                            <span className="truncate">{result.location}</span>
                                        )}
                                    </div>
                                </div>

                                {/* Arrow indicator */}
                                <div className="flex-shrink-0 text-gray-300">
                                    <svg
                                        className="w-5 h-5"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 5l7 7-7 7"
                                        />
                                    </svg>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* No results message */}
            {isOpen && !isLoading && query.length >= 2 && results.length === 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50">
                    <p className="text-gray-500 text-sm text-center">
                        {tSearch('noResults')}
                    </p>
                </div>
            )}
        </div>
    );
};

export default GlobalSearch;

