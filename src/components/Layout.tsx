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
            <TopBar/>
            <SearchBar/>
            <BurgerMenu/>
            <main className="flex-1 py-2 px-0 max-w-full">
                {children}
            </main>
            <Footer/>
        </div>
    );
}
