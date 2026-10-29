import { createTranslator } from 'next-intl';

/** Server-side translator for the gate pages (outside `[locale]`, so no next-intl request config). */
export async function previewTranslator(locale: string) {
  const messages = ((await import(`../../../messages/${locale}.json`)) as { default: Record<string, never> }).default;
  return createTranslator({ locale, messages, namespace: 'PreviewAccess' });
}
