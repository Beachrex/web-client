'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Button } from 'flowbite-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { LogOut } from 'lucide-react';

/**
 * Logout Button Component
 *
 * Calls backend logout endpoint and clears local auth state.
 */

interface LogoutButtonProps {
  className?: string;
  variant?: 'button' | 'link';
  showIcon?: boolean;
}

export function LogoutButton({ className, variant = 'button', showIcon = true }: LogoutButtonProps) {
  const { logout } = useAuth();
  const t = useTranslations('Auth');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = () => {
    setIsLoading(true);
    logout()
      .catch((error: unknown) => {
        console.error('[LogoutButton] Logout failed:', error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  if (variant === 'link') {
    return (
      <button
        onClick={handleLogout}
        disabled={isLoading}
        className={`text-sm text-gray-700 hover:text-gray-900 disabled:opacity-50 ${className ?? ''}`}
      >
        {showIcon && <LogOut className="inline w-4 h-4 mr-1" />}
        {isLoading ? t('signingOut') : t('signOut')}
      </button>
    );
  }

  return (
    <Button
      onClick={handleLogout}
      disabled={isLoading}
      color="light"
      size="sm"
      className={className}
    >
      {showIcon && <LogOut className="w-4 h-4 mr-2" />}
      {isLoading ? t('signingOut') : t('signOut')}
    </Button>
  );
}
