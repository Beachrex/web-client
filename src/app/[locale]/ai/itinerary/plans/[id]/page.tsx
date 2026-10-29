import { setRequestLocale } from 'next-intl/server';
import ItineraryPlanPage from '@/components/Itinerary/ItineraryPlanPage';

/** Private per-user plans: nothing to prerender; each id renders on request and loads its data in the browser. */
export function generateStaticParams() {
  return [];
}

export default function Page({ params }: { params: { locale: string; id: string } }) {
  setRequestLocale(params.locale);

  return <ItineraryPlanPage id={params.id} />;
}
