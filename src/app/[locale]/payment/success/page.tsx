'use client';

import { useSearchParams } from 'next/navigation';

import PaymentResult from '@/components/Payment/PaymentResult';

/** Shown after a successful Stripe Checkout payment (backend `success_url`). */
export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  return <PaymentResult variant="success" sessionId={searchParams.get('session_id')} />;
}
