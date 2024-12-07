import { CiHeart } from "react-icons/ci";
import { PiUserCircle } from "react-icons/pi";
import { MdKeyboardArrowDown } from "react-icons/md";
import Image from "next/image";
import { Dropdown } from "flowbite-react";
import { locales, languageNames } from "@/app/utils/locales";
import { Link, usePathname } from "@/i18n/routing";
import { useLocale, useTranslations } from "next-intl";

const IconButton = ({ icon: Icon, label }: { icon: React.ElementType; label: string }) => (
    <button className="flex items-center space-x-1">
        <Icon className="w-[20px] h-[20px]" />
        <span className="text-[10px] font-semibold hidden sm:inline">{label}</span>
    </button>
);

const TopBar = () => {
    const locale = useLocale();
    const t = useTranslations("Common");
    const pathname = usePathname();

    return (
        <div className="bg-variable-collection-temno-modro text-white text-sm px-4 py-2">
            <div className="container mx-auto flex items-center justify-between">
                {/* Left Section */}
                <div className="flex items-center space-x-2">
                    <Image
                        width="20"
                        height="16"
                        alt="Beachrex Language"
                        src={`${process.env.NEXT_PUBLIC_CDN_ENDPOINT}/img/icon/globeTranslate.svg`}
                    />
                    <Dropdown
                        arrowIcon={false}
                        inline
                        label={
                            <span className="inline-flex items-center cursor-pointer text-white text-[10px] font-semibold">
                                {languageNames[locale]}
                                <MdKeyboardArrowDown className="text-white ml-2 h-4 w-4" />
                            </span>
                        }
                    >
                        {locales?.map((loc) => (
                            <Dropdown.Item key={`${loc}-${pathname}`}>
                                <Link href={pathname || '/'} locale={loc}>
                                    {languageNames[loc] ?? loc}
                                </Link>
                            </Dropdown.Item>
                        ))}
                    </Dropdown>
                </div>

                {/* Center Section */}
                <div className="text-white font-bold text-[13px] sm:text-[14px]">
                    Izpostavljeno sporočilo...
                </div>

                {/* Right Section */}
                <div className="flex items-center space-x-4">
                    <IconButton icon={CiHeart} label={t("favorite_beaches")} />
                    <IconButton icon={PiUserCircle} label={t("my_account")} />
                </div>
            </div>
        </div>
    );
};

export default TopBar;
