'use client';

import { Breadcrumb } from 'flowbite-react';
import { HiHome } from 'react-icons/hi';
import { useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';

// Define the type for the props
interface DynamicBreadcrumbsProps {
    pathname: string;
}

/**
 * Format breadcrumb segment: replace dashes/underscores with spaces and capitalize each word
 * Example: "vodice-beaches" -> "Vodice Beaches"
 */
function formatBreadcrumbSegment(segment: string): string {
    return segment
        .replace(/[-_]/g, ' ') // Replace dashes and underscores with spaces
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
}

export default function DynamicBreadcrumbs({ pathname }: DynamicBreadcrumbsProps) {
    const locale = useLocale();

    // Ensure pathname is a string and split it safely
    const pathSegments = pathname.split('/').filter((segment: string) => segment.length > 0);

    // Filter out locale segment from breadcrumbs (we don't want to show 'en', 'si', etc. in breadcrumbs)
    const filteredSegments = pathSegments.filter((segment: string) => segment !== locale);

    // Generate breadcrumb items based on path segments
    const breadcrumbs = filteredSegments.map((segment: string, index: number) => {
        // Create URL for each breadcrumb - include locale prefix
        const href = `/${filteredSegments.slice(0, index + 1).join('/')}`;
        // Format segment: replace dashes with spaces and capitalize each word
        const formattedSegment = formatBreadcrumbSegment(segment);
        // Check if this is the last (current) breadcrumb
        const isCurrentPage = index === filteredSegments.length - 1;

        return (
            <Breadcrumb.Item key={`breadcrumb-${index}`}>
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
