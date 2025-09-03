import React from "react";
import Image from "next/image";
import { FiSearch } from "react-icons/fi";
import {useTranslations} from "next-intl";

const MobileSearchBar = () => {
    const t = useTranslations("Common");
    return (
        <div className="bg-white shadow-sm py-3 sm:py-4 flex flex-col items-center md:hidden">
            {/* Logo Row */}
            <div className="container mx-auto flex items-center justify-center px-4">
                <Image
                    src={`${process.env.NEXT_PUBLIC_CDN_ENDPOINT}/js/assets/img/logo_dark.png`}
                    alt="BeachRex Logo"
                    width={80}
                    height={26}
                    className="flex-shrink-0 mix-blend-luminosity sm:w-[90px] sm:h-[30px]"
                />
            </div>

            {/* Search Bar Row */}
            <div className="flex items-center border rounded-lg shadow-sm mt-3 w-[95%] sm:w-[90%] p-[3px]">
                <FiSearch className="text-gray-500 ml-2 sm:ml-3" size={18} />
                <input
                    type="text"
                    placeholder={t("search_placeholder")}
                    aria-label={t("search_placeholder")}
                    className="flex-1 bg-transparent border-none focus:ring-0 focus:outline-none px-2 sm:px-3 py-2 text-sm text-gray-600 placeholder-gray-400"
                />
                <div className="w-[38px] sm:w-[43px] h-[36px] sm:h-[41px] bg-[#e6e6e6] rounded-md justify-center items-center flex">
                    <FiSearch className="text-gray-500" size={16} />
                </div>
            </div>

            {/* Quick Action Icons (Mobile Only) */}
            <div className="flex items-center justify-center space-x-6 mt-3 w-full px-4 sm:hidden">
                <div className="flex flex-col items-center">
                    <Image
                        src={`${process.env.NEXT_PUBLIC_CDN_ENDPOINT}/img/icon/accomodation.svg`}
                        alt="Accommodations"
                        width={24}
                        height={24}
                    />
                    <span className="text-xs text-gray-600 mt-1">{t("accommodations")}</span>
                </div>
                <div className="flex flex-col items-center">
                    <Image
                        src={`${process.env.NEXT_PUBLIC_CDN_ENDPOINT}/img/icon/store.svg`}
                        alt="Shop"
                        width={24}
                        height={24}
                    />
                    <span className="text-xs text-gray-600 mt-1">{t("shop")}</span>
                </div>
                <div className="flex flex-col items-center">
                    <Image
                        src={`${process.env.NEXT_PUBLIC_CDN_ENDPOINT}/img/icon/map.svg`}
                        alt="Map"
                        width={24}
                        height={24}
                    />
                    <span className="text-xs text-gray-600 mt-1">{t("map")}</span>
                </div>
            </div>
        </div>
    );
};

export default MobileSearchBar;
