import { Suspense } from 'react';
import AgendamentosClient from './AgendamentosClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const dynamicParams = true;
export const fetchCache = 'force-no-store';

export default function AgendamentosPage() {
  return (
    <Suspense fallback={<div className="text-sm text-gray-700">Carregando filtros...</div>}>
      <AgendamentosClient />
    </Suspense>
  );
}
