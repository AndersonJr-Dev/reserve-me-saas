import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// GET /api/dashboard/services - Buscar serviços do usuário
export async function GET() {
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
      return NextResponse.json({ services: [] });
    }

    // Buscar serviços do salão
    const { data: services, error: servicesError } = await supabase
      .from('services')
      .select('*')
      .eq('salon_id', userData.salon_id)
      .order('name');

    if (servicesError) {
      console.error('Erro ao buscar serviços:', servicesError);
      return NextResponse.json({ error: 'Erro ao buscar serviços' }, { status: 500 });
    }

    return NextResponse.json({ services: services || [] });
  } catch (error) {
    console.error('Erro:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

// POST /api/dashboard/services - Criar novo serviço
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('sb-access-token')?.value;

    if (!accessToken) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
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

    // Criar serviço
    const { data: service, error: serviceError } = await supabase
      .from('services')
      .insert({
        salon_id: userData.salon_id,
        name: body.name,
        description: body.description,
        duration_min: body.duration_min,
        price: body.price,
        is_active: true
      })
      .select()
      .single();

    if (serviceError) {
      console.error('Erro ao criar serviço:', serviceError);
      return NextResponse.json({ error: 'Erro ao criar serviço' }, { status: 500 });
    }

    return NextResponse.json({ service });
  } catch (error) {
    console.error('Erro:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

// PUT /api/dashboard/services - Atualizar serviço
export async function PUT(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('sb-access-token')?.value;

    if (!accessToken) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
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

    // Atualizar serviço
    const { data: service, error: serviceError } = await supabase
      .from('services')
      .update({
        name: body.name,
        description: body.description,
        duration_min: body.duration_min,
        price: body.price
      })
      .eq('id', body.id)
      .eq('salon_id', userData.salon_id)
      .select()
      .single();

    if (serviceError) {
      console.error('Erro ao atualizar serviço:', serviceError);
      return NextResponse.json({ error: 'Erro ao atualizar serviço' }, { status: 500 });
    }

    return NextResponse.json({ service });
  } catch (error) {
    console.error('Erro:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

// DELETE /api/dashboard/services - Excluir serviço
export async function DELETE(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('sb-access-token')?.value;

    if (!accessToken) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { searchParams } = new URL(request.url);
    const serviceId = searchParams.get('id');

    if (!serviceId) {
      return NextResponse.json({ error: 'ID do serviço é obrigatório' }, { status: 400 });
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

    // Excluir serviço
    const { error: serviceError } = await supabase
      .from('services')
      .delete()
      .eq('id', serviceId)
      .eq('salon_id', userData.salon_id);

    if (serviceError) {
      console.error('Erro ao excluir serviço:', serviceError);
      return NextResponse.json({ error: 'Erro ao excluir serviço' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

const nextConfig = {
  images: {
    domains: ['www.mercadopago.com'],
  },
  experimental: {
    serverActions: true,
  },
};

