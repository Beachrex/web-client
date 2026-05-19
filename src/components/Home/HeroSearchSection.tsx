'use client';
import React, { useState } from 'react';
import { Search, MapPin, Calendar, Users, Map } from 'lucide-react';
import { Button } from 'flowbite-react';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';

const HeroSearchSection: React.FC = () => {
    const t = useTranslations('Common');
    const [searchQuery, setSearchQuery] = useState('');
    const [location, setLocation] = useState('');
    const [checkIn, setCheckIn] = useState('');
    const [guests, setGuests] = useState('2');

    const handleSearch = () => {
        console.log('Search:', { searchQuery, location, checkIn, guests });
        // Add search logic here
    };

    return (
        <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-800 text-white overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
                <div
className="absolute inset-0" style={{
                    backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.1\'%3E%3Ccircle cx=\'30\' cy=\'30\' r=\'2\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
                }}
                />
            </div>

            <div className="relative container mx-auto px-4 py-16 lg:py-24">
                <div className="text-center mb-12">
                    {/* Hero Title */}
                    <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
                        {t('heroTitle')}
                        <span className="block text-cyan-200">{t('heroTitleWorld')}</span>
                    </h1>

                    {/* Hero Subtitle */}
                    <p className="text-xl lg:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto leading-relaxed">
                        {t('heroSubtitle')}
                    </p>
                </div>

                {/* Search Form */}
                <div className="max-w-5xl mx-auto">
                    <div className="bg-white rounded-2xl shadow-2xl p-6 lg:p-8">
                        {/* Desktop Search Form */}
                        <div className="hidden lg:grid lg:grid-cols-4 gap-4 items-end">
                            {/* Destination */}
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700">
                                    {t('destination')}
                                </label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                    <input
                                        type="text"
                                        placeholder={t('whereAreYouGoing')}
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                                    />
                                </div>
                            </div>

                            {/* Check-in Date */}
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700">
                                    {t('checkInDate')}
                                </label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                    <input
                                        type="date"
                                        value={checkIn}
                                        onChange={(e) => setCheckIn(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                                    />
                                </div>
                            </div>

                            {/* Guests */}
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700">
                                    {t('guests')}
                                </label>
                                <div className="relative">
                                    <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                    <select
                                        value={guests}
                                        onChange={(e) => setGuests(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 appearance-none"
                                    >
                                        <option value="1">{t('guest1')}</option>
                                        <option value="2">{t('guests2')}</option>
                                        <option value="3">{t('guests3')}</option>
                                        <option value="4">{t('guests4')}</option>
                                        <option value="5+">{t('guests5Plus')}</option>
                                    </select>
                                </div>
                            </div>

                            {/* Search Button */}
                            <div className="flex gap-2">
                                <Button
                                    onClick={handleSearch}
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 h-[52px]"
                                    size="lg"
                                >
                                    <Search className="mr-2" size={20} />
                                    {t('searchBeaches')}
                                </Button>
                                <Link href="/beach-map">
                                    <Button
                                        className="bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 h-[52px]"
                                        size="lg"
                                    >
                                        <Map size={20} />
                                    </Button>
                                </Link>
                            </div>
                        </div>

                        {/* Mobile Search Form */}
                        <div className="lg:hidden space-y-4">
                            {/* Main Search Input */}
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="text"
                                    placeholder={t('searchBeachesDestinations')}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500 text-lg"
                                />
                            </div>

                            {/* Quick Filters */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="date"
                                        value={checkIn}
                                        onChange={(e) => setCheckIn(e.target.value)}
                                        className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                                    />
                                </div>
                                <div className="relative">
                                    <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                    <select
                                        value={guests}
                                        onChange={(e) => setGuests(e.target.value)}
                                        className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 appearance-none"
                                    >
                                        <option value="1">{t('guest1')}</option>
                                        <option value="2">{t('guests2')}</option>
                                        <option value="3">{t('guests3')}</option>
                                        <option value="4">{t('guests4')}</option>
                                        <option value="5+">{t('guests5Plus')}</option>
                                    </select>
                                </div>
                            </div>

                            {/* Mobile Search Button */}
                            <Button
                                onClick={handleSearch}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-lg transition-colors duration-200"
                                size="lg"
                            >
                                <Search className="mr-2" size={20} />
                                {t('searchBeaches')}
                            </Button>
                        </div>

                        {/* Popular Destinations */}
                        <div className="mt-6 pt-6 border-t border-gray-200">
                            <p className="text-sm text-gray-600 mb-3">{t('popularDestinations')}</p>
                            <div className="flex flex-wrap gap-2">
                                {[
                                    { key: 'countryHrvatska' },
                                    { key: 'countryGrcija' },
                                    { key: 'countrySpanija' },
                                    { key: 'countryItalija' },
                                    { key: 'countryPortugalska' },
                                    { key: 'countryTurcija' },
                                ].map((dest) => (
                                    <button
                                        key={dest.key}
                                        className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded-full transition-colors duration-200"
                                        onClick={() => setLocation(t(dest.key))}
                                    >
                                        {t(dest.key)}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Row */}
                <div className="mt-12 grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
                    <div>
                        <div className="text-3xl lg:text-4xl font-bold text-cyan-200">1500+</div>
                        <div className="text-blue-100">{t('statsBeaches')}</div>
                    </div>
                    <div>
                        <div className="text-3xl lg:text-4xl font-bold text-cyan-200">50+</div>
                        <div className="text-blue-100">{t('statsCountries')}</div>
                    </div>
                    <div>
                        <div className="text-3xl lg:text-4xl font-bold text-cyan-200">6</div>
                        <div className="text-blue-100">{t('statsContinents')}</div>
                    </div>
                    <div>
                        <div className="text-3xl lg:text-4xl font-bold text-cyan-200">100k+</div>
                        <div className="text-blue-100">{t('statsUsers')}</div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HeroSearchSection;
