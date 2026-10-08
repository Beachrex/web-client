'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslations } from 'next-intl';
import { Spinner } from 'flowbite-react';
import { Link } from '@/i18n/routing';
import { googleExchange } from '@/lib/api-client';

/**
 * Google OAuth Callback Page
 *
 * Handles the OAuth callback redirect from backend.
 *
 * Security: Token is NEVER passed via URL. Backend redirects with one-time exchange code.
 *
 * Flow:
 * 1. User clicks "Continue with Google"
 * 2. Frontend calls /auth/google/redirect to get Google OAuth URL
 * 3. User is redirected to Google
 * 4. Google redirects to backend /auth/google/callback
 * 5. Backend processes OAuth, creates token, stores in cache with one-time code
 * 6. Backend redirects here with one-time exchange code
 * 7. This page calls /auth/google/exchange to get token (using generated SDK)
 * 8. Stores token in auth context
 * 9. Redirects to intended destination or home
 *
 * URL parameters:
 * - Success: ?code=one_time_exchange_code
 * - Error: ?error=error_code&message=error_message
 */

export default function AuthCallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { login } = useAuth();
  const t = useTranslations('Auth');

  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const handleCallback = async () => {
      // Check for error from backend
      const errorParam = searchParams.get('error');
      const messageParam = searchParams.get('message');

      if (errorParam) {
        setError(messageParam ?? t('authenticationFailed'));
        setIsProcessing(false);
        return;
      }

      // Get exchange code from URL
      const code = searchParams.get('code');

      // Validate required parameter
      if (!code) {
        setError(t('missingParameters'));
        setIsProcessing(false);
        return;
      }

      try {
        // Exchange code for token using generated SDK
        const response = await googleExchange({
          body: { code },
        });

        const data = response.data!;

        // Store token and user in auth context
        login(data.token, data.user);

        // Get intended destination from localStorage (set before login)
        const intendedUrl = localStorage.getItem('auth_intended_url');
        localStorage.removeItem('auth_intended_url');

        // Redirect to intended destination or home
        router.push(intendedUrl ?? '/');
      } catch (err) {
        console.error('[AuthCallback] Failed to exchange code:', err);
        setError(err instanceof Error ? err.message : t('authenticationFailed'));
        setIsProcessing(false);
      }
    };

    void handleCallback();
  }, [searchParams, login, router, t]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-lg text-center">
        {isProcessing ? (
          <>
            <Spinner size="xl" className="mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {t('completingSignIn')}
            </h1>
            <p className="text-gray-600">{t('pleaseWait')}</p>
          </>
        ) : error ? (
          <>
            <div className="mb-4">
              <svg
                className="w-16 h-16 text-red-500 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {t('authenticationError')}
            </h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {t('returnHome')}
            </Link>
          </>
        ) : null}
      </div>
    </div>
  );
}
