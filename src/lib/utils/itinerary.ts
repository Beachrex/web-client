/**
 * AI itinerary planner (AI-3): the request the form sends, packages with prices from the API, and the
 * error mapping. Kept free of React so the unit tests can cover it.
 */

export const TRIP_LENGTHS = [3, 7, 14] as const;
export type TripLength = (typeof TRIP_LENGTHS)[number];

/** Must match ItineraryRequest `preferences.interests.*` in the backend. */
export const INTERESTS = [
  'swimming',
  'snorkeling',
  'family',
  'quiet',
  'nightlife',
  'nature',
  'diving',
  'surfing',
  'kayaking',
  'hiking',
] as const;
export type Interest = (typeof INTERESTS)[number];

/** Subset of ItineraryRequest `preferences.surface_types.*` that the database actually has. */
export const SURFACES = ['sand', 'pebble', 'rock'] as const;
export type Surface = (typeof SURFACES)[number];

export const PACES = ['relaxed', 'balanced', 'packed'] as const;
export type Pace = (typeof PACES)[number];

export interface ItineraryForm {
  countryCode: string;
  regionSlug: string;
  days: TripLength;
  interests: Interest[];
  surfaces: Surface[];
  pace: Pace;
  adults: number;
  children: number;
}

export const DEFAULT_FORM: ItineraryForm = {
  countryCode: '',
  regionSlug: '',
  days: 7,
  interests: [],
  surfaces: [],
  pace: 'balanced',
  adults: 2,
  children: 0,
};

/** Package as returned by GET /api/v1/payments/products. */
export interface ItineraryProduct {
  product_type: string;
  days: number;
  amount: number;
  currency: string;
  credits: number;
}

export type Credits = Record<TripLength, number>;

export function productTypeFor(days: TripLength): string {
  return `itinerary_${days}day`;
}

export function productFor(products: ItineraryProduct[], days: TripLength): ItineraryProduct | undefined {
  return products.find((p) => p.days === days);
}

/** Website locale → BCP 47 for Intl (si/ua are our own codes). */
export function intlLocale(locale: string): string {
  return locale === 'si' ? 'sl' : locale === 'ua' ? 'uk' : locale;
}

export function formatPrice(product: Pick<ItineraryProduct, 'amount' | 'currency'>, locale: string): string {
  try {
    return new Intl.NumberFormat(intlLocale(locale), {
      style: 'currency',
      currency: product.currency,
      minimumFractionDigits: Number.isInteger(product.amount) ? 0 : 2,
    }).format(product.amount);
  } catch {
    return `${product.amount} ${product.currency}`;
  }
}

export function creditsFromEntitlements(e: Partial<Record<string, number>> | undefined): Credits {
  return {
    3: e?.itinerary_3day_credits ?? 0,
    7: e?.itinerary_7day_credits ?? 0,
    14: e?.itinerary_14day_credits ?? 0,
  };
}

/** Body for POST /api/v1/ai/itineraries. The page language goes in Accept-Language, not in the body. */
export function buildItineraryRequest(form: ItineraryForm): Record<string, unknown> {
  return {
    destination: {
      country_code: form.countryCode.toUpperCase(),
      ...(form.regionSlug ? { region_slug: form.regionSlug } : {}),
    },
    duration_days: form.days,
    travel_party: { adults: form.adults, children: form.children },
    preferences: {
      pace: form.pace,
      ...(form.interests.length ? { interests: form.interests } : {}),
      ...(form.surfaces.length ? { surface_types: form.surfaces } : {}),
    },
  };
}

export type ItineraryErrorKey = 'signInRequired' | 'buyRequired' | 'notEnoughBeaches' | 'busy' | 'error';

export function itineraryErrorKey(status: number, body?: { error?: string }): ItineraryErrorKey {
  if (status === 401) return 'signInRequired';
  if (status === 402) return 'buyRequired';
  if (status === 422 && body?.error === 'not_enough_beaches') return 'notEnoughBeaches';
  if (status === 429 || status === 503) return 'busy';

  return 'error';
}

export function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

/** Form kept across the Stripe checkout round trip (sessionStorage; may be unavailable). */
const FORM_KEY = 'beachrex.itinerary.form';

export function saveFormForCheckout(form: ItineraryForm): void {
  try {
    sessionStorage.setItem(FORM_KEY, JSON.stringify(form));
  } catch {
    // Private mode or blocked storage: the visitor fills the form again.
  }
}

export function restoreFormAfterCheckout(): ItineraryForm | null {
  try {
    const raw = sessionStorage.getItem(FORM_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<ItineraryForm>;
    if (!TRIP_LENGTHS.includes(parsed.days!) || typeof parsed.countryCode !== 'string') return null;

    return {
      ...DEFAULT_FORM,
      ...parsed,
      interests: (parsed.interests ?? []).filter((i): i is Interest => (INTERESTS as readonly string[]).includes(i)),
      surfaces: (parsed.surfaces ?? []).filter((s): s is Surface => (SURFACES as readonly string[]).includes(s)),
    };
  } catch {
    return null;
  }
}

export function clearSavedForm(): void {
  try {
    sessionStorage.removeItem(FORM_KEY);
  } catch {
    // ignore
  }
}
