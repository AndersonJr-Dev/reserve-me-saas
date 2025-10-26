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

    // Verificar variáveis de ambiente
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Variáveis de ambiente do Supabase não configuradas');
      return NextResponse.json(
        { error: 'Configuração do servidor incompleta' },
        { status: 500 }
      );
    }

    // Criar cliente com service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Criar usuário na autenticação do Supabase
    console.log('📝 Tentando criar usuário auth com email:', email);
    
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
      console.error('❌ Erro ao criar usuário auth:', authError);
      console.error('❌ Detalhes do erro:', JSON.stringify(authError, null, 2));
      return NextResponse.json(
        { 
          error: `Erro ao criar conta: ${authError?.message || 'Erro desconhecido'}`,
          errorCode: authError?.status || null
        },
        { status: 500 }
      );
    }

    console.log('✅ Usuário auth criado com sucesso, ID:', authData.user.id);

    // Criar salão
    console.log('🏢 Tentando criar salão com slug:', salon.slug);
    
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
      console.error('❌ Erro ao criar salão:', salonError);
      console.error('❌ Detalhes:', JSON.stringify(salonError, null, 2));
      
      // Se falhar ao criar salão, tentar deletar o usuário auth criado
      console.log('🧹 Limpando usuário auth criado...');
      await supabase.auth.admin.deleteUser(authData.user.id);
      
      return NextResponse.json(
        { 
          error: `Erro ao criar estabelecimento: ${salonError?.message || 'Erro desconhecido'}`,
          details: salonError?.details || null
        },
        { status: 500 }
      );
    }

    console.log('✅ Salão criado com sucesso, ID:', salonData.id);

    // Criar usuário na tabela users
    console.log('👤 Tentando criar usuário na tabela users...');
    
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
      console.error('❌ Erro ao criar usuário na tabela:', userError);
      console.error('❌ Detalhes:', JSON.stringify(userError, null, 2));
      
      // Se falhar ao criar usuário na tabela, tentar limpar o salão e usuário auth
      console.log('🧹 Limpando dados criados...');
      await supabase.from('salons').delete().eq('id', salonData.id);
      await supabase.auth.admin.deleteUser(authData.user.id);
      
      return NextResponse.json(
        { 
          error: `Erro ao criar registro de usuário: ${userError?.message || 'Erro desconhecido'}`,
          details: userError?.details || null
        },
        { status: 500 }
      );
    }

    console.log('✅ Usuário criado na tabela users com sucesso!');

    // Fazer login automático após criar conta
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (loginError || !loginData.session) {
      console.error('❌ Erro ao fazer login automático:', loginError);
      // Retornar erro mas ainda assim retornar dados do usuário
    }

    console.log('🎉 Usuário criado com sucesso! Todos os passos completados.');
    
    // Criar resposta
    const response = NextResponse.json({
      success: true,
      user: {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        salonId: userData.salon_id
      },
      salon: salonData,
      message: 'Conta criada com sucesso!',
      token: loginData?.session?.access_token || null
    });

    // Salvar token no cookie
    if (loginData?.session?.access_token) {
      response.cookies.set('sb-access-token', loginData.session.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 // 24 horas
      });
    }

    return response;
  } catch (error) {
    console.error('💥 Erro fatal no registro:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('💥 Stack:', error instanceof Error ? error.stack : 'N/A');
    return NextResponse.json(
      { error: `Erro interno do servidor: ${errorMessage}` },
      { status: 500 }
    );
  }
}
