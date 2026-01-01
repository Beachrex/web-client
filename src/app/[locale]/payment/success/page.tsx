'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

/**
 * Payment Success Page
 *
 * Displayed after successful Stripe Checkout payment.
 * Shows confirmation and credits granted.
 */
export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    // Countdown timer
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Redirect to internal pages after countdown
          window.location.href = '/internal/ai-entitlements';
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div
style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f0f9ff',
      padding: '20px',
    }}
    >
      <div
style={{
        maxWidth: '600px',
        width: '100%',
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '40px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        textAlign: 'center',
      }}
      >
        {/* Success Icon */}
        <div
style={{
          width: '80px',
          height: '80px',
          margin: '0 auto 20px',
          backgroundColor: '#10b981',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '48px',
          color: 'white',
        }}
        >
          ✓
        </div>

        {/* Title */}
        <h1
style={{
          fontSize: '32px',
          fontWeight: 'bold',
          color: '#1f2937',
          marginBottom: '16px',
        }}
        >
          Payment Successful!
        </h1>

        {/* Message */}
        <p
style={{
          fontSize: '18px',
          color: '#6b7280',
          marginBottom: '24px',
          lineHeight: '1.6',
        }}
        >
          Thank you for your purchase! Your credits have been added to your account.
        </p>

        {/* Session ID */}
        {sessionId && (
          <div
style={{
            backgroundColor: '#f3f4f6',
            padding: '16px',
            borderRadius: '6px',
            marginBottom: '24px',
          }}
          >
            <p
style={{
              fontSize: '14px',
              color: '#6b7280',
              marginBottom: '8px',
            }}
            >
              Session ID:
            </p>
            <p
style={{
              fontSize: '12px',
              fontFamily: 'monospace',
              color: '#374151',
              wordBreak: 'break-all',
            }}
            >
              {sessionId}
            </p>
          </div>
        )}

        {/* Countdown */}
        <p
style={{
          fontSize: '16px',
          color: '#6b7280',
          marginBottom: '24px',
        }}
        >
          Redirecting to your entitlements in <strong>{countdown}</strong> seconds...
        </p>

        {/* Action Buttons */}
        <div
style={{
          display: 'flex',
          gap: '12px',
          flexDirection: 'column',
        }}
        >
          <Link
            href="/ai/itinerary"
            style={{
              display: 'block',
              padding: '12px 24px',
              backgroundColor: '#3b82f6',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '6px',
              fontWeight: '600',
              fontSize: '16px',
            }}
          >
            Generate Itinerary
          </Link>

          <Link
            href="/ai/chat"
            style={{
              display: 'block',
              padding: '12px 24px',
              backgroundColor: '#10b981',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '6px',
              fontWeight: '600',
              fontSize: '16px',
            }}
          >
            Try AI Chat
          </Link>

          <Link
            href="/"
            style={{
              display: 'block',
              padding: '12px 24px',
              backgroundColor: '#6b7280',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '6px',
              fontWeight: '600',
              fontSize: '16px',
            }}
          >
            Go to Homepage
          </Link>
        </div>

        {/* Info */}
        <p
style={{
          fontSize: '14px',
          color: '#9ca3af',
          marginTop: '32px',
          lineHeight: '1.5',
        }}
        >
          You will receive a confirmation email shortly. If you have any questions, please contact support.
        </p>
      </div>
    </div>
  );
}
