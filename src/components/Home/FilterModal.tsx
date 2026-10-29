'use client';

import { Button, Modal } from 'flowbite-react';
import React, { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import type { GetBeachFiltersResponse } from '@/lib/api-client/types.gen';
import { WATERBODY_KEY, waterbodyChoices } from '@/lib/utils/waterbody-filter';

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filterOptions: GetBeachFiltersResponse['data'] | null;
  selectedCategories: Record<string, string[]>;
  onApplyFilters: (filters: Record<string, string[]>) => void;
}

interface FilterSection {
  key: string;
  title: string;
  icon?: string | null;
  options: {
    code: string;
    name: string;
    /** The parameter this option sets when it is not the section's own (pool types under "Pool"). */
    filterKey?: string;
    nested?: boolean;
  }[];
}

const FilterModal: React.FC<FilterModalProps> = ({
  isOpen,
  onClose,
  filterOptions,
  selectedCategories,
  onApplyFilters,
}) => {
  const t = useTranslations('FilterModal');
  const [localSelectedCategories, setLocalSelectedCategories] = useState<Record<string, string[]>>(
    selectedCategories
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [showMoreSections, setShowMoreSections] = useState<Record<string, boolean>>({});

  // Parse filter options into sections
  const filterSections: FilterSection[] = useMemo(() => {
    if (!filterOptions) return [];

    // Priority filter keys to show in modal
    const modalPriorityFilters = [
      'beach_type',
      'location_infrastructure',
      'natural_location_condition',
      'accommodation_around',
      'sporting_activities',
      'culinary_offer',
      'waterbody',
      'user_type',
    ];

    return modalPriorityFilters
      .map((filterKey): FilterSection | null => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const filter = filterOptions[filterKey as keyof typeof filterOptions];
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        if (!filter?.options) return null;

        const options: FilterSection['options'] = [];
        // Indoor / outdoor pools under "Pool" (owner 2026-10-29)
        if (filterKey === WATERBODY_KEY) {
          waterbodyChoices(filterOptions as Parameters<typeof waterbodyChoices>[0]).forEach((choice) => {
            options.push({
              code: choice.code,
              name: choice.label,
              filterKey: choice.filterKey === WATERBODY_KEY ? undefined : choice.filterKey,
              nested: choice.nested,
            });
          });
          const group = filter as { title?: string | null; icon?: string | null };
          return { key: filterKey, title: group.title ?? filterKey, icon: group.icon, options };
        }
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        filter.options.forEach((option: { code?: string; name?: string }) => {
          if (option.code && option.name) {
            options.push({
              code: option.code,
              name: option.name,
            });
          }
        });

        return {
          key: filterKey,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          title: filter.title ?? filterKey,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          icon: filter.icon,
          options,
        };
      })
      .filter((section): section is FilterSection => section !== null);
  }, [filterOptions]);

  // Filter sections based on search query
  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return filterSections;

    const query = searchQuery.toLowerCase();
    return filterSections
      .map((section) => ({
        ...section,
        options: section.options.filter((option) =>
          option.name.toLowerCase().includes(query)
        ),
      }))
      .filter((section) => section.options.length > 0);
  }, [filterSections, searchQuery]);

  const toggleCategory = (filterKey: string, optionCode: string) => {
    setLocalSelectedCategories((prev) => {
      const currentValues = prev[filterKey] ?? [];
      const isSelected = currentValues.includes(optionCode);

      if (isSelected) {
        const newValues = currentValues.filter((code) => code !== optionCode);
        if (newValues.length === 0) {
          const { [filterKey]: _, ...rest } = prev;
          return rest;
        }
        return { ...prev, [filterKey]: newValues };
      } else {
        return {
          ...prev,
          [filterKey]: [...currentValues, optionCode],
        };
      }
    });
  };

  const toggleSection = (sectionKey: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionKey]: !prev[sectionKey],
    }));
  };

  const toggleShowMore = (sectionKey: string) => {
    setShowMoreSections((prev) => ({
      ...prev,
      [sectionKey]: !prev[sectionKey],
    }));
  };

  const handleApply = () => {
    onApplyFilters(localSelectedCategories);
    onClose();
  };

  const handleClearAll = () => {
    setLocalSelectedCategories({});
  };

  const totalSelected = Object.values(localSelectedCategories).flat().length;

  const MAX_VISIBLE_OPTIONS = 6; // Show first 6 options, rest behind "Show more"

  return (
    <Modal
      show={isOpen}
      onClose={onClose}
      size="4xl"
      position="center"
    >
      <Modal.Header>
        <div className="flex items-center justify-between">
          <span className="text-xl font-bold">{t('title')}</span>
          {totalSelected > 0 && (
            <span className="ml-4 text-sm text-gray-500">
              {totalSelected} filter{totalSelected !== 1 ? 's' : ''} selected
            </span>
          )}
        </div>
      </Modal.Header>

      <Modal.Body>
        {/* Search Bar */}
        <div className="mb-6">
          <input
            type="text"
            placeholder={t('searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </div>

        {/* Filter Sections */}
        <div className="space-y-4">
          {filteredSections.length === 0 ? (
            <p className="py-8 text-center text-gray-500">
              No filters found matching &quot;{searchQuery}&quot;
            </p>
          ) : (
            filteredSections.map((section) => {
              const sectionKeys = [section.key, ...section.options.flatMap((o) => (o.filterKey ? [o.filterKey] : []))];
              const sectionSelected = [...new Set(sectionKeys)].reduce(
                (n, key) => n + (localSelectedCategories[key]?.length ?? 0),
                0,
              );
              const isExpanded = expandedSections[section.key] ?? false;
              const showMore = showMoreSections[section.key] ?? false;
              const visibleOptions = showMore
                ? section.options
                : section.options.slice(0, MAX_VISIBLE_OPTIONS);
              const hiddenCount = section.options.length - MAX_VISIBLE_OPTIONS;

              return (
                <div
                  key={section.key}
                  className="rounded-lg border border-gray-200 bg-white"
                >
                  {/* Section Header */}
                  <button
                    onClick={() => toggleSection(section.key)}
                    className="flex w-full items-center justify-between p-4 text-left hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">
                        {isExpanded ? '▼' : '▶'}
                      </span>
                      <span className="font-semibold">
                        {section.title} ({section.options.length})
                      </span>
                    </div>
                    {sectionSelected > 0 && (
                      <span className="rounded-full bg-blue-500 px-3 py-1 text-xs text-white">
                        ☑️ {sectionSelected} selected
                      </span>
                    )}
                  </button>

                  {/* Section Content */}
                  {isExpanded && (
                    <div className="border-t border-gray-200 p-4">
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {visibleOptions.map((option) => {
                          const optionKey = option.filterKey ?? section.key;
                          const isSelected =
                            localSelectedCategories[optionKey]?.includes(option.code) ?? false;

                          return (
                            <label
                              key={`${optionKey}:${option.code}`}
                              className={`flex cursor-pointer items-center gap-2 rounded p-2 hover:bg-gray-50${option.nested ? ' pl-8' : ''}`}
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleCategory(optionKey, option.code)}
                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <span className="text-sm">{option.name}</span>
                            </label>
                          );
                        })}
                      </div>

                      {/* Show More Button */}
                      {hiddenCount > 0 && (
                        <button
                          onClick={() => toggleShowMore(section.key)}
                          className="mt-3 text-sm text-blue-600 hover:underline"
                        >
                          {showMore
                            ? t('showLess')
                            : t('showMore', { count: hiddenCount })}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Selected Filters Summary */}
        {totalSelected > 0 && (
          <div className="mt-6 rounded-lg bg-blue-50 p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="font-semibold text-blue-900">
                Selected Filters ({totalSelected})
              </span>
              <button
                onClick={handleClearAll}
                className="text-sm text-blue-600 hover:underline"
              >
                {t('clearAll')}
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {Object.entries(localSelectedCategories).flatMap(([filterKey, optionCodes]) =>
                optionCodes.map((code) => {
                  const option = filterSections
                    .flatMap((s) => s.options.map((o) => ({ ...o, key: o.filterKey ?? s.key })))
                    .find((o) => o.key === filterKey && o.code === code);

                  return option ? (
                    <span
                      key={`${filterKey}-${code}`}
                      className="flex items-center gap-1 rounded-full bg-blue-500 px-3 py-1 text-xs text-white"
                    >
                      {option.name}
                      <button
                        onClick={() => toggleCategory(filterKey, code)}
                        className="ml-1 hover:text-blue-200"
                      >
                        ×
                      </button>
                    </span>
                  ) : null;
                })
              )}
            </div>
          </div>
        )}
      </Modal.Body>

      <Modal.Footer>
        <div className="flex w-full items-center justify-between">
          <Button color="gray" onClick={onClose}>
            {t('cancel')}
          </Button>
          <Button color="blue" onClick={handleApply}>
            {totalSelected > 0 ? t('applyCount', { count: totalSelected }) : t('apply')}
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default FilterModal;

