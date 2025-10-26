import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function getSupabaseAdmin() {
  if (!supabaseUrl || !supabaseServiceKey) return null;
  return createClient(supabaseUrl, supabaseServiceKey);
}

// GET /api/dashboard/professionals - Buscar profissionais do usuário
export async function GET() {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('sb-access-token')?.value;

    if (!accessToken) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

  const supabase = getSupabaseAdmin();
  if (!supabase) return NextResponse.json({ error: 'Configuração do servidor incompleta' }, { status: 500 });

    // Buscar usuário autenticado
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    // Buscar dados do usuário para pegar o salon_id
    const { data: userData } = await supabase
      .from('users')
      .select('salon_id')
      .eq('id', user.id)
      .single();

    if (!userData?.salon_id) {
      return NextResponse.json({ professionals: [] });
    }

    // Buscar profissionais do salão
    const { data: professionals, error: professionalsError } = await supabase
      .from('professionals')
      .select('*')
      .eq('salon_id', userData.salon_id)
      .order('name');

    if (professionalsError) {
      console.error('Erro ao buscar profissionais:', professionalsError);
      return NextResponse.json({ error: 'Erro ao buscar profissionais' }, { status: 500 });
    }

    return NextResponse.json({ professionals: professionals || [] });
  } catch (error) {
    console.error('Erro:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

// POST /api/dashboard/professionals - Criar novo profissional
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('sb-access-token')?.value;

    if (!accessToken) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

  const supabase = getSupabaseAdmin();
  if (!supabase) return NextResponse.json({ error: 'Configuração do servidor incompleta' }, { status: 500 });
    const body = await request.json();

    // Buscar usuário autenticado
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    // Buscar dados do usuário para pegar o salon_id
    const { data: userData } = await supabase
      .from('users')
      .select('salon_id')
      .eq('id', user.id)
      .single();

    if (!userData?.salon_id) {
      return NextResponse.json({ error: 'Salão não encontrado' }, { status: 404 });
    }

    // Criar profissional
    const { data: professional, error: professionalError } = await supabase
      .from('professionals')
      .insert({
        salon_id: userData.salon_id,
        name: body.name,
        specialty: body.specialty,
        phone: body.phone,
        email: body.email,
        photo_url: body.photo_url || null,
        is_active: true
      })
      .select()
      .single();

    if (professionalError) {
      console.error('Erro ao criar profissional:', professionalError);
      return NextResponse.json({ error: 'Erro ao criar profissional' }, { status: 500 });
    }

    return NextResponse.json({ professional });
  } catch (error) {
    console.error('Erro:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

// PUT /api/dashboard/professionals - Atualizar profissional
export async function PUT(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('sb-access-token')?.value;

    if (!accessToken) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

  const supabase = getSupabaseAdmin();
  if (!supabase) return NextResponse.json({ error: 'Configuração do servidor incompleta' }, { status: 500 });
    const body = await request.json();

    // Buscar usuário autenticado
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    // Buscar dados do usuário para pegar o salon_id
    const { data: userData } = await supabase
      .from('users')
      .select('salon_id')
      .eq('id', user.id)
      .single();

    if (!userData?.salon_id) {
      return NextResponse.json({ error: 'Salão não encontrado' }, { status: 404 });
    }

    // Atualizar profissional
    const { data: professional, error: professionalError } = await supabase
      .from('professionals')
      .update({
        name: body.name,
        specialty: body.specialty,
        phone: body.phone,
        email: body.email,
        photo_url: body.photo_url || null
      })
      .eq('id', body.id)
      .eq('salon_id', userData.salon_id)
      .select()
      .single();

    if (professionalError) {
      console.error('Erro ao atualizar profissional:', professionalError);
      return NextResponse.json({ error: 'Erro ao atualizar profissional' }, { status: 500 });
    }

    return NextResponse.json({ professional });
  } catch (error) {
    console.error('Erro:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

// DELETE /api/dashboard/professionals - Excluir profissional
export async function DELETE(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('sb-access-token')?.value;

    if (!accessToken) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

  const supabase = getSupabaseAdmin();
  if (!supabase) return NextResponse.json({ error: 'Configuração do servidor incompleta' }, { status: 500 });
    const { searchParams } = new URL(request.url);
    const professionalId = searchParams.get('id');

    if (!professionalId) {
      return NextResponse.json({ error: 'ID do profissional é obrigatório' }, { status: 400 });
    }

    // Buscar usuário autenticado
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    // Buscar dados do usuário para pegar o salon_id
    const { data: userData } = await supabase
      .from('users')
      .select('salon_id')
      .eq('id', user.id)
      .single();

    if (!userData?.salon_id) {
      return NextResponse.json({ error: 'Salão não encontrado' }, { status: 404 });
    }

    // Excluir profissional
    const { error: professionalError } = await supabase
      .from('professionals')
      .delete()
      .eq('id', professionalId)
      .eq('salon_id', userData.salon_id);

    if (professionalError) {
      console.error('Erro ao excluir profissional:', professionalError);
      return NextResponse.json({ error: 'Erro ao excluir profissional' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

