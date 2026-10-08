'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import Image from 'next/image';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getBeachFiltersOptions } from '@/lib/api-client/@tanstack/react-query.gen';
import type { GetBeachFiltersResponse } from '@/lib/api-client/types.gen';
import { useTranslations } from 'next-intl';
import { buildCdnUrl } from '@/lib/utils/beach-images';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { MAP_QUICK_FILTERS } from '@/config/mapQuickFilters';
import { isQuickFilterSelected, onlyQuickFilters, resolveQuickFilters, toggleFilterValue } from '@/lib/utils/quick-filters';

type FilterValue = string | number | boolean | undefined;
type FilterOptions = GetBeachFiltersResponse['data'];

interface LeftSidebarFiltersProps {
    beachesCount: number;
    beachesLoading: boolean;
    onFiltersChange?: (filters: Record<string, FilterValue>) => void;
    currentFilters?: Record<string, FilterValue>;
    onFilterOptionsChange?: (filterOptions: FilterOptions | null) => void;
    onFilterOptionsLoadingChange?: (isLoading: boolean) => void;
}

const LeftSidebarFilters = ({
    beachesCount,
    beachesLoading,
    onFiltersChange,
    currentFilters = {},
    onFilterOptionsChange,
    onFilterOptionsLoadingChange,
}: LeftSidebarFiltersProps) => {
    const t = useTranslations('BeachesMap');
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isExpanded, setIsExpanded] = useState(false);
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
    const [isInitialized, setIsInitialized] = useState(false);
    const lastSearchParamsRef = useRef<string>('');

    // Initialize filters from URL query params on mount
    useEffect(() => {
        if (!isInitialized && searchParams) {
            const urlFilters: Record<string, FilterValue> = {};

            searchParams.forEach((value, key) => {
                // Store the filter value
                urlFilters[key] = value;
            });

            const hasFilters = Object.keys(urlFilters).length > 0;

            if (hasFilters) {

                // Open advanced filters unless the quick filters show the whole selection
                setIsExpanded(!onlyQuickFilters(urlFilters, MAP_QUICK_FILTERS));

                // Apply filters from URL
                if (onFiltersChange) {
                    onFiltersChange(urlFilters);
                }
            }

            setIsInitialized(true);
        }
    }, [isInitialized, searchParams, onFiltersChange]);

    // Watch for URL changes after initialization (e.g. from QuickMenu clicks)
    useEffect(() => {
        if (!isInitialized || !searchParams) {
            return;
        }

        // Convert searchParams to string for comparison
        const searchParamsString = searchParams.toString();

        // Only update if searchParams actually changed
        if (searchParamsString === lastSearchParamsRef.current) {
            return;
        }

        lastSearchParamsRef.current = searchParamsString;

        const urlFilters: Record<string, FilterValue> = {};

        searchParams.forEach((value, key) => {
            urlFilters[key] = value;
        });

        const hasFilters = Object.keys(urlFilters).length > 0;

        // Reset all expanded sections when URL changes
        setExpandedSections({});

        // Open advanced filters when the quick filters cannot show the whole selection;
        // never close them here (the user may be choosing in the advanced list).
        if (hasFilters && !onlyQuickFilters(urlFilters, MAP_QUICK_FILTERS)) {
            setIsExpanded(true);
        }

        // Apply filters from URL
        if (onFiltersChange) {
            onFiltersChange(urlFilters);
        }
    }, [searchParams, isInitialized, onFiltersChange]);

    // Extract all selected filters from currentFilters to pass as query parameters
    // These filters cascade - selecting a filter will update other filter options
    const queryParams = useMemo(() => {
        // Build query params from all selected filters
        const params: Record<string, string | number> = {};

        Object.entries(currentFilters).forEach(([key, value]) => {
            // Skip undefined, null, or empty values
            if (value === undefined || value === null || value === '') {
                return;
            }

            // Convert value to appropriate type for API
            if (typeof value === 'string' || typeof value === 'number') {
                params[key] = value;
            } else if (typeof value === 'boolean') {
                // Convert boolean to string or number as needed
                params[key] = value ? 1 : 0;
            }
        });

        if (Object.keys(params).length > 0) {
        }

        // Type assertion: API accepts geographic filters, but we pass all selected filters
        // for cascading filter behavior. The API will ignore unsupported parameters.
        return Object.keys(params).length > 0 ? params : undefined;
    }, [currentFilters]);

    // Fetch filter options using TanStack Query with all currently selected filters
    const { data, isLoading, error } = useQuery(
        getBeachFiltersOptions({
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
            query: queryParams as any,
        })
    );
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const filterOptions = data?.data ?? null;
    const quickFilters = useMemo(() => resolveQuickFilters(MAP_QUICK_FILTERS, filterOptions), [filterOptions]);

    // Notify parent component when filter options change
    useEffect(() => {
        if (onFilterOptionsChange) {
            onFilterOptionsChange(filterOptions);
        }
    }, [filterOptions, onFilterOptionsChange]);

    // Notify parent component when filter options loading state changes
    useEffect(() => {
        if (onFilterOptionsLoadingChange) {
            onFilterOptionsLoadingChange(isLoading);
        }
    }, [isLoading, onFilterOptionsLoadingChange]);

    // Initialize expanded sections when filter options data changes
  useEffect(() => {
  if (filterOptions && Object.keys(expandedSections).length === 0) {
    const initialExpandedState: Record<string, boolean> = {};
    Object.keys(filterOptions).forEach(key => {
      // Auto-expand section if it has a selected value
      const hasValue = currentFilters[key] !== undefined &&
                      currentFilters[key] !== null &&
                      currentFilters[key] !== '';
      initialExpandedState[key] = hasValue;
    });
    setExpandedSections(initialExpandedState);
  }
}, [filterOptions, expandedSections, currentFilters]);

    // Auto-expand/collapse sections when currentFilters change
    useEffect(() => {
      if (!filterOptions) return;

      setExpandedSections(prev => {
        const updated = { ...prev };
        Object.keys(filterOptions).forEach(key => {
          const hasValue = currentFilters[key] !== undefined &&
                          currentFilters[key] !== null &&
                          currentFilters[key] !== '';
          // Only auto-expand, don't auto-collapse if user manually expanded
          if (hasValue && !prev[key]) {
            updated[key] = true;
          }
        });
        return updated;
      });
    }, [currentFilters, filterOptions]);

    const toggleSection = (section: string) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section],
        }));
    };

    // Build URL with query parameters from filters
    const updateUrlWithFilters = (filters: Record<string, FilterValue>) => {
        const params = new URLSearchParams(searchParams.toString());

        // Remove all existing filter params first
        const keysToRemove: string[] = [];
        params.forEach((_, key) => {
            keysToRemove.push(key);
        });
        keysToRemove.forEach(key => params.delete(key));

        // Add new filter params
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                params.set(key, String(value));
            }
        });

        // Build the new URL
        const queryString = params.toString();
        const newUrl = queryString ? `${pathname}?${queryString}` : pathname;


        // Update URL without page reload
        router.replace(newUrl, { scroll: false });
    };

    const handleFilterChange = (filterKey: string, value: string | undefined) => {
        const newFilters = {
            ...currentFilters,
            [filterKey]: value ?? undefined, // Remove key if value is empty
        };

        // Remove undefined values from the object
        const cleanedFilters = Object.fromEntries(
            Object.entries(newFilters).filter(([_, v]) => v !== undefined)
        );

        if (onFiltersChange) {
            onFiltersChange(cleanedFilters);
        }

        // Update URL with new filters
        updateUrlWithFilters(cleanedFilters);
    };

    const handleResetFilters = () => {
        onFiltersChange?.({});
        // Reset URL to pathname without query params
        router.replace(pathname, { scroll: false });
    };

    const renderFilterOptions = (
        inputType: string | undefined,
        options:
            | { id?: number; code?: string; name?: string; slug?: string; value?: string; label?: string }[]
            | undefined,
        filterName: string
    ) => {
        if (!options) return null;

        const type = inputType?.toLowerCase();
        const currentValue = currentFilters[filterName] as string | undefined;

        if (type === 'select') {
            return (
                <div className="px-4 pb-3">
                    <select
                        className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                        value={currentValue ?? ''}
                        onChange={(e) => handleFilterChange(filterName, e.target.value)}
                    >
                        <option value="">Select an option</option>
                        {options.map((option, index) => (
                            <option key={option.id ?? index} value={option.code ?? option.slug ?? option.value}>
                                {option.name ?? option.label}
                            </option>
                        ))}
                    </select>
                </div>
            );
        }

        if (type === 'radio' || type === 'single') {
            return (
                <div className="px-4 pb-3 space-y-2">
                    {options.map((option, index) => {
                        const optionValue = option.code ?? option.slug ?? option.value;
                        return (
                            <label key={option.id ?? index} className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name={filterName}
                                    value={optionValue}
                                    checked={currentValue === optionValue}
                                    onChange={(e) => handleFilterChange(filterName, e.target.value)}
                                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-sm">{option.name ?? option.label}</span>
                            </label>
                        );
                    })}
                </div>
            );
        }

        // Checkbox (multiple selection) - store as comma-separated string
        return (
            <div className="px-4 pb-3 space-y-2">
                {options.map((option, index) => {
                    const optionValue = option.code ?? option.slug ?? option.value ?? '';
                    const selectedValues = currentValue ? currentValue.split(',') : [];
                    const isChecked = selectedValues.includes(optionValue);

                    return (
                        <label key={option.id ?? index} className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                value={optionValue}
                                checked={isChecked}
                                onChange={(e) => {
                                    const newValues = e.target.checked
                                        ? [...selectedValues, optionValue]
                                        : selectedValues.filter(v => v !== optionValue);
                                    handleFilterChange(filterName, newValues.length > 0 ? newValues.join(',') : undefined);
                                }}
                                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                            />
                            <span className="text-sm">{option.name ?? option.label}</span>
                        </label>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="h-full flex flex-col">
            {/* Fixed Header Section */}
            <div className="flex-shrink-0 p-6 pb-0">
                {/* Header with the toggle button */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-bold">{t('title')}</h2>
                    <div className="flex items-center gap-2">
                        <span className="text-sm">{t('advancedFilters')}</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={isExpanded}
                                onChange={(e) => setIsExpanded(e.target.checked)}
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
                        </label>
                    </div>
                </div>

                {/* Beaches Count */}
                <div className="py-2 flex items-center justify-between gap-4">
                    <p className="text-sm text-gray-600">
                        {beachesLoading ? (
                            t('loadingFilters')
                        ) : (
                            `${t('found')} (${beachesCount})`
                        )}
                    </p>
                    <button
                        type="button"
                        onClick={handleResetFilters}
                        className="text-sm text-blue-600 hover:text-blue-800 disabled:text-gray-400"
                        disabled={Object.keys(currentFilters).length === 0}
                    >
                        {t('resetFilters')}
                    </button>
                </div>
            </div>

            {/* Quick filters (advanced off): options from the filters API, icons from the local set */}
            {!isExpanded && quickFilters.length > 0 && (
                <div className="flex-1 overflow-y-auto px-6 py-6">
                    <div className="grid grid-cols-2 gap-3">
                        {quickFilters.map((tile) => {
                            const selected = isQuickFilterSelected(currentFilters, tile.filterKey, tile.code);
                            return (
                                <button
                                    key={`${tile.filterKey}:${tile.code}`}
                                    type="button"
                                    aria-pressed={selected}
                                    onClick={() => handleFilterChange(
                                        tile.filterKey,
                                        toggleFilterValue(currentFilters[tile.filterKey], tile.code),
                                    )}
                                    className={[
                                        'flex min-h-[88px] flex-col items-center justify-center gap-1.5',
                                        'rounded-lg border bg-white p-2 text-center transition-colors hover:border-gray-400',
                                        selected ? 'border-[#222] shadow-sm' : 'border-gray-200',
                                    ].join(' ')}
                                >
                                    <Image
                                        src={tile.icon}
                                        alt=""
                                        width={36}
                                        height={36}
                                        className="h-9 w-9 object-contain"
                                    />
                                    <span className="text-xs leading-tight text-[#222]">{tile.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Scrollable Filter Categories */}
            {isExpanded && (
                <div className="flex-1 overflow-y-auto px-6 py-6">
                    <div className="flex flex-col gap-4">
                        {isLoading && (
                            <div className="text-center text-gray-500 py-4">
                                {t('loadingFilters')}
                            </div>
                        )}

                        {error && (
                            <div className="text-center text-red-500 py-4">
                                {error instanceof Error ? error.message : 'Failed to fetch filters'}
                            </div>
                        )}

                        {!isLoading && !error && filterOptions && (
                            <>
                                {/* Dynamically render all filter categories */}
                                {Object.entries(filterOptions).map(([filterKey, filterData]) => {
                                    if (!filterData) return null;
                                    return (
                                        <div key={filterKey} className="border border-gray-200 rounded-lg">
                                            <button
                                                onClick={() => toggleSection(filterKey)}
                                                className="w-full flex justify-between items-center px-4 py-3 hover:bg-gray-50 transition-colors rounded-lg"
                                            >
                                                <div className="flex items-center gap-2">
                                                    {filterData.icon && (
                                                        <Image
                                                            src={buildCdnUrl(filterData.icon, 'icon') ?? ''}
                                                            alt=""
                                                            width={20}
                                                            height={20}
                                                            className="object-contain"
                                                        />
                                                    )}
                                                    <h3 className="font-semibold text-sm">
                                                        {filterData.title ?? filterKey}
                                                    </h3>
                                                </div>
                                                {expandedSections[filterKey] ? (
                                                    <ChevronUp className="text-gray-500" />
                                                ) : (
                                                    <ChevronDown className="text-gray-500" />
                                                )}
                                            </button>
                                            {expandedSections[filterKey] &&
                                                renderFilterOptions(
                                                    filterData.input_type,
                                                    filterData.options,
                                                    filterKey
                                                )
                                            }
                                        </div>
                                    );
                                })}
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default LeftSidebarFilters;

