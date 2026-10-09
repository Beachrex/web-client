'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { Alert, Button, Card, Label, Select } from 'flowbite-react';
import { Check, MapPin } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { SignInOptions, UserProfile, LogoutButton } from '@/components/Auth';
import { buildBeachUrlFromSchema } from '@/lib/utils/beach-urls';
import { buildCdnUrl } from '@/lib/utils/beach-images';
import {
  DEFAULT_FORM,
  INTERESTS,
  PACES,
  SURFACES,
  TRIP_LENGTHS,
  buildItineraryRequest,
  clearSavedForm,
  creditsFromEntitlements,
  formatPrice,
  itineraryErrorKey,
  productFor,
  productTypeFor,
  restoreFormAfterCheckout,
  saveFormForCheckout,
  toggle,
  type Credits,
  type ItineraryErrorKey,
  type ItineraryForm,
  type ItineraryProduct,
} from '@/lib/utils/itinerary';
import { env } from '@/env';

/**
 * AI itinerary planner (AI-3). The visitor picks a country (and optionally a region) from the API, a 3/7/14-day
 * package with its real price, and a few wishes. Every beach in the plan links to its Beachrex page.
 */

interface PlanBeach {
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
}

interface PlanItem {
  type: string;
  time_block: string;
  beach?: PlanBeach;
  notes: string;
  why: string | null;
}

