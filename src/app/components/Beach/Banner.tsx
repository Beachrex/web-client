import DynamicBreadcrumbs from '@/app/components/DynamicBreadcrumbs';
import BannerSection from '../BannerSection/BannerSection';
import type { Continent } from '@/app/types/api';

interface HeroSectionProps {
  pathname?: string;
  showBreadcrumbs?: boolean;
  title?: string;
  continent?: Continent;
  accommodationCount?: number;
  prevBeach?: {
    name: string;
    url: string;
  };
  nextBeach?: {
    name: string;
    url: string;
  };
}

export function HeroSection({
  pathname,
  showBreadcrumbs = true,
  title = 'Beaches',
  continent,
  accommodationCount,
  prevBeach,
  nextBeach,
}: HeroSectionProps) {
  return (
    <div className="relative">
      {/* Breadcrumbs and Pagination */}
      {showBreadcrumbs && pathname && (
        <div className="border-b bg-white">
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              {/* Left side - Breadcrumbs */}
              <div className="flex-1">
                <DynamicBreadcrumbs pathname={pathname} />
              </div>

              {/* Right side - Beach Pagination */}
              {(prevBeach ?? nextBeach) && (
                <div className="ml-8 flex items-center space-x-4 font-light">
                  {prevBeach && (
                    <a
                      href={prevBeach.url}
                      className="flex items-center text-sm text-variable-collection-mesto transition-opacity duration-200 hover:opacity-80"
                    >
                      <svg
                        className="mr-1 h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 19l-7-7 7-7"
                        />
                      </svg>
                      <span className="font-medium">{prevBeach.name}</span>
                    </a>
                  )}

                  {nextBeach && (
                    <a
                      href={nextBeach.url}
                      className="flex items-center text-sm text-variable-collection-mesto transition-opacity duration-200 hover:opacity-80"
                    >
                      <span className="font-medium">{nextBeach.name}</span>
                      <svg
                        className="ml-1 h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Banner */}

      <BannerSection
        image="/images/banner/region-banner.jpg"
        title={title}
        continent={continent}
        accommodationCount={accommodationCount}
      />
    </div>
  );
}

// Default export for compatibility
export default function Banner(props: HeroSectionProps = {}) {
  return <HeroSection {...props} />;
}
