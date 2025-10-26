"use client";

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CreditCard, Smartphone, CheckCircle, XCircle } from 'lucide-react';

interface AppointmentData {
  id: string;
  serviceName: string;
  professionalName: string;
  price: number;
  customerName: string;
  customerEmail: string;
  salonName: string;
  appointmentDate: string;
  appointmentTime: string;
}

interface Props {
  initialData: AppointmentData;
}

export default function CheckoutClient({ initialData }: Props) {
  const [appointmentData] = useState<AppointmentData | null>(initialData || null);
  const [loading] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePayment = async () => {
    if (!appointmentData) return;

    setPaymentLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/payment/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          appointmentId: appointmentData.id,
          serviceName: appointmentData.serviceName,
          professionalName: appointmentData.professionalName,
          price: appointmentData.price,
          customerName: appointmentData.customerName,
          customerEmail: appointmentData.customerEmail,
          salonName: appointmentData.salonName
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Redirecionar para o Mercado Pago
        if (data.initPoint) {
          window.location.href = data.initPoint;
        } else if (data.url) {
          window.location.href = data.url;
        } else {
          setError('Resposta inválida do servidor de pagamento');
        }
      } else {
        setError(data.error || 'Erro ao processar pagamento');
      }
    } catch (error) {
      console.error('Erro:', error);
      setError('Erro ao processar pagamento');
    } finally {
      setPaymentLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!appointmentData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Dados não encontrados</h1>
          <p className="text-gray-600 mb-4">Não foi possível carregar os dados do agendamento.</p>
          <Link 
            href="/"
            className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors"
          >
            Voltar ao início
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-4">
            <Link 
              href="/"
              className="flex items-center text-gray-600 hover:text-orange-500 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Voltar
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 ml-4">Finalizar Pagamento</h1>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Resumo do Agendamento */}
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Resumo do Agendamento</h2>
            
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Salão:</span>
                <span className="font-semibold">{appointmentData.salonName}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Serviço:</span>
                <span className="font-semibold">{appointmentData.serviceName}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Profissional:</span>
                <span className="font-semibold">{appointmentData.professionalName}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Data:</span>
                <span className="font-semibold">{appointmentData.appointmentDate}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Horário:</span>
                <span className="font-semibold">{appointmentData.appointmentTime}</span>
              </div>
              
              <div className="border-t pt-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span className="text-orange-500">R$ {appointmentData.price.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Forma de Pagamento */}
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Forma de Pagamento</h2>
            
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <div className="flex items-center">
                  <XCircle className="w-5 h-5 text-red-500 mr-2" />
                  <span className="text-red-700">{error}</span>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div className="border border-gray-200 rounded-lg p-4 hover:border-orange-500 transition-colors cursor-pointer">
                <div className="flex items-center">
                  <CreditCard className="w-6 h-6 text-gray-600 mr-3" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Cartão de Crédito/Débito</h3>
                    <p className="text-sm text-gray-600">Visa, Mastercard, Elo</p>
                  </div>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4 hover:border-orange-500 transition-colors cursor-pointer">
                <div className="flex items-center">
                  <Smartphone className="w-6 h-6 text-gray-600 mr-3" />
                  <div>
                    <h3 className="font-semibold text-gray-900">PIX</h3>
                    <p className="text-sm text-gray-600">Pagamento instantâneo</p>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={handlePayment}
              disabled={paymentLoading}
              className="w-full bg-orange-500 text-white py-4 rounded-lg hover:bg-orange-600 transition-colors font-semibold text-lg mt-8 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {paymentLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Processando...
                </>
              ) : (
                'Pagar com Mercado Pago'
              )}
            </button>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Pagamento seguro processado pelo Mercado Pago
              </p>
              <div className="flex items-center justify-center mt-2 space-x-4 text-xs text-gray-500">
                <span className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  SSL Seguro
                </span>
                <span className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Dados Protegidos
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
