import { useTranslations } from 'next-intl';
import React from 'react';
import FooterBrandColumn from './FooterBrandColumn';
import FooterBrowseColumn from './FooterBrowseColumn';
import FooterInfoColumn from './FooterInfoColumn';
import FooterMostViewedColumn from './FooterMostViewedColumn';
import FooterNewsletter from './FooterNewsletter';
const Footer: React.FC = () => {
  const t = useTranslations('Footer.legal');

  return (
    <footer className="mt-auto bg-white">
      <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        {/* Accessibility wrapper for footer navigation */}
        <nav
          aria-label="Footer"
          className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-10 lg:grid-cols-4 lg:gap-12 2xl:grid-cols-5"
        >
          <div>
            <FooterBrandColumn />
          </div>
          <FooterMostViewedColumn />
          <FooterInfoColumn />

          <FooterBrowseColumn />
          <div className="lg:col-span-2 2xl:col-span-1">
            <FooterNewsletter />
          </div>
        </nav>

        <div className="mt-10 border-t border-[#E7E7E7] pt-6">
          <p className="text-center font-figtree text-[11px] font-normal leading-none text-[#8D8D8D] md:text-left">
            {t('rights')}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
