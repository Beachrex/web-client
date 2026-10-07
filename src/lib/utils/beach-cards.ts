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
