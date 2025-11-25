import { NextRequest, NextResponse } from 'next/server';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type Stripe from 'stripe';

import { getStripeClient } from '@/lib/stripe/server';

const getSupabaseAdmin = (): SupabaseClient => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Credenciais do Supabase não configuradas.');
  }

  return createClient(supabaseUrl, supabaseServiceKey);
};

const updateAppointmentStatus = async ({
  appointmentId,
  paymentId,
  paymentStatus,
  amount
}: {
  appointmentId: string;
  paymentId: string;
  paymentStatus: Stripe.Checkout.Session.PaymentStatus;
  amount: number | null;
}) => {
  const statusMap: Record<Stripe.Checkout.Session.PaymentStatus, string> = {
    paid: 'confirmed',
    unpaid: 'pending',
    no_payment_required: 'confirmed'
  };

  const appointmentStatus = statusMap[paymentStatus] ?? 'pending';

  const { error } = await getSupabaseAdmin()
    .from('appointments')
    .update({
      status: appointmentStatus,
      payment_id: paymentId,
      payment_status: paymentStatus,
      payment_amount: amount,
      updated_at: new Date().toISOString()
    })
    .eq('id', appointmentId);

  if (error) {
    throw error;
  }
};

export async function POST(request: NextRequest) {
  const stripe = getStripeClient();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET não configurado.');
    return NextResponse.json({ error: 'Configuração ausente' }, { status: 500 });
  }

  const signature = request.headers.get('stripe-signature');
  if (!signature) {
    return NextResponse.json({ error: 'Assinatura não fornecida' }, { status: 400 });
  }

  const payload = await request.text();

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (err) {
    console.error('Falha na verificação do webhook Stripe:', err);
    return NextResponse.json({ error: 'Assinatura inválida' }, { status: 400 });
  }

  try {
    if (event.type === 'checkout.session.completed' || event.type === 'checkout.session.async_payment_succeeded') {
      const session = event.data.object as Stripe.Checkout.Session;
      const metadata = session.metadata ?? {};

      if (metadata.appointmentId) {
        await updateAppointmentStatus({
          appointmentId: metadata.appointmentId,
          paymentId: session.payment_intent ? String(session.payment_intent) : session.id,
          paymentStatus: session.payment_status,
          amount: session.amount_total
        });
        console.log(`Agendamento ${metadata.appointmentId} atualizado para ${session.payment_status}`);
      }
    }

    if (event.type === 'checkout.session.async_payment_failed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const metadata = session.metadata ?? {};
      if (metadata.appointmentId) {
        await updateAppointmentStatus({
          appointmentId: metadata.appointmentId,
          paymentId: session.payment_intent ? String(session.payment_intent) : session.id,
          paymentStatus: 'unpaid',
          amount: session.amount_total
        });
        console.warn(`Pagamento falhou para agendamento ${metadata.appointmentId}`);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Erro ao processar webhook Stripe:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ message: 'Stripe webhook ativo' });
}

