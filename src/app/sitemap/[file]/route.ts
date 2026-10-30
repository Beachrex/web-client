import { env } from '@/env';
import { serverApiBaseUrl } from '@/lib/server/api-base';
import { loadPlaceSlugs } from '@/lib/seo/place-paths';
import { parseSitemapFile, sectionRefs, sitemapXml } from '@/lib/seo/sitemap-sections';

/** /sitemap/{section}-{locale}.xml, e.g. /sitemap/beaches-si.xml (see sitemap-sections.ts). */
export const dynamic = 'force-dynamic';

export async function GET(_req: Request, { params }: { params: { file: string } }): Promise<Response> {
  const parsed = parseSitemapFile(params.file);
  if (!parsed) return new Response('Not found', { status: 404 });

  const apiEndpoint = serverApiBaseUrl();
  const [slugs, refs] = await Promise.all([loadPlaceSlugs(apiEndpoint), sectionRefs(apiEndpoint, parsed.section)]);
  const lastmod = new Date().toISOString();
  const xml = sitemapXml(refs, slugs, parsed.locale, parsed.section, env.NEXT_PUBLIC_BASE_URL, lastmod);

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  });
}
