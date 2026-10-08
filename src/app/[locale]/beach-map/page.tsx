import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import BeachMapClient from '@/components/Map/BeachMapClient';
import { getBeachMapWord } from '@/lib/utils/beach-urls';
import { buildCompleteMetadata, buildLocalizedAlternates } from '@/lib/utils/metadata-helpers';

interface PageProps {
  params: { locale: string };
}

/**
 * Beach map page. The map itself is client-only (Leaflet); this server wrapper gives the page its
 * own title, description, canonical and hreflang, plus an h1 (TASK-004 SEO; it had neither).
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = params;
  const t = await getTranslations({ locale, namespace: 'SEO' });
  return buildCompleteMetadata({
    title: t('beachMapTitle'),
    description: t('beachMapDescription'),
    locale,
    path: `/${getBeachMapWord(locale)}`,
    type: 'website',
    alternateLanguages: buildLocalizedAlternates((l) => `/${getBeachMapWord(l)}`),
  });
}

export default async function BeachMapPage({ params }: PageProps) {
  const t = await getTranslations({ locale: params.locale, namespace: 'SEO' });
  return (
    <>
      {/* Visually hidden: the map fills the screen, but the page still needs one h1 */}
      <h1 className="sr-only">{t('beachMapTitle').split(' | ')[0]}</h1>
      <BeachMapClient />
    </>
  );
}
