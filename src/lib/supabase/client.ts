import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Debug: Verificar se as variáveis estão carregando (Isso vai aparecer no console do navegador)
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('🚨 ERRO CRÍTICO: Variáveis de ambiente do Supabase não encontradas!');
  console.log('URL:', supabaseUrl);
  console.log('KEY:', supabaseAnonKey ? 'Definida (Oculta)' : 'Não definida');
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
  status: 'confirmed' | 'cancelled' | 'completed' | 'no_show';
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
  async getAppointmentsByDate(salonId: string, dateStr: string): Promise<Appointment[]> {
    // dateStr deve vir no formato YYYY-MM-DD ou ISO
    const startOfDay = new Date(dateStr);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(dateStr);
    endOfDay.setHours(23, 59, 59, 999);

    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('salon_id', salonId)
      .gte('appointment_date', startOfDay.toISOString())
      .lte('appointment_date', endOfDay.toISOString())
      .neq('status', 'cancelled'); // Ignora os cancelados
    
    if (error) {
      console.error('Erro ao buscar disponibilidade:', error);
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

    const [dayApps, weekApps, monthApps] = await Promise.all([
      fetchApps(startOfDay, endOfDay),
      fetchApps(startOfWeek, endOfWeek),
      fetchApps(startOfMonth, endOfMonth)
    ]);

    const uniqIds = Array.from(new Set([
      ...dayApps.map(a => a.service_id),
      ...weekApps.map(a => a.service_id),
      ...monthApps.map(a => a.service_id)
    ].filter(Boolean)));

    const { data: servicesData } = await supabase
      .from('services')
      .select('id, price')
      .in('id', uniqIds.length ? uniqIds : ['__none__']);

    const priceById = new Map<string, number>();
    (servicesData || []).forEach(s => priceById.set(s.id as string, Number(s.price)));

    const sum = (apps: { service_id: string }[]) => apps.reduce((acc, a) => acc + (priceById.get(a.service_id) || 0), 0);

    return { day: sum(dayApps), week: sum(weekApps), month: sum(monthApps) };
  },
  // Criar agendamento
  async createAppointment(appointmentData: CreateAppointmentInput): Promise<Appointment | null> {
    const { data, error } = await supabase
      .from('appointments')
      .insert([{
        ...appointmentData,
        status: appointmentData.status || 'confirmed'
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