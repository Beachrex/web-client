'use client';

import { Alert, Card } from 'flowbite-react';
import { useTranslations } from 'next-intl';
import { SignInOptions } from '@/components/Auth';
import DynamicPropertyCard from '@/components/PropertyCard/DynamicPropertyCard';
import { useAuth } from '@/contexts/AuthContext';
import { useFavoriteIds, useMyFavorites } from '@/hooks/useFavorites';
import { Link } from '@/i18n/routing';

/** "My favorite beaches": the signed-in user's saved beaches, newest first. */
export default function FavoritesPage() {
  const t = useTranslations('Favorites');
  const { isAuthenticated, isLoading } = useAuth();
  const { data, isError, isPending } = useMyFavorites();
  const ids = useFavoriteIds();
  // A heart removed on this page hides the card at once (the id list updates before the refetch).
  const beaches = (data?.beaches ?? []).filter((b) => b.id !== undefined && ids.includes(b.id));

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-6 font-figtree text-3xl font-bold text-gray-900">{t('title')}</h1>

        {isLoading ? null : !isAuthenticated ? (
          <Card className="mx-auto max-w-md">
            <p className="text-gray-700">{t('signInText')}</p>
            <SignInOptions />
          </Card>
        ) : isError ? (
          <Alert color="failure">{t('loadError')}</Alert>
        ) : isPending ? (
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        ) : beaches.length === 0 ? (
          <Card className="mx-auto max-w-md">
            <p className="text-gray-700">{t('empty')}</p>
            <Link href="/beaches" className="font-medium text-blue-700 hover:underline">
              {t('browse')}
            </Link>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {beaches.map((beach) => (
              <DynamicPropertyCard key={beach.id} beach={beach} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
