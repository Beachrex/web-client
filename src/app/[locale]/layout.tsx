import "@/styles/globals.css";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { Open_Sans } from 'next/font/google'

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
    const t = await getTranslations({ locale, namespace: 'Metadata' });

    return {
        title: t('title'),
        description: t('description'),
        icons: [{ rel: "icon", url: "/favicon.png" }],
    };
}
const openSans = Open_Sans({
    subsets: ['latin','latin-ext'],
    display: 'swap',
})
export default async function LocaleLayout({
                                               children,
                                               params: { locale }
                                           }: {
    children: React.ReactNode;
    params: { locale: string };
}) {
    // Typing the messages
    const messages = await getMessages() as Record<string, string>;

    return (
        <html lang={locale} className={openSans.className}>
        <body>
        <NextIntlClientProvider messages={messages}>
            {children}
        </NextIntlClientProvider>
        </body>
        </html>
    );
}
