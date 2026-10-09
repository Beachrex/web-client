import type { Country } from '@/lib/api-client/types.gen';
import { buildBeachMapUrl, buildContinentUrl, buildCountryUrl, getBeachesWord } from '@/lib/utils/beach-urls';
import type { QuickFilterTile } from '@/lib/utils/quick-filters';

export interface MenuItem {
  label: string;
  href: string;
  icon?: string;
  subItems?: MenuItem[];
}

interface MenuContinent {
  code: string;
  name: string;
  slug: string;
  beaches_count: number;
}

/** A menu group of pre-filtered beaches; every tile opens the beach map with that filter. */
export interface MenuFilterGroupItems {
  label: string;
  icon: string;
  tiles: QuickFilterTile[];
}

export interface MenuLabels {
  browseBeaches: string;
  topCountries: string;
  aiAssistant: string;
  aiChat: string;
  aiItinerary: string;
  about: string;
  contact: string;
}

/** How many countries the "Top beach countries" group lists. */
export const TOP_COUNTRIES = 10;

/**
 * Burger menu items from API data (TASK-004). Replaces the static `public/menu_*.json`, which had
 * English continent slugs (404 in locales with a localized slug) and only one enabled item.
 * Every href is locale-prefixed and localized; groups without data are left out.
 */
export function buildMenuItems({
  locale,
  continents,
  countries,
  aboutUrl,
  contactUrl,
  labels,
  filterGroups = [],
}: {
  locale: string;
  continents: MenuContinent[];
  countries: Country[];
  aboutUrl: string | null;
  contactUrl: string | null;
  labels: MenuLabels;
  filterGroups?: MenuFilterGroupItems[];
}): MenuItem[] {
  const items: MenuItem[] = [];

  const withBeaches = continents.filter((c) => c.slug && c.beaches_count > 0);
  items.push({
    label: labels.browseBeaches,
    href: `/${locale}/${getBeachesWord(locale)}`,
    icon: '/images/menu/world.svg',
    subItems: [...withBeaches]
      .sort((a, b) => b.beaches_count - a.beaches_count)
      .map((c) => ({ label: c.name, href: buildContinentUrl(locale, c.slug) })),
  });

  const continentSlug = new Map(continents.map((c) => [c.code, c.slug]));
  const top = countries
    .filter((c) => c.slug && c.name && (c.beaches_count ?? 0) > 0 && continentSlug.get(c.continent_code ?? ''))
    .sort((a, b) => (b.beaches_count ?? 0) - (a.beaches_count ?? 0))
    .slice(0, TOP_COUNTRIES);
  if (top.length > 0) {
    items.push({
      label: labels.topCountries,
      href: `/${locale}/${getBeachesWord(locale)}`,
      icon: '/images/menu/baggage.svg',
      subItems: top.map((c) => ({
        label: c.name!,
        href: buildCountryUrl(locale, continentSlug.get(c.continent_code!)!, c.slug!),
      })),
    });
  }

  for (const group of filterGroups) {
    if (group.tiles.length === 0) continue;
    items.push({
      label: group.label,
      href: buildBeachMapUrl(locale),
      icon: group.icon,
      subItems: group.tiles.map((tile) => ({
        label: tile.label,
        href: buildBeachMapUrl(locale, new URLSearchParams({ [tile.filterKey]: tile.code }).toString()),
        icon: tile.icon,
      })),
    });
  }

  items.push({
    label: labels.aiAssistant,
    href: `/${locale}/ai`,
    subItems: [
      { label: labels.aiChat, href: `/${locale}/ai/chat` },
      { label: labels.aiItinerary, href: `/${locale}/ai/itinerary` },
    ],
  });

  if (aboutUrl) items.push({ label: labels.about, href: aboutUrl, icon: '/images/menu/info.svg' });
  if (contactUrl) items.push({ label: labels.contact, href: contactUrl });

  return items;
}
