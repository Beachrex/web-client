import { readFileSync } from 'fs';
import { join } from 'path';
import { test, expect } from '@playwright/test';
import { locales } from '../src/app/config/locales';

/**
 * Guard for missing UI translations (TASK-004 audit A1).
 *
 * next-intl has no fallback locale here (src/i18n/request.ts), so a key missing in one
 * `messages/<locale>.json` shows as a raw key or throws on that locale only. `si.json` was missing
 * the whole `Auth` and `AI` namespaces. Every locale file must have exactly the keys of `en.json`.
 */

type Messages = { [key: string]: string | Messages | unknown[] };

const MESSAGES = join(process.cwd(), 'messages');

function load(locale: string): Messages {
  return JSON.parse(readFileSync(join(MESSAGES, `${locale}.json`), 'utf8')) as Messages;
}

function flatten(obj: Messages, prefix = ''): Map<string, unknown> {
  const out = new Map<string, unknown>();
  for (const [key, value] of Object.entries(obj)) {
    const path = prefix + key;
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      for (const [k, v] of flatten(value as Messages, `${path}.`)) out.set(k, v);
    } else {
      out.set(path, value);
    }
  }
  return out;
}

const en = flatten(load('en'));

test('en.json is not empty', () => {
  expect(en.size).toBeGreaterThan(100);
});

for (const locale of locales.filter((l) => l !== 'en')) {
  test(`${locale}.json has exactly the keys of en.json`, () => {
    const messages = flatten(load(locale));
    const missing = [...en.keys()].filter((k) => !messages.has(k));
    const extra = [...messages.keys()].filter((k) => !en.has(k));
    expect(missing, `missing in ${locale}.json`).toEqual([]);
    expect(extra, `not in en.json (unused) in ${locale}.json`).toEqual([]);
  });

  test(`${locale}.json has no empty values and no {{double}} braces`, () => {
    const bad = [...flatten(load(locale))].filter(
      ([, v]) => v === '' || (typeof v === 'string' && v.includes('{{')),
    );
    expect(bad.map(([k]) => k)).toEqual([]);
  });
}