interface Plan {
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

interface Place {
  code: string;
  name: string;
  slug: string;
}

const PROGRESS_STEPS = ['progressBeaches', 'progressRoute', 'progressTips'] as const;

export default function AIItineraryPage() {
  const { isAuthenticated, user, token } = useAuth();
  const t = useTranslations('AI.itinerary');
  const locale = useLocale();

  const [form, setForm] = useState<ItineraryForm>(DEFAULT_FORM);
  const [countries, setCountries] = useState<Place[]>([]);
  const [regions, setRegions] = useState<Place[]>([]);
  const [products, setProducts] = useState<ItineraryProduct[]>([]);
  const [credits, setCredits] = useState<Credits | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<ItineraryErrorKey | 'purchaseError' | null>(null);
  const [plan, setPlan] = useState<Plan | null>(null);

  const api = env.NEXT_PUBLIC_API_ENDPOINT;
  const headers = useCallback(
    (json = false): Record<string, string> => ({
      Accept: 'application/json',
      'Accept-Language': locale,
      ...(json ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    }),
    [locale, token],
  );

  const update = (patch: Partial<ItineraryForm>) => setForm((prev) => ({ ...prev, ...patch }));

  // Form saved before a Stripe checkout comes back after it.
  useEffect(() => {
    const saved = restoreFormAfterCheckout();
    if (saved) setForm(saved);
  }, []);

  useEffect(() => {
    void fetch(`${api}/api/v1/countries`, { headers: headers() })
      .then((r) => (r.ok ? (r.json() as Promise<{ data: Place[] }>) : { data: [] }))
      .then((d) => setCountries([...d.data].sort((a, b) => a.name.localeCompare(b.name, locale))))
      .catch(() => setCountries([]));
    void fetch(`${api}/api/v1/payments/products`, { headers: headers() })
      .then((r) => (r.ok ? (r.json() as Promise<{ data: ItineraryProduct[] }>) : { data: [] }))
      .then((d) => setProducts(d.data))
      .catch(() => setProducts([]));
  }, [api, headers, locale]);

  useEffect(() => {
    setRegions([]);
    if (!form.countryCode) return;
    void fetch(`${api}/api/v1/regions?country_code=${encodeURIComponent(form.countryCode)}`, { headers: headers() })
      .then((r) => (r.ok ? (r.json() as Promise<{ data: Place[] }>) : { data: [] }))
      .then((d) => setRegions([...d.data].sort((a, b) => a.name.localeCompare(b.name, locale))))
      .catch(() => setRegions([]));
  }, [api, headers, locale, form.countryCode]);

  const fetchCredits = useCallback(async (): Promise<Credits | null> => {
    if (!token) return null;
    try {
      const r = await fetch(`${api}/api/v1/me/entitlements`, { headers: headers() });
      if (!r.ok) return null;
      const d = (await r.json()) as { entitlements?: Record<string, number> };
      const c = creditsFromEntitlements(d.entitlements);
      setCredits(c);
      return c;
    } catch {
      return null;
    }
  }, [api, headers, token]);

  // After a purchase the webhook may land a few seconds after the visitor returns: poll briefly.
  useEffect(() => {
    if (!isAuthenticated) return;
    let tries = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const poll = async () => {
      const c = await fetchCredits();
      const waitingForPurchase = restoreFormAfterCheckout() !== null && c !== null && c[form.days] === 0;
      if (waitingForPurchase && ++tries < 10) timer = setTimeout(() => void poll(), 3000);
    };
    void poll();
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, fetchCredits]);

  useEffect(() => {
    if (!isLoading) return;
    setProgress(0);
    const timer = setInterval(() => setProgress((p) => Math.min(p + 1, PROGRESS_STEPS.length - 1)), 8000);
    return () => clearInterval(timer);
  }, [isLoading]);

  const product = productFor(products, form.days);
  const available = credits?.[form.days] ?? 0;

  const handleGenerate = async () => {
    if (!form.countryCode || isLoading) return;
    setIsLoading(true);
    setError(null);
    setPlan(null);
    try {
      const r = await fetch(`${api}/api/v1/ai/itineraries`, {
        method: 'POST',
        headers: headers(true),
        body: JSON.stringify(buildItineraryRequest(form)),
      });
      if (!r.ok) {
        setError(itineraryErrorKey(r.status, (await r.json().catch(() => ({}))) as { error?: string }));
        return;
      }
      setPlan((await r.json()) as Plan);
      clearSavedForm();
      void fetchCredits();
    } catch {
      setError('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBuy = async () => {
    try {
      saveFormForCheckout(form);
      const r = await fetch(`${api}/api/v1/payments/stripe/checkout`, {
        method: 'POST',
        headers: headers(true),
        body: JSON.stringify({ product_type: productTypeFor(form.days) }),
      });
      if (!r.ok) throw new Error(String(r.status));
      const d = (await r.json()) as { checkout_url: string };
      window.location.href = d.checkout_url;
    } catch {
      setError('purchaseError');
    }
  };

  const chip = (active: boolean) =>
    `inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-sm ${
      active ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300 bg-white text-gray-700 hover:border-blue-400'
    }`;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{t('title')}</h1>
            <p className="mt-1 text-gray-600">{t('subtitle')}</p>
          </div>
          <div>
            {isAuthenticated && user ? (
              <div className="flex items-center space-x-4">
                <UserProfile showEmail={false} />
                <LogoutButton variant="link" />
              </div>
            ) : (
              <SignInOptions />
            )}
          </div>
        </div>

        {!plan && (
          <Card className="mb-6">
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="country">{t('form.country')}</Label>
                  <Select
                    id="country"
                    value={form.countryCode}
                    onChange={(e) => update({ countryCode: e.target.value, regionSlug: '' })}
                    disabled={isLoading}
                  >
                    <option value="">{t('form.countryPlaceholder')}</option>
                    {countries.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.name}
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <Label htmlFor="region">{t('form.region')}</Label>
                  <Select
                    id="region"
                    value={form.regionSlug}
                    onChange={(e) => update({ regionSlug: e.target.value })}
                    disabled={isLoading || !form.countryCode || regions.length === 0}
                  >
                    <option value="">{t('form.wholeCountry')}</option>
                    {regions.map((r) => (
                      <option key={r.slug} value={r.slug}>
                        {r.name}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>

              <fieldset>
                <legend className="mb-2 text-sm font-medium text-gray-900">{t('form.duration')}</legend>
                <div className="grid grid-cols-3 gap-3">
                  {TRIP_LENGTHS.map((days) => {
                    const p = productFor(products, days);
                    const active = form.days === days;
                    return (
                      <button
                        key={days}
                        type="button"
                        onClick={() => update({ days })}
                        disabled={isLoading}
                        aria-pressed={active}
                        className={`rounded-lg border-2 p-3 text-center ${active ? 'border-blue-600 bg-blue-50' : 'border-gray-200 bg-white hover:border-blue-300'}`}
                      >
                        <span className="block text-lg font-bold text-gray-900">{t('form.daysOption', { days })}</span>
                        {p && <span className="block text-sm text-gray-600">{formatPrice(p, locale)}</span>}
                        {credits && credits[days] > 0 && (
                          <span className="mt-1 block text-xs font-medium text-green-700">
                            {t('form.plansAvailable', { count: credits[days] })}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              <fieldset>
                <legend className="mb-2 text-sm font-medium text-gray-900">{t('form.interests')}</legend>
                <div className="flex flex-wrap gap-2">
                  {INTERESTS.map((i) => {
                    const active = form.interests.includes(i);
                    return (
                      <button
                        key={i}
                        type="button"
                        aria-pressed={active}
                        disabled={isLoading}
                        onClick={() => update({ interests: toggle(form.interests, i) })}
                        className={chip(active)}
                      >
                        {active && <Check className="h-3.5 w-3.5" aria-hidden />}
                        {t(`interest.${i}`)}
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              <fieldset>
                <legend className="mb-2 text-sm font-medium text-gray-900">{t('form.surface')}</legend>
                <div className="flex flex-wrap gap-2">
                  {SURFACES.map((s) => {
                    const active = form.surfaces.includes(s);
                    return (
                      <button
                        key={s}
                        type="button"
                        aria-pressed={active}
                        disabled={isLoading}
                        onClick={() => update({ surfaces: toggle(form.surfaces, s) })}
                        className={chip(active)}
                      >
                        {active && <Check className="h-3.5 w-3.5" aria-hidden />}
                        {t(`surface.${s}`)}
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <Label htmlFor="pace">{t('form.pace')}</Label>
                  <Select
                    id="pace"
                    value={form.pace}
                    onChange={(e) => update({ pace: e.target.value as ItineraryForm['pace'] })}
                    disabled={isLoading}
                  >
                    {PACES.map((p) => (
                      <option key={p} value={p}>
                        {t(`pace.${p}`)}
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <Label htmlFor="adults">{t('form.adults')}</Label>
                  <Select
                    id="adults"
                    value={form.adults}
                    onChange={(e) => update({ adults: Number(e.target.value) })}
                    disabled={isLoading}
                  >
                    {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <Label htmlFor="children">{t('form.children')}</Label>
                  <Select
                    id="children"
                    value={form.children}
                    onChange={(e) => update({ children: Number(e.target.value) })}
                    disabled={isLoading}
                  >
                    {Array.from({ length: 9 }, (_, i) => i).map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>

              {error && (
                <Alert color={error === 'notEnoughBeaches' ? 'warning' : 'failure'} onDismiss={() => setError(null)}>
                  {t(`errors.${error}`)}
                </Alert>
              )}

              {isLoading ? (
                <div className="rounded-lg bg-blue-50 p-4 text-center" role="status">
                  <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
                  <p className="font-medium text-blue-900">{t(PROGRESS_STEPS[progress])}</p>
                  <p className="mt-1 text-sm text-blue-800">{t('progressNote')}</p>
                </div>
              ) : !isAuthenticated ? (
                <div className="rounded-lg border border-gray-200 bg-white p-4 text-center">
                  <p className="mb-3 text-gray-700">{t('signInToStart')}</p>
                  <div className="flex justify-center">
                    <SignInOptions />
                  </div>
                </div>
              ) : available > 0 ? (
                <div className="text-center">
                  <Button
color="blue" size="lg" className="w-full"
onClick={() => void handleGenerate()} disabled={!form.countryCode}
                  >
                    <MapPin className="mr-2 h-5 w-5" />
                    {t('generate')}
                  </Button>
                  <p className="mt-2 text-sm text-gray-600">{t('usesOnePlan', { days: form.days })}</p>
                </div>
              ) : (
                <div className="text-center">
                  <Button
color="blue" size="lg" className="w-full"
onClick={() => void handleBuy()} disabled={!form.countryCode || !product}
                  >
                    {product ? t('buy', { days: form.days, price: formatPrice(product, locale) }) : t('generate')}
                  </Button>
                  <p className="mt-2 text-sm text-gray-600">{t('buyNote')}</p>
                </div>
              )}
            </div>
          </Card>
        )}

        {plan && (
          <div className="space-y-6">
            <Card>
              <h2 className="text-2xl font-bold text-gray-900">{plan.title}</h2>
              <p className="text-gray-700">{plan.summary}</p>
              {plan.metadata.narrative === 'fallback' && (
                <Alert color="warning">{t('fallbackNote')}</Alert>
              )}
            </Card>

            {plan.days.map((day) => (
              <Card key={day.day_number}>
                <h3 className="text-xl font-semibold text-gray-900">
                  {t('day', { number: day.day_number })}: {day.theme}
                </h3>
                <div className="space-y-4">
                  {day.items.map((item, idx) => {
                    const href = item.beach ? buildBeachUrlFromSchema(item.beach, locale) : null;
                    const image = item.beach?.main_image ? buildCdnUrl(item.beach.main_image, 'list') : null;
                    return (
                      <div key={idx} className="flex flex-col gap-3 border-l-4 border-blue-500 pl-4 sm:flex-row">
                        {image && (
                          <div className="relative h-32 w-full flex-shrink-0 overflow-hidden rounded-md sm:w-44">
                            <Image
src={image} alt={item.beach?.name ?? ''} fill
className="object-cover" sizes="(max-width: 640px) 100vw, 176px"
                            />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                            {t(`timeBlock.${['morning', 'afternoon', 'evening'].includes(item.time_block) ? item.time_block : 'afternoon'}`)}
                          </p>
                          {item.beach ? (
                            <h4 className="text-lg font-semibold">
                              {href ? (
                                <Link href={href} target="_blank" className="text-blue-700 hover:underline">
                                  {item.beach.name}
                                </Link>
                              ) : (
                                item.beach.name
                              )}
                              {item.beach.city && <span className="ml-2 text-sm font-normal text-gray-500">{item.beach.city}</span>}
                            </h4>
                          ) : (
                            <h4 className="text-lg font-semibold text-gray-900">{t('tip')}</h4>
                          )}
                          <p className="text-gray-700">{item.notes}</p>
                          {item.why && <p className="mt-1 text-sm text-gray-600">{item.why}</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="space-y-1 rounded-md bg-gray-50 p-3 text-sm text-gray-700">
                  {day.logistics.estimated_travel_km > 0 && <p>{t('travelKm', { km: Math.round(day.logistics.estimated_travel_km) })}</p>}
                  {day.logistics.parking_notes && <p>{day.logistics.parking_notes}</p>}
                  {day.logistics.accessibility_notes && <p>{day.logistics.accessibility_notes}</p>}
                  {day.logistics.notes && <p>{day.logistics.notes}</p>}
                </div>
              </Card>
            ))}

            {plan.assumptions.length > 0 && (
              <Card>
                <h4 className="font-medium text-gray-900">{t('assumptions')}</h4>
                <ul className="list-inside list-disc text-sm text-gray-600">
                  {plan.assumptions.map((a, i) => (
                    <li key={i}>{a}</li>
                  ))}
                </ul>
              </Card>
            )}

            <Button color="light" onClick={() => setPlan(null)}>
              {t('newPlan')}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
