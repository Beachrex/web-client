'use client';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

const HomeAccommodationSection: React.FC = () => {
  const t = useTranslations('HomePage');
  return (
    <section className="py-12 sm:py-16 lg:py-20">
      <div className="container mx-auto">
        <div className="flex flex-col gap-8 lg:flex-row lg:gap-16 xl:gap-20">
          {/* Text Content */}
          <div className="flex flex-col gap-6 lg:w-1/3 lg:gap-8">
            {/* Title */}
            <h2 className="text-2xl font-bold leading-tight text-[#003366] sm:text-3xl lg:text-4xl">
              {t('accommodationTitle')}
            </h2>

            {/* Content */}
            <p className="text-sm leading-relaxed text-[#4D4D4D] sm:text-base lg:text-lg">
              {t('accommodationDescription')}
            </p>

            {/* Button */}
            <button className="flex w-fit items-center justify-center gap-2 rounded-md bg-[#008260] px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-[#006b4f] sm:px-6 sm:py-3 sm:text-base">
              <Image
                src="/images/accomodation.png"
                alt="ikona"
                width={20}
                height={20}
                className="object-contain"
              />
              {t('browseAccommodationsButton')}
            </button>
          </div>

          {/* Images Grid */}
          <div className="lg:w-2/3">
            {/* Mobile: Simple 2-column grid */}
            <div className="grid grid-cols-2 gap-3 sm:hidden">
              <Image
                src="/images/accomodation/accommodation-1.png"
                alt="Beach accommodation 1"
                width={302}
                height={182}
                className="h-32 w-full rounded-lg object-cover"
              />
              <Image
                src="/images/accomodation/accommodation-2.png"
                alt="Beach accommodation 2"
                width={233}
                height={211}
                className="h-32 w-full rounded-lg object-cover"
              />
              <Image
                src="/images/accomodation/accommodation-3.png"
                alt="Beach accommodation 3"
                width={299}
                height={187}
                className="h-32 w-full rounded-lg object-cover"
              />
              <Image
                src="/images/accomodation/accommodation-5.png"
                alt="Beach accommodation 4"
                width={367}
                height={126}
                className="h-32 w-full rounded-lg object-cover"
              />
            </div>

            {/* Tablet: 3-column grid */}
            <div className="hidden grid-cols-3 gap-4 sm:grid lg:hidden">
              <Image
                src="/images/accomodation/accommodation-1.png"
                alt="Beach accommodation 1"
                width={302}
                height={182}
                className="h-40 w-full rounded-lg object-cover"
              />
              <Image
                src="/images/accomodation/accommodation-2.png"
                alt="Beach accommodation 2"
                width={233}
                height={211}
                className="h-40 w-full rounded-lg object-cover"
              />
              <Image
                src="/images/accomodation/accommodation-3.png"
                alt="Beach accommodation 3"
                width={299}
                height={187}
                className="h-40 w-full rounded-lg object-cover"
              />
              <Image
                src="/images/accomodation/accommodation-5.png"
                alt="Beach accommodation 4"
                width={367}
                height={126}
                className="h-40 w-full rounded-lg object-cover"
              />
              <Image
                src="/images/accomodation/accommodation-4.png"
                alt="Beach accommodation 5"
                width={412}
                height={214}
                className="h-40 w-full rounded-lg object-cover"
              />
              <Image
                src="/images/accomodation/accommodation-6.png"
                alt="Beach accommodation 6"
                width={399}
                height={291}
                className="h-40 w-full rounded-lg object-cover"
              />
            </div>

            {/* Desktop: Complex masonry-style layout */}
            <div className="hidden lg:block">
              <div className="grid h-[500px] grid-cols-4 gap-4">
                {/* Column 1 */}
                <div className="flex flex-col gap-4">
                  <Image
                    src="/images/accomodation/accommodation-1.png"
                    alt="Beach accommodation 1"
                    width={302}
                    height={182}
                    className="h-48 w-full rounded-lg object-cover"
                  />
                  <Image
                    src="/images/accomodation/accommodation-2.png"
                    alt="Beach accommodation 2"
                    width={233}
                    height={211}
                    className="w-full flex-1 rounded-lg object-cover"
                  />
                </div>

                {/* Column 2 */}
                <div className="flex flex-col gap-4">
                  <Image
                    src="/images/accomodation/accommodation-3.png"
                    alt="Beach accommodation 3"
                    width={299}
                    height={187}
                    className="h-40 w-full rounded-lg object-cover"
                  />
                  <Image
                    src="/images/accomodation/accommodation-4.png"
                    alt="Beach accommodation 5"
                    width={412}
                    height={214}
                    className="h-52 w-full rounded-lg object-cover"
                  />
                  <Image
                    src="/images/accomodation/accommodation-7.png"
                    alt="Beach accommodation 7"
                    width={241}
                    height={119}
                    className="w-full flex-1 rounded-lg object-cover"
                  />
                </div>

                {/* Column 3 */}
                <div className="flex flex-col gap-4">
                  <Image
                    src="/images/accomodation/accommodation-5.png"
                    alt="Beach accommodation 4"
                    width={367}
                    height={126}
                    className="h-32 w-full rounded-lg object-cover"
                  />
                  <Image
                    src="/images/accomodation/accommodation-6.png"
                    alt="Beach accommodation 6"
                    width={399}
                    height={291}
                    className="w-full flex-1 rounded-lg object-cover"
                  />
                </div>

                {/* Column 4 */}
                <div className="flex flex-col gap-4">
                  <Image
                    src="/images/accomodation/accommodation-8.png"
                    alt="Beach accommodation 8"
                    width={159}
                    height={152}
                    className="h-40 w-full rounded-lg object-cover"
                  />
                  <div className="flex flex-1 items-center justify-center rounded-lg bg-gradient-to-br from-blue-100 to-blue-200">
                    <span className="px-4 text-center font-semibold text-blue-600">
                      {t('moreAccommodations')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomeAccommodationSection;
