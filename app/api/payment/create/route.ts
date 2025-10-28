import { NextRequest, NextResponse } from 'next/server';
import { MercadoPagoConfig, Payment, Preference } from 'mercadopago';

function getMercadoPago() {
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!accessToken) return null;
  const client = new MercadoPagoConfig({
    accessToken,
    options: { timeout: 5000, idempotencyKey: 'abc' }
  });
  return {
    payment: new Payment(client),
    preference: new Preference(client)
  };
}

// POST /api/payment/create - Criar preferência de pagamento
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      appointmentId, 
      serviceName, 
      professionalName, 
      price, 
      customerName, 
      customerEmail,
      salonName 
    } = body;

    if (!appointmentId || !serviceName || !price || !customerName || !customerEmail) {
      return NextResponse.json(
        { error: 'Dados obrigatórios não fornecidos' },
        { status: 400 }
      );
    }

    const mp = getMercadoPago();
    if (!mp) {
      console.error('MERCADOPAGO_ACCESS_TOKEN is not set');
      return NextResponse.json({ error: 'Configuração do servidor de pagamento ausente' }, { status: 500 });
    }

    // Base URL dinâmica (fallback para o origin da requisição)
    const origin = process.env.NEXT_PUBLIC_BASE_URL || new URL(request.url).origin;

    // Criar preferência de pagamento
    const preferenceData = {
      items: [
        {
          id: appointmentId,
          title: `${serviceName} - ${professionalName}`,
          description: `Agendamento com ${professionalName} na ${salonName}`,
          quantity: 1,
          unit_price: parseFloat(price),
          currency_id: 'BRL'
        }
      ],
      payer: {
        name: customerName,
        email: customerEmail
      },
      back_urls: {
        success: `${origin}/payment/success`,
        failure: `${origin}/payment/failure`,
        pending: `${origin}/payment/pending`
      },
      auto_return: 'approved',
      notification_url: `${origin}/api/payment/webhook`,
      external_reference: appointmentId,
      payment_methods: {
        default_payment_method_id: 'pix'
      },
      metadata: {
        appointment_id: appointmentId,
        salon_name: salonName,
        professional_name: professionalName,
        service_name: serviceName
      }
    };

  const result = await mp.preference.create({ body: preferenceData });

    return NextResponse.json({
      preferenceId: result.id,
      initPoint: result.init_point,
      sandboxInitPoint: result.sandbox_init_point
    });

  } catch (error) {
    console.error('Erro ao criar preferência de pagamento:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// GET /api/payment/create - Verificar status de pagamento
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const paymentId = searchParams.get('payment_id');

    if (!paymentId) {
      return NextResponse.json(
        { error: 'ID do pagamento não fornecido' },
        { status: 400 }
      );
    }

    const mp = getMercadoPago();
    if (!mp) {
      console.error('MERCADOPAGO_ACCESS_TOKEN is not set');
      return NextResponse.json({ error: 'Configuração do servidor de pagamento ausente' }, { status: 500 });
    }

    const result = await mp.payment.get({ id: paymentId });

    return NextResponse.json({
      id: result.id,
      status: result.status,
      statusDetail: result.status_detail,
      transactionAmount: result.transaction_amount,
      externalReference: result.external_reference
    });

  } catch (error) {
    console.error('Erro ao verificar pagamento:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

