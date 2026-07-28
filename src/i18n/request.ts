import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';
import type { Locale } from '@/app/config/locales';

// Define the type for the messages based on your JSON structure
type Messages = Record<string, string>;

export default getRequestConfig(async ({ requestLocale }) => {
    // This typically corresponds to the `[locale]` segment
    let locale = await requestLocale;

    // Ensure that a valid locale is used
    if (!locale || !routing.locales.includes(locale as Locale)) {
        locale = routing.defaultLocale;
    }

    // Safely import the module and assert the type of `messages`
    const messagesModule: { default: Messages } = await import(`../../messages/${locale}.json`) as
        { default: Messages };
    const messages: Messages = messagesModule.default;

    return {
        locale,
        messages,
    };
});
