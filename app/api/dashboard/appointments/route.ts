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

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('sb-access-token')?.value;
    if (!accessToken) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });

    const supabaseService = getSupabaseAdmin();
    if (!supabaseService || !supabaseUrl || !supabaseAnonKey) return NextResponse.json({ error: 'Configuração do servidor incompleta' }, { status: 500 });
    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, { global: { headers: { Authorization: `Bearer ${accessToken}` } } });

    const { data: { user }, error: authError } = await supabaseUser.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });

    const { data: userData } = await supabaseService
      .from('users')
      .select('salon_id')
      .eq('id', user.id)
      .single();

    if (!userData?.salon_id) return NextResponse.json({ error: 'Salão não encontrado' }, { status: 404 });

    const search = new URL(req.url).searchParams;

    const status = search.get('status');
    const scope = (search.get('scope') as 'upcoming' | 'all') || null;
    const page = Number(search.get('page') || '0');
    const pageSize = Number(search.get('pageSize') || '10');
    const start = search.get('start');
    const end = search.get('end');

    if (status) {
      const nowISO = new Date().toISOString();
      let q = supabaseService
        .from('appointments')
        .select('*')
        .eq('salon_id', userData.salon_id)
        .eq('status', status)
        .order('appointment_date', { ascending: true });
      if (scope === 'upcoming') q = q.gte('appointment_date', nowISO);
      const startRange = page * pageSize;
      const endRange = startRange + pageSize - 1;
      const { data: items } = await q.range(startRange, endRange);
      const { count } = await supabaseService
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('salon_id', userData.salon_id)
        .eq('status', status)
        .gte('appointment_date', scope === 'upcoming' ? nowISO : '1970-01-01T00:00:00.000Z');
      return NextResponse.json({ items: items || [], total: count || 0 });
    }

    if (start && end) {
      let q = supabaseService
        .from('appointments')
        .select('id, service_id, professional_id, status, appointment_date')
        .eq('salon_id', userData.salon_id)
        .in('status', ['confirmed','completed'])
        .gte('appointment_date', start)
        .lte('appointment_date', end);
      const professionalId = search.get('professionalId');
      const serviceId = search.get('serviceId');
      if (professionalId) q = q.eq('professional_id', professionalId);
      if (serviceId) q = q.eq('service_id', serviceId);
      const { data: apps } = await q;
      const serviceIds = Array.from(new Set((apps || []).map(a => a.service_id).filter(Boolean)));
      const professionalIds = Array.from(new Set((apps || []).map(a => a.professional_id).filter(Boolean)));
      const [{ data: services }, { data: pros }] = await Promise.all([
        supabaseService.from('services').select('id, name, price').in('id', serviceIds.length ? serviceIds : ['__none__']),
        supabaseService.from('professionals').select('id, name').in('id', professionalIds.length ? professionalIds : ['__none__'])
      ]);
      const priceByService = new Map<string, number>();
      const nameByService = new Map<string, string>();
      (services || []).forEach(s => { priceByService.set(s.id as string, Number(s.price) || 0); nameByService.set(s.id as string, s.name as string); });
      const nameByProfessional = new Map<string, string>();
      (pros || []).forEach(p => { nameByProfessional.set(p.id as string, p.name as string); });
      const serviceTotals = new Map<string, number>();
      const professionalTotals = new Map<string, number>();
      (apps || []).forEach(a => {
        const v = priceByService.get(a.service_id as string) || 0;
        serviceTotals.set(a.service_id as string, (serviceTotals.get(a.service_id as string) || 0) + v);
        professionalTotals.set(a.professional_id as string, (professionalTotals.get(a.professional_id as string) || 0) + v);
      });
      const servicesOut = Array.from(serviceTotals.entries()).map(([id, amount]) => ({ id, name: nameByService.get(id) || 'Serviço', amount })).sort((a, b) => b.amount - a.amount);
      const professionalsOut = Array.from(professionalTotals.entries()).map(([id, amount]) => ({ id, name: nameByProfessional.get(id) || 'Profissional', amount })).sort((a, b) => b.amount - a.amount);
      const total = (apps || []).reduce((acc, a) => acc + (priceByService.get(a.service_id as string) || 0), 0);
      const count = (apps || []).length;
      return NextResponse.json({ services: servicesOut, professionals: professionalsOut, total, count, data: apps || [] });
    }

    const now = new Date();
    const todayStart = new Date(now); todayStart.setHours(0,0,0,0);
    const todayEnd = new Date(now); todayEnd.setHours(23,59,59,999);

    const [{ data: todayAppointments }, { data: upcomingAppointments }, { count: confirmedCount }] = await Promise.all([
      supabaseService
        .from('appointments')
        .select('*')
        .eq('salon_id', userData.salon_id)
        .gte('appointment_date', todayStart.toISOString())
        .lte('appointment_date', todayEnd.toISOString())
        .order('appointment_date', { ascending: true }),
      supabaseService
        .from('appointments')
        .select('*')
        .eq('salon_id', userData.salon_id)
        .gte('appointment_date', now.toISOString())
        .order('appointment_date', { ascending: true })
        .limit(5),
      supabaseService
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('salon_id', userData.salon_id)
        .eq('status', 'confirmed')
    ]);

    return NextResponse.json({
      today: todayAppointments || [],
      upcoming: upcomingAppointments || [],
      stats: {
        todayCount: (todayAppointments || []).length,
        confirmedCount: confirmedCount || 0
      }
    });
  } catch (err) {
    console.error('Erro:', err);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
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

    if (!['pending', 'confirmed', 'completed', 'cancelled', 'no_show'].includes(status)) {
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
