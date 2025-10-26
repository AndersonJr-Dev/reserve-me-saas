'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Clock, ArrowLeft, RefreshCw } from 'lucide-react';

export default function PaymentPendingPage() {
  const searchParams = useSearchParams();
  const paymentId = searchParams.get('payment_id');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-xl p-8 shadow-sm border text-center">
          <Clock className="w-20 h-20 text-yellow-500 mx-auto mb-6" />
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Pagamento Pendente
          </h1>
          
          <p className="text-gray-600 mb-4">
            Seu pagamento está sendo processado. Isso pode levar alguns minutos.
          </p>

          <p className="text-sm text-gray-500 mb-8">
            Você receberá uma confirmação por email assim que o pagamento for aprovado.
          </p>

          {paymentId && (
            <div className="bg-gray-50 rounded-lg p-4 mb-8">
              <p className="text-sm text-gray-600">
                <span className="font-semibold">ID do Pagamento:</span> {paymentId}
              </p>
            </div>
          )}

          <div className="space-y-4">
            <Link
              href="/"
              className="w-full bg-orange-500 text-white py-3 px-6 rounded-lg hover:bg-orange-600 transition-colors font-semibold flex items-center justify-center"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Voltar ao Início
            </Link>
            
            <p className="text-sm text-gray-500">
              Em caso de dúvidas, entre em contato: 
              <a href="mailto:reserve.me.suporte@gmail.com" className="text-orange-500 hover:underline ml-1">
                reserve.me.suporte@gmail.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
