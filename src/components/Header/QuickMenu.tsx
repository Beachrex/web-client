'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { SlBriefcase } from 'react-icons/sl';

/* ------------------------------------------------------------------
 * NavIcon
 * ------------------------------------------------------------------ */

interface NavIconProps {
  src: string;
  alt: string;
  label: string;
  horizontal?: boolean;
  className?: string;
  onClick?: () => void;
}

const NavIcon = ({
  src,
  alt,
  label,
  horizontal = false,
  className = '',
  onClick,
}: NavIconProps) => {
  const defaultStyles = `
    h-6 flex items-center justify-center
    ${horizontal ? 'flex-row space-x-2' : 'flex-col'}
    text-sm text-variable-collection-dark-grey
  `;

  const appliedClassName = className || defaultStyles;

  return (
    <button className={appliedClassName} onClick={onClick}>
      <Image
src={src} alt={alt} width={26}
height={26}
      />

      {label && (
        <span
          className="
            font-figtree
            text-[14px]
            font-bold
            leading-[100%]
            text-[#4D4D4D]
            hidden xl:inline
          "
        >
          {label}
        </span>
      )}
    </button>
  );
};

/* ------------------------------------------------------------------
 * QuickMenu
 * ------------------------------------------------------------------ */

interface QuickMenuProps {
  isOpen: boolean;
  toggleMenu: () => void;
}

const QuickMenu = ({ isOpen, toggleMenu }: QuickMenuProps) => {
  const t = useTranslations('Common');

  return (
    <div
      className="
        border-t border-b border-variable-collection-light-grey
        min-h-[61px]
        flex items-center
      "
    >
      <div className="w-full px-[100px]">
        {/* ================= MOBILE ================= */}
        <div className="md:hidden flex items-center justify-between">
          {/* Menu trigger */}
          <div
            className="relative flex items-center gap-2 cursor-pointer select-none"
            onClick={toggleMenu}
          >
            <NavIcon
              src={
                isOpen
                  ? '/images/menu/menu.svg'
                  : 'https://beachrex.fra1.digitaloceanspaces.com/public/img/icon/hamburgerMenu.svg'
              }
              alt="Menu"
              label=""
              horizontal
            />

            <span
              className={`
                font-figtree
                font-bold
                text-[14px]
                leading-[100%]
                transition-colors
                ${isOpen ? 'text-[#1A3C68]' : 'text-[#4D4D4D]'}
              `}
            >
              {t('menu')}
            </span>

            {isOpen && (
              <span
                className="
                  absolute
                  left-0
                  -bottom-[19.5px]
                  h-[3px]
                  w-full
                  bg-[#1A3C68]
                  rounded-t-sm
                "
              />
            )}
          </div>

          {/* Social icons */}
          <div className="flex items-center space-x-2">
            <NavIcon
              src="https://beachrex.fra1.digitaloceanspaces.com/public/img/icon/facebook.svg"
              alt="Facebook"
              label=""
              className="w-5 h-5"
            />
            <NavIcon
              src="https://beachrex.fra1.digitaloceanspaces.com/public/img/icon/instagram.svg"
              alt="Instagram"
              label=""
              className="w-5 h-5"
            />
          </div>
        </div>

        {/* ================= DESKTOP ================= */}
        <div className="hidden md:flex items-center justify-between w-full">
          {/* LEFT */}
          <div className="flex items-center gap-10">
            {/* Menu trigger */}
            <div
              className="relative flex items-center gap-2 cursor-pointer select-none"
              onClick={toggleMenu}
            >
              <NavIcon
                src={
                  isOpen
                    ? '/images/menu/menu.svg'
                    : 'https://beachrex.fra1.digitaloceanspaces.com/public/img/icon/hamburgerMenu.svg'
                }
                alt="Menu"
                label=""
                horizontal
              />

              <span
                className={`
                  font-figtree
                  font-bold
                  text-[14px]
                  leading-[100%]
                  transition-colors
                  ${isOpen ? 'text-[#1A3C68]' : 'text-[#4D4D4D]'}
                `}
              >
                {t('menu')}
              </span>

              {isOpen && (
                <span className="absolute left-0 -bottom-[19.5px] h-[3px] w-full bg-[#1A3C68] rounded-t-sm" />
              )}
            </div>

            {/* Icons */}
            <div className="hidden md:flex items-center gap-6">
              {[
                { icon: 'globe.svg', label: 'Plaže po svetu' },
                { icon: 'beachType.svg', label: 'Tip plaže' },
                { icon: 'userType.svg', label: 'Tip uporabnika' },
                { icon: 'beachShowType.svg', label: 'Prikaz plaže' },
                { icon: 'shower.svg', label: 'Storitve ob plaži' },
                { icon: 'baseBeachIcon.svg', label: 'Top plaže' },
              ].map((item, index) => (
                <NavIcon
                  key={index}
                  src={`https://beachrex.fra1.digitaloceanspaces.com/public/img/icon/${item.icon}`}
                  alt={item.label}
                  label={item.label}
                  horizontal
                />
              ))}
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center gap-2">
              <SlBriefcase className="w-[26px] h-[26px] text-variable-collection-dark-grey" />
              <span className="text-sm text-variable-collection-middle-grey font-bold cursor-pointer">
                O nas
              </span>
            </div>

            <div className="flex items-center space-x-3">
              <NavIcon
                src="https://beachrex.fra1.digitaloceanspaces.com/public/img/icon/facebook.svg"
                alt="Facebook"
                label=""
              />
              <NavIcon
                src="https://beachrex.fra1.digitaloceanspaces.com/public/img/icon/instagram.svg"
                alt="Instagram"
                label=""
              />
              <NavIcon
                src="https://beachrex.fra1.digitaloceanspaces.com/public/img/icon/youtube.svg"
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
