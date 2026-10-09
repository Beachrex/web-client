'use client';

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Alert, Card } from 'flowbite-react';
import { useAuth } from '@/contexts/AuthContext';
import { SignInOptions } from '@/components/Auth';
import ItineraryPlanView from '@/components/Itinerary/ItineraryPlanView';
import { Link } from '@/i18n/routing';
import { isFinished, planFailureKey, pollDelayMs, type PlanSummary } from '@/lib/utils/itinerary';
import { env } from '@/env';

const PROGRESS_STEPS = ['progressBeaches', 'progressRoute', 'progressTips'] as const;

/** One itinerary (AI-3). While the worker generates it, the page polls and shows progress. */
export default function ItineraryPlanPage({ id }: { id: string }) {
  const t = useTranslations('AI.itinerary');
  const locale = useLocale();
  const { isAuthenticated, token } = useAuth();
  const [plan, setPlan] = useState<PlanSummary | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const started = Date.now();
    const load = async () => {
      try {
        const url = `${env.NEXT_PUBLIC_API_ENDPOINT}/api/v1/me/itinerary-plans/${encodeURIComponent(id)}`;
        const r = await fetch(url, {
          headers: { Accept: 'application/json', 'Accept-Language': locale, Authorization: `Bearer ${token}` },
        });
        if (cancelled) return;
        if (r.status === 404) {
          setNotFound(true);
          return;
        }
        if (r.ok) {
          const { data } = (await r.json()) as { data: PlanSummary };
          setPlan(data);
          if (isFinished(data.status)) return;
        }
      } catch {
        // Network hiccup: keep polling.
      }
      if (cancelled) return;
      const spent = Date.now() - started;
      setElapsed(spent);
      timer = setTimeout(() => void load(), pollDelayMs(spent));
    };
    void load();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [token, locale, id]);

  const step = PROGRESS_STEPS[Math.min(Math.floor(elapsed / 15_000), PROGRESS_STEPS.length - 1)]!;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between gap-4 print:hidden">
          <Link href="/ai/itinerary/plans" className="text-sm font-medium text-blue-700 hover:underline">
            ← {t('plans.title')}
          </Link>
          <Link href="/ai/itinerary" className="text-sm font-medium text-blue-700 hover:underline">
            {t('newPlan')}
          </Link>
        </div>

        {!isAuthenticated ? (
          <Card>
            <p className="text-gray-700">{t('signInToStart')}</p>
            <SignInOptions />
          </Card>
        ) : notFound ? (
          <Alert color="failure">{t('plans.notFound')}</Alert>
        ) : !plan || !isFinished(plan.status) ? (
          <Card>
            <div className="py-6 text-center" role="status">
              <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
              <p className="text-lg font-medium text-blue-900">{t(step)}</p>
              <p className="mt-2 text-sm text-gray-600">{t('plans.waitNote')}</p>
            </div>
          </Card>
        ) : plan.status === 'failed' ? (
          <Alert color="warning">{t(`plans.failed.${planFailureKey(plan.error)}`)}</Alert>
        ) : plan.itinerary ? (
          <ItineraryPlanView plan={plan.itinerary} />
        ) : null}
      </div>
    </div>
  );
}
