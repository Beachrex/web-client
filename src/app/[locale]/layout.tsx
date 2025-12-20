import '@/styles/globals.css';

import { ApiClientProvider } from '@/components/ApiClientProvider';
import DefaultLayout from '@/components/Layout';
import { env } from '@/env';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { Open_Sans } from 'next/font/google';
import { buildOrganizationSchema, buildWebSiteSchema, renderJsonLd } from '@/lib/utils/json-ld-helpers';

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}) {
  const { locale } = params;
  const t = await getTranslations({ locale, namespace: 'Metadata' });

  const baseUrl = env.NEXT_PUBLIC_BASE_URL;
  const isProduction = baseUrl.includes('beachrex.com') && !baseUrl.includes('dev.');

  // Block search engines on dev/staging environments
  const robotsMetadata = !isProduction
    ? { robots: { index: false, follow: false, nocache: true } }
    : {};

  return {
    title: t('title'),
    description: t('description'),
    icons: [{ rel: 'icon', url: '/favicon.png' }],
    authors: [{ name: 'David Tacer' }],
    ...robotsMetadata,
  };
}
const openSans = Open_Sans({
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
});
export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  // Next.js 14: params is directly available (not a Promise)
  const { locale } = params;

  const messages = (await getMessages()) as Record<string, string>;

  // Get localized description for Organization schema
  const t = await getTranslations({ locale, namespace: 'SEO' });
  const organizationDescription = t('organizationDescription');

  // Build JSON-LD structured data for Organization and WebSite
  const organizationSchema = buildOrganizationSchema(organizationDescription);
  const webSiteSchema = buildWebSiteSchema();

  return (
    <html lang={locale} className={openSans.className}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: renderJsonLd(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: renderJsonLd(webSiteSchema) }}
        />
      </head>
      <body>
        <NextIntlClientProvider messages={messages}>
          <ApiClientProvider locale={locale}>
            <DefaultLayout>{children}</DefaultLayout>
          </ApiClientProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
