import { FaSearch, FaChevronDown } from 'react-icons/fa';
import { useState } from 'react';
import { ToggleSwitch } from "flowbite-react";

const LeftSidebarFilters = () => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="p-4 space-y-6">
            {/* Header with the toggle button */}
            <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold">Filtriraj</h2>
                <span>{isExpanded ? 'Zatvori' : 'Napredno'}</span>
                <ToggleSwitch checked={isExpanded} onChange={setIsExpanded}/>
            </div>

            {/* Search Bar */}
            <div className="flex items-center border border-gray-300 rounded-md p-2">
                <FaSearch className="text-gray-500 mr-2"/>
                <input
                    type="text"
                    placeholder="Najdeno (15)"
                    className="w-full p-1 text-sm focus:outline-none"
                />
            </div>

            {/* Filter Categories */}
            <div className="space-y-4">
                {isExpanded && (
                    <>
                        {/* Filter by Type of Beach */}
                        <div>
                            <div className="flex justify-between items-center cursor-pointer">
                                <span className="font-semibold">Tip plaže</span>
                                <FaChevronDown/>
                            </div>
                            <div className="space-y-2 mt-2">
                                <div className="flex items-center space-x-2">
                                    <input type="checkbox" id="morske"/>
                                    <label htmlFor="morske" className="text-sm">Morske plaže</label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <input type="checkbox" id="sladkovodne"/>
                                    <label htmlFor="sladkovodne" className="text-sm">Sladkovodne plaže</label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <input type="checkbox" id="reke"/>
                                    <label htmlFor="reke" className="text-sm">Reke</label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <input type="checkbox" id="jezera"/>
                                    <label htmlFor="jezera" className="text-sm">Jezera</label>
                                </div>
                            </div>
                        </div>

                        {/* Filter by User Type */}
                        <div>
                            <div className="flex justify-between items-center cursor-pointer">
                                <span className="font-semibold">Tip uporabnika</span>
                                <FaChevronDown/>
                            </div>
                            <div className="space-y-2 mt-2">
                                <div className="flex items-center space-x-2">
                                    <input type="checkbox" id="druzina"/>
                                    <label htmlFor="druzina" className="text-sm">Družina</label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <input type="checkbox" id="avanturist"/>
                                    <label htmlFor="avanturist" className="text-sm">Avanturist</label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <input type="checkbox" id="zurer"/>
                                    <label htmlFor="zurer" className="text-sm">Žurer</label>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default LeftSidebarFilters;