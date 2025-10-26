import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

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

    // Criar cliente com service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Criar usuário na autenticação do Supabase
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        name,
        salon_slug: salon.slug
      }
    });

    if (authError || !authData.user) {
      console.error('Erro ao criar usuário auth:', authError);
      return NextResponse.json(
        { error: 'Erro ao criar conta de usuário' },
        { status: 500 }
      );
    }

    // Criar salão
    const { data: salonData, error: salonError } = await supabase
      .from('salons')
      .insert([{
        name: salon.name,
        slug: salon.slug,
        description: salon.description,
        phone: salon.phone,
        email: salon.email,
        address: salon.address,
        owner_id: authData.user.id
      }])
      .select()
      .single();

    if (salonError || !salonData) {
      console.error('Erro ao criar salão:', salonError);
      return NextResponse.json(
        { error: 'Erro ao criar estabelecimento' },
        { status: 500 }
      );
    }

    // Criar usuário na tabela users
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert([{
        id: authData.user.id,
        name,
        email,
        role: 'owner',
        salon_id: salonData.id,
        is_active: true
      }])
      .select()
      .single();

    if (userError || !userData) {
      console.error('Erro ao criar usuário na tabela:', userError);
      return NextResponse.json(
        { error: 'Erro ao criar registro de usuário' },
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
