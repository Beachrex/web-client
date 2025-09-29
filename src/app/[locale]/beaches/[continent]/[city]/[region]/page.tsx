'use client';
import { Link, usePathname } from '@/i18n/routing';
import { useEffect } from 'react';
import { Button, Carousel, Tooltip } from 'flowbite-react';
import { FaHeart, FaPlay, FaBed, FaMap, FaUmbrellaBeach, FaUser } from 'react-icons/fa';
import { BsArrowLeft, BsArrowRight } from 'react-icons/bs';
import IslandSection from '@/app/components/IslandSection';
import CitySection from '@/app/components/CitySection';
import RegionSection from '@/app/components/RegionSection';
import DynamicBreadcrumbs from '@/app/components/DynamicBreadcrumbs';

const islandsData = [
    { islandName: 'Otok A', beachCount: '1', hotelPrice: '70€' },
    { islandName: 'Otok B', beachCount: '2', hotelPrice: '60€' },
    { islandName: 'Otok C', beachCount: '3', hotelPrice: '50€' },
    { islandName: 'Otok D', beachCount: '4', hotelPrice: '80€' },
    { islandName: 'Otok E', beachCount: '5', hotelPrice: '90€' },
    { islandName: 'Otok F', beachCount: '6', hotelPrice: '100€' },
];

const cityData = [
    { cityName: 'Mesto A', beachCount: '1', hotelPrice: '70€' },
    { cityName: 'Mesto B', beachCount: '2', hotelPrice: '60€' },
    { cityName: 'Mesto C', beachCount: '3', hotelPrice: '50€' },
    { cityName: 'Mesto D', beachCount: '4', hotelPrice: '80€' },
    { cityName: 'Mesto E', beachCount: '5', hotelPrice: '90€' },
    { cityName: 'Mesto F', beachCount: '6', hotelPrice: '100€' },
];
const regionData = [
    { regionName: 'Regija A', beachCount: '1' },
    { regionName: 'Regija B', beachCount: '2' },
    { regionName: 'Regija C', beachCount: '3' },
    { regionName: 'Regija D', beachCount: '4' },
    { regionName: 'Regija E', beachCount: '5' },
    { regionName: 'Regija F', beachCount: '6' },
];

