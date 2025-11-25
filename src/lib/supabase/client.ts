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
  working_hours?: any; // Adicionado para evitar erros de tipagem
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

  // Criar agendamento
  async createAppointment(appointmentData: any): Promise<Appointment | null> {
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