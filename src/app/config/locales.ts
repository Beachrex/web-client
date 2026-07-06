export const locales = ['en', 'si', 'de', 'hr', 'fr', 'es', 'it', 'ua', 'ru', 'pl', 'cs', 'hu', 'bg', 'sk'] as const;
export type Locale = typeof locales[number];
export const languageNames: Record<string, string> = {
    en: 'English',
    si: 'Slovenščina',
    de: 'Deutsch',
    hr: 'Hrvatski',
    fr: 'Français',
    es: 'Español',
    it: 'Italiano',
    ua: 'Українська',
    ru: 'Русский',
    pl: 'Polski',
    cs: 'Čeština',
    hu: 'Magyar',
    bg: 'Български',
    sk: 'Slovenčina',
};

