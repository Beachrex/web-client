'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { useQuery } from '@tanstack/react-query';
import { getBeachFiltersOptions } from '@/lib/api-client/@tanstack/react-query.gen';
import { env } from '@/env';
import { useBeaches } from '@/hooks/useBeaches';
import { useTranslations } from 'next-intl';

const LeftSidebarFilters = () => {
    const t = useTranslations('BeachesMap');
    const [isExpanded, setIsExpanded] = useState(false);
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

    const cdnEndpoint = env.NEXT_PUBLIC_CDN_ENDPOINT;
    const { beaches, loading: beachesLoading } = useBeaches();

    // Fetch filters using TanStack Query
    const { data, isLoading, error } = useQuery(getBeachFiltersOptions());
    const filters = data?.data ?? null;

    // Initialize expanded sections when filters data changes
    useEffect(() => {
        if (filters) {
            const initialExpandedState: Record<string, boolean> = {};
            Object.keys(filters).forEach(key => {
                initialExpandedState[key] = false;
            });
            setExpandedSections(initialExpandedState);
        }
    }, [filters]);

    const toggleSection = (section: string) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section],
        }));
    };

    const renderFilterOptions = (
        inputType: string | undefined,
        options: { id?: number; code?: string; name?: string; slug?: string }[] | undefined,
        filterName: string
    ) => {
        if (!options) return null;

        const type = inputType?.toLowerCase();

        if (type === 'select') {
            return (
                <div className="px-4 pb-3">
                    <select className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm">
                        <option value="">Select an option</option>
                        {options.map((option) => (
                            <option key={option.id} value={option.code ?? option.slug}>
                                {option.name}
                            </option>
                        ))}
                    </select>
                </div>
            );
        }

        if (type === 'radio' || type === 'single') {
            return (
                <div className="px-4 pb-3 space-y-2">
                    {options.map((option) => (
                        <label key={option.id} className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name={filterName}
                                value={option.code ?? option.slug}
                                className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm">{option.name}</span>
                        </label>
                    ))}
                </div>
            );
        }

        return (
            <div className="px-4 pb-3 space-y-2">
                {options.map((option) => (
                    <label key={option.id} className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            value={option.code ?? option.slug}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm">{option.name}</span>
                    </label>
                ))}
            </div>
        );
    };

    return (
        <div className="p-6">
            <div className="flex flex-col gap-6">
                {/* Header with the toggle button */}
                <div className="flex justify-between items-center">
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
                <div className="py-2">
                    <p className="text-sm text-gray-600">
                        {beachesLoading ? (
                            t('loadingFilters')
                        ) : (
                            `${t('found')} (${beaches.length})`
                        )}
                    </p>
                </div>

                {/* Filter Categories */}
                {isExpanded && (
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

                        {!isLoading && !error && filters && (
                            <>
                                {/* Dynamically render all filter categories */}
                                {Object.entries(filters).map(([filterKey, filterData]) => {
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
                                                            src={`${cdnEndpoint}${filterData.icon}`}
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
                                                    <FiChevronUp className="text-gray-500" />
                                                ) : (
                                                    <FiChevronDown className="text-gray-500" />
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
                )}
            </div>
        </div>
    );
};

export default LeftSidebarFilters;
