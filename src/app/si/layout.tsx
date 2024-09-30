import "@/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";
import {NextIntlClientProvider} from 'next-intl';
import {getMessages, getTranslations} from 'next-intl/server';

// @ts-ignore
export async function generateMetadata({params: {locale}}) {
    const t = await getTranslations({locale, namespace: 'Metadata'});

    return {
        title: t('title'),
        description: t('description'),
        icons: [{ rel: "icon", url: "/favicon.png" }],
    };
}

export default async function LocaleLayout({
                                             children,
                                             params: {locale}
                                           }: {
  children: React.ReactNode;
  params: {locale: string};
}) {
  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  return (
      <html lang={locale}>
      <body>
      <NextIntlClientProvider messages={messages}>
        {children}
      </NextIntlClientProvider>
      </body>
      </html>
  );
}