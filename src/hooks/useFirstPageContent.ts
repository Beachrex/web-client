'use client';

import { useQuery } from '@tanstack/react-query';
import { getFirstPageContent } from '@/lib/api-client';
import type { FirstPageContent } from '@/lib/api-client';
import { useMemo } from 'react';

/**
 * Hook to fetch ALL first page content sections at once
 */
export function useFirstPageContent() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['first-page-content'],
    queryFn: async () => {
      const response = await getFirstPageContent();
      return response.data;
    },
  });

  const sections = useMemo(() => {
    if (!data?.data) return {};

    // Convert array to object keyed by code for easy access
    return (data.data).reduce((acc, section) => {
      if (section.code) {
        acc[section.code] = section;
      }
      return acc;
    }, {} as Record<string, FirstPageContent>);
  }, [data]);

  return {
    sections,
    loading: isLoading,
    error: error ? 'Failed to load content' : null,
  };
}

/**
 * Hook to get a specific section by code
 */
export function useSection(code: string) {
  const { sections, loading, error } = useFirstPageContent();

  return {
    content: sections[code],
    loading,
    error,
  };
}

/**
 * Hook specifically for the hero banner section
 */
export function useHeroBanner() {
  return useSection('hero_banner');
}

