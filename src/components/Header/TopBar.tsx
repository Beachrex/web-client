'use client';

import { Heart, UserCircle, ChevronDown } from 'lucide-react';
import Image from 'next/image';
import { Dropdown } from 'flowbite-react';
import { locales, languageNames } from '@/app/config/locales';
import { usePathname } from '@/i18n/routing';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';
import { useLocalizedPath } from '@/hooks/useLocalizedPath';

const IconButton = ({ icon: Icon, label }: { icon: React.ElementType; label: string }) => (
    <button className="flex items-center space-x-1">
        <Icon className="w-[20px] h-[20px]" />
        <span className="text-[10px] font-semibold hidden sm:inline">{label}</span>
    </button>
);

const TopBar = () => {
    const locale = useLocale();
    const t = useTranslations('Common');
    const pathname = usePathname();
    const router = useRouter();
    const { getLocalizedPath } = useLocalizedPath();
    const [_isPending, startTransition] = useTransition();
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const handleLocaleChange = (newLocale: string) => {
        startTransition(async () => {
            console.log('[TopBar] Switching locale to:', newLocale);
            console.log('[TopBar] Current pathname:', pathname);

            // Get the localized path for the new locale
            const localizedPath = await getLocalizedPath(newLocale);

            console.log('[TopBar] Localized path returned:', localizedPath);

            // Construct the full URL with locale prefix
            const fullPath = `/${newLocale}${localizedPath}`;

            console.log('[TopBar] Full path to navigate:', fullPath);

            // Navigate using Next.js router
            router.push(fullPath);
        });
    };

    return (
        <div className="bg-variable-collection-temno-modro text-white text-sm px-2 sm:px-4 py-2">
            <div className="container mx-auto">

                {/* Mobile Layout (< md) */}
                <div className="md:hidden flex items-center justify-between">
                    {/* Left: Language Selector (Compact) */}
                    <div className="flex items-center space-x-1">
                        <Image
                            width="16"
                            height="12"
                            alt="Language"
                            src={'https://beachrex.fra1.digitaloceanspaces.com/public/img/icon/globeTranslate.svg'}
                        />
                        {isClient ? (
                            <Dropdown
                                arrowIcon={false}
                                inline
                                label={
                                    <span className="inline-flex items-center cursor-pointer text-white text-[9px] font-semibold">
                                        {(languageNames[locale] ?? locale).slice(0, 2).toUpperCase()}
                                        <ChevronDown className="text-white ml-1 h-3 w-3" />
                                    </span>
                                }
                            >
                                {locales?.map((loc) => (
                                    <Dropdown.Item
                                        key={`${loc}-${pathname}`}
                                        onClick={() => handleLocaleChange(loc)}
                                    >
                                        {languageNames[loc] ?? loc}
                                    </Dropdown.Item>
                                ))}
                            </Dropdown>
                        ) : (
                            <span className="inline-flex items-center cursor-pointer text-white text-[9px] font-semibold">
                                {(languageNames[locale] ?? locale).slice(0, 2).toUpperCase()}
                                <ChevronDown className="text-white ml-1 h-3 w-3" />
                            </span>
                        )}
                    </div>

                    {/* Center: Shortened Message */}
                    <div className="text-white font-bold text-[11px] flex-1 text-center px-2 truncate">
                        Sporočilo...
                    </div>

                    {/* Right: Icons Only */}
                    <div className="flex items-center space-x-2">
                        <button className="flex items-center">
                            <Heart className="w-[18px] h-[18px]" />
                        </button>
                        <button className="flex items-center">
                            <UserCircle className="w-[18px] h-[18px]" />
                        </button>
                    </div>
                </div>

                {/* Desktop Layout (>= md) */}
                <div className="hidden md:flex items-center justify-between">
                    {/* Left Section */}
                    <div className="flex items-center space-x-2">
                        <Image
                            width="20"
                            height="16"
                            alt="Beachrex Language"
                            src={'https://beachrex.fra1.digitaloceanspaces.com/public/img/icon/globeTranslate.svg'}
                        />
                        {isClient ? (
                            <Dropdown
                                arrowIcon={false}
                                inline
                                label={
                                    <span className="inline-flex items-center cursor-pointer text-white text-[10px] font-semibold">
                                        {languageNames[locale] ?? locale}
                                        <ChevronDown className="text-white ml-2 h-4 w-4" />
                                    </span>
                                }
                            >
                                {locales?.map((loc) => (
                                    <Dropdown.Item
                                        key={`${loc}-${pathname}`}
                                        onClick={() => handleLocaleChange(loc)}
                                    >
                                        {languageNames[loc] ?? loc}
                                    </Dropdown.Item>
                                ))}
                            </Dropdown>
                        ) : (
                            <span className="inline-flex items-center cursor-pointer text-white text-[10px] font-semibold">
                                {languageNames[locale] ?? locale}
                                <ChevronDown className="text-white ml-2 h-4 w-4" />
                            </span>
                        )}
                    </div>

                    {/* Center Section */}
                    <div className="text-white font-bold text-[13px] lg:text-[14px]">
                        Izpostavljeno sporočilo...
                    </div>

                    {/* Right Section */}
                    <div className="flex items-center space-x-4">
                        <IconButton icon={Heart} label={t('favorite_beaches')} />
                        <IconButton icon={UserCircle} label={t('my_account')} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TopBar;
