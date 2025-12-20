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
            Not Found
          </h2>
          <p className="text-gray-600 mb-8">
            Page you&apos;re looking for doesn&apos;t exist or may have been moved.
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
      </div>
    </div>
  );
}
