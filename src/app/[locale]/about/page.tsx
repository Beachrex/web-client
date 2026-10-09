import { notFound, permanentRedirect } from 'next/navigation';
import { getStaticPagesForFooter } from '@/lib/api-client/sdk.gen';
import type { AcceptLanguage } from '@/lib/api-client/types.gen';
import { setRequestLocale } from 'next-intl/server';

/**
 * `/about` (localized: `/si/o-nas`, …) had only placeholder text. "About us" is the CMS page with
 * code `about-us` (owner decision 2026-10-08, TASK-004), so this route redirects to it.
 */
export default async function AboutPage({ params }: { params: { locale: string } }) {
  const { locale } = params;
  setRequestLocale(locale);
  let slug: string | undefined;
  try {
    const { data } = await getStaticPagesForFooter({
      headers: { 'Accept-Language': locale as AcceptLanguage },
    });
    slug = data?.data?.find((p) => p.code === 'about-us')?.slug;
  } catch {
    slug = undefined;
  }
  if (!slug) notFound();
  permanentRedirect(`/${locale}/p/${slug}`);
}

// The CMS slug of the about page can change; re-check hourly.
export const revalidate = 3600;
