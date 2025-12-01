import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'

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
    const period = search.get('period');
    let startISO = search.get('start');
    let endISO = search.get('end');

    if (period === 'month') {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      startISO = start.toISOString();
      endISO = end.toISOString();
    }

    if (!startISO || !endISO) return NextResponse.json({ services: [], professionals: [], total: 0, count: 0 });

    let q = supabaseService
      .from('appointments')
      .select('id, service_id, professional_id, status, appointment_date')
      .eq('salon_id', userData.salon_id)
      .in('status', ['confirmed','completed'])
      .gte('appointment_date', startISO)
      .lte('appointment_date', endISO);

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

    return NextResponse.json({ services: servicesOut, professionals: professionalsOut, total, count });
  } catch (err) {
    console.error('Erro revenue:', err);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