const Page = () => {
    const pathname = usePathname();

    useEffect(() => {
        if (!pathname) return; // Return if slug is not available
        // Here you can handle your routing logic based on the slug
        // For example, you could fetch data or set a state based on the slug
    }, [pathname]);

    return (
        <>
            <h1>{`Page: ${pathname}`}</h1>
            <div className="container mx-auto p-4">
                <h1 className="text-xl font-bold mb-4 text-red-600">
                    Ta frame je namenjen predstavitvi podstrani na ravni država
                </h1>
                {/* Filters and navigation */}
                <div className="mt-8 grid grid-cols-2 gap-4 text-black">
                    <div>
                        <DynamicBreadcrumbs pathname={pathname}/>
                    </div>
                    <div className="p-4 border border-gray-300 bg-gray-50 text-center">
                        <h2 className="font-bold">Vse plaže, opcije, filter</h2>
                    </div>
                </div>

                {/* Top section with background image */}
                <div
className="relative h-96 bg-cover bg-center"
                     style={{ backgroundImage: "url('https://beachrex.fra1.digitaloceanspaces.com/public/img/beaches/hr-543a-k-odalmacija/hr-543a-k-odalmacija-sl9.jpg')" }}
                >
                    {/* Overlay content */}
                    <div
                        className="absolute inset-0 bg-black bg-opacity-40 flex flex-col justify-center items-center text-white"
                    >
                        {/* Header section */}
                        <div className="flex flex-col items-center mt-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                                <div className="flex flex-col items-start">
                                    <div className="mb-4">
                                        <h2 className="text-lg font-semibold">Zastava države</h2>
                                        {/* Placeholder for flag */}
                                        <div className="w-40 h-24 bg-gray-200" />
                                    </div>
                                    <div className="flex flex-row gap-2 mb-4">

                                        <Button>Simbol za plažo + št. plaž</Button>
                                        <Button>Simbol za odprti bazen + št.</Button>
                                        <Button>Simbol za zaprti bazen + št.</Button>
                                    </div>
                                </div>
                                <div>
                                    <div className="h-64 w-full bg-gray-200">
                                        <p className="text-center">Karta, zemljevid</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>


                {/* Filtering and search table */}
                <div className="mt-8 p-4 bg-gray-50 border border-gray-300 rounded-lg text-black">
                    <h2 className="text-lg font-semibold">Vreme</h2>
                    <p>Opis kakšno je vreme skozi leto, po mesecih. Tudi temperatura vode, oz. kdaj je najbolje obiskati
                        to državo za prijetno kopanje</p>
                </div>

                {/* Map Section */}
                <div className="mt-8 p-4 border border-gray-300 bg-gray-50 text-black">
                    <h2 className="font-semibold text-lg">Prikaz zemljevida države z regijami</h2>
                    <p>
                        Prikaže se ime regije + št. plaž. V karti lahko uporabnik preklaplja med prikazom plaž za morje,
                        za sladko vodo, za zaprti bazen, za odprti bazen.
                    </p>
                    <div className="h-64 w-full bg-gray-200 mt-4">
                        <p className="text-center">Karta države (zemljevid z obarvanimi regijami)</p>
                    </div>
                </div>

                {/* Top Destinations Section */}
                <div className="mt-8 p-4 border border-gray-300 bg-gray-50 text-black">
                    <h2 className="font-semibold text-lg">Top destinacije države</h2>
                    <p>
                        Prikažemo top destinacije države, pomeni najbolj znane turistične plaže, pogosto kraji, imena,
                        imena obale. Klik na ime presumeri na novo podstran.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        {Array.from({ length: 6 }).map((_, index) => (
                            <div key={index} className="p-4 border border-gray-300 rounded-lg bg-white">
                                <div className="h-20 bg-gray-200 mb-2" />
                                <h3 className="font-bold">Ime destinacije</h3>
                                <p>Št. plaž: XX</p>
                                <Button className="mt-2">Preberi več</Button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Region sections */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 text-black">
                    {regionData.map((region, index) => (
                        <RegionSection
                            key={index}
                            regionName={region.regionName}
                            beachCount={region.beachCount}
                        />
                    ))}
                </div>
                {/* City sections */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 text-black">
                    {cityData.map((city, index) => (
                        <CitySection
                            key={index}
                            cityName={city.cityName}
                            beachCount={city.beachCount}
                            hotelPrice={city.hotelPrice}
                        />
                    ))}
                </div>
                {/* Island sections */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-8 text-black">
                    {islandsData.map((island, index) => (
                        <IslandSection
                            key={index}
                            islandName={island.islandName}
                            beachCount={island.beachCount}
                            hotelPrice={island.hotelPrice}
                        />
                    ))}
                </div>

                {/* Section with country description */}
                <div className="mt-8">
                    <h2 className="text-lg font-semibold">Opis države</h2>
                    <p>
                        Opis države, standardno naj bo zakrito, z možnosto razkritja na klik.
                        Tekst naj vsebuje podatke o državi danes, malo zgodovine, kulinarika, kultura, gospodarstvo,
                        turistične značilnosti, značilnosti za plažo, pač tisto, kar je za SEO najbolje, tako po
                        vsebini kot količini. Zraven teksta so slike.
                    </p>
                </div>

                {/* Filtering and search table */}
                <div className="mt-8 p-4 bg-gray-50 border border-gray-300 rounded-lg text-black">
                    <h2 className="text-lg font-semibold">Karta države</h2>
                    <p>Karta države z vsemi podatki, možnostjo filtriranja, namestitev,... (bomo še točno definirali kaj
                        vse bo vsebovala takšna karta, to bo frame zase)</p>
                </div>

                <h2 className="text-lg font-bold mb-4 text-red-600 mt-8 mb-8">
                    Spodaj prikažemo na tabelaren način vse plaže te države. Poudarek je, da lahko uporabnik preko
                    filtra si točno določi oz. prikaže plažo po svoji preferenci. Klik na posamezno polje spodaj,
                    dodatno prikaže opcije, podobno kot imamo že sedaj na obstoječi strani, isto ima konkurenca:
                    <Link
target='_blank'
                          href='https://beachsearcher.si/sl/search/country/143?nature_secret=1&pagesize=18&smart=0&op=1&offset=0'
                    ><u>Beachsearcher</u></Link>
                </h2>

                <div className="mt-4 grid grid-cols-3 gap-4">
                    {/* Filter buttons */}
                    {['LOCATION', 'USER TYPE', 'BEACH', 'INFRASTRUCTURE', 'PARKING & PATH', 'ACCOMMODATION', 'FOOD & DRINKS', 'SPORTS'].map((filter, index) => (
                        <Button key={index} className="w-full">{filter}</Button>
                    ))}
                </div>

                {/* Results section */}
                <div className="mt-8">
                    <h2 className="text-lg font-semibold">Št. zadetkov (Zadetke iz nastavitev filtrov bomo zlistali
                        spodaj v razporeditvi 3 v vrsto, 6 vrst, nato gumb za naslednjo stran in spodaj prikaz
                        navigacije, torej kje se nahajamo, koliko strani je še naprej oz. nazaj.)</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {Array.from({ length: 8 }).map((_, index) => (
                            <div key={index} className="relative border border-gray-300 rounded-lg p-4 bg-gray-100">
                                {/* Carousel for beach images */}
                                <div className="relative w-full h-48">
                                    <Carousel
                                        leftControl={<BsArrowLeft className="text-3xl opacity-0"/>} // Custom left arrow
                                        rightControl={<BsArrowRight
                                            className="text-3xl opacity-0"
                                                      />} // Custom right arrow
                                    >
                                        {/* Carousel items */}
                                        <div
className="h-48 bg-cover bg-center"
                                             style={{ backgroundImage: 'url(\'https://flowbite.com/docs/images/carousel/carousel-1.svg\')' }}
                                        />
                                        <div
className="h-48 bg-cover bg-center"
                                             style={{ backgroundImage: 'url(\'https://flowbite.com/docs/images/carousel/carousel-1.svg\')' }}
                                        />
                                        <div
className="h-48 bg-cover bg-center"
                                             style={{ backgroundImage: 'url(\'https://flowbite.com/docs/images/carousel/carousel-1.svg\')' }}
                                        />
                                    </Carousel>

                                </div>
                                {/* Country Flag */}
                                <div
                                    className="absolute top-2 left-2 w-16 h-15 bg-gray-200 text-black text-center"
                                >Zastava
                                    države
                                </div>

                                {/* Right-side icons */}
                                <div className="absolute top-2 right-2 flex flex-col space-y-2">
                                    <Button className="p-1 bg-orange-300 rounded-full"><FaHeart/></Button>
                                    <Button className="p-1 bg-orange-300 rounded-full">360</Button>
                                    <Button className="p-1 bg-orange-300 rounded-full"><FaPlay/></Button>
                                    <Button className="p-1 bg-orange-300 rounded-full"><FaBed/></Button>
                                </div>

                                {/* Content below the carousel */}
                                <div className="mt-4 flex justify-between">
                                    {/* Left Column */}
                                    <div className="flex-1">
                                        {/* Beach Name */}
                                        <div className="text-left">
                                            <h2 className="font-bold text-lg text-black">Ime Plaže</h2>
                                        </div>

                                        {/* Location and Region */}
                                        <div className="mt-2 text-left text-sm text-black">
                                            <p className="bg-gray-200 p-2">Mesto</p>
                                            <p className="bg-gray-200 p-2 mt-1">Regija in otok, če je</p>
                                        </div>
                                    </div>

                                    {/* Right Column */}
                                    <div className="flex-1 flex justify-end items-center space-x-4">
                                        {/* Symbols for Beach and User Type */}
                                        <div className="flex space-x-4">
                                            {/* Icon for Beach Type */}
                                            <div
                                                className="w-10 h-10 bg-gray-400 rounded-full flex justify-center items-center"
                                            >
                                                <Tooltip content="Tip plaže">
                                                    <FaUmbrellaBeach/>
                                                </Tooltip>

                                            </div>

                                            {/* Icon for User Type */}
                                            <div
                                                className="w-10 h-10 bg-gray-400 rounded-full flex justify-center items-center"
                                            >
                                                <Tooltip content="Tip uporabnika">
                                                    <FaUser/>
                                                </Tooltip>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Floating Map Icon - placed in the right column */}
                                <div className="absolute bottom-2 right-2">
                                    <Button className="p-1 bg-blue-400 rounded-full"><FaMap/></Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
};

export default Page;
