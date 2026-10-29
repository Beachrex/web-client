import { getTranslations, setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import { MessageSquare, MapPin } from 'lucide-react';

import { fetchSiteSettings } from '@/lib/site-settings';

/**
 * AI Landing Page
 *
 * Public page showcasing AI features:
 * - AI Chat (anonymous or authenticated)
 * - AI Itinerary Generator (requires auth + credits for multi-day)
 */

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}) {
  const { locale } = params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'AI.landing' });

  return {
    title: t('title'),
    description: t('description'),
  };
}

export default async function AILandingPage({
  params,
}: {
  params: { locale: string };
}) {
  const { locale } = params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'AI.landing' });
  // TASK-009: each card follows its own admin switch (the layout 404s when both are off).
  const { aiAssistantEnabled, aiTripPlannerEnabled } = await fetchSiteSettings();
  const both = aiAssistantEnabled && aiTripPlannerEnabled;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {t('title')}
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            {t('subtitle')}
          </p>
          <p className="text-lg text-gray-500 max-w-3xl mx-auto">
            {t('description')}
          </p>
        </div>

        {/* Features Grid */}
        <div className={`grid gap-8 mx-auto ${both ? 'md:grid-cols-2 max-w-5xl' : 'max-w-2xl'}`}>
          {/* AI Chat Card */}
          {aiAssistantEnabled && (
          <Link
            href={`/${locale}/ai/chat`}
            className="block p-8 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow border border-gray-200 hover:border-blue-500"
          >
            <div className="flex items-center mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <MessageSquare className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 ml-4">
                {t('chatButton')}
              </h2>
            </div>
            <p className="text-gray-600 mb-4">
              {t('chatCardText')}
            </p>
            <div className="flex items-center text-blue-600 font-medium">
              {t('chatCta')}
              <svg
                className="w-5 h-5 ml-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </Link>
          )}

          {/* AI Itinerary Card */}
          {aiTripPlannerEnabled && (
          <Link
            href={`/${locale}/ai/itinerary`}
            className="block p-8 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow border border-gray-200 hover:border-green-500"
          >
            <div className="flex items-center mb-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <MapPin className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 ml-4">
                {t('itineraryButton')}
              </h2>
            </div>
            <p className="text-gray-600 mb-4">
              {t('itineraryCardText')}
            </p>
            <div className="flex items-center text-green-600 font-medium">
              {t('itineraryCta')}
              <svg
                className="w-5 h-5 ml-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </Link>
          )}
        </div>

        {/* Info Section: explains free chat vs paid plans, so only when both are on */}
        {both && (
        <div className="mt-16 text-center">
          <div className="inline-block p-6 bg-blue-50 rounded-lg">
            <p className="text-gray-700">
              <span className="font-semibold">{t('infoTitle')}</span> {t('infoText')}
            </p>
          </div>
        </div>
        )}
      </div>
    </div>
  );
}
