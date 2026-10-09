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
            <div className="print:hidden">
                <TopBar/>
                <SearchBar/>
                <BurgerMenu/>
            </div>
            <main className="flex-1 py-2 px-0 max-w-full">
                {children}
            </main>
            <div className="print:hidden">
                <Footer/>
            </div>
        </div>
    );
}
