import { Spinner } from 'flowbite-react';

export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Banner Loading Skeleton */}
      <div className="relative h-96 bg-gray-300 animate-pulse">
        <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col justify-center items-center">
          <div className="h-8 bg-gray-400 rounded w-64 mb-4" />
          <div className="h-4 bg-gray-400 rounded w-48" />
        </div>
      </div>

      {/* Content Loading */}
      <div className="container mx-auto px-4 py-8">
        {/* Title Skeleton */}
        <div className="h-8 bg-gray-300 rounded w-96 mb-8 animate-pulse" />

        {/* Properties Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
              <div className="h-48 bg-gray-300" />
              <div className="p-4">
                <div className="h-4 bg-gray-300 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-300 rounded w-1/2 mb-2" />
                <div className="h-4 bg-gray-300 rounded w-1/4" />
              </div>
            </div>
          ))}
        </div>

        {/* Loading Spinner */}
        <div className="flex justify-center items-center py-12">
          <Spinner size="xl" />
        </div>
      </div>
    </div>
  );
}
