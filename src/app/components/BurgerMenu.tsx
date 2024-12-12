import { useEffect, useState } from 'react';
import { HiX } from 'react-icons/hi';
import { Sidebar } from "flowbite-react";
import { Link, usePathname } from '@/i18n/routing';
import { useLocale } from "next-intl";
import enMenu from 'public/menu_en.json';
import siMenu from 'public/menu_si.json';
import QuickMenu from '@/app/components/Header/QuickMenu';

interface MenuItem {
    label: string;
    href: string;
    icon?: React.ComponentType<{ className?: string }> | string; // Icon can be optional
    subItems?: MenuItem[]; // Optional sub-items
}

// Recursive component for rendering nested menu
const NestedMenu = ({ items, closeMenu }: { items: MenuItem[], closeMenu: () => void }) => {
    return (
        <ul className="pl-4">
            {items.map((item, index) => (
                <MenuItemComponent key={index} item={item} closeMenu={closeMenu} />
            ))}
        </ul>
    );
};

// Individual menu item component
const MenuItemComponent: React.FC<{ item: MenuItem; closeMenu: () => void }> = ({ item, closeMenu }) => {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();

    const isSelected = pathname === item.href ||
        (item.subItems?.some(sub => pathname === sub.href));

    useEffect(() => {
        // Reset isOpen when the pathname changes
        if (isSelected) {
            setIsOpen(true);
        } else {
            setIsOpen(false);
        }
    }, [pathname, isSelected]);

    const toggleMenu = () => {
        if (item.subItems && item.subItems.length > 0) {
            setIsOpen((prev) => !prev); // Toggle submenu if sub-items exist
        } else {
            closeMenu(); // Close menu if no sub-items
        }
    };

    return (
        <li className="mb-1">
            <div
                className={`flex items-center cursor-pointer p-2 rounded-md hover:bg-gray-300 transition duration-200 ${isOpen || isSelected ? 'bg-gray-200 font-semibold' : ''}`}
                onClick={toggleMenu}
            >
                {/* Display an arrow if there are sub-items */}
                {item.subItems?.length ? (
                    <span className={`mr-2 text-xs ${isOpen ? 'rotate-90' : ''}`}>➔</span>
                ) : null}
                {/* Render Link only if there are no sub-items */}
                {item.subItems?.length ? (
                    <span className="flex-1">{item.label}</span>
                ) : (
                    <Link href={item.href} className="flex-1" onClick={closeMenu}>{item.label}</Link>
                )}
            </div>
            {/* Render sub-items if they exist */}
            {isOpen && item.subItems && <NestedMenu items={item.subItems} closeMenu={closeMenu} />}
        </li>
    );
};

const BurgerMenu = () => {
    const [isOpen, setIsOpen] = useState(false);

    const locale = useLocale();
    const menuItems = locale === 'si' ? siMenu.MenuItems : enMenu.MenuItems;

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    const closeMenu = () => {
        setIsOpen(false);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const sidebar = document.getElementById("sidebar");
            if (sidebar && !sidebar.contains(event.target as Node)) {
                closeMenu();
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        } else {
            document.removeEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);

    return (
        <div className="relative h-[61px] bg-variable-collection-ultra-light-grey">
            <QuickMenu toggleMenu={toggleMenu} />
            {/* Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black opacity-60 z-40"
                    onClick={closeMenu}
                />
            )}
            {/* Sidebar */}
            <Sidebar
                id="sidebar"
                aria-label="Default sidebar example"
                className={`fixed inset-y-0 left-0 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 z-50`}
            >
                <Sidebar.Items>
                    <Sidebar.ItemGroup>
                        <div className="flex justify-between items-center p-4">
                            <h2 className="text-lg font-bold">Menu</h2>
                            <button onClick={closeMenu} className="p-1 rounded-md">
                                <HiX className="h-6 w-6 text-gray-800" />
                            </button>
                        </div>
                        <div className="overflow-y-auto max-h-[calc(100vh-64px)]">
                            <NestedMenu items={menuItems} closeMenu={closeMenu} />
                        </div>
                    </Sidebar.ItemGroup>
                </Sidebar.Items>
            </Sidebar>
        </div>
    );
};

export default BurgerMenu;