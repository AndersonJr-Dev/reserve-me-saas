import Stripe from 'stripe';

const STRIPE_API_VERSION: Stripe.StripeConfig['apiVersion'] = '2024-11-20.acacia';

let stripeSingleton: Stripe | null = null;

const getStripeSecretKey = () => {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY não está configurada. Defina-a no arquivo .env.local.');
  }
  return secretKey;
};

export const getStripeClient = (): Stripe => {
  if (stripeSingleton) {
    return stripeSingleton;
  }

  stripeSingleton = new Stripe(getStripeSecretKey(), {
    apiVersion: STRIPE_API_VERSION,
    typescript: true
  });

  return stripeSingleton;
};

export const STRIPE_PLAN_PRICE_IDS = {
  basic: process.env.STRIPE_PRICE_BASIC ?? '',
  advanced: process.env.STRIPE_PRICE_ADVANCED ?? '',
  premium: process.env.STRIPE_PRICE_PREMIUM ?? ''
} as const;

type PlanKey = keyof typeof STRIPE_PLAN_PRICE_IDS;

export const getPlanPriceId = (planKey: PlanKey): string => {
  const priceId = STRIPE_PLAN_PRICE_IDS[planKey];
  if (!priceId) {
    throw new Error(`Price ID não configurado para o plano ${planKey}. Defina STRIPE_PRICE_${planKey.toUpperCase()} no .env.local.`);
  }
  return priceId;
};


