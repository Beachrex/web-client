import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import { test, expect } from '@playwright/test';

/**
 * TASK-004 audit D12/D13: the Stripe result pages redirected to `/internal/...` (404), used
 * locale-less links and English-only text; the sign-in error linked to a hard-coded `/en`.
 */

const root = process.cwd();
const read = (p: string) => readFileSync(join(root, p), 'utf8');
const sources = [
  'src/components/Payment/PaymentResult.tsx',
  'src/app/[locale]/payment/success/page.tsx',
  'src/app/[locale]/payment/cancel/page.tsx',
  'src/app/[locale]/auth/callback/page.tsx',
];

test('no /internal targets, no hard-coded /en, links through the next-intl Link', () => {
  for (const file of sources) {
    const source = read(file);
    expect(source, file).not.toMatch(/\/internal\/|href="\/en"|from 'next\/link'|window\.location/);
  }
  const component = read('src/components/Payment/PaymentResult.tsx');
  expect(component).toContain("from '@/i18n/routing'");
  expect(component).not.toMatch(/>\s*[A-Z][a-z]+ [a-z]+[^<{]*</); // no English text nodes
});

test('Payment strings exist in all 19 locales with their placeholders', () => {
  const dir = join(root, 'messages');
  const files = readdirSync(dir).filter((f) => f.endsWith('.json'));
  expect(files).toHaveLength(19);
  const keys = Object.keys((JSON.parse(read('messages/en.json')) as { Payment: object }).Payment);
  expect(keys.length).toBeGreaterThan(5);
  for (const file of files) {
    const payment = (JSON.parse(read(`messages/${file}`)) as { Payment: Record<string, string> }).Payment;
    expect(Object.keys(payment), file).toEqual(keys);
    expect(payment.redirecting, file).toMatch(/<strong>\{seconds\}<\/strong>/);
    expect(payment.help, file).toContain('{email}');
  }
});
