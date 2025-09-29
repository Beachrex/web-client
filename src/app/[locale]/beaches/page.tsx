'use client';
import { Link, usePathname } from '@/i18n/routing';
import { useEffect } from 'react';
import { Button, Carousel, Tooltip } from 'flowbite-react';
import { FaHeart, FaPlay, FaBed, FaMap, FaUmbrellaBeach, FaUser } from 'react-icons/fa';
import { BsArrowLeft, BsArrowRight } from 'react-icons/bs';
import ContinentSection from '@/app/components/ContinentSection';
import DynamicBreadcrumbs from '@/app/components/DynamicBreadcrumbs';

const continentData = [
    { name: 'Europe', beachCount: '1', hotelPrice: '70€', link: '/beaches/europe/' },
    { name: 'Kontinent B', beachCount: '2', hotelPrice: '60€', link: '/beaches/europe/' },
    { name: 'Kontinent C', beachCount: '3', hotelPrice: '50€', link: '/beaches/europe/' },
    { name: 'Kontinent D', beachCount: '4', hotelPrice: '80€', link: '/beaches/europe/' },
    { name: 'Kontinent E', beachCount: '5', hotelPrice: '90€', link: '/beaches/europe/' },
    { name: 'Kontinent F', beachCount: '6', hotelPrice: '100€', link: '/beaches/europe/' },
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
            <div className="container mx-auto p-4">
                <h1 className="text-xl mb-4 text-red-600">
                    Ta frame je namenjen predstavitvi podstrani SVET
                    (<Link
                        className="text-xl font-bold mb-4 text-red-600"
                        href="https://wireframe.cc/QteImS"
                        target="_blank"
                     >
                        <u>Wireframe</u>
                     </Link>)
                </h1>
                <p>
                    Veliko zadev je podobnih kot na ostalih podstraneh. najti moramo nek način, da se to jasno loči,
                    da človek takoj ve, da je na strani kontinent, ne na strani država ali regija
                </p>
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
                            <div className="grid grid-cols-1 md:grid-cols-1 gap-4 items-center">
                                <div className="flex flex-col items-start">
                                    <div className="flex flex-row gap-2 mb-4">
                                        <Button>št. držav z plažami</Button>
                                        <Button>skupno št. plaž na svetu</Button>
                                        <Button>skupno št. odprtih bazenov na svetu</Button>
                                        <Button>skupno št. zaprtih bazenov na svetu</Button>
                                        <Button>skupno št. otokov z plažami na svetu</Button>
                                        <Button>skupno št. plaž ob rekah</Button>
                                        <Button>skupno št. plaž ob jezerih</Button>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
                {/* Navigation section for previous and next page */}
                <div className="flex justify-around items-center mt-2">
                    {/* Previous page button */}
                    <div className="flex-1 mx-2">
                        <Button className="w-full">
                            GUMB za dostop do nastanitev
                        </Button>
                    </div>

                    {/* Middle button */}
                    <div className="flex-1 mx-2">
                        <Button className="w-full">
                            GUMB za dostop do vremena
                        </Button>
                    </div>

                    {/* Next page button */}
                    <div className="flex-1 mx-2">
                        <Button className="w-full">
                            GUMB za dostop do TOP plaž podstrani
                        </Button>
                    </div>
                </div>
                {/* Country sections */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 text-black">
                    {continentData.map((continent, index) => (
                        <ContinentSection
                            key={index}
                            name={continent.name}
                            beachCount={continent.beachCount}
                            hotelPrice={continent.hotelPrice}
                            link={continent.link}
                        />
                    ))}
                </div>
                {/* Section with country description */}
                <div className="mt-8">
                    <h2 className="text-lg font-semibold">Opis sveta</h2>
                    <p>
                        Opis sveta z opisom kontinentov, držav, mest, ..., standardno naj bo zakrito, z
                        možnosto razkritja na klik. Tekst naj vsebuje podatke o vseh kontinenthi, državah,
                        malo zgodovine, kulinarika, kultura, gospodarstvo, turistične značilnosti, značilnosti za
                        plažo, pač tisto, kar je za SEO najbolje, tako po vsebini kot količini. Zraven teksta so slike.
                    </p>
                </div>
                {/* Map Section */}
                <div className="mt-8 p-4 border border-gray-300 bg-gray-50 text-black">
                    <h2 className="font-semibold text-lg">Karta sveta</h2>
                    <p>
                        Karta sveta z vsemi, kontinenti, državami in plažami in podatki, možnostjo filtriranja,
                        namestitev,... (bomo še točno definirali kaj vse bo vsebovala takšna karta, to bo frame zase)
                    </p>
                    <div className="h-64 w-full bg-gray-200 mt-4">
                        <p className="text-center">Karta kontinenta</p>
                    </div>
                </div>


                {/* Filtering and search table */}
                <h2 className="text-lg font-bold mb-4 text-red-600 mt-8 mb-8">
                    Spodaj prikažemo na tabelaren način vse plaže sveta, če to sploh gre. Poudarek je, da
                    lahko uporabnik preko filtra si točno določi oz. prikaže plažo po svoji preferenci.
                    Klik na posamezno polje spodaj, dodatno prikaže opcije, podobno kot imamo že sedaj na
                    obstoječi strani, isto ima konkurenca.
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
