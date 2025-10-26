import { Suspense } from 'react';
import CadastroForm from './CadastroForm';

// Forçar renderização dinâmica para páginas com useSearchParams
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const dynamicParams = true;
export const fetchCache = 'force-no-store';

export default function CadastroPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Suspense fallback={
          <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando formulário...</p>
          </div>
        }>
          <CadastroForm />
        </Suspense>
      </div>
    </div>
  );
}
