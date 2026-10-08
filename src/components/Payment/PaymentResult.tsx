'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import { Link, useRouter } from '@/i18n/routing';

/** Where Stripe checkout starts; both result pages send the visitor back there. */
export const PAYMENT_RETURN_PATH = '/ai/itinerary';
export const SUPPORT_EMAIL = 'info@beachrex.com';
const REDIRECT_SECONDS = 10;

interface PaymentResultProps {
  variant: 'success' | 'cancel';
  sessionId?: string | null;
}

/**
 * Stripe Checkout result (`/payment/success`, `/payment/cancel`). Translated, locale-aware links;
 * after a countdown it returns to the itinerary planner (the old `/internal/...` targets were 404).
 */
export default function PaymentResult({ variant, sessionId }: PaymentResultProps) {
  const t = useTranslations('Payment');
  const router = useRouter();
  const [countdown, setCountdown] = useState(REDIRECT_SECONDS);
  const success = variant === 'success';

  useEffect(() => {
    const timer = setInterval(() => setCountdown((prev) => Math.max(prev - 1, 0)), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (countdown === 0) router.push(PAYMENT_RETURN_PATH);
  }, [countdown, router]);

  const button = 'block rounded-md px-6 py-3 text-base font-semibold text-white no-underline';

  return (
    <div className={`flex min-h-screen items-center justify-center p-5 ${success ? 'bg-sky-50' : 'bg-red-50'}`}>
      <div className="w-full max-w-[600px] rounded-lg bg-white p-10 text-center shadow-md">
        <div
          aria-hidden
          className={`mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full text-5xl text-white ${success ? 'bg-emerald-500' : 'bg-red-500'}`}
        >
          {success ? '✓' : '✕'}
        </div>

        <h1 className="mb-4 text-3xl font-bold text-gray-800">
          {success ? t('successTitle') : t('cancelTitle')}
        </h1>
        <p className="mb-6 text-lg leading-relaxed text-gray-500">
          {success ? t('successMessage') : t('cancelMessage')}
        </p>

        {success && sessionId && (
          <div className="mb-6 rounded-md bg-gray-100 p-4">
            <p className="mb-2 text-sm text-gray-500">{t('sessionId')}</p>
            <p className="break-all font-mono text-xs text-gray-700">{sessionId}</p>
          </div>
        )}

        <p className="mb-6 text-base text-gray-500">
          {t.rich('redirecting', { seconds: countdown, strong: (chunks) => <strong>{chunks}</strong> })}
        </p>

        <div className="flex flex-col gap-3">
          <Link href={PAYMENT_RETURN_PATH} className={`${button} bg-blue-500`}>
            {success ? t('planItinerary') : t('tryAgain')}
          </Link>
          {success && (
            <Link href="/ai/chat" className={`${button} bg-emerald-500`}>
              {t('tryChat')}
            </Link>
          )}
          <Link href="/" className={`${button} bg-gray-500`}>
            {t('goHome')}
          </Link>
        </div>

        <p className="mt-8 text-sm leading-normal text-gray-400">
          {t('help', { email: SUPPORT_EMAIL })}
        </p>
      </div>
    </div>
  );
}
