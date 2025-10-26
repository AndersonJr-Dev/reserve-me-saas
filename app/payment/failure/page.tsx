import FailureClient from './FailureClient';

export default function PaymentFailurePage({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  const status = Array.isArray(searchParams.status) ? searchParams.status[0] : (searchParams.status as string) || null;
  const statusDetail = Array.isArray(searchParams.status_detail) ? searchParams.status_detail[0] : (searchParams.status_detail as string) || null;

  return <FailureClient initial={{ status, statusDetail }} />;
}

