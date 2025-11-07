'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { getBeachFilters } from '@/lib/api-client/sdk.gen';
import type { GetBeachFiltersResponse } from '@/lib/api-client/types.gen';
import { env } from '@/env';
import { useBeaches } from '@/hooks/useBeaches';
import { useTranslations } from 'next-intl';

const LeftSidebarFilters = () => {
    const t = useTranslations('BeachesMap');
    const [isExpanded, setIsExpanded] = useState(false);
    const [expandedSections, setExpandedSections] = useState({
        beachType: false,
        userType: false,
        waterbody: false,
    });
    const [filters, setFilters] = useState<GetBeachFiltersResponse['data'] | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const cdnEndpoint = env.NEXT_PUBLIC_CDN_ENDPOINT;
    const { beaches, loading: beachesLoading } = useBeaches();


    useEffect(() => {
        const fetchFilters = async () => {
            try {
                setIsLoading(true);
                const response = await getBeachFilters({
                    throwOnError: true,
                });
                if (response.data) {
                    setFilters(response.data.data ?? null);
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch filters');
                console.error('Error fetching beach filters:', err);
            } finally {
                setIsLoading(false);
            }
        };

        void fetchFilters();
    }, []);

    const toggleSection = (section: 'beachType' | 'userType' | 'waterbody') => {
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
                                {error}
                            </div>
                        )}

                        {!isLoading && !error && filters && (
                            <>
                                {/* Filter by Water Body */}
                                {filters.waterbody && (
                                    <div className="border border-gray-200 rounded-lg">
                                        <button
                                            onClick={() => toggleSection('waterbody')}
                                            className="w-full flex justify-between items-center px-4 py-3 hover:bg-gray-50 transition-colors rounded-lg"
                                        >
                                            <div className="flex items-center gap-2">
                                                {filters.waterbody.icon && (
                                                    <Image
                                                        src={`${cdnEndpoint}${filters.waterbody.icon}`}
                                                        alt=""
                                                        width={20}
                                                        height={20}
                                                        className="object-contain"
                                                    />
                                                )}
                                                <h3 className="font-semibold text-sm">
                                                    {filters.waterbody.title ?? 'Water Body'}
                                                </h3>
                                            </div>
                                            {expandedSections.waterbody ? (
                                                <FiChevronUp className="text-gray-500" />
                                            ) : (
                                                <FiChevronDown className="text-gray-500" />
                                            )}
                                        </button>
                                        {expandedSections.waterbody &&
                                            renderFilterOptions(
                                                filters.waterbody.input_type,
                                                filters.waterbody.options,
                                                'waterbody'
                                            )
                                        }
                                    </div>
                                )}

                                {/* Filter by Beach Type */}
                                {filters.beach_type && (
                                    <div className="border border-gray-200 rounded-lg">
                                        <button
                                            onClick={() => toggleSection('beachType')}
                                            className="w-full flex justify-between items-center px-4 py-3 hover:bg-gray-50 transition-colors rounded-lg"
                                        >
                                            <div className="flex items-center gap-2">
                                                {filters.beach_type.icon && (
                                                    <Image
                                                        src={`${cdnEndpoint}${filters.beach_type.icon}`}
                                                        alt=""
                                                        width={20}
                                                        height={20}
                                                        className="object-contain"
                                                    />
                                                )}
                                                <h3 className="font-semibold text-sm">
                                                    {filters.beach_type.title ?? 'Beach Type'}
                                                </h3>
                                            </div>
                                            {expandedSections.beachType ? (
                                                <FiChevronUp className="text-gray-500" />
                                            ) : (
                                                <FiChevronDown className="text-gray-500" />
                                            )}
                                        </button>
                                        {expandedSections.beachType &&
                                            renderFilterOptions(
                                                filters.beach_type.input_type,
                                                filters.beach_type.options,
                                                'beachType'
                                            )
                                        }
                                    </div>
                                )}

                                {/* Filter by User Type */}
                                {filters.user_type && (
                                    <div className="border border-gray-200 rounded-lg">
                                        <button
                                            onClick={() => toggleSection('userType')}
                                            className="w-full flex justify-between items-center px-4 py-3 hover:bg-gray-50 transition-colors rounded-lg"
                                        >
                                            <div className="flex items-center gap-2">
                                                {filters.user_type.icon && (
                                                    <Image
                                                        src={`${cdnEndpoint}${filters.user_type.icon}`}
                                                        alt=""
                                                        width={20}
                                                        height={20}
                                                        className="object-contain"
                                                    />
                                                )}
                                                <h3 className="font-semibold text-sm">
                                                    {filters.user_type.title ?? 'User Type'}
                                                </h3>
                                            </div>
                                            {expandedSections.userType ? (
                                                <FiChevronUp className="text-gray-500" />
                                            ) : (
                                                <FiChevronDown className="text-gray-500" />
                                            )}
                                        </button>
                                        {expandedSections.userType &&
                                            renderFilterOptions(
                                                filters.user_type.input_type,
                                                filters.user_type.options,
                                                'userType'
                                            )
                                        }
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default LeftSidebarFilters;
