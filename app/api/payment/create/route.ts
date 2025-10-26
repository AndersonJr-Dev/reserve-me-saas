import { NextRequest, NextResponse } from 'next/server';
import { MercadoPagoConfig, Payment, Preference } from 'mercadopago';

if (!process.env.MERCADOPAGO_ACCESS_TOKEN) {
  throw new Error('MERCADOPAGO_ACCESS_TOKEN is not defined');
}

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
  options: {
    timeout: 5000,
    idempotencyKey: 'abc'
  }
});

const payment = new Payment(client);
const preference = new Preference(client);

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
        success: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/success`,
        failure: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/failure`,
        pending: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/pending`
      },
      auto_return: 'approved',
      notification_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/payment/webhook`,
      external_reference: appointmentId,
      metadata: {
        appointment_id: appointmentId,
        salon_name: salonName,
        professional_name: professionalName,
        service_name: serviceName
      }
    };

    const result = await preference.create({ body: preferenceData });

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

    const result = await payment.get({ id: paymentId });

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

