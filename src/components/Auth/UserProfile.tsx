'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Avatar } from 'flowbite-react';

/**
 * User Profile Component
 *
 * Displays authenticated user's avatar, name, and email.
 * Shows loading state while auth is initializing.
 */

interface UserProfileProps {
  className?: string;
  showEmail?: boolean;
}

export function UserProfile({ className, showEmail = true }: UserProfileProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className={className}>
        <div className="animate-pulse flex items-center space-x-3">
          <div className="rounded-full bg-gray-300 h-10 w-10" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-300 rounded w-24" />
            {showEmail && <div className="h-3 bg-gray-300 rounded w-32" />}
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className={className}>
      <div className="flex items-center space-x-3">
        <Avatar
          img={user.avatar_url ?? undefined}
          alt={user.name}
          rounded
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {user.name}
          </p>
          {showEmail && (
            <p className="text-sm text-gray-500 truncate">
              {user.email}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
