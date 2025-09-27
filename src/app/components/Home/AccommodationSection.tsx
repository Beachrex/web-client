"use client";
import Image from "next/image";

const AccommodationSection: React.FC = () => {
  return (
    <section className="mx-auto mt-[100px] flex max-w-[1722px] justify-between">
      {/* Levi tekstualni del */}
      <div className="flex w-[585px] flex-col gap-[40px]">
        {/* Naslov */}
        <h2 className="w-[409px] font-[Figtree] text-[30px] font-bold leading-[100%] text-[#003366]">
          Odpočij si v udobni <br /> plažni nastanitvi
        </h2>

        {/* Vsebina */}
        <p className="w-[409px] font-[Figtree] text-[14px] font-normal leading-[24px] text-[#4D4D4D]">
          Doživi popolno sprostitev v nastanitvi tik ob morju! Izberi med
          luksuznimi letovišči, prikupnimi bungalovi ali apartmaji s pogledom na
          valove. Ne glede na tvoj slog potovanja te čaka udobje, bližina plaže
          in nepozabno doživetje ob morski obali.
        </p>

        {/* Gumb */}
        <button className="flex h-[41px] w-[206px] items-center justify-center gap-[8px] rounded-[6px] bg-[#008260] px-[20px] py-[11px] font-[Figtree] text-[14px] font-bold leading-[100%] text-white">
          <Image
            src="/images/accomodation.png"
            alt="ikona"
            width={20}
            height={20}
            className="object-contain"
          />
          Brskaj po nastanitvah
        </button>
      </div>

      <div className="relative h-[574px] w-[1137px] rounded-[10px]">
        {/* Slika 1 */}
        <Image
          src="/images/accomodation/rectangle 96.png"
          alt="img1"
          width={302}
          height={182}
          className="absolute left-[0px] top-[81px] rounded-[10px] object-contain"
        />

        {/* Slika 2 */}
        <Image
          src="/images/accomodation/rectangle 97.png"
          alt="img2"
          width={233}
          height={211}
          className="absolute left-[0px] top-[275px] rounded-[10px] object-contain"
        />

        {/* Slika 3 */}
        <Image
          src="/images/accomodation/rectangle 98.png"
          alt="img3"
          width={299}
          height={187}
          className="absolute left-[138px] top-[0px] rounded-[10px] object-contain"
        />

        {/* Slika 4 */}
        <Image
          src="/images/accomodation/rectangle 100.png"
          alt="img4"
          width={367}
          height={126}
          className="absolute left-[449px] top-[61px] rounded-[10px] object-contain"
        />

        {/* Slika 5 */}
        <Image
          src="/images/accomodation/rectangle99.png"
          alt="img5"
          width={412}
          height={214}
          className="absolute left-[138px] top-[199px] rounded-[10px] object-contain"
        />

        {/* Slika 6 */}
        <Image
          src="/images/accomodation/rectangle 101.png"
          alt="img6"
          width={399}
          height={291}
          className="absolute left-[562px] top-[199px] rounded-[10px] object-contain"
        />

        {/* Slika 7 */}
        <Image
          src="/images/accomodation/rectangle 102.png"
          alt="img7"
          width={241}
          height={119}
          className="absolute left-[138px] top-[422px] rounded-[10px] object-contain"
        />

        {/* Slika 8 */}
        <Image
          src="/images/accomodation/rectangle 103.png"
          alt="img8"
          width={159}
          height={152}
          className="absolute left-[391px] top-[422px] rounded-[10px] object-contain"
        />
      </div>
    </section>
  );
};

export default AccommodationSection;
