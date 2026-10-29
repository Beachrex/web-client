import { readFileSync } from 'fs';
import { join } from 'path';
import { test, expect } from '@playwright/test';

/**
 * Guards against UI strings left in English (owner report 2026-10-21).
 *
 * In the four languages with a non-Latin script, a string with Latin words and
 * no Greek/Cyrillic letter is almost always an untranslated English string.
 * Proper names and templates that are Latin on purpose are listed explicitly.
 */
const NON_LATIN_LOCALES = ['bg', 'el', 'ru', 'ua'];

const LATIN_ON_PURPOSE = new Set([
    'SEO.beachTitle', // template: {beachName} - {cityName}, {countryName} | BeachRex
    'SEO.beachTitleNoCity',
    'Common.accommodationDefaultTitle', // property name "Apartma Pehta"
    'Common.accommodationDefaultLocation', // place name "Baška"
]);

type Messages = { [key: string]: string | Messages };

function flatten(obj: Messages, prefix = ''): [string, string][] {
    return Object.entries(obj).flatMap(([k, v]) =>
        typeof v === 'string' ? [[prefix + k, v] as [string, string]] : flatten(v, `${prefix}${k}.`)
    );
}

function load(locale: string): Messages {
    return JSON.parse(readFileSync(join(process.cwd(), 'messages', `${locale}.json`), 'utf-8')) as Messages;
}

for (const locale of NON_LATIN_LOCALES) {
    test(`${locale}: no Latin-only (untranslated) UI strings`, () => {
        const offenders = flatten(load(locale))
            .filter(([key]) => !key.startsWith('routes.') && !LATIN_ON_PURPOSE.has(key))
            .filter(([, value]) => {
                const text = value.replace(/\{[^}]*\}/g, '');
                return /[A-Za-z]{2}/.test(text) && !/[Ͱ-ϿЀ-ӿ]/.test(text);
            })
            .map(([key, value]) => `${key} = ${value}`);
        expect(offenders).toEqual([]);
    });
}

test('every locale has every key that en has', () => {
    const enKeys = flatten(load('en')).map(([k]) => k);
    for (const locale of ['si', 'de', 'hr', 'fr', 'es', 'it', 'ua', 'ru', 'pl', 'cs', 'hu', 'bg', 'sk', 'da', 'pt', 'nl', 'el', 'sq']) {
        const keys = new Set(flatten(load(locale)).map(([k]) => k));
        expect(enKeys.filter((k) => !keys.has(k)), locale).toEqual([]);
    }
});
