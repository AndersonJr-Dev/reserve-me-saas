import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function getSupabaseAdmin() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !key) return null;
  return createClient(supabaseUrl, key);
}

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
    const supabaseService = getSupabaseAdmin();
    if (!supabaseService) {
      console.error('Supabase admin credentials missing for /api/auth/me');
      return NextResponse.json({ error: 'Configuração do servidor incompleta' }, { status: 500 });
    }

    // Criar cliente com token do usuário
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Supabase client keys missing for /api/auth/me');
      return NextResponse.json({ error: 'Configuração do servidor incompleta' }, { status: 500 });
    }

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
      .select('*, salons(slug, plan_type, subscription_status)')
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

    // Buscar slug do salão com fallback se relação não estiver configurada
    let salonSlug = userData.salons?.slug || null;
    const planType = userData.salons?.plan_type || null;
    let subscriptionStatus = userData.salons?.subscription_status || null;
    if (!salonSlug && userData.salon_id) {
      const { data: salonData, error: salonError } = await supabaseService
        .from('salons')
        .select('slug')
        .eq('id', userData.salon_id)
        .single();

      if (!salonError && salonData?.slug) {
        salonSlug = salonData.slug;
      }
    }

    if (userData.salons && planType === 'basic' && subscriptionStatus === 'inactive' && user.email_confirmed_at) {
      await supabaseService
        .from('salons')
        .update({ subscription_status: 'active', updated_at: new Date().toISOString() })
        .eq('id', userData.salon_id);
      subscriptionStatus = 'active';
    }

    return NextResponse.json({
      user: {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        salonId: userData.salon_id,
        salonSlug,
        planType,
        subscriptionStatus
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
