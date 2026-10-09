import { useCallback, useMemo, useRef } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { getBeachFiltersOptions } from '@/lib/api-client/@tanstack/react-query.gen';

interface UseBeachFiltersControllerProps {
  baseFilters?: Record<string, string | number>;
  hiddenFilterKeys?: string[];
  optionScopeFilters?: Record<string, string | number>;
}


type FilterValue = string | number | boolean | undefined;

type NormalizedFilterOptions = Record<
  string,
  {
    title?: string;
    icon?: string | null;
    input_type?: string;
    options?: {
      id?: number;
      code?: string;
      slug?: string;
      name?: string;
    }[];
  }
>;

interface FilterOptionGroup {
  options?: {
    id?: number;
    code?: string;
    slug?: string;
  }[];
}

export function useBeachFiltersController({
  baseFilters = {},
  hiddenFilterKeys = [],
  optionScopeFilters = {},
}: UseBeachFiltersControllerProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Callers typically pass inline object/array literals, which create a new
  // reference on every render. Stabilize them by content so the effects and
  // memos below don't re-run endlessly (which caused a render loop).
  const hiddenFilterKeysStable = useMemo(
    () => hiddenFilterKeys,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(hiddenFilterKeys)],
  );
  const baseFiltersStable = useMemo(
    () => baseFilters,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(baseFilters)],
  );
  const optionScopeFiltersStable = useMemo(
    () => optionScopeFilters,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(optionScopeFilters)],
  );

  // The URL search params are the single source of truth for user filters.
  // We derive `userFilters` directly from them instead of mirroring them
  // into a separate useState + two sync effects. The previous bidirectional
  // URL ↔ STATE effects ran one render behind each other and ping-ponged
  // forever when the page was loaded/refreshed with an existing query string
  // (e.g. ?country=HR), causing an infinite render + API-call loop.
  const userFilters = useMemo<Record<string, FilterValue>>(() => {
    const filters: Record<string, FilterValue> = {};
    searchParams?.forEach((value, key) => {
      if (!hiddenFilterKeysStable.includes(key)) {
        filters[key] = value;
      }
    });
    return filters;
  }, [searchParams, hiddenFilterKeysStable]);

  const lastValidatedFiltersRef = useRef<Record<string, FilterValue>>({});

  /* ---------------- STATE → URL ---------------- */

  // Changing filters writes directly to the URL; the `userFilters` memo
  // above picks up the new value on the next render. No bidirectional sync
  // effects, so no loop. Supports both object and functional updater forms
  // to stay compatible with existing callers.
  const setUserFilters = useCallback(
    (
      update:
        | Record<string, FilterValue>
        | ((prev: Record<string, FilterValue>) => Record<string, FilterValue>),
    ) => {
      const next =
        typeof update === 'function' ? update(userFilters) : update;

      const params = new URLSearchParams();
      Object.entries(next).forEach(([key, value]) => {
        if (
          value !== undefined &&
          value !== null &&
          value !== '' &&
          !hiddenFilterKeysStable.includes(key)
        ) {
          params.set(key, String(value));
        }
      });

      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    },
    [userFilters, hiddenFilterKeysStable, pathname, router],
  );


  /* ---------------- QUERY PARAMS ---------------- */

  const queryParams = useMemo(() => {
    const params: Record<string, string | number> = { ...baseFiltersStable };

    Object.entries(userFilters).forEach(([key, value]) => {
      if (
        value !== undefined &&
        value !== null &&
        value !== '' &&
        !hiddenFilterKeysStable.includes(key)
      ) {
        params[key] =
          typeof value === 'boolean' ? (value ? 1 : 0) : value;
      }
    });

    return params;
  }, [baseFiltersStable, userFilters, hiddenFilterKeysStable]);

    /* ---------------- FILTER OPTIONS QUERY (HARD SCOPE) ---------------- */

  const filterOptionsQuery = useMemo(() => {
    return {
      ...queryParams,
      ...optionScopeFiltersStable,
    };
  }, [queryParams, optionScopeFiltersStable]);


  /* ---------------- FETCH FILTER OPTIONS ---------------- */

  const { data, isLoading } = useQuery(
    getBeachFiltersOptions({
      query: filterOptionsQuery as never,
    })
  );

  const filterOptions = data?.data as NormalizedFilterOptions | null;

  /* ---------------- VALIDATION ---------------- */

  const validatedUserFilters = useMemo(() => {
    if (!filterOptions) {
      return lastValidatedFiltersRef.current;
    }

    const validated: Record<string, FilterValue> = {};

    Object.entries(userFilters).forEach(([key, value]) => {
      if (hiddenFilterKeysStable.includes(key)) return;
      if (!value) return;

      const filterData = filterOptions[key] as FilterOptionGroup | undefined;
      if (!filterData?.options) return;

      if (typeof value === 'string' && value.includes(',')) {
        const selected = value.split(',');
        const valid = selected.filter((v) =>
          filterData.options?.some(
            (opt) =>
              opt.code === v ||
              opt.slug === v ||
              String(opt.id) === v,
          ),
        );

        if (valid.length > 0) {
          validated[key] = valid.join(',');
        }
      } else {
        const isValid = filterData.options.some(
          (opt) =>
            opt.code === value ||
            opt.slug === value ||
            String(opt.id) === String(value),
        );

        if (isValid) {
          validated[key] = value;
        }
      }
    });

    lastValidatedFiltersRef.current = validated;
    return validated;
  }, [userFilters, filterOptions, hiddenFilterKeysStable]);

  /* ---------------- FINAL FILTERS ---------------- */

  // Memoize so consumers (e.g. useBeachPage) receive a stable reference and
  // don't refetch / re-render on every parent render.
  const filters = useMemo(
    () => ({
      ...baseFiltersStable,
      ...validatedUserFilters,
    }),
    [baseFiltersStable, validatedUserFilters],
  );

  const resetFilters = useCallback(() => {
    router.replace(pathname, { scroll: false });
  }, [pathname, router]);

  return {
    filters,
    userFilters: validatedUserFilters,
    setUserFilters,
    filterOptions,
    isFilterOptionsLoading: isLoading,
    resetFilters,
  };
}
