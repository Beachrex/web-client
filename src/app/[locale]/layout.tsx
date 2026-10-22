import { toHtmlLang } from '@/app/config/locales';
import '@/styles/globals.css';

import { ApiClientProvider } from '@/components/ApiClientProvider';
import DefaultLayout from '@/components/Layout';
import { env } from '@/env';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';
import { Damion, Figtree, Open_Sans } from 'next/font/google';
import { buildOrganizationSchema, buildWebSiteSchema, renderJsonLd } from '@/lib/utils/json-ld-helpers';
import { AuthProvider } from '@/contexts/AuthContext';
import { isProductionSite } from '@/lib/utils/environment';
import { withDefaultShareImage } from '@/lib/utils/metadata-helpers';
import ThirdPartyScripts from '@/components/Analytics/ThirdPartyScripts';

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}) {
  const { locale } = params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'Metadata' });

  const isProduction = isProductionSite(env.NEXT_PUBLIC_BASE_URL);

  // Block search engines on dev/staging environments
  const robotsMetadata = !isProduction
    ? { robots: { index: false, follow: false, nocache: true } }
    : {};

  return {
    title: t('title'),
    description: t('description'),
    // Brand package icons (CGP v1.0, public/brand/…/02_Favicon_App)
    icons: {
      icon: [
        { url: '/favicon.ico', sizes: '48x48' },
        { url: '/favicon.svg', type: 'image/svg+xml' },
      ],
      apple: '/apple-touch-icon.png',
    },
    manifest: '/site.webmanifest',
    // Pages without their own metadata still get a share image
    openGraph: { siteName: 'BeachRex', images: withDefaultShareImage() },
    twitter: { card: 'summary_large_image', images: withDefaultShareImage() },
    authors: [{ name: 'David Tacer' }],
    ...robotsMetadata,
  };
}
const openSans = Open_Sans({
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
});
// Self-hosted by next/font (was a render-blocking Google Fonts @import in globals.css)
const figtree = Figtree({
  subsets: ['latin', 'latin-ext'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-figtree',
});
const damion = Damion({
  subsets: ['latin'], // Damion has no latin-ext subset (same as the old Google Fonts CSS)
  weight: '400',
  display: 'swap',
  variable: '--font-damion',
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
  setRequestLocale(locale);

  const messages = (await getMessages()) as Record<string, string>;

  // Get localized description for Organization schema
  const t = await getTranslations({ locale, namespace: 'SEO' });
  const organizationDescription = t('organizationDescription');

  // Build JSON-LD structured data for Organization and WebSite
  const organizationSchema = buildOrganizationSchema(organizationDescription);
  const webSiteSchema = buildWebSiteSchema();

  return (
    <html lang={toHtmlLang(locale)} className={`${openSans.className} ${figtree.variable} ${damion.variable}`}>
      <head>
        {/* Consent, analytics and ads: production only */}
        {isProductionSite(env.NEXT_PUBLIC_BASE_URL) && <ThirdPartyScripts />}
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
          <AuthProvider>
            <ApiClientProvider locale={locale}>
              <DefaultLayout>{children}</DefaultLayout>
            </ApiClientProvider>
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

/**
 * No paths are rendered at build time (the build must not depend on the API); every page is rendered on its first
 * visit and then served from the cache (ISR, see `revalidate`). Without this, Next 14 renders every request.
 */
export function generateStaticParams() {
  return [];
}
