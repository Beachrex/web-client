import { useEffect, useState } from 'react';
import { HiMenu, HiX } from 'react-icons/hi';
import { Sidebar } from "flowbite-react";
import {Link, usePathname} from '@/i18n/routing';

interface MenuItem {
    label: string;
    href: string;
    icon?: React.ComponentType<{ className?: string }> | string; // Icon can be optional
    subItems?: MenuItem[]; // Optional sub-items
}

// Define the menu structure with nested sub-items and URLs
const menuItems: MenuItem[] = [
    {
        label: "Beach Map z filtrom",
        href: "/beach-map",
        icon: "",
        // icon: HiMap,
        subItems: []
    },
    {
        label: "Plaže po svetu",
        href: "/beaches",
        icon: "",
        subItems: [
            { label: "Evropa", icon:"", href: "/beaches/europe", subItems: [] },
            { label: "S. Amerika", icon:"", href: "/beaches/south-america", subItems: [] },
            { label: "J. Amerika",icon:"", href: "/beaches/north-america", subItems: [] },
            { label: "Centralna Amerika", icon:"", href: "/beaches/central-america", subItems: [] },
            { label: "Karibi", icon:"", href: "/beaches/caribbean", subItems: [] },
            { label: "Centralna Azija", icon:"", href: "/beaches/central-asia", subItems: [] },
            { label: "Južna Azija", icon:"", href: "/beaches/south-asia", subItems: [] },
            { label: "JV Azija", icon:"", href: "/beaches/southeast-asia", subItems: [] },
            { label: "Avstralija in Oceanija", icon:"", href: "/beaches/australia-oceania", subItems: [] },
            { label: "Bližnji vzhod", icon:"", href: "/beaches/middle-east", subItems: [] },
            { label: "Afrika", icon:"", href: "/beaches/africa", subItems: [] }
        ]
    },
    {
        label: "Tip plaže",
        href: "/beach-type",
        icon: "",
        subItems: [
            { label: "Peščena plaža", icon:"", href: "/beach-type/sandy", subItems: [] },
            { label: "Prodnata plaža", icon:"", href: "/beach-type/gravel", subItems: [] },
            { label: "Kamnita plaža", icon:"", href: "/beach-type/rocky", subItems: [] },
            { label: "Skalnata plaža", icon:"", href: "/beach-type/cliff", subItems: [] },
            { label: "Travnata plaža", icon:"", href: "/beach-type/grass", subItems: [] },
            { label: "Betonska plaža", icon:"", href: "/beach-type/concrete", subItems: [] },
            { label: "Morska plaža", icon:"", href: "/beach-type/marine", subItems: [] },
            { label: "Sladkovodna plaža", icon:"", href: "/beach-type/freshwater", subItems: [
                    { label: "Plaža ob rekah", icon:"", href: "/beach-type/freshwater/rivers", subItems: [] },
                    { label: "Plaža ob jezerih", icon:"", href: "/beach-type/freshwater/lakes", subItems: [] }
                ]},
            { label: "Plaža na otoku", icon:"", href: "/beach-type/island", subItems: [] },
            { label: "Poletno kopališče", icon:"", href: "/beach-type/summer-pool", subItems: [] },
            { label: "Zaprti bazen, terme", icon:"", href: "/beach-type/indoor-pool", subItems: [] },
            { label: "Plaže dostopne samo s čolnom", icon:"", href: "/beach-type/boat-access", subItems: [] },
            { label: "Plaža s toboganom", icon:"", href: "/beach-type/slides", subItems: [] },
            { label: "Plaža s senco", icon:"", href: "/beach-type/shaded", subItems: [] },
            { label: "Plaža za otroke, dojenčke", icon:"", href: "/beach-type/kids", subItems: [] }
        ]
    },
    {
        label: "Tip uporabnika",
        href: "/user-type",
        icon: "",
        subItems: [
            { label: "Plaža za družine", icon:"", href: "/user-type/families", subItems: [] },
            { label: "Plaža za zabavo", icon:"", href: "/user-type/fun", subItems: [] },
            { label: "Plaža za avanturiste", icon:"", href: "/user-type/adventurers", subItems: [] }
        ]
    },
    {
        label: "Plažna trgovina",
        href: "/beach-store",
        icon:"",
        subItems: []
    },
    {
        label: "Nastanitev ob plaži",
        href: "/beach-accommodation",
        icon:"",
        subItems: []
    },
    {
        label: "360 plaže",
        href: "/beach-360",
        icon:"",
        subItems: []
    },
    {
        label: "Video plaže",
        href: "/beach-video",
        icon:"",
        subItems: []
    },
    {
        label: "Webcam plaže",
        href: "/beach-webcam",
        icon:"",
        subItems: []
    },
    {
        label: "Dodatne storitve ob plaži",
        href: "/beach-services",
        icon: "",
        subItems: [
            { label: "Aktivnosti ob plaži GYG", icon:"", href: "/beach-services/activities", subItems: [] },
            { label: "Rent a car", icon:"", href: "/beach-services/rent-car", subItems: [] },
            { label: "Rent a motorhome", icon:"", href: "/beach-services/rent-motorhome", subItems: [] },
            { label: "Rent a boat, yacht", icon:"", href: "/beach-services/rent-boat", subItems: [] },
            { label: "Rent a Sea scooter", icon:"", href: "/beach-services/rent-sea-scooter", subItems: [] },
            { label: "Rent a SUP, kayak,..", icon:"", href: "/beach-services/rent-sup-kayak", subItems: [] },
            { label: "Buy airplane tickets", icon:"", href: "/beach-services/airplane-tickets", subItems: [] },
            { label: "Beach events", icon:"", href: "/beach-services/events", subItems: [] }
        ]
    },
    {
        label: "Plažna tržnica",
        href: "/beach-market",
        icon:"",
        subItems: []
    },
    {
        label: "Turistične organizacije",
        href: "/tourist-organizations",
        icon:"",
        subItems: []
    },
    {
        label: "Top beaches",
        href: "/top-beaches",
        icon:"",
        subItems: []
    },
    {
        label: "Beach Blog",
        href: "/beach-blog",
        icon:"",
        subItems: []
    },
    {
        label: "Fit na plažo",
        href: "/beach-fitness",
        icon:"",
        subItems: []
    },
    {
        label: "Mobile App",
        href: "/mobile-app",
        icon:"",
        subItems: []
    },
    {
        label: "Razno",
        href: "/miscellaneous",
        icon: "",
        subItems: [
            { label: "O nas", icon:"", href: "/miscellaneous/about", subItems: [] },
            { label: "Pogoji poslovanja", icon:"", href: "/miscellaneous/terms", subItems: [] },
            { label: "Zasebnost", icon:"", href: "/miscellaneous/privacy", subItems: [] },
            { label: "Vse destinacije", icon:"", href: "/miscellaneous/all-destinations", subItems: [] },
            { label: "Socialna omrežja", icon:"", href: "/miscellaneous/social-media", subItems: [] },
            { label: "Kontakt", icon:"", href: "/miscellaneous/contact", subItems: [] },
            { label: "APP", icon:"", href: "/miscellaneous/app", subItems: [] },
            { label: "Pravila za prispevanje", icon:"", href: "/miscellaneous/contribution-rules", subItems: [] },
            { label: "Filter z mapo", icon:"", href: "/miscellaneous/map-filter", subItems: [] }
        ]
    }
];
// Recursive component for rendering nested menu
const NestedMenu = ({ items }: { items: MenuItem[] }) => {
    return (
        <ul className="pl-4">
            {items.map((item, index) => (
                <MenuItemComponent key={index} item={item} />
            ))}
        </ul>
    );
};

