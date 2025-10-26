import { NextRequest, NextResponse } from 'next/server';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

function getMercadoPagoPayment(): Payment {
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!accessToken) throw new Error('MERCADOPAGO_ACCESS_TOKEN is not defined');

  const client = new MercadoPagoConfig({
    accessToken,
    options: {
      timeout: 5000,
      idempotencyKey: 'abc'
    }
  });

  return new Payment(client);
}

function getSupabaseAdmin(): SupabaseClient {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase admin credentials are not set (NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY)');
  }

  return createClient(supabaseUrl, supabaseServiceKey);
}

// POST /api/payment/webhook - Receber notificações do Mercado Pago
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, data } = body;

    console.log('Webhook recebido:', { type, data });

    if (type === 'payment') {
      const paymentId = data.id;
      
  // Buscar detalhes do pagamento
  const paymentDetails = await getMercadoPagoPayment().get({ id: paymentId });
      
      console.log('Detalhes do pagamento:', {
        id: paymentDetails.id,
        status: paymentDetails.status,
        external_reference: paymentDetails.external_reference,
        transaction_amount: paymentDetails.transaction_amount
      });

      const appointmentId = paymentDetails.external_reference;
      
      if (!appointmentId) {
        console.error('External reference não encontrado');
        return NextResponse.json({ error: 'External reference não encontrado' }, { status: 400 });
      }

      // Atualizar status do agendamento baseado no status do pagamento
      let appointmentStatus = 'pending';
      
      switch (paymentDetails.status) {
        case 'approved':
          appointmentStatus = 'confirmed';
          break;
        case 'rejected':
        case 'cancelled':
          appointmentStatus = 'cancelled';
          break;
        case 'pending':
          appointmentStatus = 'pending';
          break;
        default:
          appointmentStatus = 'pending';
      }

      // Atualizar agendamento no banco de dados
      const { error: updateError } = await getSupabaseAdmin()
        .from('appointments')
        .update({
          status: appointmentStatus,
          payment_id: paymentId,
          payment_status: paymentDetails.status,
          payment_amount: paymentDetails.transaction_amount,
          updated_at: new Date().toISOString()
        })
        .eq('id', appointmentId);

      if (updateError) {
        console.error('Erro ao atualizar agendamento:', updateError);
        return NextResponse.json({ error: 'Erro ao atualizar agendamento' }, { status: 500 });
      }

      console.log(`Agendamento ${appointmentId} atualizado para status: ${appointmentStatus}`);

      // Se o pagamento foi aprovado, enviar confirmação por email/WhatsApp
      if (paymentDetails.status === 'approved') {
        // Aqui você pode adicionar lógica para enviar email/WhatsApp
        console.log(`Pagamento aprovado para agendamento ${appointmentId}`);
      }
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Erro no webhook:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// GET /api/payment/webhook - Para verificação do webhook
export async function GET() {
  return NextResponse.json({ message: 'Webhook endpoint ativo' });
}

