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
      .select('*, salons(slug, plan_type, subscription_status, created_at)')
      .eq('id', user.id)
      .single();

    if (userError || !userData) {
      console.error('❌ Usuário não encontrado na tabela users:', userError);
      return NextResponse.json({
        user: {
          id: user.id,
          name: (user.user_metadata?.name as string) || (user.user_metadata?.full_name as string) || user.email || 'Usuário',
          email: user.email,
          role: (user.user_metadata?.role as string) || 'admin',
          salonId: (user.user_metadata?.salon_id as string | null) || null
        }
      });
    }

    console.log('✅ Usuário encontrado:', userData.name);

    // Buscar slug do salão com fallback se relação não estiver configurada
    let salonSlug = userData.salons?.slug || null;
    const planType = userData.salons?.plan_type || null;
    let subscriptionStatus = userData.salons?.subscription_status || null;
    const salonCreatedAt = userData.salons?.created_at || null;
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

    let trialActive = false;
    let trialEndsAt: string | null = null;
    if (userData.salons && planType === 'basic' && subscriptionStatus === 'trial' && salonCreatedAt) {
      const start = new Date(salonCreatedAt);
      const end = new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000);
      trialEndsAt = end.toISOString();
      trialActive = new Date() < end;
      if (!trialActive) {
        subscriptionStatus = 'inactive';
        await supabaseService
          .from('salons')
          .update({ plan_type: 'free', subscription_status: 'inactive', updated_at: new Date().toISOString() })
          .eq('id', userData.salon_id);
      }
    }

    return NextResponse.json({
      user: {
        id: userData.id,
        name: userData.name || (user.user_metadata?.name as string) || (user.user_metadata?.full_name as string) || user.email || 'Usuário',
        email: userData.email || user.email,
        role: userData.role,
        salonId: userData.salon_id,
        salonSlug,
        planType,
        subscriptionStatus,
        trialActive,
        trialEndsAt
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

// DELETE /api/auth/me - Apagar toda a conta e dados associados
export async function DELETE() {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('sb-access-token')?.value;
    if (!accessToken) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });

    const supabaseService = getSupabaseAdmin();
    if (!supabaseService) return NextResponse.json({ error: 'Configuração do servidor incompleta' }, { status: 500 });
    if (!supabaseUrl || !supabaseAnonKey) return NextResponse.json({ error: 'Configuração do servidor incompleta' }, { status: 500 });

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${accessToken}` } }
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });

    const { data: userRow } = await supabaseService
      .from('users')
      .select('id, salon_id')
      .eq('id', user.id)
      .maybeSingle();

    const salonId = userRow?.salon_id || null;
    if (salonId) {
      await supabaseService.from('appointments').delete().eq('salon_id', salonId);
      await supabaseService.from('professionals').delete().eq('salon_id', salonId);
      await supabaseService.from('services').delete().eq('salon_id', salonId);
      await supabaseService.from('salons').delete().eq('id', salonId);
    }
    await supabaseService.from('users').delete().eq('id', user.id);
    await supabaseService.auth.admin.deleteUser(user.id);

    const res = NextResponse.json({ success: true });
    res.cookies.set('sb-access-token', '', { httpOnly: true, maxAge: 0 });
    return res;
  } catch (error) {
    console.error('Erro ao apagar conta:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
