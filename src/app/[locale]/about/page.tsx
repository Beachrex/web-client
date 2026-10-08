import { notFound, permanentRedirect } from 'next/navigation';
import { getStaticPagesForFooter } from '@/lib/api-client/sdk.gen';
import type { AcceptLanguage } from '@/lib/api-client/types.gen';

/**
 * `/about` (localized: `/si/o-nas`, …) had only placeholder text. "About us" is the CMS page with
 * code `about-us` (owner decision 2026-10-08, TASK-004), so this route redirects to it.
 */
export default async function AboutPage({ params }: { params: { locale: string } }) {
  const { locale } = params;
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
