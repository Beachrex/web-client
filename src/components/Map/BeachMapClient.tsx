'use client';

import dynamic from 'next/dynamic';

// Spinner only (no text): language-neutral and no translation needed before the map loads
const LoadingMap = () => (
  <div className="h-screen flex flex-col items-center justify-center bg-gray-100 gap-2">
    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
  </div>
);

const MapWithSidebar = dynamic(() => import('@/components/Map/MapWithSidebar'), {
  loading: LoadingMap,
  ssr: false,
});

export default function BeachMapClient() {
  return <MapWithSidebar />;
}
