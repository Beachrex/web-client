export const locales = ['en', 'si', 'de', 'hr', 'fr', 'es', 'it', 'ua', 'ru', 'pl', 'cs', 'hu', 'bg', 'sk', 'da', 'pt', 'nl', 'el', 'sq'] as const;
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
    da: 'Dansk',
    pt: 'Português',
    nl: 'Nederlands',
    el: 'Ελληνικά',
    sq: 'Shqip',
};


/**
 * URL locale code → ISO 639-1 language code for `<html lang>` and `hreflang`.
 * Two URL codes are country codes, not language codes: `si` (Slovenia; as a
 * language code it means Sinhala) and `ua` (Ukraine). URLs keep them; only the
 * language attributes use the real language codes `sl` and `uk`.
 */
const HTML_LANG_OVERRIDES: Partial<Record<string, string>> = {
    si: 'sl',
    ua: 'uk',
};

export function toHtmlLang(locale: string): string {
    return HTML_LANG_OVERRIDES[locale] ?? locale;
}
