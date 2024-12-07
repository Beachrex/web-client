import React from "react";
import Image from "next/image";
import { FiSearch } from "react-icons/fi";
import {useTranslations} from "next-intl";

const NavIcon = ({ src, alt, label }: { src: string; alt: string; label: string }) => (
    <button className="flex flex-col items-center text-sm text-gray-600 hover:text-gray-900">
        <Image src={src} alt={alt} width={26} height={26} />
        <span className="text-[10px] font-semibold text-variable-collection-middle-grey">{label}</span>
    </button>
);

const DesktopSearchBar = () => {
    const t = useTranslations("Common");

    return (
        <div className="bg-white shadow-sm py-4 hidden md:flex">
            <div className="container mx-auto flex flex-wrap items-center justify-between space-y-4 md:space-y-0">
                {/* Left Section (Logo) */}
                <div className="flex items-center">
                    <Image
                        src={`${process.env.NEXT_PUBLIC_CDN_ENDPOINT}/js/assets/img/logo_dark.png`}
                        alt="BeachRex Logo"
                        width={100}
                        height={40}
                        className="mix-blend-luminosity"
                    />
                </div>

                {/* Middle Section (Search Bar + Icons) */}
                <div className="flex items-center justify-center flex-1 space-x-4 mx-4">
                    {/* Search Bar */}
                    <div className="flex items-center border rounded-lg shadow-sm max-w-[500px] w-full p-[5px]">
                        <FiSearch className="text-gray-500 ml-3" size={20} />
                        <input
                            type="text"
                            placeholder={t("search_placeholder")}
                            aria-label={t("search_placeholder")}
                            className="flex-1 bg-transparent border-none focus:ring-0 focus:outline-none px-3 py-2 text-sm text-gray-600 placeholder-gray-400"
                        />
                        <div className="w-[113px] h-[41px] px-[34px] py-[11px] bg-[#e6e6e6] rounded-md justify-center items-center gap-2.5 flex">
                            <div className="text-center text-[#8d8d8d] text-sm font-bold">{t("search")}</div>
                        </div>
                    </div>

                    {/* Navigation Icons */}
                    <NavIcon
                        src={`${process.env.NEXT_PUBLIC_CDN_ENDPOINT}/img/icon/accomodation.svg`}
                        alt={`${t("accommodations")} ${t("icon")}`}
                        label={t("accommodations")}
                    />
                    <NavIcon
                        src={`${process.env.NEXT_PUBLIC_CDN_ENDPOINT}/img/icon/store.svg`}
                        alt={`${t("shop")} ${t("icon")}`}
                        label={t("shop")}
                    />
                </div>

                {/* Right Section (Map Button) */}
                <div className="flex items-center space-x-4">
                    <button className="inline-flex items-center justify-center gap-5 px-10 py-3 bg-variable-collection-temno-modro text-white rounded-[6px] shadow-[0px_0px_4px_0px_rgba(0,0,0,0.20)] flex-shrink-0 h-[54px] hover:bg-variable-collection-morje">
                        <Image
                            src={`${process.env.NEXT_PUBLIC_CDN_ENDPOINT}/img/icon/map.svg`}
                            alt={`${t("map")} ${t("icon")}`}
                            width={26}
                            height={26}
                        />
                        {t("map")}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DesktopSearchBar;
