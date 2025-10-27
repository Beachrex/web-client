'use client';

import LeftSidebarFilters from './LeftSidebarFilters';
import ReactLeafletMap from './ReactLeafletMap';
import { useBeaches } from '@/hooks/useBeaches';

const MapWithSidebar = () => {
    const { beaches, loading, error } = useBeaches();

    console.log('🗺️ [MapWithSidebar] beaches:', beaches);
    console.log('🗺️ [MapWithSidebar] loading:', loading);
    console.log('🗺️ [MapWithSidebar] error:', error);

    return (
        <div className="h-screen w-full">
            <div className="h-full w-full grid grid-cols-1 md:grid-cols-12">
                {/* Left Sidebar - Filters */}
                <div className="h-full col-span-1 md:col-span-3">
                    <div className="h-full bg-white border-r border-gray-300 shadow-md">
                        <LeftSidebarFilters />
                        {/* Debug info */}
                        {loading && <p className="p-4 text-sm text-gray-500">Loading beaches...</p>}
                        {error && <p className="p-4 text-sm text-red-500">Error: {error}</p>}
                        {beaches.length > 0 && (
                            <p className="p-4 text-sm text-gray-600">Found {beaches.length} beaches</p>
                        )}
                    </div>
                </div>

                {/* Right Side - Map */}
                <div className="h-full col-span-1 md:col-span-9">
                    <div className="h-full w-full">
                        <ReactLeafletMap beaches={beaches} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MapWithSidebar;

