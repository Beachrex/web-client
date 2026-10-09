'use client';

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Alert, Card } from 'flowbite-react';
import { useAuth } from '@/contexts/AuthContext';
import { SignInOptions } from '@/components/Auth';
import { Link } from '@/i18n/routing';
import { intlLocale, isFinished, planFailureKey, type PlanSummary } from '@/lib/utils/itinerary';
import { env } from '@/env';

/** "My plans" (AI-3): every itinerary the user created, newest first. */
export default function MyItineraryPlansPage() {
  const t = useTranslations('AI.itinerary');
  const locale = useLocale();
  const { isAuthenticated, token } = useAuth();
  const [plans, setPlans] = useState<PlanSummary[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!token) return;
    void fetch(`${env.NEXT_PUBLIC_API_ENDPOINT}/api/v1/me/itinerary-plans`, {
      headers: { Accept: 'application/json', 'Accept-Language': locale, Authorization: `Bearer ${token}` },
    })
      .then(async (r) => {
        if (!r.ok) throw new Error(String(r.status));
        setPlans(((await r.json()) as { data: PlanSummary[] }).data);
      })
      .catch(() => setFailed(true));
  }, [token, locale]);

  const date = (iso: string) => new Date(iso).toLocaleDateString(intlLocale(locale), { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <h1 className="text-3xl font-bold text-gray-900">{t('plans.title')}</h1>
          <Link href="/ai/itinerary" className="text-sm font-medium text-blue-700 hover:underline">
            {t('newPlan')}
          </Link>
        </div>

        {!isAuthenticated ? (
          <Card>
            <p className="text-gray-700">{t('signInToStart')}</p>
            <SignInOptions />
          </Card>
        ) : failed ? (
          <Alert color="failure">{t('errors.error')}</Alert>
        ) : plans === null ? (
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        ) : plans.length === 0 ? (
          <Card>
            <p className="text-gray-700">{t('plans.empty')}</p>
          </Card>
        ) : (
          <ul className="space-y-3">
            {plans.map((p) => (
              <li key={p.id}>
                <Link href={`/ai/itinerary/plans/${p.id}`} className="block rounded-lg border border-gray-200 bg-white p-4 hover:border-blue-400">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900">
                        {p.title ?? t('plans.untitled', { days: p.duration_days, country: p.country_code })}
                      </p>
                      <p className="text-sm text-gray-500">
                        {t('form.daysOption', { days: p.duration_days })} · {p.country_code} · {date(p.created_at)}
                      </p>
                      {p.status === 'failed' && (
                        <p className="mt-1 text-sm text-red-700">{t(`plans.failed.${planFailureKey(p.error)}`)}</p>
                      )}
                    </div>
                    <span
                      className={`flex-shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                        p.status === 'done'
                          ? 'bg-green-100 text-green-800'
                          : p.status === 'failed'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {t(`plans.status.${isFinished(p.status) ? p.status : 'running'}`)}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
