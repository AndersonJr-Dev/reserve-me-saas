import PendingClient from './PendingClient';

export default function PaymentPendingPage({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  const paymentId = Array.isArray(searchParams.payment_id) ? searchParams.payment_id[0] : (searchParams.payment_id as string) || null;

  return <PendingClient initial={{ paymentId }} />;
}

