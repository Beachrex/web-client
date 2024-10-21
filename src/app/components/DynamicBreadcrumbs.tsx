"use client";

import { Breadcrumb } from "flowbite-react";
import { HiHome } from "react-icons/hi";
import Link from "next/link";
import {useTranslations} from "next-intl";

// Define the type for the props
interface DynamicBreadcrumbsProps {
    pathname: string;
}

export default function DynamicBreadcrumbs({ pathname }: DynamicBreadcrumbsProps) {

    const t = useTranslations('Common');

    // Ensure pathname is a string and split it safely
    const pathSegments = pathname.split("/").filter((segment: string) => segment.length > 0);

    // Generate breadcrumb items based on path segments
    const breadcrumbs = pathSegments.map((segment: string, index: number) => {
        // Create URL for each breadcrumb
        const href = `/${pathSegments.slice(0, index + 1).join("/")}`;
        // Capitalize each breadcrumb for display
        const formattedSegment = `${segment.charAt(0).toUpperCase()}${segment.slice(1)}`;

        return (
            <Breadcrumb.Item key={href}>
                <Link href={href} className="text-blue-600 hover:text-blue-800 transition-colors duration-200 ease-in-out">
                    {formattedSegment}
                </Link>
            </Breadcrumb.Item>
        );
    });

    return (
        <div className="bg-white shadow-md rounded-md p-3 mb-6">
            <Breadcrumb aria-label="Dynamic breadcrumbs">
                <Breadcrumb.Item>
                    <Link href="/" className="flex items-center text-blue-600 hover:text-blue-800 transition-colors duration-200 ease-in-out">
                        <HiHome className="mr-2" /> {t('home')}
                    </Link>
                </Breadcrumb.Item>
                {breadcrumbs}
            </Breadcrumb>
        </div>
    );
}
