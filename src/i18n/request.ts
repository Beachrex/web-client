import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

// Define the shape of the messages object
type Messages = Record<string, string>;
type Locale = 'en' | 'de' | 'si'; // Define valid locales explicitly

export default getRequestConfig(async ({ locale }) => {
    // Validate that the incoming `locale` parameter is valid
    if (!routing.locales.includes(locale as Locale)) notFound();

    // Safely import the module with inferred types
    const messages = (await import(`../../messages/${locale}.json`)).default as Messages;

    return {
        messages,
    };
});
