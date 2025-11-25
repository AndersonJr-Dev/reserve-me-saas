"use client";

import Link from 'next/link';
import { XCircle, ArrowLeft, RefreshCw } from 'lucide-react';

interface Props {
  initial: {
    status: string | null;
    statusDetail: string | null;
  };
}

export default function FailureClient({ initial }: Props) {
  const { status, statusDetail } = initial;

  const getErrorMessage = () => {
    if (status === 'expired') {
      return 'Sessão expirada. Gere um novo link de pagamento.';
    }

    if (status === 'cancelled') {
      return 'O checkout foi cancelado antes de concluir o pagamento.';
    }

    if (statusDetail) {
      switch (statusDetail) {
        case 'card_declined':
          return 'Cartão recusado pelo emissor.';
        case 'incorrect_cvc':
          return 'Código de segurança inválido.';
        case 'expired_card':
          return 'Cartão expirado.';
        default:
          return 'Pagamento não foi aprovado.';
      }
    }

    return 'Pagamento não foi aprovado.';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-xl p-8 shadow-sm border text-center">
          <XCircle className="w-20 h-20 text-red-500 mx-auto mb-6" />
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Pagamento Não Aprovado</h1>
          
          <p className="text-gray-600 mb-4">{getErrorMessage()}</p>

          <p className="text-sm text-gray-500 mb-8">Não se preocupe, seu agendamento não foi confirmado. Você pode tentar novamente com outro método de pagamento.</p>

          <div className="space-y-4">
            <Link href="/checkout" className="w-full bg-orange-500 text-white py-3 px-6 rounded-lg hover:bg-orange-600 transition-colors font-semibold flex items-center justify-center">
              <RefreshCw className="w-5 h-5 mr-2" />
              Tentar Novamente
            </Link>
            
            <Link href="/" className="w-full bg-gray-500 text-white py-3 px-6 rounded-lg hover:bg-gray-600 transition-colors font-semibold flex items-center justify-center">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Voltar ao Início
            </Link>
            
            <p className="text-sm text-gray-500">Precisa de ajuda? Entre em contato: <a href="mailto:reserve.me.suporte@gmail.com" className="text-orange-500 hover:underline ml-1">reserve.me.suporte@gmail.com</a></p>
          </div>
        </div>
      </div>
    </div>
  );
}
