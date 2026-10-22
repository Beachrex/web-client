import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { test, expect } from '@playwright/test';

process.env.SKIP_ENV_VALIDATION = '1';

/**
 * TASK-007 (owner 2026-10-21): beach pages show the FAQ from the API, emit it as FAQPage JSON-LD and use the
 * search snippet written for the language as the meta description.
 */
const root = process.cwd();
const read = (f: string) => readFileSync(join(root, f), 'utf8');
const beach = (basic: Record<string, unknown>) => ({ basic_info: { name: 'Slanica', ...basic } }) as never;

test('FAQ items are read from basic_info.faq and malformed ones are dropped', async () => {
  const { readBeachFaq } = await import('@/lib/utils/beach-faq');

  expect(readBeachFaq(beach({ faq: [{ q: ' Is it shallow? ', a: 'Yes.' }, { q: '', a: 'x' }, { q: 'No answer' }, null, 'text'] })))
    .toEqual([{ q: 'Is it shallow?', a: 'Yes.' }]);
  expect(readBeachFaq(beach({}))).toEqual([]);
  expect(readBeachFaq(beach({ faq: { a: 1 } }))).toEqual([]);
  expect(readBeachFaq(undefined)).toEqual([]);
});

test('FAQPage JSON-LD has one Question per item and none without items', async () => {
  const { buildBeachFaqSchema } = await import('@/lib/utils/beach-faq');

  expect(buildBeachFaqSchema([], 'https://beachrex.com/x')).toBeNull();
  expect(buildBeachFaqSchema([{ q: 'Is it shallow?', a: 'Yes.' }], 'https://beachrex.com/x')).toEqual({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    url: 'https://beachrex.com/x',
    mainEntity: [{ '@type': 'Question', name: 'Is it shallow?', acceptedAnswer: { '@type': 'Answer', text: 'Yes.' } }],
  });
});

test('the meta description prefers the snippet for the language', async () => {
  const { readMetaDescription } = await import('@/lib/utils/beach-faq');

  expect(readMetaDescription(beach({ meta_description: ' Shallow sandy beach. ' }))).toBe('Shallow sandy beach.');
  expect(readMetaDescription(beach({ meta_description: '  ' }))).toBeNull();
  expect(readMetaDescription(beach({ meta_description: null }))).toBeNull();

  const page = read('src/app/[locale]/beaches/[continent]/[country]/[...segments]/page.tsx');
  expect(page).toContain("let description = readMetaDescription(beach) ?? beach.basic_info?.description ?? '';");
  expect(page).toContain('buildBeachFaqSchema(readBeachFaq(beach), canonicalUrl)');
});

test('JSON-LD text cannot close the script tag', async () => {
  const { renderJsonLd } = await import('@/lib/utils/json-ld-helpers');

  const out = renderJsonLd({ text: 'a</script><script>alert(1)</script>' });
  expect(out).not.toContain('</script>');
  expect(JSON.parse(out)).toEqual({ text: 'a</script><script>alert(1)</script>' });
});

test('the FAQ section is on the beach page and its heading exists in all 19 languages', () => {
  expect(read('src/components/Pages/BeachDetailPage.tsx')).toContain('<BeachFaqSection');
  const files = readdirSync(join(root, 'messages')).filter((f) => f.endsWith('.json'));
  expect(files).toHaveLength(19);
  for (const f of files) {
    const title = JSON.parse(read(`messages/${f}`)).BeachFaq?.title;
    expect(title, f).toContain('{name}');
  }
});
