import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../src/lib/supabase/client';

// POST /api/auth/register - Criar conta
export async function POST(request: NextRequest) {
  try {
    const { name, email, password, salon } = await request.json();

    if (!name || !email || !password || !salon?.name || !salon?.slug) {
      return NextResponse.json(
        { error: 'Todos os campos são obrigatórios' },
        { status: 400 }
      );
    }

    // Criar salão
    const salonData = await db.createSalon({
      name: salon.name,
      slug: salon.slug,
      description: salon.description,
      phone: salon.phone,
      email: salon.email,
      address: salon.address
    });

    if (!salonData) {
      return NextResponse.json(
        { error: 'Erro ao criar estabelecimento' },
        { status: 500 }
      );
    }

    // Criar usuário real no Supabase
    const userData = await db.createUser({
      name,
      email,
      role: 'owner',
      salon_id: salonData.id
    });

    if (!userData) {
      return NextResponse.json(
        { error: 'Erro ao criar usuário' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      user: userData,
      salon: salonData,
      message: 'Conta criada com sucesso!'
    });
  } catch (error) {
    console.error('Erro no registro:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
