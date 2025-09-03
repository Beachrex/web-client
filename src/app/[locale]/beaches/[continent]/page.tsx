"use client";
// Removed unused imports to fix lint errors
import { usePathname } from '@/i18n/routing';
import { useEffect } from 'react';
// import {Link} from '@/i18n/routing';
// import { Button, Carousel, Tooltip } from "flowbite-react";
// import { FaHeart, FaPlay, FaBed, FaMap, FaUmbrellaBeach, FaUser } from 'react-icons/fa';
// import { BsArrowLeft, BsArrowRight } from 'react-icons/bs';
// import CountrySection from "@/app/components/CountrySection";
// import DynamicBreadcrumbs from "@/app/components/DynamicBreadcrumbs";
import Banner from "@/app/components/Beach/Banner";
import { PropertySection } from "@/app/components/PropertySection";

// Commented out unused variable to fix lint errors
// const countryData = [
//     { countryName: 'Slovenia', beachCount: '1', hotelPrice: '70€', link: '/beaches/europe/slovenia' },
//     { countryName: 'Država B', beachCount: '2', hotelPrice: '60€', link: '/beaches/europe/slovenia' },
//     { countryName: 'Država C', beachCount: '3', hotelPrice: '50€', link: '/beaches/europe/slovenia' },
//     { countryName: 'Država D', beachCount: '4', hotelPrice: '80€', link: '/beaches/europe/slovenia' },
//     { countryName: 'Država E', beachCount: '5', hotelPrice: '90€', link: '/beaches/europe/slovenia' },
//     { countryName: 'Država F', beachCount: '6', hotelPrice: '100€', link: '/beaches/europe/slovenia' },
// ];

