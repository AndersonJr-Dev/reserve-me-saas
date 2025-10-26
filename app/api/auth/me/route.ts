import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// GET /api/auth/me - Verificar usuário autenticado
export async function GET() {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('sb-access-token')?.value;

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    // Criar cliente com service role key para buscar dados
    const supabaseService = createClient(
      supabaseUrl, 
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Criar cliente com token do usuário
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    });

    // Buscar usuário autenticado
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    console.log('🔍 Buscando usuário na tabela users para ID:', user.id);
    
    // Buscar dados completos do usuário na tabela users usando service role
    const { data: userData, error: userError } = await supabaseService
      .from('users')
      .select('*, salons(slug)')
      .eq('id', user.id)
      .single();

    if (userError || !userData) {
      console.error('❌ Usuário não encontrado na tabela users:', userError);
      // Se não encontrar na tabela users, retornar dados básicos
      return NextResponse.json({
        user: {
          id: user.id,
          name: user.user_metadata?.name || user.email,
          email: user.email,
          role: user.user_metadata?.role || 'owner',
          salonId: user.user_metadata?.salon_id
        }
      });
    }

    console.log('✅ Usuário encontrado:', userData.name);

    // Buscar slug do salão
    const salonSlug = userData.salons?.slug || null;

    return NextResponse.json({
      user: {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        salonId: userData.salon_id,
        salonSlug: salonSlug
      }
    });
  } catch (error) {
    console.error('Erro ao verificar autenticação:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
