'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, Calendar, User, Clock, Check } from 'lucide-react';
import { db, Salon, Service, Professional } from '../../../src/lib/supabase/client';

// Tipagem básica para os parâmetros da página (necessário pelo Next.js)
interface AppointmentPageProps {
  params: {
    slug: string; // O slug da barbearia/salão
  };
}

// Interfaces já importadas do cliente de banco

// Estado do agendamento
interface AppointmentState {
  selectedService: Service | null;
  selectedProfessional: Professional | null;
  selectedDateTime: Date | null;
  customerInfo: {
    name: string;
    phone: string;
    email: string;
  };
}

// O componente principal da sua página de agendamento
export default function AppointmentPage({ params }: AppointmentPageProps) {
  // Estado para controlar a etapa atual do agendamento
  const [step, setStep] = useState(1);
  const totalSteps = 4;

  // Estados para os dados do banco
  const [salon, setSalon] = useState<Salon | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estado do agendamento
  const [appointment, setAppointment] = useState<AppointmentState>({
    selectedService: null,
    selectedProfessional: null,
    selectedDateTime: null,
    customerInfo: {
      name: '',
      phone: '',
      email: ''
    }
  });

  // Variável para facilitar a leitura do slug (ex: "salao-estilo" -> "Salão Estilo")
  const salonName = salon?.name || params.slug.replace(/-/g, ' ').toUpperCase();

  // useEffect para buscar dados do salão e serviços
  useEffect(() => {
    const fetchSalonData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Buscar o salão pelo slug
        const salonData = await db.getSalonBySlug(params.slug);

        if (!salonData) {
          throw new Error('Salão não encontrado');
        }

        setSalon(salonData);

        // Buscar serviços do salão
        const servicesData = await db.getServicesBySalonId(salonData.id);
        setServices(servicesData);

        // Buscar profissionais do salão
        const professionalsData = await db.getProfessionalsBySalonId(salonData.id);
        setProfessionals(professionalsData);

      } catch (err) {
        console.error('Erro ao buscar dados:', err);
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
      } finally {
        setLoading(false);
      }
    };

    fetchSalonData();
  }, [params.slug]);

  // Função para avançar para a próxima etapa
  const nextStep = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  // Função para voltar para a etapa anterior
  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  // Funções para atualizar o estado do agendamento
  const updateAppointment = (updates: Partial<AppointmentState>) => {
    setAppointment(prev => ({ ...prev, ...updates }));
  };

  const selectService = (service: Service) => {
    updateAppointment({ selectedService: service });
    nextStep();
  };

  const selectProfessional = (professional: Professional) => {
    updateAppointment({ selectedProfessional: professional });
    nextStep();
  };

  const selectDateTime = (dateTime: Date) => {
    updateAppointment({ selectedDateTime: dateTime });
    nextStep();
  };

  // Função para finalizar o agendamento
  const finalizeAppointment = async () => {
    try {
      if (!salon?.id || !appointment.selectedService?.id || !appointment.selectedDateTime) {
        throw new Error('Dados do agendamento incompletos');
      }

      const appointmentData = {
        salon_id: salon.id,
        service_id: appointment.selectedService.id,
        professional_id: appointment.selectedProfessional?.id === 'any' ? undefined : appointment.selectedProfessional?.id,
        appointment_date: appointment.selectedDateTime.toISOString(),
        customer_name: appointment.customerInfo.name,
        customer_phone: appointment.customerInfo.phone,
        customer_email: appointment.customerInfo.email,
        status: 'confirmed'
      };

      const savedAppointment = await db.createAppointment(appointmentData);

      if (savedAppointment) {
        console.log('Agendamento salvo com sucesso!', savedAppointment);
        // Aqui você pode adicionar lógica adicional como envio de email, etc.
      } else {
        throw new Error('Erro ao salvar agendamento');
      }
      
    } catch (err) {
      console.error('Erro ao finalizar agendamento:', err);
      setError(err instanceof Error ? err.message : 'Erro ao finalizar agendamento');
    }
  };

  // Componente que mostra o progresso (barra superior)
  const StepIndicator = () => (
    <div className="flex justify-between items-center mb-6 w-full max-w-sm mx-auto">
      {Array.from({ length: totalSteps }, (_, index) => (
        <div 
          key={index} 
          className={`h-2 w-1/4 rounded-full transition-colors duration-300 ${
            index + 1 <= step ? 'bg-indigo-600' : 'bg-gray-300'
          }`}
        />
      ))}
    </div>
  );

  // Tela de loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-lg bg-white shadow-lg rounded-xl p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Carregando...</h2>
          <p className="text-gray-600">Buscando informações do salão</p>
        </div>
      </div>
    );
  }

  // Tela de erro
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-lg bg-white shadow-lg rounded-xl p-8 text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Erro</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link 
            href="/" 
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-150"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Voltar ao início
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-4">
      
      <header className="w-full max-w-lg bg-white shadow-md rounded-xl p-6 mb-6">
        <Link href="/" className="text-indigo-600 hover:text-indigo-800 text-sm flex items-center mb-4">
          <ChevronLeft className="w-4 h-4 mr-1" />
          Voltar ao site {salonName}
        </Link>
        <h1 className="text-3xl font-bold text-gray-800">
          Agendamento: {salonName}
        </h1>
        <p className="text-gray-500 mt-1">
          Etapa {step} de {totalSteps}
        </p>
        
        {/* Indicador de Etapa */}
        <div className="mt-4">
            <StepIndicator />
        </div>
      </header>

      <main className="w-full max-w-lg bg-white shadow-lg rounded-xl p-8">
        
        {/* Renderiza a Etapa Atual */}
        <div className="min-h-[300px]">
          {step === 1 && (
            <Step1 
              services={services} 
              selectedService={appointment.selectedService}
              onSelectService={selectService}
            />
          )}
          {step === 2 && (
            <Step2 
              professionals={professionals}
              selectedProfessional={appointment.selectedProfessional}
              onSelectProfessional={selectProfessional}
              prevStep={prevStep} 
            />
          )}
          {step === 3 && (
            <Step3 
              selectedDateTime={appointment.selectedDateTime}
              onSelectDateTime={selectDateTime}
              prevStep={prevStep} 
            />
          )}
          {step === 4 && (
            <Step4 
              appointment={appointment}
              salon={salon}
              onUpdateCustomerInfo={(customerInfo) => updateAppointment({ customerInfo })}
              onFinalize={finalizeAppointment}
              prevStep={prevStep} 
            />
          )}
        </div>

      </main>
      
    </div>
  );
}

