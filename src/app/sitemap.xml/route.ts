/**
 * /sitemap.xml — sitemap index (sitemaps.org protocol) pointing to the section sitemaps.
 *
 * The previous `app/sitemap.ts` emitted a <urlset> whose <url> entries were other sitemaps;
 * search engines expect a <sitemapindex> for that (TASK-004 SEO).
 */
const SITEMAP_SECTIONS = ['static', 'beaches', 'countries', 'regions', 'cities', 'islands'] as const;

export const revalidate = 86400;

export function GET(): Response {
  const base = (process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000').replace(/\/$/, '');
  const lastmod = new Date().toISOString();
  const entries = SITEMAP_SECTIONS.map((name) =>
    [
      '  <sitemap>',
      `    <loc>${base}/sitemap/${name}.xml</loc>`,
      `    <lastmod>${lastmod}</lastmod>`,
      '  </sitemap>',
    ].join('\n'),
  ).join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</sitemapindex>\n`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
}
