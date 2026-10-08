import { notFound, permanentRedirect } from 'next/navigation';
import { resolveLegacyUrl } from '@/lib/api-client/sdk.gen';
import type { AcceptLanguage } from '@/lib/api-client/types.gen';
import { buildLegacyTargetUrl, type LegacyTarget } from '@/lib/utils/legacy-redirect';

interface PageProps {
  params: { locale: string; rest: string[] };
}

// Old URLs and their targets change rarely; re-check once a day.
export const revalidate = 86400;

async function resolveOldUrl(locale: string, rest: string[]): Promise<LegacyTarget | null> {
  try {
    const { data } = await resolveLegacyUrl({
      query: { path: `/${locale}/${rest.join('/')}` },
      headers: { 'Accept-Language': locale as AcceptLanguage },
    });
    return (data?.data as LegacyTarget | undefined) ?? null;
  } catch {
    return null;
  }
}

/**
 * Catch-all for URLs that match no route.
 *
 * Old beachrex.com URLs (on Google Maps and other sites) get a permanent redirect to the same
 * beach, city, island, region or country on the new site (TASK-004 step 5b). Everything else
 * gets the localized 404 with header and footer instead of Next's bare default 404.
 */
export default async function CatchAllPage({ params }: PageProps) {
  const { locale, rest } = params;
  const target = buildLegacyTargetUrl(await resolveOldUrl(locale, rest), locale);
  if (target) permanentRedirect(target);
  notFound();
}
