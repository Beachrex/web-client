import { test, expect } from '@playwright/test';
import { locales, toHtmlLang } from '@/app/config/locales';
import { buildAlternateLanguages } from '@/lib/utils/metadata-helpers';

/**
 * `<html lang>` and `hreflang` need ISO 639-1 language codes. Two URL locales
 * are country codes: `si` (as a language code: Sinhala) and `ua` (not a
 * language code at all). URLs keep them; the language attributes must not.
 */
test.describe('toHtmlLang', () => {
    test('maps the two country-code URL locales to language codes', () => {
        expect(toHtmlLang('si')).toBe('sl');
        expect(toHtmlLang('ua')).toBe('uk');
    });

    test('leaves every other locale unchanged', () => {
        for (const locale of locales) {
            if (locale === 'si' || locale === 'ua') continue;
            expect(toHtmlLang(locale)).toBe(locale);
        }
    });

    test('never returns si or ua for any supported locale', () => {
        const codes = locales.map(toHtmlLang);
        expect(codes).not.toContain('si');
        expect(codes).not.toContain('ua');
        expect(new Set(codes).size).toBe(locales.length);
    });
});

test.describe('buildAlternateLanguages', () => {
    test('uses language codes as hreflang keys but keeps URL locales in the URLs', () => {
        const alt = buildAlternateLanguages('/beaches');
        expect(alt).toHaveProperty('sl');
        expect(alt).toHaveProperty('uk');
        expect(alt).not.toHaveProperty('si');
        expect(alt).not.toHaveProperty('ua');
        expect(alt.sl).toMatch(/\/si\/beaches$/);
        expect(alt.uk).toMatch(/\/ua\/beaches$/);
        expect(alt['x-default']).toMatch(/\/en\/beaches$/);
    });
});
