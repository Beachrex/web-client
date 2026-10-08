import { ChevronRight } from 'lucide-react';

/** Id of the "browse beaches" section (`DynamicSearchBeaches`) that the link scrolls to. */
export const ALL_BEACHES_SECTION_ID = 'all-beaches';

interface AllBeachesLinkProps {
  /** Already translated label, e.g. `PropertySection.allBeachesLink` with the total beach count. */
  label: string;
}

/**
 * "All beaches (n)" next to the popular beaches carousel on country, region, island and city
 * pages. It jumps to the full, filterable list further down the same page (it was `href="#"`).
 */
export default function AllBeachesLink({ label }: AllBeachesLinkProps) {
  return (
    <a
      href={`#${ALL_BEACHES_SECTION_ID}`}
      className="flex items-center font-figtree text-[14px] font-bold leading-[100%] text-[#8D8D8D] underline underline-offset-[2px] hover:text-[#555]"
    >
      {label}
      <ChevronRight className="h-4 w-4" />
    </a>
  );
}
