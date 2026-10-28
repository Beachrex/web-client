'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useMemo, useState, type ComponentProps } from 'react';
import DestinationsCarousel from '@/components/DestinationsCarousel';
import DestinationSortSelect from '@/components/DestinationSortSelect';
import { buildDestinationUrl } from '@/lib/utils/destination-url';
import {
  DEFAULT_DESTINATION_SORT,
  sortDestinations,
  type DestinationSort,
} from '@/lib/utils/destination-sort';

type DestinationType = 'country' | 'region' | 'city' | 'island';

interface DestinationLocation {
  continent_slug: string;
  country_slug: string;
  region_slug?: string | null;
  island_slug?: string | null;
}

interface RoutableDestination {
  slug: string;
  location: DestinationLocation;
}

interface DestinationSectionConfig<T> {
  type: DestinationType;
  items: T[];

  titleKey: string;
  titleNamespace?:
    | 'Common'
    | 'HomePage'
    | 'ContinentPage'
    | 'countryPage'
    | 'RegionPage'
    | 'IslandPage';

  countKey?: string;
  badgeKey?: string;

  cardVariant?: 'default' | 'city' | 'island' | 'region';
  showFlag?: boolean;
  /** Shows the "Sort by" control (alphabetical / most / fewest beaches); the list then starts alphabetical. */
  sortable?: boolean;

  backgroundClassName?: string;
  titleClassName?: string;
}

interface DestinationsSectionProps {
  context: 'home' | 'continent' | 'country' | 'region' | 'island';
  contextName?: string;
  sections: DestinationSectionConfig<unknown>[];
}

function buildUrl(
  locale: string,
  type: DestinationType,
  item: RoutableDestination,
) {
  return buildDestinationUrl({
    locale,
    type,
    slug: item.slug,
    location: item.location,
  });
}

type CarouselProps = ComponentProps<typeof DestinationsCarousel>;

/** A carousel with its own "Sort by" state (one per section, so each list sorts independently). */
function SortableDestinationsCarousel(props: CarouselProps) {
  const locale = useLocale();
  const [sort, setSort] = useState<DestinationSort>(DEFAULT_DESTINATION_SORT);
  const sortedItems = useMemo(
    () => sortDestinations(props.items, sort, locale),
    [props.items, sort, locale],
  );

  return (
    <DestinationsCarousel
      {...props}
      items={sortedItems}
      headerActions={<DestinationSortSelect value={sort} onChange={setSort} />}
    />
  );
}

function isRoutableDestination(item: unknown): item is RoutableDestination {
  return (
    typeof item === 'object' &&
    item !== null &&
    'slug' in item &&
    'location' in item &&
    typeof (item as { slug: unknown }).slug === 'string' &&
    typeof (item as { location: unknown }).location === 'object' &&
    (item as { location: unknown }).location !== null
  );
}

export default function DestinationsSection({
  context,
  contextName,
  sections,
}: DestinationsSectionProps) {
  const locale = useLocale();

  // Default namespace based on context (existing behavior)
  const tDefault = useTranslations(
    context === 'home' ? 'HomePage'
    : context === 'country' ? 'countryPage'
    : context === 'region' ? 'RegionPage'
    : context === 'island' ? 'IslandPage'
    : 'ContinentPage'
  );

  // Explicit Common namespace
  const tCommon = useTranslations('Common');

  return (
    <>
      {sections.map((section) => {
        const routableItems = section.items.filter(isRoutableDestination);

        if (routableItems.length === 0) {
          return null;
        }

        const itemsWithUrl = routableItems.map((item) => ({
          ...item,
          url: buildUrl(locale, section.type, item),
        }));
        const title =
          section.titleNamespace === 'Common'
            ? tCommon(section.titleKey)
            : tDefault(
                section.titleKey,
                contextName ? { [context]: contextName } : {},
              );

        const countLabel = section.countKey
          ? tDefault(section.countKey, { count: itemsWithUrl.length })
          : undefined;

        const badgeLabel = section.badgeKey
          ? tDefault(section.badgeKey)
          : undefined;

        const Carousel = section.sortable ? SortableDestinationsCarousel : DestinationsCarousel;

        return (
          <Carousel
            key={`${section.type}-${section.titleKey}`}
            items={itemsWithUrl}
            title={title}
            countLabel={countLabel}
            badgeLabel={badgeLabel}
            cardVariant={section.cardVariant}
            showFlag={section.showFlag}
            backgroundClassName={section.backgroundClassName}
            titleClassName={section.titleClassName}
          />
        );
      })}
    </>
  );
}
