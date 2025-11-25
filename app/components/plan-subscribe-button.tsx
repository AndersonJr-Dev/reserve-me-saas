'use client';

import { useState } from 'react';

type PlanKey = 'basic' | 'advanced' | 'premium';

type PlanSubscribeButtonProps = {
  planKey: PlanKey;
  label?: string;
  buttonClassName?: string;
};

const PlanSubscribeButton = ({ planKey, label = 'Assinar Agora', buttonClassName = '' }: PlanSubscribeButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubscribeClick = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/payment/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          planKey
        })
      });

      const data = await response.json();

      if (!response.ok || !data.checkoutUrl) {
        throw new Error(data.error || 'Não foi possível iniciar o pagamento.');
      }

      window.location.href = data.checkoutUrl as string;
    } catch (error) {
      console.error('Erro ao criar sessão do plano:', error);
      setErrorMessage('Erro ao iniciar pagamento. Tente novamente.');
      setIsLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleSubscribeClick}
        disabled={isLoading}
        className={`w-full rounded-lg font-semibold text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${buttonClassName}`}
      >
        {isLoading ? 'Carregando...' : label}
      </button>
      {errorMessage ? (
        <p className="text-xs text-red-600 mt-2 text-center">{errorMessage}</p>
      ) : null}
    </div>
  );
};

export default PlanSubscribeButton;


