import type { Property } from '@/components/PropertySection';
import type { BeachLike } from './mapBeachToProperty';
import { mapBeachToProperty } from './mapBeachToProperty';

export function mapBeachToPropertyWithUrl(
  beach: BeachLike | null | undefined,
  options: Parameters<typeof mapBeachToProperty>[1],
  locale?: string,
): Property | null {
  const p = mapBeachToProperty(beach, {
    ...options,
    locale,
  });

  if (!p) return null;
  return p;
}
