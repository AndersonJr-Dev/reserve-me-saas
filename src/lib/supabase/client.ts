import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Interfaces para tipagem
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

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'staff';
  salon_id?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Funções para interagir com o Supabase
export const db = {
  // Buscar salão por slug
  async getSalonBySlug(slug: string): Promise<Salon | null> {
    const { data, error } = await supabase
      .from('salons')
      .select('*')
      .eq('slug', slug)
      .single();
    
    if (error) {
      console.error('Erro ao buscar salão:', error);
      return null;
    }
    
    return data;
  },

  // Buscar serviços de um salão
  async getServicesBySalonId(salonId: string): Promise<Service[]> {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('salon_id', salonId)
      .eq('is_active', true)
      .order('name');
    
    if (error) {
      console.error('Erro ao buscar serviços:', error);
      return [];
    }
    
    return data || [];
  },

  // Buscar profissionais de um salão
  async getProfessionalsBySalonId(salonId: string): Promise<Professional[]> {
    const { data, error } = await supabase
      .from('professionals')
      .select('*')
      .eq('salon_id', salonId)
      .eq('is_active', true)
      .order('name');
    
    if (error) {
      console.error('Erro ao buscar profissionais:', error);
      return [];
    }
    
    return data || [];
  },

  // Criar agendamento
  async createAppointment(appointmentData: {
    salon_id: string;
    service_id: string;
    professional_id?: string;
    appointment_date: string;
    customer_name: string;
    customer_phone: string;
    customer_email?: string;
    status?: string;
  }): Promise<Appointment | null> {
    const { data, error } = await supabase
      .from('appointments')
      .insert([{
        ...appointmentData,
        status: appointmentData.status || 'confirmed'
      }])
      .select()
      .single();
    
    if (error) {
      console.error('Erro ao criar agendamento:', error);
      return null;
    }
    
    return data;
  },

  // Criar usuário
  async createUser(userData: {
    name: string;
    email: string;
    role: string;
    salon_id?: string;
  }): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .insert([userData])
      .select()
      .single();
    
    if (error) {
      console.error('Erro ao criar usuário:', error);
      return null;
    }
    
    return data;
  },

  // Buscar usuário por email
  async getUserByEmail(email: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    
    if (error) {
      console.error('Erro ao buscar usuário:', error);
      return null;
    }
    
    return data;
  },

  // Criar salão
  async createSalon(salonData: {
    name: string;
    slug: string;
    description?: string;
    phone?: string;
    email?: string;
    address?: string;
    owner_id?: string;
  }): Promise<Salon | null> {
    const { data, error } = await supabase
      .from('salons')
      .insert([salonData])
      .select()
      .single();
    
    if (error) {
      console.error('Erro ao criar salão:', error);
      return null;
    }
    
    return data;
  }
};
