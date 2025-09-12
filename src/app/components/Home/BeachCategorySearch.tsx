'use client';
import React, { useState } from 'react';
import { Button } from 'flowbite-react';
import { FiFilter } from 'react-icons/fi';

interface CategoryItem {
    id: string;
    icon: string;
    label: string;
    description?: string;
}

const BeachCategorySearch: React.FC = () => {
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

    // Beach categories with simple icons
    const topRowCategories: CategoryItem[] = [
        { id: 'podzemne', icon: '🏛️', label: 'Podzemne' },
        { id: 'kamene', icon: '🪨', label: 'Kamene plaže' },
        { id: 'termalne', icon: '♨️', label: 'Termalne plaže' },
        { id: 'bazen', icon: '🏊', label: 'Bazen' },
        { id: 'naravna', icon: '🌿', label: 'Naravna kopališča' },
        { id: 'fotogeni', icon: '📸', label: 'Fotogeni' },
        { id: 'plaze-z-igro', icon: '🏔️', label: 'Plaže z igro' },
        { id: 'plaze-za-zabavo', icon: '🎪', label: 'Plaže za zabavo' },
        { id: 'plaze-z-barom', icon: '🏨', label: 'Plaže z barom' },
        { id: 'z-sportnim', icon: '🚗', label: 'Z športnim programom' },
        { id: 'plaze-s-posebnimi', icon: '📋', label: 'Plaže s posebnimi' }
    ];

    const bottomRowCategories: CategoryItem[] = [
        { id: 'razglednice', icon: '💌', label: 'Razglednice plaže' },
        { id: 'avtokamp', icon: '🚐', label: 'Avtokamp ob plaži' },
        { id: 'primerne-za-pes', icon: '🐕', label: 'Primerne za pes' },
        { id: 'primerne-za-invalide', icon: '♿', label: 'Primerne za invalide' },
        { id: 'naravna-senca', icon: '🌳', label: 'Naravna senca' },
        { id: 'naravna-senca2', icon: '💡', label: 'Naravna senca' },
        { id: 'naravna-senca3', icon: '💡', label: 'Naravna senca' },
        { id: 'naravna-senca4', icon: '💡', label: 'Naravna senca' },
        { id: 'naravna-senca5', icon: '💡', label: 'Naravna senca' },
        { id: 'naravna-senca6', icon: '💡', label: 'Naravna senca' },
        { id: 'naravna-senca7', icon: '💡', label: 'Naravna senca' }
    ];

    const quickFilterButtons = [
        { id: 'morske', label: 'Morske plaže', color: 'bg-blue-500 hover:bg-blue-600', icon: '🌊' },
        { id: 'ob-jezeru', label: 'Plaže ob jezeru', color: 'bg-green-500 hover:bg-green-600', icon: '🏞️' },
        { id: 'ob-reki', label: 'Plaže ob reki', color: 'bg-green-600 hover:bg-green-700', icon: '🏞️' },
        { id: 'zunanji-bazeni', label: 'Zunanji bazeni', color: 'bg-cyan-400 hover:bg-cyan-500', icon: '🏊' },
        { id: 'pokrit-bazeni', label: 'Pokriti bazeni, terme', color: 'bg-cyan-300 hover:bg-cyan-400', icon: '🏊' }
    ];

    const toggleCategory = (categoryId: string) => {
        setSelectedCategories(prev => 
            prev.includes(categoryId) 
                ? prev.filter(id => id !== categoryId)
                : [...prev, categoryId]
        );
    };

    const CategoryButton: React.FC<{ category: CategoryItem }> = ({ category }) => (
        <button
            onClick={() => toggleCategory(category.id)}
            className={`
                flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all duration-200 min-h-[80px] text-center
                ${selectedCategories.includes(category.id) 
                    ? 'border-blue-500 bg-blue-50 text-blue-700' 
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                }
            `}
        >
            <div className="text-2xl mb-1">{category.icon}</div>
            <div className="text-xs font-medium leading-tight">{category.label}</div>
        </button>
    );

    return (
        <section className="py-16 bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-12">
                    <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
                        Poišči plažo po svojem okusu
                    </h2>
                    <p className="text-lg text-slate-300 max-w-4xl mx-auto leading-relaxed">
                        Izberi popolno plažo! Uporabi napredne filtre in tako najdi idealno lokacijo! Brskaj glede na tip plaže, vrsto pesek, dostopnost, 
                        ali priljubljenost, aktivnosti, infrastrukturo in še več. Na voljo je več kot 1500 različnih plaž z različnimi 
                        vrstami športa, od plaže naše reke, kar ti najbolj ustreza.
                    </p>
                </div>

                {/* Category Grid */}
                <div className="bg-white rounded-2xl p-8 shadow-2xl mb-8">
                    {/* Top Row */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-11 gap-3 mb-6">
                        {topRowCategories.map((category) => (
                            <CategoryButton key={category.id} category={category} />
                        ))}
                    </div>

                    {/* Bottom Row */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-11 gap-3 mb-8">
                        {bottomRowCategories.map((category) => (
                            <CategoryButton key={category.id} category={category} />
                        ))}
                    </div>

                    {/* Advanced Filters Button */}
                    <div className="text-center">
                        <Button className="bg-slate-600 hover:bg-slate-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors duration-200">
                            <FiFilter className="mr-2" size={18} />
                            Prikaži napredne filtre
                        </Button>
                    </div>
                </div>

                {/* Quick Filter Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    {quickFilterButtons.map((button) => (
                        <Button
                            key={button.id}
                            className={`${button.color} text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg`}
                        >
                            <span className="flex items-center justify-center gap-2">
                                <span className="text-lg">{button.icon}</span>
                                <span className="text-sm">{button.label}</span>
                            </span>
                        </Button>
                    ))}
                </div>

                {/* Selected Categories Display */}
                {selectedCategories.length > 0 && (
                    <div className="mt-8 bg-white/10 backdrop-blur-sm rounded-lg p-4">
                        <h3 className="text-white font-semibold mb-2">Izbrane kategorije:</h3>
                        <div className="flex flex-wrap gap-2">
                            {selectedCategories.map((categoryId) => {
                                const category = [...topRowCategories, ...bottomRowCategories].find(c => c.id === categoryId);
                                return category ? (
                                    <span
                                        key={categoryId}
                                        className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm flex items-center gap-1"
                                    >
                                        {category.icon} {category.label}
                                        <button
                                            onClick={() => toggleCategory(categoryId)}
                                            className="ml-1 hover:bg-blue-600 rounded-full w-4 h-4 flex items-center justify-center text-xs"
                                        >
                                            ×
                                        </button>
                                    </span>
                                ) : null;
                            })}
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
};

export default BeachCategorySearch;
