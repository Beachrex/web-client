import { useTranslations } from 'next-intl';
import type { BeachFaqItem } from '@/lib/utils/beach-faq';

interface BeachFaqSectionProps {
  beachName: string;
  items: BeachFaqItem[];
}

/**
 * TASK-007: frequently asked questions about the beach. Answers are in the HTML (native <details>),
 * so search engines and AI assistants read them without running scripts. Hidden without questions.
 */
export default function BeachFaqSection({ beachName, items }: BeachFaqSectionProps) {
  const t = useTranslations('BeachFaq');
  if (items.length === 0) return null;

  return (
    <section aria-labelledby="beach-faq-title" className="bg-white py-10 sm:py-14">
      <div className="container mx-auto">
        <h2
          id="beach-faq-title"
          className="mb-6 font-figtree text-[22px] font-bold text-[#222222] sm:text-[26px] lg:text-[30px]"
        >
          {t('title', { name: beachName })}
        </h2>
        <div className="divide-y divide-[#E5E5E5] rounded-[10px] border border-[#E5E5E5]">
          {items.map((item, index) => (
            <details key={index} className="group px-4 sm:px-6" open={index === 0}>
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 font-figtree text-[16px] font-semibold text-[#1A3C68] sm:text-[17px] [&::-webkit-details-marker]:hidden">
                <h3 className="text-left">{item.q}</h3>
                <span aria-hidden="true" className="text-[22px] leading-none transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="pb-4 font-figtree text-[15px] leading-relaxed text-[#4D4D4D]">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
