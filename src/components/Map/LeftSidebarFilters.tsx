import { useState } from 'react';
import { FiSearch, FiChevronDown, FiChevronUp } from 'react-icons/fi';

const LeftSidebarFilters = () => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [expandedSections, setExpandedSections] = useState({
        beachType: false,
        userType: false,
    });

    const toggleSection = (section: 'beachType' | 'userType') => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section],
        }));
    };

    return (
        <div className="p-6">
            <div className="flex flex-col gap-6">
                {/* Header with the toggle button */}
                <div className="flex justify-between items-center">
                    <h2 className="text-lg font-bold">Filtriraj</h2>
                    <div className="flex items-center gap-2">
                        <span className="text-sm">Napredno</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={isExpanded}
                                onChange={(e) => setIsExpanded(e.target.checked)}
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
                        </label>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <FiSearch className="text-gray-500" />
                    </div>
                    <input
                        type="text"
                        placeholder="Najdeno (15)"
                        className="w-full py-2 px-4 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                </div>

                {/* Filter Categories */}
                {isExpanded && (
                    <div className="flex flex-col gap-4">
                        {/* Filter by Type of Beach */}
                        <div className="border border-gray-200 rounded-lg">
                            <button
                                onClick={() => toggleSection('beachType')}
                                className="w-full flex justify-between items-center px-4 py-3 hover:bg-gray-50 transition-colors rounded-lg"
                            >
                                <h3 className="font-semibold text-sm">Tip plaže</h3>
                                {expandedSections.beachType ? (
                                    <FiChevronUp className="text-gray-500" />
                                ) : (
                                    <FiChevronDown className="text-gray-500" />
                                )}
                            </button>
                            {expandedSections.beachType && (
                                <div className="px-4 pb-3 space-y-2">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" />
                                        <span className="text-sm">Morske plaže</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" />
                                        <span className="text-sm">Sladkovodne plaže</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" />
                                        <span className="text-sm">Reke</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" />
                                        <span className="text-sm">Jezera</span>
                                    </label>
                                </div>
                            )}
                        </div>

                        {/* Filter by User Type */}
                        <div className="border border-gray-200 rounded-lg">
                            <button
                                onClick={() => toggleSection('userType')}
                                className="w-full flex justify-between items-center px-4 py-3 hover:bg-gray-50 transition-colors rounded-lg"
                            >
                                <h3 className="font-semibold text-sm">Tip uporabnika</h3>
                                {expandedSections.userType ? (
                                    <FiChevronUp className="text-gray-500" />
                                ) : (
                                    <FiChevronDown className="text-gray-500" />
                                )}
                            </button>
                            {expandedSections.userType && (
                                <div className="px-4 pb-3 space-y-2">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" />
                                        <span className="text-sm">Družina</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" />
                                        <span className="text-sm">Avanturist</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" />
                                        <span className="text-sm">Žurer</span>
                                    </label>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LeftSidebarFilters;
