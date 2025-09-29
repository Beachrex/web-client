import React from 'react';
import Image from 'next/image';
import { SlBriefcase } from 'react-icons/sl';

const NavIcon = ({
                     src,
                     alt,
                     label,
                     horizontal = false, // optional prop to switch to horizontal layout
                     className = '',
                     onClick,
                 }: {
    src: string;
    alt: string;
    label: string;
    horizontal?: boolean; // optional prop to control the layout
    className?: string; // optional className for custom styles
    onClick?: () => void;
}) => {
    // Default styles when className is not provided
    const defaultStyles = `h-6 items-center justify-center flex ${horizontal ? 'flex-row space-x-2' : 'flex-col items-center'} text-sm text-variable-collection-dark-grey`;

    // Use the passed className if available, otherwise use defaultStyles
    const appliedClassName = className || defaultStyles;

    return (
        <button className={appliedClassName} onClick={onClick}>
            <Image
src={src} alt={alt} width={26}
height={26} />
            <span className={appliedClassName}>
       <span className="text-sm text-variable-collection-semi-dark-grey leading-tight">{label}</span>
      </span>
        </button>
    );
};

const QuickMenu = ({ toggleMenu }: { toggleMenu: () => void }) => {
    return (
        <div
            className="bg-variable-collection-ultra-light-grey border-t border-b border-variable-collection-light-grey min-h-[61px] flex items-center"
        >
            <div className="container mx-auto">

                {/* Mobile Layout (< md) */}
                <div className="md:hidden flex items-center justify-between">
                    {/* Left: Hamburger Menu */}
                    <div className="flex items-center">
                        <NavIcon
                            src={`${process.env.NEXT_PUBLIC_CDN_ENDPOINT}/img/icon/hamburgerMenu.svg`}
                            alt="Hamburger Menu"
                            label=""
                            horizontal={true}
                            className="cursor-pointer"
                            onClick={toggleMenu}
                        />
                    </div>

                    {/* Center: Most important icons only */}
                    <div className="flex items-center space-x-3 flex-1 justify-center">
                        {[
                            { icon: 'globe.svg', label: 'Plaže' },
                            { icon: 'beachType.svg', label: 'Tip' },
                            { icon: 'baseBeachIcon.svg', label: 'Top' },
                        ].map((item, index) => (
                            <div key={index} className="flex flex-col items-center">
                                <Image
                                    src={`${process.env.NEXT_PUBLIC_CDN_ENDPOINT}/img/icon/${item.icon}`}
                                    alt={item.label}
                                    width={20}
                                    height={20}
                                />
                                <span className="text-xs text-variable-collection-semi-dark-grey mt-1 hidden xs:block">
                                    {item.label}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Right: Social icons (minimal) */}
                    <div className="flex items-center space-x-2">
                        <NavIcon
                            src={`${process.env.NEXT_PUBLIC_CDN_ENDPOINT}/img/icon/facebook.svg`}
                            alt="Facebook"
                            label=""
                            className="w-5 h-5"
                        />
                        <NavIcon
                            src={`${process.env.NEXT_PUBLIC_CDN_ENDPOINT}/img/icon/instagram.svg`}
                            alt="Instagram"
                            label=""
                            className="w-5 h-5"
                        />
                    </div>
                </div>

                {/* Desktop Layout (>= md) */}
                <div className="hidden md:flex items-center justify-between">
                    {/* Left Section (Menu) */}
                    <div className="flex items-center space-x-4 lg:space-x-6">
                        <NavIcon
                            src={`${process.env.NEXT_PUBLIC_CDN_ENDPOINT}/img/icon/hamburgerMenu.svg`}
                            alt="Hamburger Menu"
                            label=""
                            horizontal={true}
                            className="cursor-pointer"
                            onClick={toggleMenu}
                        />
                    </div>

                    {/* Middle Section (Icons and Labels) */}
                    <div className="flex flex-wrap items-center justify-center space-x-3 lg:space-x-6 flex-1">
                        {[
                            { icon: 'globe.svg', label: 'Plaže po svetu' },
                            { icon: 'beachType.svg', label: 'Tip plaže' },
                            { icon: 'userType.svg', label: 'Tip uporabnika' },
                            { icon: 'beachShowType.svg', label: 'Prikaz plaže' },
                            { icon: 'shower.svg', label: 'Storitve ob plaži' },
                            { icon: 'baseBeachIcon.svg', label: 'Top plaže' },
                        ].map((item, index) => (
                            <div key={index} className="flex items-center space-x-2">
                                <NavIcon
                                    src={`${process.env.NEXT_PUBLIC_CDN_ENDPOINT}/img/icon/${item.icon}`}
                                    alt={item.label}
                                    label={item.label}
                                    horizontal={true}
                                />
                            </div>
                        ))}
                    </div>

                    {/* Right Section (Social Icons) */}
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center gap-2 pr-6">
                            <SlBriefcase className="w-[26px] h-[26px] text-variable-collection-dark-grey"/>
                            <span className="text-sm text-variable-collection-middle-grey font-bold cursor-pointer">
                                O nas
                            </span>
                        </div>
                        <div className="flex items-center space-x-3">
                            <NavIcon
                                src={`${process.env.NEXT_PUBLIC_CDN_ENDPOINT}/img/icon/facebook.svg`}
                                alt="Facebook"
                                label=""
                            />
                            <NavIcon
                                src={`${process.env.NEXT_PUBLIC_CDN_ENDPOINT}/img/icon/instagram.svg`}
                                alt="Instagram"
                                label=""
                            />
                            <NavIcon
                                src={`${process.env.NEXT_PUBLIC_CDN_ENDPOINT}/img/icon/youtube.svg`}
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
