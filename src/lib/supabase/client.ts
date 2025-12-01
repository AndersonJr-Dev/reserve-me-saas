import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Variáveis de ambiente do Supabase ausentes');
}

// Cria o cliente forçando a existência das chaves (ou quebra com erro visível)
export const supabase = createClient(supabaseUrl!, supabaseAnonKey!)

// --- INTERFACES (Atualizadas com photo_url) ---

export interface Salon {
  id: string;
  name: string;
  slug: string;
  description?: string;
  phone?: string;
  email?: string;
  address?: string;
  owner_id?: string;
  plan_type?: string;
  working_hours?: WorkingHours;
  created_at: string;
  updated_at: string;
}

export interface Service {
  id: string;
  salon_id: string;
  name: string;
  description?: string;
  duration_min: number;
  price: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Professional {
  id: string;
  salon_id: string;
  name: string;
  specialty?: string;
  phone?: string;
  email?: string;
  photo_url?: string; // <--- ADICIONADO AQUI
  working_hours?: WorkingHours; 
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Appointment {
  id: string;
  salon_id: string;
  service_id: string;
  professional_id?: string;
  appointment_date: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface WorkingHours {
  [weekday: string]: {
    isOpen: boolean;
    open?: string;
    close?: string;
  } | undefined;
}

// --- FUNÇÕES DE BANCO DE DADOS ---

export const db = {
  // Buscar salão por slug
  async getSalonBySlug(slug: string): Promise<Salon | null> {
    console.log(`📡 Buscando salão: ${slug}...`);
    
    const { data, error } = await supabase
      .from('salons')
      .select('*')
      .eq('slug', slug)
      .single();
    
    if (error) {
      console.error('❌ Erro Supabase (getSalonBySlug):', error);
      return null;
    }
    
    console.log('✅ Salão encontrado:', data?.name);
    return data;
  },
  async getAppointmentsByStatusPaginated(
    salonId: string,
    status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show',
    page: number,
    pageSize: number,
    scope: 'upcoming' | 'all' = 'upcoming'
  ): Promise<{ items: Appointment[]; total: number }> {
    const nowISO = new Date().toISOString();
    let base = supabase
      .from('appointments')
      .select('*')
      .eq('salon_id', salonId)
      .eq('status', status)
      .order('appointment_date', { ascending: true });
    if (scope === 'upcoming') base = base.gte('appointment_date', nowISO);
    const start = page * pageSize;
    const end = start + pageSize - 1;
    const { data: items, error } = await base.range(start, end);
    const { count } = await supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .eq('salon_id', salonId)
      .eq('status', status)
      .gte('appointment_date', scope === 'upcoming' ? nowISO : '1970-01-01T00:00:00.000Z');
    if (error) return { items: [], total: 0 };
    return { items: (items || []) as Appointment[], total: count || 0 };
  },

  // Buscar serviços
  async getServicesBySalonId(salonId: string): Promise<Service[]> {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('salon_id', salonId)
      .eq('is_active', true)
      .order('name');
    
    if (error) {
      console.error('❌ Erro Supabase (getServices):', error);
      return [];
    }
    return data || [];
  },

  // Buscar profissionais
  async getProfessionalsBySalonId(salonId: string): Promise<Professional[]> {
    const { data, error } = await supabase
      .from('professionals')
      .select('*')
      .eq('salon_id', salonId)
      .eq('is_active', true)
      .order('name');
    
    if (error) {
      console.error('❌ Erro Supabase (getProfessionals):', error);
      return [];
    }
    return data || [];
  },
  // Buscar agendamentos de um dia específico (para verificar disponibilidade)
  async getAppointmentsByDate(salonId: string, dateStr: string, professionalId?: string): Promise<Appointment[]> {
    // dateStr deve vir no formato YYYY-MM-DD ou ISO
    const startOfDay = new Date(dateStr);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(dateStr);
    endOfDay.setHours(23, 59, 59, 999);

    let base = supabase
      .from('appointments')
      .select('*')
      .eq('salon_id', salonId)
      .gte('appointment_date', startOfDay.toISOString())
      .lte('appointment_date', endOfDay.toISOString())
      .neq('status', 'cancelled');
    if (professionalId && professionalId !== 'any') {
      base = base.eq('professional_id', professionalId);
    }
    const { data, error } = await base;
    
    if (error) {
      console.error('Erro ao buscar disponibilidade:', error);
      return [];
    }
    
    return data || [];
  },

  // Disponibilidade pública via VIEW (sem PII)
  async getSalonAvailabilityByDate(
    salonId: string,
    dateStr: string,
    professionalId?: string
  ): Promise<Array<{ salon_id: string; professional_id: string | null; service_id: string; appointment_date: string; status: string }>> {
    const startOfDay = new Date(dateStr);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(dateStr);
    endOfDay.setHours(23, 59, 59, 999);

    let base = supabase
      .from('salon_availability')
      .select('*')
      .eq('salon_id', salonId)
      .gte('appointment_date', startOfDay.toISOString())
      .lte('appointment_date', endOfDay.toISOString());
    if (professionalId && professionalId !== 'any') {
      base = base.eq('professional_id', professionalId);
    }
    const { data, error } = await base;
    if (error) {
      console.error('Erro ao buscar disponibilidade pública:', error);
      return [];
    }
    return (data || []) as Array<{ salon_id: string; professional_id: string | null; service_id: string; appointment_date: string; status: string }>;
  },

  async getAppointmentsRange(salonId: string, startISO: string, endISO: string): Promise<Appointment[]> {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('salon_id', salonId)
      .gte('appointment_date', startISO)
      .lte('appointment_date', endISO)
      .order('appointment_date', { ascending: true });
    if (error) {
      console.error('Erro Supabase (getAppointmentsRange):', error);
      return [];
    }
    return data || [];
  },

  // Buscar dados para o Dashboard (Hoje + Futuros)
  async getDashboardData(salonId: string) {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // 1. Buscar agendamentos de HOJE
    const { data: todayAppointments, error: errorToday } = await supabase
      .from('appointments')
      .select('*')
      .eq('salon_id', salonId)
      .gte('appointment_date', todayStart.toISOString())
      .lte('appointment_date', todayEnd.toISOString())
      .order('appointment_date', { ascending: true });

    // 2. Buscar próximos agendamentos (a partir de agora)
    const { data: upcomingAppointments, error: errorUpcoming } = await supabase
      .from('appointments')
      .select('*')
      .eq('salon_id', salonId)
      .gte('appointment_date', new Date().toISOString()) // A partir de agora
      .order('appointment_date', { ascending: true })
      .limit(5); // Pega só os 5 próximos

    // 3. Contar total de confirmados (Geral)
    const { count: confirmedCount, error: errorCount } = await supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .eq('salon_id', salonId)
      .eq('status', 'confirmed');

    if (errorToday || errorUpcoming || errorCount) {
      console.error('Erro no dashboard:', errorToday || errorUpcoming || errorCount);
      return null;
    }

    return {
      today: todayAppointments || [],
      upcoming: upcomingAppointments || [],
      stats: {
        todayCount: todayAppointments?.length || 0,
        confirmedCount: confirmedCount || 0,
      }
    };
  },
  async getRevenueStats(salonId: string) {
    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    const startOfWeek = new Date(now);
    const day = startOfWeek.getDay();
    const diffToMonday = (day + 6) % 7;
    startOfWeek.setDate(startOfWeek.getDate() - diffToMonday);
    startOfWeek.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    startOfMonth.setHours(0, 0, 0, 0);
    endOfMonth.setHours(23, 59, 59, 999);

    const prevWeekStart = new Date(startOfWeek);
    prevWeekStart.setDate(prevWeekStart.getDate() - 7);
    prevWeekStart.setHours(0, 0, 0, 0);
    const prevWeekEnd = new Date(endOfWeek);
    prevWeekEnd.setDate(prevWeekEnd.getDate() - 7);
    prevWeekEnd.setHours(23, 59, 59, 999);

    const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
    prevMonthStart.setHours(0, 0, 0, 0);
    prevMonthEnd.setHours(23, 59, 59, 999);

    const fetchApps = async (from: Date, to: Date) => {
      const { data, error } = await supabase
        .from('appointments')
        .select('id, service_id, appointment_date, status')
        .eq('salon_id', salonId)
        .gte('appointment_date', from.toISOString())
        .lte('appointment_date', to.toISOString())
        .in('status', ['confirmed', 'completed']);
      if (error) return [] as { service_id: string }[];
      return (data || []) as { service_id: string }[];
    };

    const [dayApps, weekApps, monthApps, prevWeekApps, prevMonthApps] = await Promise.all([
      fetchApps(startOfDay, endOfDay),
      fetchApps(startOfWeek, endOfWeek),
      fetchApps(startOfMonth, endOfMonth),
      fetchApps(prevWeekStart, prevWeekEnd),
      fetchApps(prevMonthStart, prevMonthEnd)
    ]);

    const uniqIds = Array.from(new Set([
      ...dayApps.map(a => a.service_id),
      ...weekApps.map(a => a.service_id),
      ...monthApps.map(a => a.service_id),
      ...prevWeekApps.map(a => a.service_id),
      ...prevMonthApps.map(a => a.service_id)
    ].filter(Boolean)));

    const { data: servicesData } = await supabase
      .from('services')
      .select('id, price')
      .in('id', uniqIds.length ? uniqIds : ['__none__']);

    const priceById = new Map<string, number>();
    (servicesData || []).forEach(s => priceById.set(s.id as string, Number(s.price)));

    const sum = (apps: { service_id: string }[]) => apps.reduce((acc, a) => acc + (priceById.get(a.service_id) || 0), 0);

    return {
      day: sum(dayApps),
      week: sum(weekApps),
      month: sum(monthApps),
      dayCount: dayApps.length,
      weekCount: weekApps.length,
      monthCount: monthApps.length,
      prevWeek: sum(prevWeekApps),
      prevMonth: sum(prevMonthApps)
    };
  },

  async getRevenueBreakdownMonthly(salonId: string) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    startOfMonth.setHours(0, 0, 0, 0);
    endOfMonth.setHours(23, 59, 59, 999);

    const { data: apps, error: appsErr } = await supabase
      .from('appointments')
      .select('id, service_id, professional_id, status, appointment_date')
      .eq('salon_id', salonId)
      .in('status', ['confirmed', 'completed'])
      .gte('appointment_date', startOfMonth.toISOString())
      .lte('appointment_date', endOfMonth.toISOString());
    if (appsErr) return { services: [], professionals: [] };

    const serviceIds = Array.from(new Set((apps || []).map(a => a.service_id).filter(Boolean)));
    const professionalIds = Array.from(new Set((apps || []).map(a => a.professional_id).filter(Boolean)));

    const [{ data: services }, { data: pros }] = await Promise.all([
      supabase.from('services').select('id, name, price').in('id', serviceIds),
      supabase.from('professionals').select('id, name').in('id', professionalIds)
    ]);

    const priceByService = new Map<string, number>();
    const nameByService = new Map<string, string>();
    (services || []).forEach(s => { priceByService.set(s.id, Number(s.price) || 0); nameByService.set(s.id, s.name); });

    const nameByProfessional = new Map<string, string>();
    (pros || []).forEach(p => { nameByProfessional.set(p.id, p.name); });

    const serviceTotals = new Map<string, number>();
    const professionalTotals = new Map<string, number>();

    (apps || []).forEach(a => {
      const v = priceByService.get(a.service_id) || 0;
      serviceTotals.set(a.service_id, (serviceTotals.get(a.service_id) || 0) + v);
      professionalTotals.set(a.professional_id, (professionalTotals.get(a.professional_id) || 0) + v);
    });

    const servicesOut = Array.from(serviceTotals.entries())
      .map(([id, amount]) => ({ name: nameByService.get(id) || 'Serviço', amount }))
      .sort((a, b) => b.amount - a.amount);

    const professionalsOut = Array.from(professionalTotals.entries())
      .map(([id, amount]) => ({ name: nameByProfessional.get(id) || 'Profissional', amount }))
      .sort((a, b) => b.amount - a.amount);

    return { services: servicesOut, professionals: professionalsOut };
  },

  async getRevenueBreakdownRange(salonId: string, startISO: string, endISO: string) {
    const { data: apps, error: appsErr } = await supabase
      .from('appointments')
      .select('id, service_id, professional_id, status, appointment_date')
      .eq('salon_id', salonId)
      .in('status', ['confirmed', 'completed'])
      .gte('appointment_date', startISO)
      .lte('appointment_date', endISO);
    if (appsErr) return { services: [], professionals: [] };

    const serviceIds = Array.from(new Set((apps || []).map(a => a.service_id).filter(Boolean)));
    const professionalIds = Array.from(new Set((apps || []).map(a => a.professional_id).filter(Boolean)));

    const [{ data: services }, { data: pros }] = await Promise.all([
      supabase.from('services').select('id, name, price').in('id', serviceIds),
      supabase.from('professionals').select('id, name').in('id', professionalIds)
    ]);

    const priceByService = new Map<string, number>();
    const nameByService = new Map<string, string>();
    (services || []).forEach(s => { priceByService.set(s.id, Number(s.price) || 0); nameByService.set(s.id, s.name); });

    const nameByProfessional = new Map<string, string>();
    (pros || []).forEach(p => { nameByProfessional.set(p.id, p.name); });

    const serviceTotals = new Map<string, number>();
    const professionalTotals = new Map<string, number>();

    (apps || []).forEach(a => {
      const v = priceByService.get(a.service_id) || 0;
      serviceTotals.set(a.service_id, (serviceTotals.get(a.service_id) || 0) + v);
      professionalTotals.set(a.professional_id, (professionalTotals.get(a.professional_id) || 0) + v);
    });

    const servicesOut = Array.from(serviceTotals.entries())
      .map(([id, amount]) => ({ name: nameByService.get(id) || 'Serviço', amount }))
      .sort((a, b) => b.amount - a.amount);

    const professionalsOut = Array.from(professionalTotals.entries())
      .map(([id, amount]) => ({ name: nameByProfessional.get(id) || 'Profissional', amount }))
      .sort((a, b) => b.amount - a.amount);

    return { services: servicesOut, professionals: professionalsOut };
  },

  async getRevenueBreakdownRangeFiltered(
    salonId: string,
    startISO: string,
    endISO: string,
    opts?: { professionalId?: string; serviceId?: string }
  ) {
    let q = supabase
      .from('appointments')
      .select('id, service_id, professional_id, status, appointment_date')
      .eq('salon_id', salonId)
      .in('status', ['confirmed', 'completed'])
      .gte('appointment_date', startISO)
      .lte('appointment_date', endISO);
    if (opts?.professionalId) q = q.eq('professional_id', opts.professionalId);
    if (opts?.serviceId) q = q.eq('service_id', opts.serviceId);
    const { data: apps, error: appsErr } = await q;
    if (appsErr) return { services: [], professionals: [] };

    const serviceIds = Array.from(new Set((apps || []).map(a => a.service_id).filter(Boolean)));
    const professionalIds = Array.from(new Set((apps || []).map(a => a.professional_id).filter(Boolean)));

    const [{ data: services }, { data: pros }] = await Promise.all([
      supabase.from('services').select('id, name, price').in('id', serviceIds),
      supabase.from('professionals').select('id, name').in('id', professionalIds)
    ]);

    const priceByService = new Map<string, number>();
    const nameByService = new Map<string, string>();
    (services || []).forEach(s => { priceByService.set(s.id, Number(s.price) || 0); nameByService.set(s.id, s.name); });

    const nameByProfessional = new Map<string, string>();
    (pros || []).forEach(p => { nameByProfessional.set(p.id, p.name); });

    const serviceTotals = new Map<string, number>();
    const professionalTotals = new Map<string, number>();

    (apps || []).forEach(a => {
      const v = priceByService.get(a.service_id) || 0;
      serviceTotals.set(a.service_id, (serviceTotals.get(a.service_id) || 0) + v);
      professionalTotals.set(a.professional_id, (professionalTotals.get(a.professional_id) || 0) + v);
    });

    const servicesOut = Array.from(serviceTotals.entries())
      .map(([id, amount]) => ({ id, name: nameByService.get(id) || 'Serviço', amount }))
      .sort((a, b) => b.amount - a.amount);

    const professionalsOut = Array.from(professionalTotals.entries())
      .map(([id, amount]) => ({ id, name: nameByProfessional.get(id) || 'Profissional', amount }))
      .sort((a, b) => b.amount - a.amount);

    return { services: servicesOut, professionals: professionalsOut };
  },
  async getRevenueAggregateRangeFiltered(
    salonId: string,
    startISO: string,
    endISO: string,
    opts?: { professionalId?: string; serviceId?: string }
  ) {
    let q = supabase
      .from('appointments')
      .select('id, service_id, professional_id, status, appointment_date')
      .eq('salon_id', salonId)
      .in('status', ['confirmed', 'completed'])
      .gte('appointment_date', startISO)
      .lte('appointment_date', endISO);
    if (opts?.professionalId) q = q.eq('professional_id', opts.professionalId);
    if (opts?.serviceId) q = q.eq('service_id', opts.serviceId);
    const { data: apps, error: appsErr } = await q;
    if (appsErr) return { total: 0, count: 0 };

    const serviceIds = Array.from(new Set((apps || []).map(a => a.service_id).filter(Boolean)));
    const { data: services } = await supabase
      .from('services')
      .select('id, price')
      .in('id', serviceIds.length ? serviceIds : ['__none__']);

    const priceByService = new Map<string, number>();
    (services || []).forEach(s => { priceByService.set(s.id, Number(s.price) || 0); });

    const total = (apps || []).reduce((acc, a) => acc + (priceByService.get(a.service_id) || 0), 0);
    const count = (apps || []).length;
    return { total, count };
  },
  // Criar agendamento
  async createAppointment(appointmentData: CreateAppointmentInput): Promise<Appointment | null> {
    const { data, error } = await supabase
      .from('appointments')
      .insert([{
        ...appointmentData,
        status: appointmentData.status || 'pending'
      }])
      .select()
      .single();
    
    if (error) {
      console.error('❌ Erro Supabase (createAppointment):', error);
      return null;
    }
    return data;
  }
};

export interface CreateAppointmentInput {
  salon_id: string;
  service_id: string;
  professional_id?: string;
  appointment_date: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  status?: Appointment['status'];
  notes?: string;
}
