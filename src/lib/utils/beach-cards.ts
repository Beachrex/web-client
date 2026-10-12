// src/lib/utils/beach-cards.ts

/**
 * Beach listings (continent, country, region, island, city pages) render one card per beach,
 * and the card needs a main image (`next/image` throws without a `src`).
 * Some beaches have no `main_image`, so they are left out of card lists instead of crashing
 * the whole page (QA #19, #55, #56, #60, #77). Same rule as `mapBeachToProperty`.
 */
export function hasMainImage<T extends { main_image?: string | null }>(
  beach: T,
): beach is T & { main_image: string } {
  return typeof beach.main_image === 'string' && beach.main_image.trim() !== '';
}

/**
 * A beach without `main_image` but with gallery photos uses its first gallery photo (owner 2026-10-12:
 * French beaches uploaded from the mobile app had none, so Bretagne showed no beach cards at all).
 */
export function withMainImage<
  T extends { main_image?: string | null; media?: { gallery?: { url?: string | null }[] | null } | null },
>(beach: T): T {
  if (hasMainImage(beach)) return beach;
  const first = beach.media?.gallery?.find((img) => typeof img.url === 'string' && img.url.trim() !== '');
  return first?.url ? { ...beach, main_image: first.url } : beach;
}
