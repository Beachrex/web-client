"use client";
import BurgerMenu from './BurgerMenu';
import TopBar from './Header/TopBar';
import SearchBar from './Header/SearchBar';

const Layout = ({ children }: { children: React.ReactNode }) => {

    return (
        <>
            <TopBar/>
            <SearchBar/>
            <BurgerMenu/>
            <main
                className="flex min-h-screen flex-col bg-gradient-to-b from-[#00b1c8]/70 to-[#eb8651]/70 text-white">{children}</main>
        </>
    );
};

export default Layout;

