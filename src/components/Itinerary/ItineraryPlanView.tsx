'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { Alert, Card } from 'flowbite-react';
import { buildBeachUrlFromSchema } from '@/lib/utils/beach-urls';
import { buildCdnUrl } from '@/lib/utils/beach-images';
import type { Plan } from '@/lib/utils/itinerary';

const TIME_BLOCKS = ['morning', 'afternoon', 'evening'];

/** A generated itinerary: days with time blocks; every beach links to its Beachrex page with its photo. */
export default function ItineraryPlanView({ plan }: { plan: Plan }) {
  const t = useTranslations('AI.itinerary');
  const locale = useLocale();

  return (
    <div className="space-y-6">
      <Card>
        <h2 className="text-2xl font-bold text-gray-900">{plan.title}</h2>
        <p className="text-gray-700">{plan.summary}</p>
        {plan.metadata.narrative === 'fallback' && <Alert color="warning">{t('fallbackNote')}</Alert>}
      </Card>

      {plan.days.map((day) => (
        <Card key={day.day_number}>
          <h3 className="text-xl font-semibold text-gray-900">
            {t('day', { number: day.day_number })}: {day.theme}
          </h3>
          <div className="space-y-4">
            {day.items.map((item, idx) => {
              const href = item.beach ? buildBeachUrlFromSchema(item.beach, locale) : null;
              const image = item.beach?.main_image ? buildCdnUrl(item.beach.main_image, 'list') : null;
              return (
                <div key={idx} className="flex flex-col gap-3 border-l-4 border-blue-500 pl-4 sm:flex-row">
                  {image && (
                    <div className="relative h-32 w-full flex-shrink-0 overflow-hidden rounded-md sm:w-44">
                      <Image
                        src={image}
                        alt={item.beach?.name ?? ''}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, 176px"
                      />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                      {t(`timeBlock.${TIME_BLOCKS.includes(item.time_block) ? item.time_block : 'afternoon'}`)}
                    </p>
                    {item.beach ? (
                      <h4 className="text-lg font-semibold">
                        {href ? (
                          <Link href={href} target="_blank" className="text-blue-700 hover:underline">
                            {item.beach.name}
                          </Link>
                        ) : (
                          item.beach.name
                        )}
                        {item.beach.city && <span className="ml-2 text-sm font-normal text-gray-500">{item.beach.city}</span>}
                      </h4>
                    ) : (
                      <h4 className="text-lg font-semibold text-gray-900">{t('tip')}</h4>
                    )}
                    <p className="text-gray-700">{item.notes}</p>
                    {item.why && <p className="mt-1 text-sm text-gray-600">{item.why}</p>}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="space-y-1 rounded-md bg-gray-50 p-3 text-sm text-gray-700">
            {day.logistics.estimated_travel_km > 0 && (
              <p>{t('travelKm', { km: Math.round(day.logistics.estimated_travel_km) })}</p>
            )}
            {day.logistics.parking_notes && <p>{day.logistics.parking_notes}</p>}
            {day.logistics.accessibility_notes && <p>{day.logistics.accessibility_notes}</p>}
            {day.logistics.notes && <p>{day.logistics.notes}</p>}
          </div>
        </Card>
      ))}

      {plan.assumptions.length > 0 && (
        <Card>
          <h4 className="font-medium text-gray-900">{t('assumptions')}</h4>
          <ul className="list-inside list-disc text-sm text-gray-600">
            {plan.assumptions.map((a, i) => (
              <li key={i}>{a}</li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
