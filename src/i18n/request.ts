import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';
import { locales, type Locale } from '@/app/utils/locales';

// Define the type for the messages based on your JSON structure
type Messages = Record<string, string>;

export default getRequestConfig(async ({ locale }) => {
    // Validate that the incoming `locale` parameter is valid
    if (!locales.includes(locale as Locale)) notFound();

    // Safely import the module and assert the type of `messages`
    const messages: Messages = (await import(`../../messages/${locale}.json`)).default as Messages;

    return {
        messages,
    };
});
