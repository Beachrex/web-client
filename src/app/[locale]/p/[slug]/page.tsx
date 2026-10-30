/**
 * Static (CMS) Page Route — /{locale}/p/{slug}
 *
 * The `p` prefix is NOT localized (kept as `p` in all 19 languages); only the
 * slug is localized. SSR page that fetches the page content by slug and
 * renders it with SEO metadata via `generateMetadata`.
 */

import '@/lib/server/api-client-server';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { buildCompleteMetadata, buildSelfAlternate } from '@/lib/utils/metadata-helpers';
import { getStaticPageBySlug } from '@/lib/api-client/sdk.gen';
import type { AcceptLanguage, StaticPage } from '@/lib/api-client/types.gen';
import StaticPageContent from '@/components/StaticPage/StaticPageContent';
import { setRequestLocale } from 'next-intl/server';

interface PageProps {
    params: { locale: string; slug: string };
}

/**
 * Fetch a static page by slug for the given locale via the generated SDK.
 * Returns `null` on any error / 404 so the caller can `notFound()`.
 * The backend resolves translations by Accept-Language (with EN fallback)
 * and maps the frontend `si` code to its internal `sl`.
 */
async function fetchStaticPage(locale: string, slug: string): Promise<StaticPage | null> {
    try {
        const { data } = await getStaticPageBySlug({
            path: { slug },
            headers: { 'Accept-Language': locale as AcceptLanguage },
        });
        return data?.data ?? null;
    } catch {
        return null;
    }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { locale, slug } = params;
    setRequestLocale(locale);
    try {
        const page = await fetchStaticPage(locale, slug);
        if (!page) return {};

        return buildCompleteMetadata({
            title: page.meta_title ?? page.title ?? slug,
            description: page.meta_description ?? page.title ?? slug,
            locale,
            // Localized slugs: other locales' URLs are unknown here, so no cross-locale hreflang
            alternateLanguages: buildSelfAlternate(locale, `/p/${slug}`),
            // `p` prefix is constant across locales; only the slug is localized.
            path: `/p/${slug}`,
            type: 'website',
        });
    } catch {
        return {};
    }
}

export default async function StaticPageRoute({ params }: PageProps) {
    const { locale, slug } = params;
    setRequestLocale(locale);
    const page = await fetchStaticPage(locale, slug);
    if (!page) notFound();

    return <StaticPageContent page={page} />;
}

// Revalidate every hour (ISR). The backend also caches for 30 days and
// invalidates on admin edits; this is a safety net for the frontend cache.
export const revalidate = 3600;

/**
 * No paths are rendered at build time (the build must not depend on the API); every page is rendered on its first
 * visit and then served from the cache (ISR, see `revalidate`). Without this, Next 14 renders every request.
 */
export function generateStaticParams() {
  return [];
}
