"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle, ArrowRight } from 'lucide-react';

interface Props {
  initial: {
    sessionId: string | null;
  };
}

type SessionData = {
  id: string;
  amountTotal: number | null;
  currency: string | null;
  paymentStatus: string;
  metadata?: Record<string, string>;
} | null;

const formatCurrency = (amount?: number | null, currency?: string | null) => {
  if (!amount || !currency) return null;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: currency.toUpperCase()
  }).format(amount / 100);
};

export default function SuccessClient({ initial }: Props) {
  const { sessionId } = initial;
  const [paymentData, setPaymentData] = useState<SessionData>(null);
  const [loading, setLoading] = useState<boolean>(!!sessionId);

  useEffect(() => {
    if (!sessionId) return;

    fetch(`/api/payment/create?session_id=${sessionId}`)
      .then(response => response.json())
      .then(data => {
        setPaymentData({
          id: data.id,
          amountTotal: data.amountTotal ?? null,
          currency: data.currency ?? 'brl',
          paymentStatus: data.paymentStatus ?? 'unknown',
          metadata: data.metadata
        });
        setLoading(false);
      })
      .catch(error => {
        console.error('Erro ao buscar dados do pagamento:', error);
        setLoading(false);
      });
  }, [sessionId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-xl p-8 shadow-sm border text-center">
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Pagamento Aprovado!</h1>
          
          <p className="text-gray-600 mb-8">Seu agendamento foi confirmado com sucesso. Você receberá um email de confirmação em breve.</p>

          {!sessionId && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 text-left">
              <p className="text-sm text-yellow-800">
                Não encontramos o identificador da sessão do Stripe. Caso tenha concluído o pagamento, entre em contato com o suporte para validar.
              </p>
            </div>
          )}

          {paymentData && (
            <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
              <h3 className="font-semibold text-gray-900 mb-4">Detalhes do Pagamento</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">ID do Pagamento:</span>
                  <span className="font-mono">{paymentData.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Valor:</span>
                  <span className="font-semibold">
                    {formatCurrency(paymentData.amountTotal, paymentData.currency) ?? '—'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="text-green-600 font-semibold">
                    {paymentData.paymentStatus === 'paid' ? 'Aprovado' : paymentData.paymentStatus}
                  </span>
                </div>
                {paymentData.metadata?.serviceName && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Serviço:</span>
                    <span className="font-semibold">{paymentData.metadata.serviceName}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="space-y-4">
            <Link href="/" className="w-full bg-orange-500 text-white py-3 px-6 rounded-lg hover:bg-orange-600 transition-colors font-semibold flex items-center justify-center">
              <ArrowRight className="w-5 h-5 mr-2" />
              Voltar ao Início
            </Link>
            
            <p className="text-sm text-gray-500">Em caso de dúvidas, entre em contato conosco: <a href="mailto:reserve.me.suporte@gmail.com" className="text-orange-500 hover:underline ml-1">reserve.me.suporte@gmail.com</a></p>
          </div>
        </div>
      </div>
    </div>
  );
}
