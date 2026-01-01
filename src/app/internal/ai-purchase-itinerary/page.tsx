'use client';

import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { a957Abdc0A1F026Bb8B6F4D5Ec975B8E } from '@/lib/api-client';
import type { CheckoutRequest } from '@/lib/api-client/types.gen';
import { createAuthenticatedClient, hasInternalApiToken, getAuthStatus } from '@/lib/api-client-auth';
import { env } from '@/env';
import { notFound } from 'next/navigation';
import Link from 'next/link';

/**
 * Internal AI Purchase Itinerary Page
 *
 * DEV/STAGING ONLY - Purchase itinerary credits via Stripe Checkout
 *
 * Purpose:
 * - Test Stripe Checkout integration
 * - Purchase credits for 3/7/14-day itineraries
 * - Verify webhook grants credits correctly
 *
 * Authentication:
 * - Requires NEXT_PUBLIC_INTERNAL_API_TOKEN in .env.local
 * - Token must be a Laravel Sanctum personal access token
 *
 * NOT for production use. No design polish. Functional only.
 */
export default function AiPurchaseItineraryPage() {
  // Production guard: Block access in production
  const baseUrl = env.NEXT_PUBLIC_BASE_URL;
  const isProduction = baseUrl.includes('beachrex.com') && !baseUrl.includes('dev.');

  if (isProduction) {
    notFound();
  }

  // Check if token is configured
  // Check if token is configured (client-side only to avoid hydration mismatch)
  const [hasToken, setHasToken] = useState(false);
  const [authStatus, setAuthStatus] = useState('Checking...');

  useEffect(() => {
    // Only run on client side
    setHasToken(hasInternalApiToken());
    setAuthStatus(getAuthStatus());
  }, []);

  // Mutation for creating checkout session
  const checkoutMutation = useMutation({
    mutationFn: async (productType: CheckoutRequest['product_type']) => {
      const client = createAuthenticatedClient();
      const response = await a957Abdc0A1F026Bb8B6F4D5Ec975B8E({
        client,
        body: { product_type: productType },
        throwOnError: true,
      });
      return response.data;
    },
    onSuccess: (data) => {
      // Redirect to Stripe Checkout
      window.location.href = data.checkout_url;
    },
  });

  const handlePurchase = (productType: CheckoutRequest['product_type']) => {
    if (!hasToken) {
      alert('Please configure NEXT_PUBLIC_INTERNAL_API_TOKEN in .env.local');
      return;
    }
    checkoutMutation.mutate(productType);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '24px', marginBottom: '20px' }}>Purchase AI Itinerary (Internal)</h1>

      <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#f0f0f0', borderRadius: '4px' }}>
        <p style={{ margin: 0, fontSize: '14px' }}>
          <strong>Purpose:</strong> Test Stripe Checkout integration and purchase itinerary credits.
        </p>
        <p style={{ margin: '5px 0 0 0', fontSize: '14px' }}>
          <strong>Auth:</strong> Requires Bearer token (Laravel Sanctum personal access token).
        </p>
        <p style={{ margin: '5px 0 0 0', fontSize: '14px' }}>
          <strong>Status:</strong> {authStatus}
        </p>
      </div>

      {/* Token Not Configured Warning */}
      {!hasToken && (
        <div style={{ padding: '20px', backgroundColor: '#fff3cd', borderRadius: '4px', marginBottom: '20px', border: '1px solid #ffc107' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#856404' }}>⚠️ Authentication Required</h3>
          <p style={{ margin: '0 0 10px 0', color: '#856404' }}>
            <strong>NEXT_PUBLIC_INTERNAL_API_TOKEN</strong> is not configured.
          </p>
          <p style={{ margin: '0 0 10px 0', fontSize: '14px' }}>
            To use this page, you need to create a Laravel Sanctum personal access token and add it to your{' '}
            <code>.env.local</code> file:
          </p>
          <pre style={{ backgroundColor: '#f8f9fa', padding: '10px', borderRadius: '4px', fontSize: '12px', overflow: 'auto' }}>
{`# Frontend .env.local
NEXT_PUBLIC_INTERNAL_API_TOKEN=1|abc123def456...`}
          </pre>
          <p style={{ margin: '10px 0 0 0', fontSize: '14px' }}>
            <strong>How to create a token:</strong>
          </p>
          <ol style={{ margin: '5px 0 0 20px', fontSize: '14px' }}>
            <li>SSH into backend server or use Laravel Sail</li>
            <li>Run: <code>php artisan tinker</code></li>
            <li>Execute: <code>{'$user = User::find(1); $token = $user->createToken(\'internal-tooling\')->plainTextToken; echo $token;'}</code></li>
            <li>Copy the token (format: <code>1|abc123...</code>)</li>
            <li>Add to <code>Front/.env.local</code> as shown above</li>
            <li>Restart Next.js dev server</li>
          </ol>
        </div>
      )}

      {/* Purchase Buttons */}
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ fontSize: '20px', marginBottom: '15px' }}>Select Itinerary Type</h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {/* 3-Day Itinerary */}
          <div style={{ padding: '20px', backgroundColor: 'white', border: '1px solid #dee2e6', borderRadius: '4px' }}>
            <h3 style={{ fontSize: '18px', marginTop: 0, marginBottom: '10px' }}>3-Day Itinerary</h3>
            <p style={{ margin: '0 0 15px 0', color: '#6c757d' }}>
              Perfect for a weekend getaway. Includes 3 days of beach recommendations.
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#28a745' }}>$19.00 USD</span>
              <button
                onClick={() => handlePurchase('itinerary_3day')}
                disabled={checkoutMutation.isPending || !hasToken}
                style={{
                  padding: '12px 24px',
                  backgroundColor: checkoutMutation.isPending || !hasToken ? '#6c757d' : '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: checkoutMutation.isPending || !hasToken ? 'not-allowed' : 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold',
                }}
              >
                {checkoutMutation.isPending ? 'Processing...' : 'Buy 3-Day'}
              </button>
            </div>
          </div>

          {/* 7-Day Itinerary */}
          <div style={{ padding: '20px', backgroundColor: 'white', border: '1px solid #dee2e6', borderRadius: '4px' }}>
            <h3 style={{ fontSize: '18px', marginTop: 0, marginBottom: '10px' }}>7-Day Itinerary</h3>
            <p style={{ margin: '0 0 15px 0', color: '#6c757d' }}>
              Ideal for a full week vacation. Includes 7 days of beach recommendations.
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#007bff' }}>$39.00 USD</span>
              <button
                onClick={() => handlePurchase('itinerary_7day')}
                disabled={checkoutMutation.isPending || !hasToken}
                style={{
                  padding: '12px 24px',
                  backgroundColor: checkoutMutation.isPending || !hasToken ? '#6c757d' : '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: checkoutMutation.isPending || !hasToken ? 'not-allowed' : 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold',
                }}
              >
                {checkoutMutation.isPending ? 'Processing...' : 'Buy 7-Day'}
              </button>
            </div>
          </div>

          {/* 14-Day Itinerary */}
          <div style={{ padding: '20px', backgroundColor: 'white', border: '1px solid #dee2e6', borderRadius: '4px' }}>
            <h3 style={{ fontSize: '18px', marginTop: 0, marginBottom: '10px' }}>14-Day Itinerary</h3>
            <p style={{ margin: '0 0 15px 0', color: '#6c757d' }}>
              For extended vacations. Includes 14 days of beach recommendations.
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#6f42c1' }}>$59.00 USD</span>
              <button
                onClick={() => handlePurchase('itinerary_14day')}
                disabled={checkoutMutation.isPending || !hasToken}
                style={{
                  padding: '12px 24px',
                  backgroundColor: checkoutMutation.isPending || !hasToken ? '#6c757d' : '#6f42c1',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: checkoutMutation.isPending || !hasToken ? 'not-allowed' : 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold',
                }}
              >
                {checkoutMutation.isPending ? 'Processing...' : 'Buy 14-Day'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Error State */}
      {checkoutMutation.isError && (
        <div style={{ padding: '20px', backgroundColor: '#f8d7da', borderRadius: '4px', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '18px', marginTop: 0 }}>Error</h2>
          <p style={{ margin: '10px 0' }}>
            <strong>Status:</strong>{' '}
            {(checkoutMutation.error as { status?: number })?.status ?? 'Unknown'}
          </p>
          <p style={{ margin: '10px 0' }}>
            <strong>Message:</strong>{' '}
            {(checkoutMutation.error as { message?: string })?.message ??
              checkoutMutation.error?.toString()}
          </p>
          {(checkoutMutation.error as { status?: number })?.status === 401 && (
            <p style={{ margin: '10px 0', color: '#721c24' }}>
              <strong>Note:</strong> You must be authenticated to purchase. Please log in first.
            </p>
          )}
        </div>
      )}

      {/* Instructions */}
      <div style={{ marginTop: '30px', padding: '15px', backgroundColor: '#d1ecf1', borderRadius: '4px' }}>
        <h3 style={{ fontSize: '16px', marginTop: 0 }}>Testing Instructions</h3>
        <ol style={{ margin: '10px 0', paddingLeft: '20px' }}>
          <li>Click one of the purchase buttons above</li>
          <li>You will be redirected to Stripe Checkout (hosted page)</li>
          <li>Use test card: <code>4242 4242 4242 4242</code>, any future expiry, any CVC</li>
          <li>Complete the payment</li>
          <li>Stripe will send webhook to backend</li>
          <li>Backend will grant credits to your account</li>
          <li>
            Check{' '}
            <Link href="/internal/ai-entitlements" style={{ color: '#0c5460' }}>
              /internal/ai-entitlements
            </Link>{' '}
            to verify credits
          </li>
        </ol>
      </div>
    </div>
  );
}

