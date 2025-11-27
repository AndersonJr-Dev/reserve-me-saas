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

export async function PUT(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('sb-access-token')?.value;
    if (!accessToken) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });

    const supabaseService = getSupabaseAdmin();
    if (!supabaseService || !supabaseUrl || !supabaseAnonKey) return NextResponse.json({ error: 'Configuração do servidor incompleta' }, { status: 500 });
    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, { global: { headers: { Authorization: `Bearer ${accessToken}` } } });

    const { data: { user }, error: authError } = await supabaseUser.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });

    const body = await request.json();
    const id = body?.id as string | undefined;
    const status = body?.status as string | undefined;
    if (!id || !status) return NextResponse.json({ error: 'ID e status são obrigatórios' }, { status: 400 });

    if (!['confirmed', 'completed', 'cancelled', 'no_show'].includes(status)) {
      return NextResponse.json({ error: 'Status inválido' }, { status: 400 });
    }

    const { data: userData } = await supabaseService
      .from('users')
      .select('salon_id')
      .eq('id', user.id)
      .single();

    if (!userData?.salon_id) return NextResponse.json({ error: 'Salão não encontrado' }, { status: 404 });

    const { data: updated, error } = await supabaseService
      .from('appointments')
      .update({ status })
      .eq('id', id)
      .eq('salon_id', userData.salon_id)
      .select()
      .maybeSingle();

    if (error) return NextResponse.json({ error: 'Erro ao atualizar agendamento' }, { status: 500 });

    return NextResponse.json({ appointment: updated });
  } catch (err) {
    console.error('Erro:', err);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
