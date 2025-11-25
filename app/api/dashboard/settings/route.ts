import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function getSupabaseAdmin() {
  if (!supabaseUrl || !supabaseServiceKey) return null;
  return createClient(supabaseUrl, supabaseServiceKey);
}

// GET /api/dashboard/settings - Buscar configurações do salão
export async function GET() {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('sb-access-token')?.value;

    if (!accessToken) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const supabaseService = getSupabaseAdmin();
    if (!supabaseService || !supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({ error: 'Configuração do servidor incompleta' }, { status: 500 });
    }

    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${accessToken}` } }
    });

    // Buscar usuário autenticado
    const { data: { user }, error: authError } = await supabaseUser.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    // Buscar dados do usuário para pegar o salon_id
    const { data: userData } = await supabaseService
      .from('users')
      .select('salon_id')
      .eq('id', user.id)
      .single();

    if (!userData?.salon_id) {
      return NextResponse.json({ error: 'Salão não encontrado' }, { status: 404 });
    }

    // Buscar configurações do salão
    const { data: salon, error: salonError } = await supabaseService
      .from('salons')
      .select('*')
      .eq('id', userData.salon_id)
      .single();

    if (salonError) {
      console.error('Erro ao buscar configurações:', salonError);
      return NextResponse.json({ error: 'Erro ao buscar configurações' }, { status: 500 });
    }

    return NextResponse.json({ salon });
  } catch (error) {
    console.error('Erro:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

// PUT /api/dashboard/settings - Atualizar configurações do salão
export async function PUT(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('sb-access-token')?.value;

    if (!accessToken) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const supabaseService = getSupabaseAdmin();
    if (!supabaseService || !supabaseUrl || !supabaseAnonKey) return NextResponse.json({ error: 'Configuração do servidor incompleta' }, { status: 500 });

    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${accessToken}` } }
    });
    
    const body = await request.json();

    // Buscar usuário autenticado
    const { data: { user }, error: authError } = await supabaseUser.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    // Buscar dados do usuário para pegar o salon_id
    const { data: userData } = await supabaseService
      .from('users')
      .select('salon_id')
      .eq('id', user.id)
      .single();

    if (!userData?.salon_id) {
      return NextResponse.json({ error: 'Salão não encontrado' }, { status: 404 });
    }

    // Validar slug único
    if (body.slug) {
      const { data: existingSlug, error: slugError } = await supabaseService
        .from('salons')
        .select('id')
        .eq('slug', body.slug)
        .neq('id', userData.salon_id)
        .maybeSingle();

      if (!slugError && existingSlug) {
        return NextResponse.json({ 
          error: 'Esta URL já está em uso. Por favor, escolha outra.' 
        }, { status: 400 });
      }
    }

    // Atualizar configurações do salão
    const { data: salon, error: salonError } = await supabaseService
      .from('salons')
      .update({
        name: body.name,
        slug: body.slug,
        description: body.description || null,
        phone: body.phone || null,
        email: body.email || null,
        address: body.address || null,
        working_hours: body.workingHours || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', userData.salon_id)
      .select()
      .single();

    if (salonError) {
      console.error('Erro ao atualizar configurações:', salonError);
      return NextResponse.json({ error: 'Erro ao atualizar configurações' }, { status: 500 });
    }

    return NextResponse.json({ salon });
  } catch (error) {
    console.error('Erro:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}