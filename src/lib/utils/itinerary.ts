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

/** One beach of a generated plan (POST /ai/itineraries, GET /me/itinerary-plans/{id}). */
export interface PlanBeach {
  id: number;
  name: string;
  slug?: string;
  city?: string | null;
  surface?: string | null;
  facilities?: string[];
  main_image?: string | null;
  continent_slug?: string | null;
  country_slug?: string | null;
  region_slug?: string | null;
  island_slug?: string | null;
  city_slug?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

export interface PlanItem {
  type: string;
  time_block: string;
  beach?: PlanBeach;
  notes: string;
  why: string | null;
}

export interface Plan {
  title: string;
  summary: string;
  duration_days: number;
  days: {
    day_number: number;
    theme: string;
    base_area: string | null;
    items: PlanItem[];
    logistics: {
      estimated_travel_km: number;
      parking_notes: string | null;
      accessibility_notes: string | null;
      notes?: string | null;
    };
  }[];
  assumptions: string[];
  metadata: { narrative?: 'llm' | 'fallback'; credit_used?: boolean };
}

/** A background plan (AI-3): POST /ai/itinerary-plans, GET /me/itinerary-plans(/{id}). */
export type PlanStatus = 'queued' | 'running' | 'done' | 'failed';

export interface PlanSummary {
  id: string;
  status: PlanStatus;
  country_code: string;
  region_slug: string | null;
  duration_days: number;
  title: string | null;
  error: 'not_enough_beaches' | 'error' | 'timeout' | null;
  credit_used: boolean;
  created_at: string;
  finished_at: string | null;
  itinerary?: Plan | null;
}

export function isFinished(status: PlanStatus): boolean {
  return status === 'done' || status === 'failed';
}

/** Message key under AI.itinerary.plans.failed for a failed plan. */
export function planFailureKey(error: PlanSummary['error']): 'notEnoughBeaches' | 'timeout' | 'error' {
  if (error === 'not_enough_beaches') return 'notEnoughBeaches';
  if (error === 'timeout') return 'timeout';

  return 'error';
}

/** Poll every 3 s for the first minute, then every 10 s (a 14-day plan can take two minutes). */
export function pollDelayMs(elapsedMs: number): number {
  return elapsedMs < 60_000 ? 3_000 : 10_000;
}

/** Day colours for the plan map (repeat after 7 days). */
export const DAY_COLORS = ['#2563eb', '#16a34a', '#dc2626', '#9333ea', '#ea580c', '#0891b2', '#ca8a04'];

export interface MapStop {
  day: number;
  order: number;
  name: string;
  lat: number;
  lng: number;
  href: string | null;
}

/** Beaches of a plan with coordinates, in visiting order, numbered within each day. */
export function planStops(plan: Plan, hrefFor: (b: PlanBeach) => string | null): MapStop[] {
  const stops: MapStop[] = [];
  for (const day of plan.days) {
    let order = 0;
    for (const item of day.items) {
      const b = item.beach;
      if (!b || typeof b.latitude !== 'number' || typeof b.longitude !== 'number') continue;
      order += 1;
      stops.push({ day: day.day_number, order, name: b.name, lat: b.latitude, lng: b.longitude, href: hrefFor(b) });
    }
  }

  return stops;
}