// Individual menu item component
const MenuItemComponent: React.FC<{ item: MenuItem }> = ({ item }) => {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();

    const isSelected = pathname === item.href ||
        (item.subItems?.some(sub => pathname === sub.href));

    useEffect(() => {
        if (isSelected) {
            setIsOpen(true);
        }
    }, [isSelected]);
    const toggleMenu = () => {
        if (item.subItems && item.subItems.length > 0) {
            setIsOpen((prev) => !prev); // Toggle submenu if sub-items exist
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
                    <span className={`mr-2 ${isOpen ? 'rotate-90' : ''}`}>➔</span>
                ) : null}
                {/* Render Link only if there are no sub-items */}
                {item.subItems?.length ? (
                    <span className="flex-1">{item.label}</span>
                ) : (
                    <Link href={item.href} className="flex-1">{item.label}</Link>
                )}
            </div>
            {/* Render sub-items if they exist */}
            {isOpen && item.subItems && <NestedMenu items={item.subItems} />}
        </li>
    );
};

const BurgerMenu = () => {
    const [isOpen, setIsOpen] = useState(false);

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
        <div className="relative">
            {/* Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black opacity-60 z-40"
                    onClick={closeMenu}
                />
            )}

            {/* Burger Icon */}
            <button
                onClick={toggleMenu}
                className="p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-600 z-50"
            >
                {isOpen ? <HiX className="h-6 w-6 text-gray-800" /> : <HiMenu className="h-6 w-6 text-gray-800" />}
            </button>

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
                            <NestedMenu items={menuItems} />
                        </div>
                    </Sidebar.ItemGroup>
                </Sidebar.Items>
            </Sidebar>
        </div>
    );
};

export default BurgerMenu;