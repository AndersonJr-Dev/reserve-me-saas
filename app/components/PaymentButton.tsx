'use client';

import { useState } from 'react';
import { CreditCard, Smartphone, CheckCircle } from 'lucide-react';

interface PaymentButtonProps {
  appointmentData: {
    id: string;
    serviceName: string;
    professionalName: string;
    price: number;
    customerName: string;
    customerEmail: string;
    salonName: string;
    appointmentDate: string;
    appointmentTime: string;
  };
  onPaymentSuccess?: () => void;
}

export default function PaymentButton({ appointmentData, onPaymentSuccess }: PaymentButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePayment = async () => {
    setLoading(true);
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
        window.location.href = data.initPoint;
      } else {
        setError(data.error || 'Erro ao processar pagamento');
      }
    } catch (error) {
      console.error('Erro:', error);
      setError('Erro ao processar pagamento');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Finalizar Pagamento</h3>
      
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-600">Total:</span>
          <span className="text-2xl font-bold text-orange-500">
            R$ {appointmentData.price.toFixed(2)}
          </span>
        </div>
        
        <div className="text-sm text-gray-500">
          {appointmentData.serviceName} com {appointmentData.professionalName}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <div className="flex items-center">
            <span className="text-red-700 text-sm">{error}</span>
          </div>
        </div>
      )}

      <div className="space-y-3 mb-6">
        <div className="flex items-center p-3 border border-gray-200 rounded-lg">
          <CreditCard className="w-5 h-5 text-gray-600 mr-3" />
          <div className="flex-1">
            <div className="font-medium text-gray-900">Cartão de Crédito/Débito</div>
            <div className="text-sm text-gray-600">Visa, Mastercard, Elo</div>
          </div>
        </div>

        <div className="flex items-center p-3 border border-gray-200 rounded-lg">
          <Smartphone className="w-5 h-5 text-gray-600 mr-3" />
          <div className="flex-1">
            <div className="font-medium text-gray-900">PIX</div>
            <div className="text-sm text-gray-600">Pagamento instantâneo</div>
          </div>
        </div>
      </div>

      <button
        onClick={handlePayment}
        disabled={loading}
        className="w-full bg-orange-500 text-white py-3 px-6 rounded-lg hover:bg-orange-600 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            Processando...
          </>
        ) : (
          <>
            <CreditCard className="w-5 h-5 mr-2" />
            Pagar com Mercado Pago
          </>
        )}
      </button>

      <div className="mt-4 text-center">
        <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
          <span className="flex items-center">
            <CheckCircle className="w-4 h-4 mr-1" />
            SSL Seguro
          </span>
          <span className="flex items-center">
            <CheckCircle className="w-4 h-4 mr-1" />
            Dados Protegidos
          </span>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Pagamento processado pelo Mercado Pago
        </p>
      </div>
    </div>
  );
}
