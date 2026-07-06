import { useEffect, useMemo, useRef, useState } from 'react';
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

function shallowEqualFilters(
  a: Record<string, FilterValue>,
  b: Record<string, FilterValue>,
): boolean {
  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);
  if (aKeys.length !== bKeys.length) return false;
  return aKeys.every((key) => a[key] === b[key]);
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

  const [userFilters, setUserFilters] = useState<Record<string, FilterValue>>(
    {},
  );

  const lastValidatedFiltersRef = useRef<Record<string, FilterValue>>({});

  /* ---------------- URL → STATE ---------------- */

  useEffect(() => {
    if (!searchParams) return;

    const initialFilters: Record<string, FilterValue> = {};

    searchParams.forEach((value, key) => {
      if (!hiddenFilterKeysStable.includes(key)) {
        initialFilters[key] = value;
      }
    });

    // Only update state when the derived filters actually changed, otherwise
    // we create a new object reference on every run and retrigger downstream
    // effects (STATE → URL), causing an infinite update loop.
    setUserFilters((prev) =>
      shallowEqualFilters(prev, initialFilters) ? prev : initialFilters,
    );
  }, [searchParams, hiddenFilterKeysStable]);

  /* ---------------- STATE → URL ---------------- */

  useEffect(() => {
  const params = new URLSearchParams();

  Object.entries(userFilters).forEach(([key, value]) => {
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

  // Skip navigation when the query string already matches the current URL.
  // This breaks the URL ↔ STATE cycle that otherwise loops forever.
  const currentQuery = searchParams?.toString() ?? '';
  if (query === currentQuery) return;

  router.replace(
    query ? `${pathname}?${query}` : pathname,
    { scroll: false }
  );
}, [userFilters, hiddenFilterKeysStable, pathname, router, searchParams]);


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

  // Memoize so consumers (e.g. useAllBeaches) receive a stable reference and
  // don't refetch / re-render on every parent render.
  const filters = useMemo(
    () => ({
      ...baseFiltersStable,
      ...validatedUserFilters,
    }),
    [baseFiltersStable, validatedUserFilters],
  );

  const resetFilters = () => {
    setUserFilters({});
    router.replace(pathname, { scroll: false });
  };

  return {
    filters,
    userFilters: validatedUserFilters,
    setUserFilters,
    filterOptions,
    isFilterOptionsLoading: isLoading,
    resetFilters,
  };
}
