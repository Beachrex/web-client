'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { e3A9C3C756B5255539Aa1Ab9F3A2A6A8 } from '@/lib/api-client';
import type { EntitlementsResponse } from '@/lib/api-client/types.gen';
import { createAuthenticatedClient, hasInternalApiToken, getAuthStatus } from '@/lib/api-client-auth';
import { env } from '@/env';
import { notFound } from 'next/navigation';

/**
 * Internal AI Entitlements Page
 *
 * DEV/STAGING ONLY - Display user's credit balances and purchase history
 *
 * Purpose:
 * - View current credit balances for itinerary products
 * - View purchase history
 * - Verify credit consumption after itinerary generation
 *
 * Authentication:
 * - Requires NEXT_PUBLIC_INTERNAL_API_TOKEN in .env.local
 * - Token must be a Laravel Sanctum personal access token
 *
 * NOT for production use. No design polish. Functional only.
 */
export default function AiEntitlementsPage() {
  // Production guard: Block access in production
  const baseUrl = env.NEXT_PUBLIC_BASE_URL;
  const isProduction = baseUrl.includes('beachrex.com') && !baseUrl.includes('dev.');

  if (isProduction) {
    notFound();
  }

  // Check if token is configured (client-side only to avoid hydration mismatch)
  const [hasToken, setHasToken] = useState(false);
  const [authStatus, setAuthStatus] = useState('Checking...');

  useEffect(() => {
    // Only run on client side
    setHasToken(hasInternalApiToken());
    setAuthStatus(getAuthStatus());
  }, []);

  // Fetch entitlements
  const {
    data: entitlements,
    isLoading,
    error,
    refetch,
  } = useQuery<EntitlementsResponse>({
    queryKey: ['entitlements'],
    queryFn: async () => {
      const client = createAuthenticatedClient();
      const response = await e3A9C3C756B5255539Aa1Ab9F3A2A6A8({
        client,
        throwOnError: true,
      });
      return response.data;
    },
    retry: false,
    enabled: hasToken, // Only run query if token is configured
  });

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '24px', marginBottom: '20px' }}>AI Entitlements (Internal)</h1>

      <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#f0f0f0', borderRadius: '4px' }}>
        <p style={{ margin: 0, fontSize: '14px' }}>
          <strong>Purpose:</strong> View credit balances and purchase history for AI itinerary products.
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

      <button
        onClick={() => refetch()}
        style={{
          padding: '10px 20px',
          marginBottom: '20px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
        disabled={!hasToken}
      >
        Refresh
      </button>

      {/* Loading State */}
      {isLoading && hasToken && (
        <div style={{ padding: '20px', backgroundColor: '#fff3cd', borderRadius: '4px' }}>
          <p style={{ margin: 0 }}>Loading entitlements...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div style={{ padding: '20px', backgroundColor: '#f8d7da', borderRadius: '4px', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '18px', marginTop: 0 }}>Error</h2>
          <p style={{ margin: '10px 0' }}>
            <strong>Status:</strong>{' '}
            {(error as { status?: number })?.status ?? 'Unknown'}
          </p>
          <p style={{ margin: '10px 0' }}>
            <strong>Message:</strong>{' '}
            {(error as { message?: string })?.message ?? error.toString()}
          </p>
          {(error as { status?: number })?.status === 401 && (
            <p style={{ margin: '10px 0', color: '#721c24' }}>
              <strong>Note:</strong> You must be authenticated to view entitlements. Please log in first.
            </p>
          )}
        </div>
      )}

      {/* Success State */}
      {entitlements && (
        <>
          {/* Credit Balances */}
          <div style={{ marginBottom: '30px' }}>
            <h2 style={{ fontSize: '20px', marginBottom: '15px' }}>Credit Balances</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white' }}>
              <thead>
                <tr style={{ backgroundColor: '#e9ecef' }}>
                  <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #dee2e6' }}>Product Type</th>
                  <th style={{ padding: '12px', textAlign: 'right', border: '1px solid #dee2e6' }}>Credits</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>3-Day Itinerary</td>
                  <td
                    style={{
                      padding: '12px',
                      textAlign: 'right',
                      border: '1px solid #dee2e6',
                      fontWeight: 'bold',
                      color: entitlements.entitlements.itinerary_3day_credits > 0 ? '#28a745' : '#6c757d',
                    }}
                  >
                    {entitlements.entitlements.itinerary_3day_credits}
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>7-Day Itinerary</td>
                  <td
                    style={{
                      padding: '12px',
                      textAlign: 'right',
                      border: '1px solid #dee2e6',
                      fontWeight: 'bold',
                      color: entitlements.entitlements.itinerary_7day_credits > 0 ? '#28a745' : '#6c757d',
                    }}
                  >
                    {entitlements.entitlements.itinerary_7day_credits}
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>14-Day Itinerary</td>
                  <td
                    style={{
                      padding: '12px',
                      textAlign: 'right',
                      border: '1px solid #dee2e6',
                      fontWeight: 'bold',
                      color: entitlements.entitlements.itinerary_14day_credits > 0 ? '#28a745' : '#6c757d',
                    }}
                  >
                    {entitlements.entitlements.itinerary_14day_credits}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Purchase History */}
          <div>
            <h2 style={{ fontSize: '20px', marginBottom: '15px' }}>Purchase History</h2>
            {entitlements.purchases.length === 0 ? (
              <div style={{ padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
                <p style={{ margin: 0 }}>No purchases yet.</p>
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white' }}>
                <thead>
                  <tr style={{ backgroundColor: '#e9ecef' }}>
                    <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #dee2e6' }}>ID</th>
                    <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #dee2e6' }}>Product</th>
                    <th style={{ padding: '12px', textAlign: 'right', border: '1px solid #dee2e6' }}>Amount</th>
                    <th style={{ padding: '12px', textAlign: 'center', border: '1px solid #dee2e6' }}>Status</th>
                    <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #dee2e6' }}>Purchased At</th>
                    <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #dee2e6' }}>Session ID</th>
                  </tr>
                </thead>
                <tbody>
                  {entitlements.purchases.map((purchase) => (
                    <tr key={purchase.id}>
                      <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>{purchase.id}</td>
                      <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>{purchase.product_type}</td>
                      <td style={{ padding: '12px', textAlign: 'right', border: '1px solid #dee2e6' }}>
                        {purchase.amount.toFixed(2)} {purchase.currency}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center', border: '1px solid #dee2e6' }}>
                        <span
                          style={{
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: 'bold',
                            backgroundColor:
                              purchase.status === 'completed'
                                ? '#d4edda'
                                : purchase.status === 'pending'
                                  ? '#fff3cd'
                                  : purchase.status === 'refunded'
                                    ? '#f8d7da'
                                    : '#f8d7da',
                            color:
                              purchase.status === 'completed'
                                ? '#155724'
                                : purchase.status === 'pending'
                                  ? '#856404'
                                  : purchase.status === 'refunded'
                                    ? '#721c24'
                                    : '#721c24',
                          }}
                        >
                          {purchase.status.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>
                        {purchase.purchased_at
                          ? new Date(purchase.purchased_at).toLocaleString()
                          : 'N/A'}
                      </td>
                      <td
                        style={{
                          padding: '12px',
                          border: '1px solid #dee2e6',
                          fontSize: '11px',
                          fontFamily: 'monospace',
                        }}
                      >
                        {purchase.stripe_session_id ?? 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {/* Debug Info */}
      {entitlements && (
        <div style={{ marginTop: '30px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
          <h3 style={{ fontSize: '16px', marginTop: 0 }}>Raw Response (Debug)</h3>
          <pre style={{ fontSize: '12px', overflow: 'auto', margin: 0 }}>
            {JSON.stringify(entitlements, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
