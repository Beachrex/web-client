'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

import PaymentResult from '@/components/Payment/PaymentResult';

/** Shown after a successful Stripe Checkout payment (backend `success_url`). */
function PaymentSuccessPageContent() {
  const searchParams = useSearchParams();
  return <PaymentResult variant="success" sessionId={searchParams.get('session_id')} />;
}

/** `useSearchParams` needs a Suspense boundary on a statically rendered (ISR) page. */
export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={null}>
      <PaymentSuccessPageContent />
    </Suspense>
  );
}