// =========================================================================
// Componentes de Etapa com funcionalidade real
// =========================================================================

interface Step1Props {
  services: Service[];
  selectedService: Service | null;
  onSelectService: (service: Service) => void;
}

const Step1 = ({ services, selectedService, onSelectService }: Step1Props) => (
  <>
    <h2 className="text-2xl font-semibold mb-6 flex items-center text-indigo-600">
        <Calendar className="w-6 h-6 mr-3" /> 1. Escolha o Serviço
    </h2>
    
    {services.length === 0 ? (
      <div className="text-center py-8">
        <p className="text-gray-500">Nenhum serviço disponível no momento.</p>
      </div>
    ) : (
      <div className="grid gap-4 mb-6">
        {services.map((service) => (
          <div
            key={service.id}
            onClick={() => onSelectService(service)}
            className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md ${
              selectedService?.id === service.id
                ? 'border-indigo-500 bg-indigo-50'
                : 'border-gray-200 hover:border-indigo-300'
            }`}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-gray-800">{service.name}</h3>
                {service.description && (
                  <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                )}
                <div className="flex items-center mt-2 text-sm text-gray-500">
                  <Clock className="w-4 h-4 mr-1" />
                  {service.duration_min} minutos
                </div>
              </div>
              <div className="text-right">
                <span className="text-lg font-bold text-indigo-600">
                  R$ {service.price.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        ))}
    </div>
    )}
  </>
);

interface Step2Props {
  professionals: Professional[];
  selectedProfessional: Professional | null;
  onSelectProfessional: (professional: Professional) => void;
  prevStep: () => void;
}

const Step2 = ({ professionals, selectedProfessional, onSelectProfessional, prevStep }: Step2Props) => (
  <>
    <h2 className="text-2xl font-semibold mb-6 flex items-center text-indigo-600">
        <User className="w-6 h-6 mr-3" /> 2. Escolha o Profissional
    </h2>
    
    <div className="grid gap-4 mb-6">
      {/* Opção "Qualquer um" */}
      <div
        onClick={() => onSelectProfessional({ 
          id: 'any', 
          name: 'Qualquer um', 
          salon_id: '', 
          is_active: true, 
          created_at: new Date().toISOString(), 
          updated_at: new Date().toISOString() 
        })}
        className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md ${
          selectedProfessional?.id === 'any'
            ? 'border-indigo-500 bg-indigo-50'
            : 'border-gray-200 hover:border-indigo-300'
        }`}
      >
        <div className="flex items-center">
          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mr-4">
            <User className="w-6 h-6 text-gray-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">Qualquer um</h3>
            <p className="text-sm text-gray-600">O primeiro profissional disponível</p>
          </div>
        </div>
      </div>

      {/* Lista de profissionais */}
      {professionals.map((professional) => (
        <div
          key={professional.id}
          onClick={() => onSelectProfessional(professional)}
          className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md ${
            selectedProfessional?.id === professional.id
              ? 'border-indigo-500 bg-indigo-50'
              : 'border-gray-200 hover:border-indigo-300'
          }`}
        >
          <div className="flex items-center">
            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mr-4">
              <User className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">{professional.name}</h3>
              {professional.specialty && (
                <p className="text-sm text-gray-600">{professional.specialty}</p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>

    <div className="flex justify-between">
      <button 
        onClick={prevStep} 
        className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition duration-150"
      >
        Anterior
      </button>
    </div>
  </>
);

interface Step3Props {
  selectedDateTime: Date | null;
  onSelectDateTime: (dateTime: Date) => void;
  prevStep: () => void;
}

const Step3 = ({ selectedDateTime, onSelectDateTime, prevStep }: Step3Props) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>('');

  // Horários disponíveis (você pode buscar do banco também)
  const availableTimes = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30', '18:00', '18:30'
  ];

  // Gerar próximos 30 dias
  const getAvailableDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 1; i <= 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedTime('');
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    if (selectedDate) {
      const [hours, minutes] = time.split(':');
      const dateTime = new Date(selectedDate);
      dateTime.setHours(parseInt(hours), parseInt(minutes));
      onSelectDateTime(dateTime);
    }
  };

  return (
  <>
    <h2 className="text-2xl font-semibold mb-6 flex items-center text-indigo-600">
        <Clock className="w-6 h-6 mr-3" /> 3. Data e Horário
    </h2>

      {/* Seleção de Data */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4">Escolha a data:</h3>
        <div className="grid grid-cols-7 gap-2 mb-4">
          {getAvailableDates().slice(0, 14).map((date, index) => (
            <button
              key={index}
              onClick={() => handleDateSelect(date)}
              className={`p-2 text-sm rounded-lg border transition-colors ${
                selectedDate?.toDateString() === date.toDateString()
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-indigo-300'
              }`}
            >
              <div className="text-xs">{date.toLocaleDateString('pt-BR', { weekday: 'short' })}</div>
              <div className="font-semibold">{date.getDate()}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Seleção de Horário */}
      {selectedDate && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4">Escolha o horário:</h3>
          <div className="grid grid-cols-4 gap-2">
            {availableTimes.map((time) => (
              <button
                key={time}
                onClick={() => handleTimeSelect(time)}
                className={`p-3 text-sm rounded-lg border transition-colors ${
                  selectedTime === time
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-indigo-300'
                }`}
              >
                {time}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Resumo da seleção */}
      {selectedDateTime && (
        <div className="bg-indigo-50 p-4 rounded-lg mb-6">
          <h4 className="font-semibold text-indigo-800">Agendamento selecionado:</h4>
          <p className="text-indigo-700">
            {selectedDateTime.toLocaleDateString('pt-BR', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })} às {selectedDateTime.toLocaleTimeString('pt-BR', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </p>
        </div>
      )}

    <div className="flex justify-between">
      <button 
        onClick={prevStep} 
        className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition duration-150"
      >
        Anterior
      </button>
        {selectedDateTime && (
      <button 
            onClick={() => onSelectDateTime(selectedDateTime)} 
        className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition duration-150"
      >
            Continuar
      </button>
        )}
    </div>
  </>
);
};

interface Step4Props {
  appointment: AppointmentState;
  salon: Salon | null;
  onUpdateCustomerInfo: (customerInfo: { name: string; phone: string; email: string }) => void;
  onFinalize: () => void;
  prevStep: () => void;
}

const Step4 = ({ appointment, salon, onUpdateCustomerInfo, onFinalize, prevStep }: Step4Props) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await onFinalize();
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
  <>
    <h2 className="text-2xl font-semibold mb-6 flex items-center text-green-600">
        <Check className="w-6 h-6 mr-3" /> 4. Confirmação
    </h2>

      {/* Resumo do Agendamento */}
      <div className="bg-gray-50 p-6 rounded-lg mb-6">
        <h3 className="text-lg font-semibold mb-4">Resumo do Agendamento</h3>
        
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Salão:</span>
            <span className="font-semibold">{salon?.name}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600">Serviço:</span>
            <span className="font-semibold">{appointment.selectedService?.name}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600">Duração:</span>
            <span>{appointment.selectedService?.duration_min} minutos</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600">Profissional:</span>
            <span>{appointment.selectedProfessional?.name}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600">Data e Hora:</span>
            <span>
              {appointment.selectedDateTime?.toLocaleDateString('pt-BR')} às{' '}
              {appointment.selectedDateTime?.toLocaleTimeString('pt-BR', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </span>
          </div>
          
          <div className="flex justify-between text-lg font-bold border-t pt-3">
            <span>Total:</span>
            <span className="text-indigo-600">
              {formatCurrency(appointment.selectedService?.price || 0)}
            </span>
          </div>
        </div>
      </div>

      {/* Formulário de Dados do Cliente */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <h3 className="text-lg font-semibold mb-4">Seus Dados</h3>
        
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Nome Completo *
          </label>
          <input
            type="text"
            id="name"
            required
            value={appointment.customerInfo.name}
            onChange={(e) => onUpdateCustomerInfo({ 
              ...appointment.customerInfo, 
              name: e.target.value 
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Seu nome completo"
          />
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
            Telefone/WhatsApp *
          </label>
          <input
            type="tel"
            id="phone"
            required
            value={appointment.customerInfo.phone}
            onChange={(e) => onUpdateCustomerInfo({ 
              ...appointment.customerInfo, 
              phone: e.target.value 
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="(11) 99999-9999"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            E-mail
          </label>
          <input
            type="email"
            id="email"
            value={appointment.customerInfo.email}
            onChange={(e) => onUpdateCustomerInfo({ 
              ...appointment.customerInfo, 
              email: e.target.value 
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="seu@email.com"
          />
        </div>

        <div className="flex justify-between pt-4">
      <button 
            type="button"
        onClick={prevStep} 
        className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition duration-150"
      >
        Voltar
      </button>
          
          <button 
            type="submit"
            disabled={isSubmitting || !appointment.customerInfo.name || !appointment.customerInfo.phone}
            className="px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition duration-150 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Finalizando...' : 'Confirmar Agendamento'}
          </button>
    </div>
      </form>
  </>
);
};