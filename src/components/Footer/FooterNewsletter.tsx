'use client';

import { Facebook, Instagram, Youtube } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

export default function FooterNewsletter() {
  const t = useTranslations('Footer.newsletter');

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-figtree text-[14px] font-bold leading-none text-[#4D4D4D]">
          {t('title')}
        </h2>
        <p className="mt-2 font-figtree text-[14px] font-medium leading-none text-[#4D4D4D]">
          {t('subtitle')}
        </p>
      </div>

      <form
        onSubmit={(e) => e.preventDefault()}
        className="flex w-full items-center justify-between gap-3 rounded-[10px] border border-[#E7E7E7] px-[16px] py-[8px] 2xl:max-w-[720px]"
      >
        <input
          type="email"
          placeholder={t('placeholder')}
          className="w-full flex-1 border-none bg-transparent font-figtree text-[14px] font-normal leading-[100%] text-[#8D8D8D] placeholder-[#8D8D8D] focus:outline-none focus:ring-0"
        />

        <button
          type="submit"
          className="shrink-0 rounded-[6px] bg-[#E7E7E7] px-5 py-[10px] font-figtree text-[14px] font-bold leading-[100%] text-[#8D8D8D] transition-colors hover:bg-[#dcdcdc]"
        >
          {t('button')}
        </button>
      </form>

      <div className="flex items-center gap-3 pt-1">
        <Link
          href="#"
          aria-label="Facebook"
          className="flex h-6 w-6 items-center justify-center rounded-full bg-[#8D8D8D] text-white"
        >
          <Facebook className="h-4 w-4" />
        </Link>
        <Link
          href="#"
          aria-label="Instagram"
          className="flex h-6 w-6 items-center justify-center rounded-full bg-[#8D8D8D] text-white"
        >
          <Instagram className="h-4 w-4" />
        </Link>
        <Link
          href="#"
          aria-label="YouTube"
          className="flex h-6 w-6 items-center justify-center rounded-full bg-[#8D8D8D] text-white"
        >
          <Youtube className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
