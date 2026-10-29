'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocale } from 'next-intl';
import { useAuth } from '@/contexts/AuthContext';
import { addFavorite, getMyFavoriteIds, getMyFavorites, removeFavorite } from '@/lib/api-client/sdk.gen';
import { favoriteErrorKey, toggledIds, type FavoriteError } from '@/lib/utils/favorites';

export type { FavoriteError };

/**
 * Saved beaches (B-M2 web, owner 2026-10-09). One cached id list drives every heart on the page;
 * the list page reads the full cards. Keys carry the token so another account never sees cached ids.
 */
export const favoriteKeys = {
  ids: (token: string | null) => ['favorites', 'ids', token] as const,
  list: (token: string | null, locale: string) => ['favorites', 'list', token, locale] as const,
};

export function useFavoriteIds(): number[] {
  const { token } = useAuth();
  const { data } = useQuery({
    queryKey: favoriteKeys.ids(token),
    queryFn: async () => {
      const { data } = await getMyFavoriteIds({ throwOnError: true });
      return data.data ?? [];
    },
    enabled: Boolean(token),
    staleTime: 60 * 1000,
  });

  return token ? (data ?? []) : [];
}

export function useMyFavorites() {
  const { token } = useAuth();
  const locale = useLocale();

  return useQuery({
    queryKey: favoriteKeys.list(token, locale),
    queryFn: async () => {
      const { data } = await getMyFavorites({ throwOnError: true, headers: { 'Accept-Language': locale } });
      return { beaches: data.data ?? [], limit: data.meta?.limit ?? null };
    },
    enabled: Boolean(token),
    staleTime: 0,
  });
}

/** Save or remove a beach; the heart changes at once and rolls back if the API refuses. */
export function useToggleFavorite(onError?: (error: FavoriteError) => void) {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const key = favoriteKeys.ids(token);

  return useMutation({
    mutationFn: async ({ beachId, save }: { beachId: number; save: boolean }) => {
      const result = save
        ? await addFavorite({ body: { beach_id: beachId } })
        : await removeFavorite({ path: { beachId } });
      if (result.error !== undefined || !result.response?.ok) throw new Error(favoriteErrorKey(result.error));
    },
    onMutate: async ({ beachId, save }) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<number[]>(key);
      queryClient.setQueryData<number[]>(key, (ids = []) => toggledIds(ids, beachId, save));
      return { previous };
    },
    onError: (error, _vars, context) => {
      queryClient.setQueryData(key, context?.previous);
      onError?.(error.message === 'limit' ? 'limit' : 'error');
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });
}