const mockProperties = {
    popularDestinations: [
        {
            id: '1',
            image: 'https://images.unsplash.com/photo-1634041441461-a1789d008830?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBob3RlbCUyMGV4dGVyaW9yfGVufDF8fHx8MTc1Njg3MzMzN3ww&ixlib=rb-4.1.0&q=80&w=1080',
            title: 'Grand Hotel Adriatic',
            location: 'Opatija, Kvarner',
            price: 180,
            originalPrice: 220,
            rating: 4.8,
            reviews: 234,
            discount: '18',
            isFreeBreakfast: true,
            isFreeCancellation: true,
        },
        {
            id: '2',
            image: 'https://images.unsplash.com/photo-1641150557653-e4c409426e59?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiZWFjaCUyMHJlc29ydCUyMGFlcmlhbHxlbnwxfHx8fDE3NTY5MTI2Mjl8MA&ixlib=rb-4.1.0&q=80&w=1080',
            title: 'Seaside Resort & Spa',
            location: 'Crikvenica, Kvarner',
            price: 145,
            rating: 4.6,
            reviews: 189,
            isFreeBreakfast: true,
            isFreeCancellation: false,
        },
        {
            id: '3',
            image: 'https://images.unsplash.com/photo-1600493505873-cddd69453072?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2FzdGFsJTIwYXBhcnRtZW50JTIwYnVpbGRpbmd8ZW58MXx8fHwxNzU2OTEyNjI5fDA&ixlib=rb-4.1.0&q=80&w=1080',
            title: 'Coastal Villa Apartments',
            location: 'Rijeka, Kvarner',
            price: 95,
            originalPrice: 120,
            rating: 4.4,
            reviews: 156,
            discount: '21',
            isFreeBreakfast: false,
            isFreeCancellation: true,
        },
        {
            id: '4',
            image: 'https://images.unsplash.com/photo-1615858770618-27f91b9c066c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZHJpYXRpYyUyMHNlYSUyMGhvdGVsfGVufDF8fHx8MTc1NjkxMjYyOXww&ixlib=rb-4.1.0&q=80&w=1080',
            title: 'Adriatic Bay Hotel',
            location: 'Lovran, Kvarner',
            price: 160,
            rating: 4.7,
            reviews: 287,
            isFreeBreakfast: true,
            isFreeCancellation: true,
        },
    ],
    premiumAccommodations: [
        {
            id: '5',
            image: 'https://images.unsplash.com/photo-1694818740144-65ac2c8c8c62?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjcm9hdGlhJTIwdmFjYXRpb24lMjByZW50YWx8ZW58MXx8fHwxNzU2OTEyNjI5fDA&ixlib=rb-4.1.0&q=80&w=1080',
            title: 'Luxury Beachfront Villa',
            location: 'Mali Lošinj, Lošinj',
            price: 320,
            originalPrice: 400,
            rating: 4.9,
            reviews: 98,
            discount: '20',
            isFreeBreakfast: true,
            isFreeCancellation: true,
        },
        {
            id: '6',
            image: 'https://images.unsplash.com/photo-1634041441461-a1789d008830?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBob3RlbCUyMGV4dGVyaW9yfGVufDF8fHx8MTc1Njg3MzMzN3ww&ixlib=rb-4.1.0&q=80&w=1080',
            title: 'Premium Spa Resort',
            location: 'Rab, Rab Island',
            price: 280,
            rating: 4.8,
            reviews: 145,
            isFreeBreakfast: true,
            isFreeCancellation: false,
        },
        {
            id: '7',
            image: 'https://images.unsplash.com/photo-1615858770618-27f91b9c066c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZHJpYXRpYyUyMHNlYSUyMGhvdGVsfGVufDF8fHx8MTc1NjkxMjYyOXww&ixlib=rb-4.1.0&q=80&w=1080',
            title: 'Elite Marina Hotel',
            location: 'Punat, Krk Island',
            price: 245,
            originalPrice: 290,
            rating: 4.7,
            reviews: 203,
            discount: '16',
            isFreeBreakfast: true,
            isFreeCancellation: true,
        },
        {
            id: '8',
            image: 'https://images.unsplash.com/photo-1641150557653-e4c409426e59?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiZWFjaCUyMHJlc29ydCUyMGFlcmlhbHxlbnwxfHx8fDE3NTY5MTI2Mjl8MA&ixlib=rb-4.1.0&q=80&w=1080',
            title: 'Exclusive Resort & Club',
            location: 'Malinska, Krk Island',
            price: 310,
            rating: 4.9,
            reviews: 167,
            isFreeBreakfast: true,
            isFreeCancellation: true,
        },
    ],
    bestDeals: [
        {
            id: '9',
            image: 'https://images.unsplash.com/photo-1600493505873-cddd69453072?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2FzdGFsJTIwYXBhcnRtZW50JTIwYnVpbGRpbmd8ZW58MXx8fHwxNzU2OTEyNjI5fDA&ixlib=rb-4.1.0&q=80&w=1080',
            title: 'Budget Coastal Retreat',
            location: 'Senj, Kvarner',
            price: 65,
            originalPrice: 85,
            rating: 4.2,
            reviews: 89,
            discount: '24',
            isFreeBreakfast: false,
            isFreeCancellation: true,
        },
        {
            id: '10',
            image: 'https://images.unsplash.com/photo-1694818740144-65ac2c8c8c62?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjcm9hdGlhJTIwdmFjYXRpb24lMjByZW50YWx8ZW58MXx8fHwxNzU2OTEyNjI5fDA&ixlib=rb-4.1.0&q=80&w=1080',
            title: 'Charming Guesthouse',
            location: 'Vrbnik, Krk Island',
            price: 78,
            originalPrice: 98,
            rating: 4.3,
            reviews: 112,
            discount: '20',
            isFreeBreakfast: true,
            isFreeCancellation: false,
        },
        {
            id: '11',
            image: 'https://images.unsplash.com/photo-1615858770618-27f91b9c066c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZHJpYXRpYyUyMHNlYSUyMGhvdGVsfGVufDF8fHx8MTc1NjkxMjYyOXww&ixlib=rb-4.1.0&q=80&w=1080',
            title: 'Family-Friendly Hotel',
            location: 'Novi Vinodolski, Kvarner',
            price: 115,
            originalPrice: 140,
            rating: 4.5,
            reviews: 176,
            discount: '18',
            isFreeBreakfast: true,
            isFreeCancellation: true,
        },
        {
            id: '12',
            image: 'https://images.unsplash.com/photo-1634041441461-a1789d008830?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBob3RlbCUyMGV4dGVyaW9yfGVufDF8fHx8MTc1Njg3MzMzN3ww&ixlib=rb-4.1.0&q=80&w=1080',
            title: 'Affordable Beach Hotel',
            location: 'Cres, Cres Island',
            price: 92,
            originalPrice: 115,
            rating: 4.1,
            reviews: 134,
            discount: '20',
            isFreeBreakfast: false,
            isFreeCancellation: true,
        },
    ],
};

const Page = () => {
    const pathname = usePathname();

    useEffect(() => {
        if (!pathname) return; // Return if slug is not available
        // Here you can handle your routing logic based on the slug
        // For example, you could fetch data or set a state based on the slug
    }, [pathname]);

    return (
        <>
            <Banner/>
            <PropertySection
                title="Najljepše destinacije pjade Kvarner"
                properties={mockProperties.popularDestinations}
            />

            <PropertySection
                title="Luksuzni smještaj u Kvarneru"
                properties={mockProperties.premiumAccommodations}
            />

            <PropertySection
                title="Odlične ponude"
                properties={mockProperties.bestDeals}
            />

        </>
    );
};

export default Page;