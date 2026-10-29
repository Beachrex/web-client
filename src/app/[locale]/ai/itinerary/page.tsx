'use client';

import { useCallback, useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocale, useTranslations } from 'next-intl';
import { Alert, Button, Card, Label, Select } from 'flowbite-react';
import { Check, MapPin } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { SignInOptions, UserProfile, LogoutButton } from '@/components/Auth';
import { Link, useRouter } from '@/i18n/routing';
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
  type PlanSummary,
} from '@/lib/utils/itinerary';
import { env } from '@/env';
import { getStaticPagesForFooter } from '@/lib/api-client/sdk.gen';
import type { AcceptLanguage, StaticPageFooter } from '@/lib/api-client/types.gen';

/**
 * AI itinerary planner (AI-3). The visitor picks a country (and optionally a region) from the API, a 3/7/14-day
 * package with its real price, and a few wishes. Every beach in the plan links to its Beachrex page.
 */

interface Place {
  code: string;
  name: string;
  slug: string;
}

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
  const [error, setError] = useState<ItineraryErrorKey | 'purchaseError' | null>(null);
  const router = useRouter();
  // AI-4: consent before paying (terms of sale; immediate delivery and the withdrawal waiver).
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [waiveWithdrawal, setWaiveWithdrawal] = useState(false);
  // Same query as the footer, so the localized terms slug costs no extra request.
  const { data: footerPages } = useQuery<StaticPageFooter[]>({
    queryKey: ['static-pages', 'footer', locale],
    queryFn: async () => {
      try {
        const { data } = await getStaticPagesForFooter({ headers: { 'Accept-Language': locale as AcceptLanguage } });
        return data?.data ?? [];
      } catch {
        return [];
      }
    },
    staleTime: 60 * 60 * 1000,
    gcTime: 2 * 60 * 60 * 1000,
    retry: 1,
  });
  const termsSlug = footerPages?.find((p) => p.code === 'terms-of-use')?.slug ?? 'terms-of-use';

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

  const product = productFor(products, form.days);
  const available = credits?.[form.days] ?? 0;

  // AI-3: the plan is generated in the background (a 14-day plan can take two minutes); its page shows progress.
  const handleGenerate = async () => {
    if (!form.countryCode || isLoading) return;
    setIsLoading(true);
    setError(null);
    try {
      const r = await fetch(`${api}/api/v1/ai/itinerary-plans`, {
        method: 'POST',
        headers: headers(true),
        body: JSON.stringify(buildItineraryRequest(form)),
      });
      if (!r.ok) {
        setError(itineraryErrorKey(r.status, (await r.json().catch(() => ({}))) as { error?: string }));
        setIsLoading(false);
        return;
      }
      const { data } = (await r.json()) as { data: PlanSummary };
      clearSavedForm();
      router.push(`/ai/itinerary/plans/${data.id}`);
    } catch {
      setError('error');
      setIsLoading(false);
    }
  };

  const handleBuy = async () => {
    try {
      saveFormForCheckout(form);
      const r = await fetch(`${api}/api/v1/payments/stripe/checkout`, {
        method: 'POST',
        headers: headers(true),
        body: JSON.stringify({
          product_type: productTypeFor(form.days),
          accept_terms: acceptTerms,
          waive_withdrawal: waiveWithdrawal,
        }),
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
                <Link href="/ai/itinerary/plans" className="text-sm font-medium text-blue-700 hover:underline">
                  {t('plans.title')}
                </Link>
                <UserProfile showEmail={false} />
                <LogoutButton variant="link" />
              </div>
            ) : (
              <SignInOptions />
            )}
          </div>
        </div>

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
                  <p className="font-medium text-blue-900">{t('progressBeaches')}</p>
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
                  <div className="mb-4 space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-3 text-left text-sm text-gray-700">
                    <label className="flex items-start gap-2">
                      <input
                        type="checkbox"
                        className="mt-0.5 h-4 w-4 flex-shrink-0 rounded border-gray-300"
                        checked={acceptTerms}
                        onChange={(e) => setAcceptTerms(e.target.checked)}
                      />
                      <span>
                        {t.rich('consent.terms', {
                          link: (chunks) => (
                            <Link href={`/p/${termsSlug}`} target="_blank" className="font-medium text-blue-700 underline">
                              {chunks}
                            </Link>
                          ),
                        })}
                      </span>
                    </label>
                    <label className="flex items-start gap-2">
                      <input
                        type="checkbox"
                        className="mt-0.5 h-4 w-4 flex-shrink-0 rounded border-gray-300"
                        checked={waiveWithdrawal}
                        onChange={(e) => setWaiveWithdrawal(e.target.checked)}
                      />
                      <span>{t('consent.withdrawal')}</span>
                    </label>
                  </div>
                  <Button
color="blue" size="lg" className="w-full"
onClick={() => void handleBuy()} disabled={!form.countryCode || !product || !acceptTerms || !waiveWithdrawal}
                  >
                    {product ? t('buy', { days: form.days, price: formatPrice(product, locale) }) : t('generate')}
                  </Button>
                  <p className="mt-2 text-sm text-gray-600">{t('buyNote')}</p>
                </div>
              )}
            </div>
          </Card>

      </div>
    </div>
  );
}
