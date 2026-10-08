import { FEATURES } from '@/lib/constants/features';
import { buildBeachMapUrl, getBeachesWord } from '@/lib/utils/beach-urls';

/**
 * Hrefs are built here, not taken from the messages: the message hrefs pointed at routes that
 * do not exist (`/destinations`, `/accommodations` → 404) and differed per locale.
 * The labels keep their order in `Footer.browse.links`:
 * 0 destinations overview, 1 search by beaches, 2 accommodations (hidden for launch), 3 map view.
 */
export function footerBrowseHrefs(locale: string): (string | null)[] {
  const beaches = `/${locale}/${getBeachesWord(locale)}`;
  return [
    beaches,
    `/${locale}`,
    FEATURES.accommodation ? `/${locale}/accommodations` : null,
    buildBeachMapUrl(locale),
  ];
}
