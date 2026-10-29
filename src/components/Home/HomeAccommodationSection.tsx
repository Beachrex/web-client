'use client';

import Image from 'next/image';

interface HomeAccommodationSectionProps {
  title: string;
  description: string;
  images: string[];
  buttonLabel: string;
  moreLabel: string;
}

const HomeAccommodationSection: React.FC<HomeAccommodationSectionProps> = ({
  title,
  description,
  images,
  buttonLabel,
  moreLabel,
}) => {
  return (
    <section className="py-12 sm:py-16 lg:py-20">
      <div className="container mx-auto">
        <div className="flex flex-col gap-8 lg:flex-row lg:gap-16 xl:gap-20 2xl:gap-12">
          {/* ================================
              LEFT COLUMN (TEXT CONTENT)
              ================================ */}
          <div className="flex flex-col gap-6 lg:w-1/3 lg:gap-8 2xl:w-[400px] 2xl:flex-none">
            {/* Title */}
            <h2 className="text-2xl font-bold leading-tight text-[#003366] sm:text-3xl lg:text-4xl">
              {title}
            </h2>

            {/* Description */}
            <p className="text-sm leading-relaxed text-[#4D4D4D] sm:text-base lg:text-lg">
              {description}
            </p>

            {/* CTA Button */}
            <button className="flex w-fit items-center justify-center gap-2 rounded-md bg-[#008260] px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-[#006b4f] sm:px-6 sm:py-3 sm:text-base">
              <Image
                src="/images/accomodation.png"
                alt=""
                width={20}
                height={20}
                className="object-contain"
              />
              {buttonLabel}
            </button>
          </div>

          {/* ================================
              RIGHT COLUMN (IMAGES SECTION)
              ================================ */}
          <div className="lg:w-2/3 2xl:flex-1">
            {/* ---- MOBILE: 2-column grid ---- */}
            <div className="grid grid-cols-2 gap-3 sm:hidden">
              {images.slice(0, 4).map((url, idx) => (
                <Image
                  key={idx}
                  src={url}
                  alt=""
                  width={302}
                  height={182}
                  className="h-32 w-full rounded-lg object-cover"
                />
              ))}
            </div>

            {/* ---- TABLET: 3-column grid ---- */}
            <div className="hidden grid-cols-3 gap-4 sm:grid lg:hidden">
              {images.slice(0, 6).map((url, idx) => (
                <Image
                  key={idx}
                  src={url}
                  alt=""
                  width={302}
                  height={182}
                  className="h-40 w-full rounded-lg object-cover"
                />
              ))}
            </div>

            {/* ---- DESKTOP < 2XL: Masonry grid ---- */}
            <div className="hidden lg:block 2xl:hidden">
              <div className="grid h-[500px] grid-cols-4 gap-4">
                {/* Column 1 */}
                <div className="flex flex-col gap-4">
                  {images[0] && (
                    <Image
                      src={images[0]}
                      alt=""
                      width={302}
                      height={182}
                      className="h-48 w-full rounded-lg object-cover"
                    />
                  )}
                  {images[1] && (
                    <Image
                      src={images[1]}
                      alt=""
                      width={233}
                      height={211}
                      className="w-full flex-1 rounded-lg object-cover"
                    />
                  )}
                </div>

                {/* Column 2 */}
                <div className="flex flex-col gap-4">
                  {images[2] && (
                    <Image
                      src={images[2]}
                      alt=""
                      width={299}
                      height={187}
                      className="h-40 w-full rounded-lg object-cover"
                    />
                  )}
                  {images[3] && (
                    <Image
                      src={images[3]}
                      alt=""
                      width={412}
                      height={214}
                      className="h-52 w-full rounded-lg object-cover"
                    />
                  )}
                  {images[6] && (
                    <Image
                      src={images[6]}
                      alt=""
                      width={241}
                      height={119}
                      className="w-full flex-1 rounded-lg object-cover"
                    />
                  )}
                </div>

                {/* Column 3 */}
                <div className="flex flex-col gap-4">
                  {images[4] && (
                    <Image
                      src={images[4]}
                      alt=""
                      width={367}
                      height={126}
                      className="h-32 w-full rounded-lg object-cover"
                    />
                  )}
                  {images[5] && (
                    <Image
                      src={images[5]}
                      alt=""
                      width={399}
                      height={291}
                      className="w-full flex-1 rounded-lg object-cover"
                    />
                  )}
                </div>

                {/* Column 4 */}
                <div className="flex flex-col gap-4">
                  {images[7] && (
                    <Image
                      src={images[7]}
                      alt=""
                      width={159}
                      height={152}
                      className="h-40 w-full rounded-lg object-cover"
                    />
                  )}
                  <div className="flex flex-1 items-center justify-center rounded-lg bg-gradient-to-br from-blue-100 to-blue-200">
                    <span className="px-4 text-center font-semibold text-blue-600">
                      {moreLabel}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* ---- 2XL: Pixel-perfect Figma mosaic ---- */}
            <div className="hidden 2xl:flex 2xl:justify-end">
              <div className="relative h-[574px] w-[1137px] rounded-[10px] bg-white">
                {/* image 0 – 412x214 */}
                {images[0] && (
                  <Image
                    src={images[0]}
                    alt=""
                    width={412}
                    height={214}
                    className="absolute left-[314px] top-[199px] h-[214px] w-[412px] rounded-[10px] object-cover"
                  />
                )}

                {/* image 1 – 399x291 */}
                {images[4] && (
                  <Image
                    src={images[4]}
                    alt=""
                    width={340}
                    height={291}
                    className="absolute left-[738px] top-[199px] h-[291px] w-[340px] rounded-[10px] object-cover"
                  />
                )}

                {/* image 2 – 233x211 */}
                {images[1] && (
                  <Image
                    src={images[1]}
                    alt=""
                    width={233}
                    height={211}
                    className="absolute left-[69px] top-[275px] h-[211px] w-[233px] rounded-[10px] object-cover"
                  />
                )}

                {/* image 3 – 299x187 */}
                {images[2] && (
                  <Image
                    src={images[2]}
                    alt=""
                    width={299}
                    height={187}
                    className="absolute left-[314px] top-[0px] h-[187px] w-[299px] rounded-[10px] object-cover"
                  />
                )}

                {/* image 4 – 241x119 */}
                {images[6] && (
                  <Image
                    src={images[6]}
                    alt=""
                    width={241}
                    height={119}
                    className="absolute left-[314px] top-[422px] h-[119px] w-[241px] rounded-[10px] object-cover"
                  />
                )}

                {/* image 5 – 159x152 */}
                {images[7] && (
                  <Image
                    src={images[7]}
                    alt=""
                    width={159}
                    height={152}
                    className="absolute left-[567px] top-[422px] h-[152px] w-[159px] rounded-[10px] object-cover"
                  />
                )}

                {/* image 6 – 367x126 */}
                {images[5] && (
                  <Image
                    src={images[5]}
                    alt=""
                    width={367}
                    height={126}
                    className="absolute left-[625px] top-[61px] h-[126px] w-[367px] rounded-[10px] object-cover"
                  />
                )}

                {/* image 7 – 302x182 */}
                {images[3] && (
                  <Image
                    src={images[3]}
                    alt=""
                    width={302}
                    height={182}
                    className="absolute left-[0px] top-[81px] h-[182px] w-[302px] rounded-[10px] object-cover"
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomeAccommodationSection;
