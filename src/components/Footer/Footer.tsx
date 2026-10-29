import { useTranslations } from 'next-intl';
import React from 'react';
import FooterBrandColumn from './FooterBrandColumn';
import FooterBrowseColumn from './FooterBrowseColumn';
import FooterInfoColumn from './FooterInfoColumn';
import FooterMostViewedColumn from './FooterMostViewedColumn';
import FooterNewsletter from './FooterNewsletter';

/**
 * Owner, 2026-10-08: the footer looked scattered on 13" laptops (four equal columns, the
 * newsletter squeezed under them). Brand + three link columns on a 12-column grid, the
 * newsletter as its own band, a bottom bar with the year, the company and the brand (owner, 2026-10-08).
 */
const Footer: React.FC = () => {
  const t = useTranslations('Footer.legal');
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-[#E7E7E7] bg-white">
      <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8 lg:py-14">
        <nav aria-label="Footer" className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-12 lg:gap-8">
          <div className="sm:col-span-2 lg:col-span-4">
            <FooterBrandColumn />
          </div>
          <div className="lg:col-span-3">
            <FooterMostViewedColumn />
          </div>
          <div className="lg:col-span-3">
            <FooterInfoColumn />
          </div>
          <div className="lg:col-span-2">
            <FooterBrowseColumn />
          </div>
        </nav>

        <div className="mt-12 rounded-2xl bg-[#F5F8FB] p-6 md:p-8">
          <FooterNewsletter />
        </div>

        <div className="mt-10 border-t border-[#E7E7E7] pt-6">
          <p className="text-center font-figtree text-[12px] leading-5 text-[#8D8D8D] md:text-left">
            {t('rights', { year })}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
