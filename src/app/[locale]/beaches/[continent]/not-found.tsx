import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { Button } from 'flowbite-react';
import { FaHome, FaMap } from 'react-icons/fa';

export default async function NotFound() {
  const _t = await getTranslations('NotFoundPage');

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-4">
      <div className="max-w-md w-full text-center">
        {/* 404 Icon */}
        <div className="mb-8">
          <FaMap className="mx-auto text-6xl text-gray-400 mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 mb-2">404</h1>
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Continent Not Found
          </h2>
          <p className="text-gray-600 mb-8">
            The continent you&apos;re looking for doesn&apos;t exist or may have been moved.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <Link href="/beaches" className="block">
            <Button className="w-full" size="lg">
              <FaMap className="mr-2" />
              Browse All Beaches
            </Button>
          </Link>

          <Link href="/" className="block">
            <Button color="gray" className="w-full" size="lg">
              <FaHome className="mr-2" />
              Go Home
            </Button>
          </Link>
        </div>

        {/* Available Continents */}
        <div className="mt-8 p-4 bg-white rounded-lg shadow-sm">
          <h3 className="text-sm font-medium text-gray-700 mb-3">
            Available Continents:
          </h3>
          <div className="flex flex-wrap gap-2 justify-center">
            <Link href="/beaches/europe">
              <Button size="xs" color="light">Europe</Button>
            </Link>
            <Link href="/beaches/asia">
              <Button size="xs" color="light">Asia</Button>
            </Link>
            <Link href="/beaches/africa">
              <Button size="xs" color="light">Africa</Button>
            </Link>
            <Link href="/beaches/north-america">
              <Button size="xs" color="light">North America</Button>
            </Link>
            <Link href="/beaches/south-america">
              <Button size="xs" color="light">South America</Button>
            </Link>
            <Link href="/beaches/oceania">
              <Button size="xs" color="light">Oceania</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
