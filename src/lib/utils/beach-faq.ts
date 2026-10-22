import type { BeachDetailsSchema } from '@/lib/api-client/types.gen';

/**
 * TASK-007 (owner 2026-10-21): search snippet and FAQ per beach and language from the API
 * (`basic_info.meta_description`, `basic_info.faq`, requested language only). Typed here until the
 * API client is regenerated from dev (`yarn generate:api`).
 */
export interface BeachFaqItem {
  q: string;
  a: string;
}

type BasicInfoWithSeo = NonNullable<BeachDetailsSchema['basic_info']> & {
  meta_description?: string | null;
  faq?: unknown;
};

function basicInfo(beach: BeachDetailsSchema | null | undefined): BasicInfoWithSeo | undefined {
  return beach?.basic_info as BasicInfoWithSeo | undefined;
}

/** The search snippet in the page language, or null. */
export function readMetaDescription(beach: BeachDetailsSchema | null | undefined): string | null {
  const meta = basicInfo(beach)?.meta_description;
  return typeof meta === 'string' && meta.trim() !== '' ? meta.trim() : null;
}

/** FAQ items with a question and an answer; anything malformed is dropped. */
export function readBeachFaq(beach: BeachDetailsSchema | null | undefined): BeachFaqItem[] {
  const faq = basicInfo(beach)?.faq;
  if (!Array.isArray(faq)) return [];
  return faq.flatMap((item) => {
    if (!item || typeof item !== 'object') return [];
    const { q, a } = item as Record<string, unknown>;
    if (typeof q !== 'string' || typeof a !== 'string' || q.trim() === '' || a.trim() === '') return [];
    return [{ q: q.trim(), a: a.trim() }];
  });
}

/** schema.org FAQPage for the beach page, or null without questions. */
export function buildBeachFaqSchema(items: BeachFaqItem[], url: string): Record<string, unknown> | null {
  if (items.length === 0) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    url,
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  };
}
