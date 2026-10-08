import { notFound } from 'next/navigation';

/**
 * Catch-all for unknown URLs under a locale, so they get the localized 404 with header and
 * footer instead of Next's bare default 404. Real routes always win over this segment.
 */
export default function CatchAllPage() {
  notFound();
}
