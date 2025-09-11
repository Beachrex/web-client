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

    // Ensure pathname is a string and split it safely
    const pathSegments = pathname.split("/").filter((segment: string) => segment.length > 0);

    // Generate breadcrumb items based on path segments
    const breadcrumbs = pathSegments.map((segment: string, index: number) => {
        // Create URL for each breadcrumb
        const href = `/${pathSegments.slice(0, index + 1).join("/")}`;
        // Capitalize each breadcrumb for display
        const formattedSegment = `${segment.charAt(0).toUpperCase()}${segment.slice(1)}`;
        // Check if this is the last (current) breadcrumb
        const isCurrentPage = index === pathSegments.length - 1;

        return (
            <Breadcrumb.Item key={href}>
                <Link
                    href={href}
                    className={`transition-colors duration-200 ease-in-out text-xs ${
                        isCurrentPage
                            ? 'text-variable-collection-mesto hover:opacity-80 font-medium'
                            : 'text-variable-collection-middle-grey hover:text-variable-collection-mesto font-light'
                    }`}
                >
                    {formattedSegment}
                </Link>
            </Breadcrumb.Item>
        );
    });

    return (
        <div>
            <Breadcrumb aria-label="Dynamic breadcrumbs">
                <Breadcrumb.Item>
                    <Link href="/" className="flex items-center text-variable-collection-middle-grey hover:text-variable-collection-mesto transition-colors duration-200 ease-in-out">
                        <HiHome className="mr-2" />
                    </Link>
                </Breadcrumb.Item>
                {breadcrumbs}
            </Breadcrumb>
        </div>
    );
}
