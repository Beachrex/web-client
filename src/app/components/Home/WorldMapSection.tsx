'use client';
import React from 'react';
import dynamic from 'next/dynamic';
import { Button } from 'flowbite-react';
import { useTranslations } from 'next-intl';

// Dynamically import the map component
const HomeWorldMap = dynamic(() => import('@/app/components/Map/HomeWorldMap'), { 
    ssr: false,
    loading: () => (
        <div className="flex items-center justify-center h-[400px] bg-gray-100 rounded-lg">
            <div className="text-gray-600">Loading map...</div>
        </div>
    )
});

const WorldMapSection: React.FC = () => {
    const t = useTranslations('HomePage');

    return (
        <section className="py-16 bg-gradient-to-br from-blue-50 to-cyan-50">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    {/* Left side - Text content */}
                    <div className="space-y-6">
                        <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
                            {t('searchMap')}
                        </h2>
                        
                        <p className="text-lg text-gray-600 leading-relaxed">
                            Odkri najlepše plaže po svetu s pomočjo interaktivnega 
                            zemljevida. Iz več kot 1500 različnih lokacij izberi 
                            to, ki ustreza tvojim željam, aktivnostim in proračunu. 
                            Optimalno za načrtovanje tako kratke počitnice kot 
                            daljšega potovanja. Poišči svojo popolno plažo in 
                            začni načrtovati svojo naslednjo avanturo ob morju!
                        </p>
                        
                        <div className="pt-4">
                            <Button 
                                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors duration-200"
                                size="lg"
                            >
                                <span className="flex items-center gap-2">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m0 0L9 7" />
                                    </svg>
                                    Pogled zemljevid plaž
                                </span>
                            </Button>
                        </div>
                    </div>
                    
                    {/* Right side - Interactive map */}
                    <div className="relative">
                        <div className="bg-white rounded-xl shadow-lg p-4">
                            <HomeWorldMap />
                        </div>
                        
                        {/* Optional overlay stats */}
                        <div className="absolute top-8 left-8 bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-md">
                            <div className="text-sm text-gray-600 mb-1">Skupaj plaž</div>
                            <div className="text-2xl font-bold text-blue-600">1500+</div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default WorldMapSection;
