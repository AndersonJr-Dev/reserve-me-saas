import PendingClient from './PendingClient';

export default function PaymentPendingPage({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  const sessionId = Array.isArray(searchParams.session_id) ? searchParams.session_id[0] : (searchParams.session_id as string) || null;

  return <PendingClient initial={{ sessionId }} />;
}

