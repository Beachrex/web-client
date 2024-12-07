export const locales = ['en', 'si'] as const;
export type Locale = typeof locales[number];
export const languageNames: Record<string, string> = {
    en: 'English',
    si: 'Slovenščina',
    de: 'Deutsch',
    fr: 'Français',
    // Add more as needed
};