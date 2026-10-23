'use client';

import clsx from 'clsx';
import { Check, ChevronDown, Search, X } from 'lucide-react';
import React from 'react';

import { normalizeSearchText } from '@/lib/utils/search-tabs';

export interface SearchableOption {
  value: string;
  label: string;
}

interface SearchableSelectProps {
  /** One value, or with `multiple` a comma-separated list ("HR,IT"). */
  value?: string;
  /** Several values (owner 2026-10-23); the list stays open while choosing. */
  multiple?: boolean;
  options: SearchableOption[];
  onChange: (value: string) => void;
  /** Shown when nothing is selected, e.g. "Vse države". */
  allLabel: string;
  searchPlaceholder: string;
  noMatchesLabel: string;
  clearLabel: string;
}

/**
 * Owner 2026-10-23: the map's country, region, island and city filters were plain selects with
 * "Izberite možnost" and long unsearchable lists. This one shows "All …" or the choice, and opens a list
 * with a search box (diacritics ignored: "krk" finds "Krk", "sibenik" finds "Šibenik"). The list opens
 * in place (not floating), so the scrolling sidebar never clips it. Keyboard: arrows, Enter, Escape.
 */
export default function SearchableSelect({
  value,
  multiple = false,
  options,
  onChange,
  allLabel,
  searchPlaceholder,
  noMatchesLabel,
  clearLabel,
}: SearchableSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const [active, setActive] = React.useState(0);
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const listRef = React.useRef<HTMLUListElement | null>(null);
  const listId = React.useId();

  const selectedValues = React.useMemo(
    () => (value ? (multiple ? value.split(',').filter(Boolean) : [value]) : []),
    [value, multiple],
  );
  const selectedOptions = selectedValues.map((v) => options.find((o) => o.value === v) ?? { value: v, label: v });
  const selected = selectedOptions[0];
  const display =
    selectedOptions.length > 1 ? `${selectedOptions[0]!.label} +${selectedOptions.length - 1}` : selected?.label;
  const filtered = React.useMemo(() => {
    const q = normalizeSearchText(query);
    if (!q) return options;
    return options.filter((o) => normalizeSearchText(o.label).includes(q));
  }, [options, query]);

  const close = React.useCallback(() => {
    setOpen(false);
    setQuery('');
  }, []);

  React.useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) close();
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open, close]);

  React.useEffect(() => setActive(0), [query, open]);

  React.useEffect(() => {
    listRef.current?.querySelector<HTMLElement>(`[data-index="${active}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  const choose = (v: string) => {
    if (multiple && v !== '') {
      const next = selectedValues.includes(v) ? selectedValues.filter((x) => x !== v) : [...selectedValues, v];
      onChange(next.join(','));
      return; // keep the list open to pick more
    }
    onChange(v);
    close();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const option = filtered[active];
      if (option) choose(option.value);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      close();
    }
  };

  return (
    <div ref={rootRef} className="relative">
      <div
        className={clsx(
          'flex w-full items-center rounded-lg border bg-white text-sm transition',
          selected ? 'border-[#1A3C68] ring-1 ring-[#1A3C68]' : 'border-gray-300 hover:border-gray-400',
        )}
      >
        <button
          type="button"
          onClick={() => (open ? close() : setOpen(true))}
          aria-haspopup="listbox"
          title={selectedOptions.length > 1 ? selectedOptions.map((o) => o.label).join(', ') : undefined}
          aria-expanded={open}
          aria-controls={open ? listId : undefined}
          className="flex min-w-0 flex-1 items-center justify-between gap-2 px-3 py-2 text-left"
        >
          <span className={clsx('truncate', selected ? 'font-semibold text-[#1A3C68]' : 'text-gray-700')}>
            {display ?? allLabel}
          </span>
          {!selected && (
            <ChevronDown size={16} aria-hidden="true" className={clsx('shrink-0 text-gray-500 transition', open && 'rotate-180')} />
          )}
        </button>
        {selected && (
          <button
            type="button"
            onClick={() => choose('')}
            aria-label={clearLabel}
            className="mr-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100"
          >
            <X size={15} aria-hidden="true" />
          </button>
        )}
      </div>

      {open && (
        <div className="mt-1 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg" onKeyDown={onKeyDown}>
          <div className="flex items-center gap-2 border-b border-gray-100 px-3 py-2">
            <Search size={15} aria-hidden="true" className="shrink-0 text-gray-400" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={searchPlaceholder}
              aria-label={searchPlaceholder}
              aria-controls={listId}
              aria-activedescendant={filtered[active] ? `${listId}-${active}` : undefined}
              className="w-full border-none bg-transparent p-0 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-0"
            />
          </div>
          <ul
            ref={listRef}
            id={listId}
            role="listbox"
            aria-multiselectable={multiple || undefined}
            className="max-h-60 overflow-y-auto py-1"
          >
            {filtered.length === 0 && <li className="px-3 py-2 text-sm text-gray-500">{noMatchesLabel}</li>}
            {filtered.map((option, index) => {
              const isSelected = selectedValues.includes(option.value);
              return (
                <li
                  key={option.value}
                  id={`${listId}-${index}`}
                  data-index={index}
                  role="option"
                  aria-selected={isSelected}
                  onMouseDown={(e) => e.preventDefault()}
                  onMouseEnter={() => setActive(index)}
                  onClick={() => choose(option.value)}
                  className={clsx(
                    'flex cursor-pointer items-center gap-2 px-3 py-2 text-sm',
                    multiple ? 'flex-row-reverse justify-end' : 'justify-between',
                    index === active ? 'bg-blue-50' : '',
                    isSelected ? 'font-semibold text-[#1A3C68]' : 'text-gray-700',
                  )}
                >
                  <span className="truncate">{option.label}</span>
                  {multiple ? (
                    <span
                      aria-hidden="true"
                      className={clsx(
                        'flex h-4 w-4 shrink-0 items-center justify-center rounded border',
                        isSelected ? 'border-[#1A3C68] bg-[#1A3C68] text-white' : 'border-gray-300 bg-white',
                      )}
                    >
                      {isSelected && <Check size={12} />}
                    </span>
                  ) : (
                    isSelected && (
                      <Check
                        size={15}
                        aria-hidden="true"
                        className="shrink-0"
                      />
                    )
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
