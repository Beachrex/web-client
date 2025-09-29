'use client';
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
                className="flex min-h-screen flex-col text-white"
            >{children}</main>
        </>
    );
};

export default Layout;

