'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

/**
 * Payment Cancel Page
 *
 * Displayed when user cancels Stripe Checkout.
 */
export default function PaymentCancelPage() {
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    // Countdown timer
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Redirect to purchase page after countdown
          window.location.href = '/internal/ai-purchase-itinerary';
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
      backgroundColor: '#fef2f2',
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
        {/* Cancel Icon */}
        <div
style={{
          width: '80px',
          height: '80px',
          margin: '0 auto 20px',
          backgroundColor: '#ef4444',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '48px',
          color: 'white',
        }}
        >
          ✕
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
          Payment Cancelled
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
          Your payment was cancelled. No charges were made to your account.
        </p>

        {/* Info Box */}
        <div
style={{
          backgroundColor: '#fef3c7',
          padding: '16px',
          borderRadius: '6px',
          marginBottom: '24px',
          border: '1px solid #fbbf24',
        }}
        >
          <p
style={{
            fontSize: '14px',
            color: '#92400e',
            lineHeight: '1.5',
          }}
          >
            💡 <strong>Tip:</strong> You can try again anytime. Your cart is still available.
          </p>
        </div>

        {/* Countdown */}
        <p
style={{
          fontSize: '16px',
          color: '#6b7280',
          marginBottom: '24px',
        }}
        >
          Redirecting to purchase page in <strong>{countdown}</strong> seconds...
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
            href="/internal/ai-purchase-itinerary"
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
            Try Again
          </Link>

          <Link
            href="/internal/ai-entitlements"
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
            View My Credits
          </Link>

          <Link
            href="/"
            style={{
              display: 'block',
              padding: '12px 24px',
              backgroundColor: '#9ca3af',
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

        {/* Help */}
        <p
style={{
          fontSize: '14px',
          color: '#9ca3af',
          marginTop: '32px',
          lineHeight: '1.5',
        }}
        >
          Need help? Contact our support team.
        </p>
      </div>
    </div>
  );
}
