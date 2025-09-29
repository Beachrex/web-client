import React from 'react';
import DesktopSearchBar from './SearchBarComponents/DesktopSearchBar';
import MobileSearchBar from './SearchBarComponents/MobileSearchBar';

const SearchBar = () => {
    return (
        <>
            <DesktopSearchBar />
            <MobileSearchBar />
        </>
    );
};

export default SearchBar;
