import '@/styles/globals.css';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { Open_Sans } from 'next/font/google';
import Script from 'next/script';
import Footer from 'src/app/components/Footer';
import Layout from '@/app/components/Layout';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'Metadata' });

    return {
        title: t('title'),
        description: t('description'),
        icons: [{ rel: 'icon', url: '/favicon.png' }],
        authors: [
            { name: 'David Tacer' },
        ],
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
    params: Promise<{ locale: string }>;
}) {
    // Await params in Next.js 15
    const { locale } = await params;
    // Typing the messages
    const messages = await getMessages() as Record<string, string>;

    return (
        <html lang={locale} className={openSans.className}>
        <head>
            <link
                rel="stylesheet"
                href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
                integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
                crossOrigin=""
            />
        </head>
        <body>
        <NextIntlClientProvider messages={messages}>
            <Layout>{children}</Layout>
            <Footer/>
        </NextIntlClientProvider>

        {/* Load Leaflet with Next.js Script component for better loading control */}
        <Script
            src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
            integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo="
            crossOrigin=""
            strategy="beforeInteractive"
        />
        </body>
        </html>
    );
}
