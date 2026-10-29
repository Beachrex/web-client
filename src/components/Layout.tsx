'use client';


import TopBar from './Header/TopBar';
import SearchBar from './Header/SearchBar';
import Footer from './Footer/Footer';
import BurgerMenu from './Header/BurgerMenu';

interface DefaultLayoutProps {
    children: React.ReactNode;
}

export default function DefaultLayout({ children }: DefaultLayoutProps) {
    return (
        <div className="flex flex-col min-h-screen">
            {/* Not printed: a printed itinerary (Save as PDF) shows only the page content. */}
            {/* Sticky header: stays visible while scrolling. The full-screen map page opts out (body[data-map-page]),
                because its panels are exactly one screen high and a sticky header would cover their top. */}
            <header className="print:hidden sticky top-0 z-[1050] [body[data-map-page]_&]:static">
                <TopBar/>
                <SearchBar/>
                <BurgerMenu/>
            </header>
            <main className="flex-1 py-2 px-0 max-w-full">
                {children}
            </main>
            <div className="print:hidden">
                <Footer/>
            </div>
        </div>
    );
}
