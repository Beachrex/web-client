'use client';

import dynamic from 'next/dynamic';

// Simple loading component without translations to avoid hydration issues
const LoadingMap = () => (
  <div className="h-screen flex flex-col items-center justify-center bg-gray-100 gap-2">
    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
    <p className="text-gray-600 text-base">Loading map...</p>
  </div>
);

const MapWithSidebar = dynamic(() => import('@/components/Map/MapWithSidebar'), {
  loading: LoadingMap,
  ssr: false,
});

export default function BeachMapPage() {
  return <MapWithSidebar />;
}
