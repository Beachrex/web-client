"use client";

import { MegaMenu, Navbar } from 'flowbite-react';
import { HiArrowRight, HiChevronDown } from 'react-icons/hi';
import Link from "next/link";

const Layout = ({ children }: { children: React.ReactNode }) => {
    return (
        <>
            <MegaMenu>
                <Navbar.Brand href="/">
                    <img alt="Beachrex Logo" src={`${process.env.NEXT_PUBLIC_CDN_ENDPOINT}/js/assets/img/logo_dark.png`} className="mr-3 h-6 sm:h-9" />
                </Navbar.Brand>
                <Navbar.Toggle />
                <Navbar.Collapse>
                    <Navbar.Link href="/">Home</Navbar.Link>
                    <Navbar.Link href="/">Company</Navbar.Link>
                    <MegaMenu.DropdownToggle >
                        Marketplace
                        <HiChevronDown className="ml-2" />
                    </MegaMenu.DropdownToggle>
                    <Navbar.Link href="/">Resources</Navbar.Link>
                    <Navbar.Link href="/">Contact</Navbar.Link>
                </Navbar.Collapse>
                <MegaMenu.Dropdown>
                    <div className="mt-6 border-y border-gray-200 bg-white shadow-sm dark:border-gray-600 dark:bg-gray-800 hi">
                        <div className="mx-auto grid max-w-screen-xl px-4 py-5 text-sm text-gray-500 dark:text-gray-400 md:grid-cols-3 md:px-6">
                            <ul className="mb-4 hidden space-y-4 md:mb-0 md:block">
                                <li>
                                    <Link href="#" className="hover:text-primary-600 dark:hover:text-primary-500">
                                        Online Stores
                                    </Link>
                                </li>
                                <li>
                                    <Link href="#" className="hover:text-primary-600 dark:hover:text-primary-500">
                                        Segmentation
                                    </Link>
                                </li>
                                <li>
                                    <Link href="#" className="hover:text-primary-600 dark:hover:text-primary-500">
                                        Marketing CRM
                                    </Link>
                                </li>
                            </ul>
                            <ul className="mb-4 space-y-4 md:mb-0">
                                <li>
                                    <Link href="#" className="hover:text-primary-600 dark:hover:text-primary-500">
                                        Our Blog
                                    </Link>
                                </li>
                                <li>
                                    <Link href="#" className="hover:text-primary-600 dark:hover:text-primary-500">
                                        Terms & Conditions
                                    </Link>
                                </li>
                                <li>
                                    <Link href="#" className="hover:text-primary-600 dark:hover:text-primary-500">
                                        License
                                    </Link>
                                </li>
                            </ul>
                            <Link href="#" className="rounded-lg bg-gray-500 p-8 text-left">
                                <p className="mb-5 max-w-xl font-extrabold leading-tight tracking-tight text-white">
                                    Preview the new Flowbite dashboard navigation.
                                </p>
                                <button
                                    type="button"
                                    className="inline-flex items-center rounded-lg border border-white px-2.5 py-1.5 text-center text-xs font-medium text-white hover:bg-white hover:text-gray-900"
                                >
                                    Get started
                                    <HiArrowRight className="ml-2" />
                                </button>
                            </Link>
                        </div>
                    </div>
                </MegaMenu.Dropdown>
            </MegaMenu>

            <main className="flex min-h-screen flex-col items-center bg-gradient-to-b from-[#00b1c8]/50 to-[#eb8651]/50 text-white">{children}</main>
        </>
    );
};

export default Layout;
