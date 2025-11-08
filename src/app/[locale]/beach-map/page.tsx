'use client';

import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';

const LoadingMap = () => {
  const t = useTranslations('BeachesMap');
  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gray-100 gap-2">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      <p className="text-gray-600 text-base">{t('loadingMap')}</p>
    </div>
  );
};

const MapWithSidebar = dynamic(() => import('@/components/Map/MapWithSidebar'), {
  loading: () => <LoadingMap />,
  ssr: false,
});

export default function BeachMapPage() {
  return <MapWithSidebar />;
}
