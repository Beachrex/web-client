'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { aiChat, a957Abdc0A1F026Bb8B6F4D5Ec975B8E } from '@/lib/api-client';
import { createAuthenticatedClient } from '@/lib/api-client-auth';
import type {
  AiChatRequest,
  AiChatResponse,
  CheckoutRequest,
} from '@/lib/api-client/types.gen';
import { env } from '@/env';
import { notFound } from 'next/navigation';
import Link from 'next/link';

/**
 * Internal AI Playground
 *
 * DEV/STAGING ONLY - Minimal testing UI for AI chat endpoint validation
 *
 * Purpose:
 * - Human-led testing of AI behavior
 * - Validation of monetization gates (402/429/413/503)
 * - Debugging of error states
 *
 * NOT for production use. No design polish. Functional only.
 */
export default function AiPlaygroundPage() {
  // Production guard: Block access in production
  const baseUrl = env.NEXT_PUBLIC_BASE_URL;
  const isProduction = baseUrl.includes('beachrex.com') && !baseUrl.includes('dev.');

  if (isProduction) {
    notFound();
  }

  // Form state
  const [message, setMessage] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [radius, setRadius] = useState('');

  // Session state (persisted between requests)
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Response state
  const [lastResponse, setLastResponse] = useState<AiChatResponse | null>(null);
  const [lastError, setLastError] = useState<{
    status: number;
    code: string;
    message: string;
    details?: Record<string, unknown>;
    rawError?: unknown;
  } | null>(null);

  // AI Chat mutation
  const mutation = useMutation({
    mutationFn: async (request: AiChatRequest) => {
      const response = await aiChat({
        body: request,
        throwOnError: true,
      });
      return response.data;
    },
    onSuccess: (data) => {
      setLastResponse(data);
      setLastError(null);
      setSessionId(data.session_id);
      setMessage(''); // Clear input on success
    },
    onError: (error: unknown) => {
      setLastResponse(null);

      // Extract error details from the API response
      const apiError = error as {
        status?: number;
        error?: {
          error?: string;
          message?: string;
          details?: Record<string, unknown>;
        };
        message?: string;
      };

      const status = apiError?.status ?? 0;
      const errorData = apiError?.error ?? {};
      const code = errorData.error ?? 'UNKNOWN_ERROR';
      const message =
        errorData.message ?? apiError?.message ?? 'An unknown error occurred';
      const details = errorData.details;

      setLastError({
        status,
        code,
        message,
        details,
        rawError: error,
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const request: AiChatRequest = {
      message: message.trim(),
      session_id: sessionId ?? undefined,
      context: {
        location: latitude && longitude ? {
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
        } : undefined,
        preferences: radius ? {
          max_distance_km: parseFloat(radius),
        } : undefined,
      },
    };

    mutation.mutate(request);
  };

  const handleClearSession = () => {
    setSessionId(null);
    setLastResponse(null);
    setLastError(null);
    setMessage('');
  };

  const handleCopyDebugInfo = () => {
    const debugInfo = {
      sessionId,
      lastResponse,
      lastError,
      timestamp: new Date().toISOString(),
    };
    void navigator.clipboard.writeText(JSON.stringify(debugInfo, null, 2));
    alert('Debug info copied to clipboard');
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '24px', marginBottom: '20px' }}>AI Playground (Internal)</h1>

      <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#f0f0f0', borderRadius: '4px' }}>
        <p style={{ margin: 0, fontSize: '14px' }}>
          <strong>Purpose:</strong> Test AI chat endpoint, validate monetization gates (402/429/413/503), debug errors.
        </p>
        <p style={{ margin: '5px 0 0 0', fontSize: '14px' }}>
          <strong>Auth:</strong> Requires authentication (Laravel Sanctum token).
        </p>
      </div>

      {/* Chat Form */}
      <form onSubmit={handleSubmit} style={{ marginBottom: '30px' }}>
        {/* Message input */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Message
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="e.g., 'I want to visit beaches in Croatia for 7 days'"
            rows={4}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ccc',
              fontFamily: 'monospace',
              fontSize: '14px',
            }}
            disabled={mutation.isPending}
          />
        </div>

        {/* Optional context */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>Latitude (optional)</label>
            <input
              type="number"
              step="any"
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
              placeholder="45.8150"
              style={{ width: '100%', padding: '8px', border: '1px solid #ccc', fontFamily: 'monospace' }}
              disabled={mutation.isPending}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>Longitude (optional)</label>
            <input
              type="number"
              step="any"
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
              placeholder="15.9819"
              style={{ width: '100%', padding: '8px', border: '1px solid #ccc', fontFamily: 'monospace' }}
              disabled={mutation.isPending}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>Radius (km, optional)</label>
            <input
              type="number"
              step="any"
              value={radius}
              onChange={(e) => setRadius(e.target.value)}
              placeholder="50"
              style={{ width: '100%', padding: '8px', border: '1px solid #ccc', fontFamily: 'monospace' }}
              disabled={mutation.isPending}
            />
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="submit"
            disabled={mutation.isPending || !message.trim()}
            style={{
              padding: '10px 20px',
              backgroundColor: mutation.isPending ? '#ccc' : '#007bff',
              color: 'white',
              border: 'none',
              cursor: mutation.isPending ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
            }}
          >
            {mutation.isPending ? 'Sending...' : 'Send'}
          </button>
          <button
            type="button"
            onClick={handleClearSession}
            disabled={mutation.isPending}
            style={{
              padding: '10px 20px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              cursor: mutation.isPending ? 'not-allowed' : 'pointer',
            }}
          >
            Clear Session
          </button>
          {(lastResponse ?? lastError) && (
            <button
              type="button"
              onClick={handleCopyDebugInfo}
              disabled={mutation.isPending}
              style={{
                padding: '10px 20px',
                backgroundColor: '#17a2b8',
                color: 'white',
                border: 'none',
                cursor: mutation.isPending ? 'not-allowed' : 'pointer',
              }}
            >
              📋 Copy Debug Info
            </button>
          )}
        </div>

        {/* Session ID display */}
        {sessionId && (
          <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#e7f3ff', borderRadius: '4px' }}>
            <strong>Session ID:</strong> {sessionId}
          </div>
        )}
      </form>

      {/* Success Response */}
      {lastResponse && (
        <div style={{ marginBottom: '30px', border: '2px solid #28a745', padding: '20px', backgroundColor: '#d4edda' }}>
          <h2 style={{ fontSize: '18px', marginBottom: '15px', color: '#155724' }}>✅ Success Response</h2>

          {/* AI Message */}
          <div style={{ marginBottom: '15px' }}>
            <strong>AI Message:</strong>
            <div style={{ marginTop: '5px', padding: '10px', backgroundColor: 'white', whiteSpace: 'pre-wrap' }}>
              {lastResponse.message}
            </div>
          </div>

          {/* Beach Recommendations */}
          {lastResponse.beaches && lastResponse.beaches.length > 0 && (
            <div style={{ marginBottom: '15px' }}>
              <strong>Beach Recommendations ({lastResponse.beaches.length}):</strong>
              <div style={{ marginTop: '5px' }}>
                {lastResponse.beaches.slice(0, 3).map((beach, idx) => (
                  <div key={beach.id} style={{ padding: '10px', backgroundColor: 'white', marginBottom: '5px' }}>
                    <div><strong>{idx + 1}. {beach.name}</strong></div>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      {beach.city && `${beach.city}, `}{beach.country_code}
                      {beach.distance_km && ` • ${beach.distance_km.toFixed(1)} km`}
                      {' • Match: '}{(beach.match_score * 100).toFixed(0)}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Metadata */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '10px', fontSize: '12px' }}>
            <div>
              <strong>Session ID:</strong><br />
              {lastResponse.session_id}
            </div>
            <div>
              <strong>Intent:</strong><br />
              {lastResponse.intent}
            </div>
            <div>
              <strong>Tokens Used:</strong><br />
              {lastResponse.metadata.tokens_used}
            </div>
            <div>
              <strong>Response Time:</strong><br />
              {lastResponse.metadata.response_time_ms}ms
            </div>
          </div>
        </div>
      )}

      {/* Error Response */}
      {lastError && (
        <ErrorDisplay error={lastError} />
      )}
    </div>
  );
}

// Error display component
function ErrorDisplay({
  error,
}: {
  error: {
    status: number;
    code: string;
    message: string;
    details?: Record<string, unknown>;
    rawError?: unknown;
  };
}) {
  const { status, code, message, details, rawError } = error;

  // Display status as "unknown" if 0 (unavailable)
  const statusDisplay = status === 0 ? 'unknown' : status;

  // Checkout mutation for 402 Payment Required
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const handleBuyItinerary = async (productType: CheckoutRequest['product_type']) => {
    setIsCheckingOut(true);
    setCheckoutError(null);

    try {
      const client = createAuthenticatedClient();
      const response = await a957Abdc0A1F026Bb8B6F4D5Ec975B8E({
        client,
        body: { product_type: productType },
        throwOnError: true,
      });
      const data = response.data;

      // Redirect to Stripe Checkout
      window.location.href = data.checkout_url;
    } catch (err: unknown) {
      const errorMessage =
        (err as { message?: string })?.message ??
        'Failed to create checkout session';
      setCheckoutError(errorMessage);
      setIsCheckingOut(false);
    }
  };

  return (
    <div style={{ marginBottom: '30px', border: '2px solid #dc3545', padding: '20px', backgroundColor: '#f8d7da' }}>
      <h2 style={{ fontSize: '18px', marginBottom: '15px', color: '#721c24' }}>
        ❌ Error Response
      </h2>

      {/* HTTP Status and Error Code */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
        <div>
          <strong>HTTP Status:</strong>
          <div style={{ marginTop: '5px', padding: '10px', backgroundColor: 'white', fontFamily: 'monospace' }}>
            {statusDisplay}
          </div>
        </div>
        <div>
          <strong>Error Code:</strong>
          <div style={{ marginTop: '5px', padding: '10px', backgroundColor: 'white', fontFamily: 'monospace' }}>
            {code}
          </div>
        </div>
      </div>

      <div style={{ marginBottom: '15px' }}>
        <strong>Message:</strong>
        <div style={{ marginTop: '5px', padding: '10px', backgroundColor: 'white' }}>
          {message}
        </div>
      </div>

      {/* 402 Payment Required - Enhanced with Buy CTA */}
      {status === 402 && details && (() => {
        const product = details.product as Record<string, unknown> | undefined;
        const productType = product?.type as string;

        // Map product type to CheckoutRequest product_type
        const checkoutProductType: CheckoutRequest['product_type'] =
          productType === 'itinerary_3day' ? 'itinerary_3day' :
          productType === 'itinerary_7day' ? 'itinerary_7day' :
          productType === 'itinerary_14day' ? 'itinerary_14day' :
          'itinerary_3day'; // fallback

        return (
          <div style={{ marginTop: '15px', padding: '15px', backgroundColor: '#fff3cd', border: '2px solid #ffc107', borderRadius: '4px' }}>
            <h3 style={{ marginTop: 0, marginBottom: '10px', fontSize: '16px' }}>💳 Payment Required</h3>
            <div style={{ marginBottom: '15px' }}>
              <strong>Product:</strong> {productType} ({product?.duration_days as number} days)<br />
              <strong>Price:</strong> ${product?.price as number} {product?.currency as string}
            </div>

            {/* Buy Itinerary CTA Button */}
            <button
              onClick={() => handleBuyItinerary(checkoutProductType)}
              disabled={isCheckingOut}
              style={{
                padding: '12px 24px',
                backgroundColor: isCheckingOut ? '#6c757d' : '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: isCheckingOut ? 'not-allowed' : 'pointer',
                fontSize: '16px',
                fontWeight: 'bold',
                width: '100%',
              }}
            >
              {isCheckingOut
                ? 'Creating checkout session...'
                : `🛒 Buy ${productType} - $${String(product?.price)}`}
            </button>

            {/* Checkout Error */}
            {checkoutError && (
              <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#f8d7da', border: '1px solid #dc3545', borderRadius: '4px' }}>
                <strong>Checkout Error:</strong> {checkoutError}
              </div>
            )}

            {/* Alternative: Manual purchase page link */}
            <div style={{ marginTop: '10px', fontSize: '12px', textAlign: 'center' }}>
              Or visit{' '}
              <Link href="/internal/ai-purchase-itinerary" style={{ color: '#007bff' }}>
                /internal/ai-purchase-itinerary
              </Link>
            </div>
          </div>
        );
      })()}

      {/* 429 Rate Limit */}
      {status === 429 && details && (
        <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#fff3cd', border: '1px solid #ffc107' }}>
          <strong>⏱️ Rate Limit Exceeded</strong>
          <div style={{ marginTop: '5px' }}>
            Limit: {details.limit as number} requests/hour<br />
            Reset at: {details.reset_at as string}<br />
            <a href={details.upgrade_url as string} style={{ color: '#007bff' }}>Upgrade</a>
          </div>
        </div>
      )}

      {/* 413 Token Budget */}
      {status === 413 && details && (
        <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#fff3cd', border: '1px solid #ffc107' }}>
          <strong>📊 Token Budget Exceeded</strong>
          <div style={{ marginTop: '5px' }}>
            Estimated tokens: {details.estimated_tokens as number}<br />
            Max tokens: {details.max_tokens as number}<br />
            Suggestion: {details.suggestion as string}
          </div>
        </div>
      )}

      {/* 503 Service Unavailable */}
      {status === 503 && details && (
        <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#fff3cd', border: '1px solid #ffc107' }}>
          <strong>🚫 Service Unavailable</strong>
          <div style={{ marginTop: '5px' }}>
            Retry after: {details.retry_after as number} seconds<br />
            <a href={details.fallback_url as string} style={{ color: '#007bff' }}>Fallback URL</a>
          </div>
        </div>
      )}

      {/* Dev-only debug block */}
      <details style={{ marginTop: '20px', fontSize: '12px' }}>
        <summary style={{ cursor: 'pointer', color: '#666', fontWeight: 'bold' }}>
          🐛 Raw Error Object (Debug)
        </summary>
        <pre
style={{
          marginTop: '10px',
          padding: '10px',
          backgroundColor: '#f5f5f5',
          border: '1px solid #ddd',
          overflow: 'auto',
          maxHeight: '300px',
          fontSize: '11px',
        }}
        >
          {JSON.stringify(rawError, null, 2)}
        </pre>
      </details>
    </div>
  );
}

