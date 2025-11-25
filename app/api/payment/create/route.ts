import { NextRequest, NextResponse } from 'next/server';
import type Stripe from 'stripe';

import { getPlanPriceId, getStripeClient } from '@/lib/stripe/server';

type PlanKey = 'basic' | 'advanced' | 'premium';

type CheckoutPayload = {
  appointmentId?: string;
  serviceName?: string;
  professionalName?: string;
  price?: number | string;
  customerName?: string;
  customerEmail?: string;
  salonName?: string;
  planKey?: PlanKey;
  successPath?: string;
  cancelPath?: string;
};

const REQUIRED_APPOINTMENT_FIELDS: Array<keyof Required<CheckoutPayload>> = [
  'appointmentId',
  'serviceName',
  'professionalName',
  'price',
  'customerName'
];

const normalizeNumber = (value?: number | string): number | null => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string' && value.trim().length > 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

const buildRedirectUrl = (origin: string, path?: string) => {
  if (!path) return origin;
  if (path.startsWith('http')) return path;
  const formattedPath = path.startsWith('/') ? path : `/${path}`;
  return `${origin}${formattedPath}`;
};

const validateAppointmentPayload = (payload: CheckoutPayload): string | null => {
  const missingField = REQUIRED_APPOINTMENT_FIELDS.find((field) => !payload[field]);
  if (missingField) {
    return `Campo obrigatório ausente: ${missingField}`;
  }

  const normalizedPrice = normalizeNumber(payload.price);
  if (!normalizedPrice || normalizedPrice <= 0) {
    return 'Preço inválido';
  }

  return null;
};

const formatMetadata = (payload: CheckoutPayload) => ({
  appointmentId: payload.appointmentId ?? '',
  serviceName: payload.serviceName ?? '',
  professionalName: payload.professionalName ?? '',
  customerName: payload.customerName ?? '',
  salonName: payload.salonName ?? '',
  purchaseType: payload.planKey ? `plan-${payload.planKey}` : 'appointment'
});

const withSessionResponse = (session: Stripe.Checkout.Session) =>
  NextResponse.json({
    sessionId: session.id,
    checkoutUrl: session.url
  });

export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json()) as CheckoutPayload;
    const origin = process.env.NEXT_PUBLIC_BASE_URL || new URL(request.url).origin;
    const successUrl = `${buildRedirectUrl(origin, payload.successPath || '/payment/success')}?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${buildRedirectUrl(origin, payload.cancelPath || '/payment/failure')}?session_id={CHECKOUT_SESSION_ID}&status=cancelled`;

    const stripe = getStripeClient();

    if (payload.planKey) {
      const planKey = payload.planKey;
      if (!['basic', 'advanced', 'premium'].includes(planKey)) {
        return NextResponse.json({ error: 'Plano inválido' }, { status: 400 });
      }

      const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        customer_email: payload.customerEmail,
        payment_method_types: ['card'],
        line_items: [
          {
            price: getPlanPriceId(planKey),
            quantity: 1
          }
        ],
        metadata: {
          ...formatMetadata(payload),
          planKey
        },
        success_url: successUrl,
        cancel_url: cancelUrl
      });

      return withSessionResponse(session);
    }

    const validationError = validateAppointmentPayload(payload);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const normalizedPrice = normalizeNumber(payload.price) as number;
    const unitAmount = Math.round(normalizedPrice * 100);

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: payload.customerEmail,
      payment_method_types: ['card'],
      allow_promotion_codes: true,
      line_items: [
        {
          price_data: {
            currency: 'brl',
            unit_amount: unitAmount,
            product_data: {
              name: `${payload.serviceName} - ${payload.professionalName}`,
              description: payload.salonName ? `Serviço em ${payload.salonName}` : undefined
            }
          },
          quantity: 1
        }
      ],
      metadata: formatMetadata(payload),
      success_url: successUrl,
      cancel_url: cancelUrl
    });

    return withSessionResponse(session);
  } catch (error) {
    console.error('Erro ao criar sessão do Stripe:', error);
    return NextResponse.json({ error: 'Erro ao iniciar o checkout' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json({ error: 'session_id não informado' }, { status: 400 });
    }

    const stripe = getStripeClient();
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['payment_intent', 'subscription']
    });

    return NextResponse.json({
      id: session.id,
      amountTotal: session.amount_total,
      currency: session.currency,
      paymentStatus: session.payment_status,
      metadata: session.metadata,
      customerEmail: session.customer_details?.email ?? session.customer_email ?? null,
      paymentIntentId: typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id ?? null,
      subscriptionId: typeof session.subscription === 'string' ? session.subscription : session.subscription?.id ?? null
    });
  } catch (error) {
    console.error('Erro ao consultar sessão do Stripe:', error);
    return NextResponse.json({ error: 'Erro ao consultar pagamento' }, { status: 500 });
  }
}

