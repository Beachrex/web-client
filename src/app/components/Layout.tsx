"use client";

import { MegaMenu, Navbar, TextInput, Dropdown  } from 'flowbite-react';
import {
    HiMap,
    HiHeart,
    HiShoppingCart,
    HiOutlineUser,
    HiSearch
} from 'react-icons/hi';
import { FaBed, FaFilter, FaMobileAlt } from "react-icons/fa";
import {Link} from '@/i18n/routing';
import {useLocale, useTranslations} from "next-intl";
import Image from "next/image";

const Layout = ({ children }: { children: React.ReactNode }) => {
    const locale = useLocale();
    const t = useTranslations('Common');
    return (
        <>
            <MegaMenu>
                <Navbar.Brand href="/">
                    <Image width="200" height="100" alt="Beachrex Logo" src={`${process.env.NEXT_PUBLIC_CDN_ENDPOINT}/js/assets/img/logo_dark.png`} className="mr-3 h-6 sm:h-9" />
                </Navbar.Brand>
                <Navbar.Toggle />
                <Navbar.Collapse>
                    <div className="max-w-md">
                        <TextInput id="searchMenu" type="input" rightIcon={HiSearch} placeholder={`${t('search')}...`}  />
                    </div>
                    <Navbar.Collapse>
                        <Dropdown
                            arrowIcon={false}
                            inline
                            label={
                                <span className='inline-flex cursor-pointer justify-center rounded p-2 text-gray-500 hover:bg-neutral-100 hover:text-gray-900 dark:hover:bg-neutral-700 dark:hover:text-white'>
                              <span className='sr-only'></span>
                              <Image width="50" height="50" alt={`${locale}`} className='h-6 w-6' src={`${process.env.NEXT_PUBLIC_CDN_ENDPOINT}/img/flag/${locale}.svg`} />
                            </span>
                            }
                        >
                            <ul className='py-1' role='none'>
                                <li>
                                    <Link
                                        href='/'
                                        locale='en'
                                        className='block py-2 px-4 text-sm text-gray-700 hover:bg-neutral-100 dark:text-gray-400 dark:hover:bg-neutral-600 dark:hover:text-white'
                                    >
                                        <div className='inline-flex items-center'>
                                            <Image width="50" height="50" alt='EN' className='mr-2 h-4 w-4' src={`${process.env.NEXT_PUBLIC_CDN_ENDPOINT}/img/flag/en.svg`} />
                                            <span className='whitespace-nowrap'>EN</span>
                                        </div>
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href='/'
                                        locale='si'
                                        className='block py-2 px-4 text-sm text-gray-700 hover:bg-neutral-100 dark:text-gray-400 dark:hover:bg-neutral-600 dark:hover:text-white'
                                    >
                                        <div className='inline-flex items-center'>
                                            <Image width="50" height="50" alt='SI' className='mr-2 h-4 w-4' src={`${process.env.NEXT_PUBLIC_CDN_ENDPOINT}/img/flag/si.svg`} />
                                            <span className='whitespace-nowrap'>SI</span>
                                        </div>
                                    </Link>
                                </li>
                            </ul>
                        </Dropdown>
                    </Navbar.Collapse>
                    <Navbar.Link href="/"> <HiMap className="size-10"/></Navbar.Link>
                    <Navbar.Link href="/"> <HiHeart className="size-10"/></Navbar.Link>
                    <Navbar.Link href="/"> <HiShoppingCart className="size-10"/></Navbar.Link>
                    <Navbar.Link href="/"> <FaBed className="size-10"/></Navbar.Link>
                    <Navbar.Link href="/"> <FaFilter className="size-9"/></Navbar.Link>
                    <Navbar.Link href="/"> <FaMobileAlt className="size-10"/></Navbar.Link>
                    <Navbar.Link href="/"> <HiOutlineUser className="size-10"/></Navbar.Link>

                </Navbar.Collapse>
            </MegaMenu>

            <main
                className="flex min-h-screen flex-col bg-gradient-to-b from-[#00b1c8]/70 to-[#eb8651]/70 text-white">{children}</main>
        </>
    );
};

export default Layout;

