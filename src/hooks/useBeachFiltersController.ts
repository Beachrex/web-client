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

export function useBeachFiltersController({
  baseFilters = {},
  hiddenFilterKeys = [],
  optionScopeFilters = {},
}: UseBeachFiltersControllerProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [userFilters, setUserFilters] = useState<Record<string, FilterValue>>(
    {},
  );

  const lastValidatedFiltersRef = useRef<Record<string, FilterValue>>({});

  /* ---------------- URL → STATE ---------------- */

  useEffect(() => {
    if (!searchParams) return;

    const initialFilters: Record<string, FilterValue> = {};

    searchParams.forEach((value, key) => {
      if (!hiddenFilterKeys.includes(key)) {
        initialFilters[key] = value;
      }
    });

    setUserFilters(initialFilters);
  }, [searchParams, hiddenFilterKeys]);

  /* ---------------- STATE → URL ---------------- */

  useEffect(() => {
  const params = new URLSearchParams();

  Object.entries(userFilters).forEach(([key, value]) => {
    if (
      value !== undefined &&
      value !== null &&
      value !== '' &&
      !hiddenFilterKeys.includes(key)
    ) {
      params.set(key, String(value));
    }
  });

  const query = params.toString();


  router.replace(
    query ? `${pathname}?${query}` : pathname,
    { scroll: false }
  );
}, [userFilters, hiddenFilterKeys, pathname, router]);


  /* ---------------- QUERY PARAMS ---------------- */

  const queryParams = useMemo(() => {
    const params: Record<string, string | number> = { ...baseFilters };

    Object.entries(userFilters).forEach(([key, value]) => {
      if (
        value !== undefined &&
        value !== null &&
        value !== '' &&
        !hiddenFilterKeys.includes(key)
      ) {
        params[key] =
          typeof value === 'boolean' ? (value ? 1 : 0) : value;
      }
    });

    return params;
  }, [baseFilters, userFilters, hiddenFilterKeys]);

    /* ---------------- FILTER OPTIONS QUERY (HARD SCOPE) ---------------- */

  const filterOptionsQuery = useMemo(() => {
    return {
      ...queryParams,
      ...optionScopeFilters,
    };
  }, [queryParams, optionScopeFilters]);


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
      if (hiddenFilterKeys.includes(key)) return;
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
  }, [userFilters, filterOptions, hiddenFilterKeys]);

  /* ---------------- FINAL FILTERS ---------------- */

  const filters = {
    ...baseFilters,
    ...validatedUserFilters,
  };

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
