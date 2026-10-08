import PaymentResult from '@/components/Payment/PaymentResult';

/** Shown when the visitor cancels Stripe Checkout (backend `cancel_url`). */
export default function PaymentCancelPage() {
  return <PaymentResult variant="cancel" />;
}
