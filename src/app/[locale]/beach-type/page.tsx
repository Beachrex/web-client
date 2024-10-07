"use client";
import { usePathname } from '@/i18n/routing';
import { useEffect } from 'react';

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
            {/* Render content based on slug */}
        </>
    );
};

export default Page;