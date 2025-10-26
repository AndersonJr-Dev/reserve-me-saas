import SuccessClient from './SuccessClient';

export default function PaymentSuccessPage({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  const paymentId = Array.isArray(searchParams.payment_id) ? searchParams.payment_id[0] : (searchParams.payment_id as string) || null;
  const externalReference = Array.isArray(searchParams.external_reference) ? searchParams.external_reference[0] : (searchParams.external_reference as string) || null;

  return <SuccessClient initial={{ paymentId, externalReference }} />;
}

