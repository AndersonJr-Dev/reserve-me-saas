import CheckoutClient from './CheckoutClient';

interface AppointmentData {
  id: string;
  serviceName: string;
  professionalName: string;
  price: number;
  customerName: string;
  customerEmail: string;
  salonName: string;
  appointmentDate: string;
  appointmentTime: string;
}

export default function CheckoutPage({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  // Construir dados iniciais a partir de searchParams (Server Component)
  const appointmentData: AppointmentData = {
    id: Array.isArray(searchParams.appointment_id) ? searchParams.appointment_id[0] || '123' : (searchParams.appointment_id as string) || '123',
    serviceName: Array.isArray(searchParams.service) ? searchParams.service[0] || 'Corte de Cabelo' : (searchParams.service as string) || 'Corte de Cabelo',
    professionalName: Array.isArray(searchParams.professional) ? searchParams.professional[0] || 'João Silva' : (searchParams.professional as string) || 'João Silva',
    price: parseFloat(Array.isArray(searchParams.price) ? searchParams.price[0] || '50' : (searchParams.price as string) || '50'),
    customerName: Array.isArray(searchParams.customer) ? searchParams.customer[0] || 'Cliente' : (searchParams.customer as string) || 'Cliente',
    customerEmail: Array.isArray(searchParams.email) ? searchParams.email[0] || 'cliente@email.com' : (searchParams.email as string) || 'cliente@email.com',
    salonName: Array.isArray(searchParams.salon) ? searchParams.salon[0] || 'Barbearia Estilo' : (searchParams.salon as string) || 'Barbearia Estilo',
    appointmentDate: Array.isArray(searchParams.date) ? searchParams.date[0] || '2024-01-15' : (searchParams.date as string) || '2024-01-15',
    appointmentTime: Array.isArray(searchParams.time) ? searchParams.time[0] || '14:00' : (searchParams.time as string) || '14:00'
  };

  // Renderiza o componente cliente passando os dados iniciais
  return <CheckoutClient initialData={appointmentData} />;
}

