import React from 'react';
import Image from 'next/image';
import { SlBriefcase } from 'react-icons/sl';
import { useTranslations } from 'next-intl';

const CDN_ASSETS = process.env.NEXT_PUBLIC_CDN_ASSETS ?? '';

const NavIcon = ({
  src,
  alt,
  label,
  horizontal = false,
  className = '',
  onClick,
}: {
  src: string;
  alt: string;
  label: string;
  horizontal?: boolean;
  className?: string;
  onClick?: () => void;
}) => {
  const defaultStyles = `h-6 items-center justify-center flex ${
    horizontal ? 'flex-row space-x-2' : 'flex-col items-center'
  } text-sm text-variable-collection-dark-grey`;

  const appliedClassName = className || defaultStyles;

  return (
    <button className={appliedClassName} onClick={onClick}>
      <Image
src={src} alt={alt} width={26}
height={26}
      />
      <span className={appliedClassName}>
        <span className="text-sm leading-tight text-variable-collection-semi-dark-grey">
          {label}
        </span>
      </span>
    </button>
  );
};

const QuickMenu = ({ toggleMenu }: { toggleMenu: () => void }) => {
  const t = useTranslations('Common');

  return (
    <div className="flex min-h-[61px] items-center border-b border-t border-variable-collection-light-grey bg-variable-collection-ultra-light-grey">
      <div className="container mx-auto">
        {/* Mobile Layout (< md) */}
        <div className="flex items-center justify-between md:hidden">
          {/* Left: Hamburger Menu */}
          <div className="flex items-center">
            <NavIcon
              src={`${CDN_ASSETS}img/icon/hamburgerMenu.svg`}
              alt="Hamburger Menu"
              label=""
              horizontal={true}
              className="cursor-pointer"
              onClick={toggleMenu}
            />
          </div>

          {/* Center: Most important icons only */}
          <div className="flex flex-1 items-center justify-center space-x-3">
            {[
              { icon: 'globe.svg', labelKey: 'quickMenuWorldBeaches' },
              { icon: 'beachType.svg', labelKey: 'quickMenuBeachType' },
              { icon: 'baseBeachIcon.svg', labelKey: 'quickMenuTopBeaches' },
            ].map((item, index) => (
              <div key={index} className="flex flex-col items-center">
                <Image
                  src={`${CDN_ASSETS}img/icon/${item.icon}`}
                  alt={t(item.labelKey)}
                  width={40}
                  height={40}
                />
                <span className="xs:block mt-1 hidden text-xs text-variable-collection-semi-dark-grey">
                  {t(item.labelKey)}
                </span>
              </div>
            ))}
          </div>

          {/* Right: Social icons (minimal) */}
          <div className="flex items-center space-x-2">
            <NavIcon
              src={`${CDN_ASSETS}img/icon/facebook.svg`}
              alt="Facebook"
              label=""
              className="h-5 w-5"
            />
            <NavIcon
              src={`${CDN_ASSETS}img/icon/instagram.svg`}
              alt="Instagram"
              label=""
              className="h-5 w-5"
            />
          </div>
        </div>

        {/* Desktop Layout (>= md) */}
        <div className="hidden items-center justify-between md:flex">
          {/* Left Section (Menu) */}
          <div className="flex items-center space-x-4 lg:space-x-6">
            <NavIcon
              src={`${CDN_ASSETS}img/icon/hamburgerMenu.svg`}
              alt="Hamburger Menu"
              label=""
              horizontal={true}
              className="cursor-pointer"
              onClick={toggleMenu}
            />
          </div>

          {/* Middle Section (Icons and Labels) */}
          <div className="flex flex-1 flex-wrap items-center justify-center space-x-3 lg:space-x-6">
            {[
              { icon: 'globe.svg', labelKey: 'quickMenuWorldBeaches' },
              { icon: 'beachType.svg', labelKey: 'quickMenuBeachType' },
              { icon: 'userType.svg', labelKey: 'quickMenuUserType' },
              { icon: 'beachShowType.svg', labelKey: 'quickMenuBeachDisplay' },
              { icon: 'shower.svg', labelKey: 'quickMenuBeachServices' },
              { icon: 'baseBeachIcon.svg', labelKey: 'quickMenuTopBeaches' },
            ].map((item, index) => (
              <div key={index} className="flex items-center space-x-2">
                <NavIcon
                  src={`${CDN_ASSETS}img/icon/${item.icon}`}
                  alt={t(item.labelKey)}
                  label={t(item.labelKey)}
                  horizontal={true}
                />
              </div>
            ))}
          </div>

          {/* Right Section (Social Icons) */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center gap-2 pr-6">
              <SlBriefcase className="h-[26px] w-[26px] text-variable-collection-dark-grey" />
              <span className="cursor-pointer text-sm font-bold text-variable-collection-middle-grey">
                {t('quickMenuAboutUs')}
              </span>
            </div>

            <div className="flex items-center space-x-3">
              <NavIcon
                src={`${CDN_ASSETS}img/icon/facebook.svg`}
                alt="Facebook"
                label=""
              />
              <NavIcon
                src={`${CDN_ASSETS}img/icon/instagram.svg`}
                alt="Instagram"
                label=""
              />
              <NavIcon
                src={`${CDN_ASSETS}img/icon/youtube.svg`}
                alt="YouTube"
                label=""
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickMenu;
