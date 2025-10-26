import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// GET /api/dashboard/professionals - Buscar profissionais do usuário
export async function GET(_request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('sb-access-token')?.value;

    if (!accessToken) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

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

