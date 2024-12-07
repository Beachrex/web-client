import React from "react";
import Image from "next/image";
import { FiSearch } from "react-icons/fi";
import {useTranslations} from "next-intl";

const MobileSearchBar = () => {
    const t = useTranslations("Common");
    return (
        <div className="bg-white shadow-sm py-4 flex flex-col items-center md:hidden">
            {/* Logo Row */}
            <div className="container mx-auto flex items-center justify-center">
                <Image
                    src={`${process.env.NEXT_PUBLIC_CDN_ENDPOINT}/js/assets/img/logo_dark.png`}
                    alt="BeachRex Logo"
                    width={90}
                    height={30}
                    className="flex-shrink-0 mix-blend-luminosity"
                />
            </div>

            {/* Search Bar Row */}
            <div className="flex items-center border rounded-lg shadow-sm mt-4 w-[98%] p-[3px] md:hidden">
                <input
                    type="text"
                    placeholder={t("search_placeholder")}
                    aria-label={t("search_placeholder")}
                    className="flex-1 bg-transparent border-none focus:ring-0 focus:outline-none px-3 py-2 text-sm text-gray-600 placeholder-gray-400"
                />
                <div
                    className="w-[43px] h-[41px] bg-[#e6e6e6] rounded-md justify-center items-center flex">
                    <div className="text-center text-[#8d8d8d] text-sm font-bold"><FiSearch className="text-gray-500" size={20}/></div>
                </div>
            </div>
        </div>
    );
};

export default MobileSearchBar;
