import '@/styles/globals.css';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { Open_Sans } from 'next/font/google';
import DefaultLayout from '@/components/Layout';


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
        <body>
        <NextIntlClientProvider messages={messages}>
            <DefaultLayout>{children}</DefaultLayout>
        </NextIntlClientProvider>

        </body>
        </html>
    );
}
