'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { ChevronLeft, Calendar, User, Clock, Check, AlertCircle } from 'lucide-react';
import { db, Salon, Service, Professional } from '../../../src/lib/supabase/client';

// --- HELPER: GERAÇÃO DE HORÁRIOS ---
const WEEKDAY_KEYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function generateSlotsForDate(date: Date, workingHours: any, intervalMinutes: number = 60) {
  if (!workingHours) return [];

  const dayIndex = date.getDay(); // 0 = Domingo, 1 = Segunda...
  const dayKey = WEEKDAY_KEYS[dayIndex];
  const config = workingHours[dayKey];

  // Se não tiver configuração para esse dia ou estiver fechado
  if (!config || !config.isOpen) {
    return [];
  }

  const slots = [];
  const [openH, openM] = (config.open || "09:00").split(':').map(Number);
  const [closeH, closeM] = (config.close || "18:00").split(':').map(Number);

  const current = new Date(date);
  current.setHours(openH, openM, 0, 0);

  const end = new Date(date);
  end.setHours(closeH, closeM, 0, 0);

  while (current < end) {
    const timeString = current.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    slots.push(timeString);
    current.setMinutes(current.getMinutes() + intervalMinutes);
  }

  return slots;
}

// --- INTERFACES ---

interface AppointmentPageProps {
  params: Promise<{
    slug: string;
  }>;
}

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

interface Step1Props {
  services: Service[];
  selectedService: Service | null;
  onSelectService: (service: Service) => void;
}

interface Step2Props {
  professionals: Professional[];
  selectedProfessional: Professional | null;
  onSelectProfessional: (professional: Professional) => void;
  prevStep: () => void;
}

interface Step3Props {
  selectedDateTime: Date | null;
  onSelectDateTime: (date: Date) => void;
  prevStep: () => void;
  salonId: string;
  salon: Salon | null;
}

interface Step4Props {
  appointment: AppointmentState;
  salon: Salon | null;
  onUpdateCustomerInfo: (info: { name: string; phone: string; email: string }) => void;
  onFinalize: () => Promise<void>;
  prevStep: () => void;
}

// --- COMPONENTE PRINCIPAL ---

export default function AppointmentPage({ params }: AppointmentPageProps) {
  const resolvedParams = use(params);
  const safeSlug = resolvedParams.slug;

  const [step, setStep] = useState(1);
  const totalSteps = 4;

  const [salon, setSalon] = useState<Salon | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const [appointment, setAppointment] = useState<AppointmentState>({
    selectedService: null,
    selectedProfessional: null,
    selectedDateTime: null,
    customerInfo: { name: '', phone: '', email: '' }
  });

  const salonName = salon?.name || (safeSlug ? safeSlug.replace(/-/g, ' ').toUpperCase() : '...');

  useEffect(() => {
    const fetchSalonData = async () => {
      if (!safeSlug) return;

      try {
        setLoading(true);
        setError(null);

        const salonData = await db.getSalonBySlug(safeSlug);

        if (!salonData) {
          setError('Salão não encontrado');
          setLoading(false);
          return;
        }

        setSalon(salonData);

        const [servicesData, professionalsData] = await Promise.all([
          db.getServicesBySalonId(salonData.id),
          db.getProfessionalsBySalonId(salonData.id)
        ]);

        setServices(servicesData || []);
        setProfessionals(professionalsData || []);

      } catch (err) {
        console.error('Erro ao buscar dados:', err);
        setError('Ocorreu um erro ao carregar o agendamento.');
      } finally {
        setLoading(false);
      }
    };

    fetchSalonData();
  }, [safeSlug]);

  const nextStep = () => step < totalSteps && setStep(step + 1);
  const prevStep = () => step > 1 && setStep(step - 1);

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

  const finalizeAppointment = async () => {
    try {
      if (!salon?.id || !appointment.selectedService?.id || !appointment.selectedDateTime) {
        throw new Error('Dados incompletos');
      }

      const appointmentData: import('@/lib/supabase/client').CreateAppointmentInput = {
        salon_id: salon.id,
        service_id: appointment.selectedService.id,
        professional_id: appointment.selectedProfessional?.id === 'any' ? undefined : appointment.selectedProfessional?.id,
        appointment_date: appointment.selectedDateTime.toISOString(),
        customer_name: appointment.customerInfo.name,
        customer_phone: appointment.customerInfo.phone,
        customer_email: appointment.customerInfo.email,
        status: 'pending'
      };

      const saved = await db.createAppointment(appointmentData);

      if (saved) {
        setIsSuccess(true);
      } else {
        throw new Error('Falha ao salvar no banco');
      }
      
    } catch (err) {
      console.error('Erro:', err);
      alert('Erro ao finalizar agendamento. Tente novamente.');
    }
  };

  // --- RENDERS CONDICIONAIS ---

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-lg flex flex-col items-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mb-4"></div>
          <p className="text-gray-600">Carregando {safeSlug.replace(/-/g, ' ')}...</p>
        </div>
      </div>
    );
  }

  if (error || !salon) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-white shadow-lg rounded-xl p-8 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <AlertCircle className="h-6 w-6 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Ops! Algo deu errado</h2>
          <p className="text-gray-600 mb-6">{error || 'Não conseguimos encontrar este salão.'}</p>
          <Link 
            href="/"
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 w-full"
          >
            Voltar ao Início
          </Link>
        </div>
      </div>
    );
  }

  // TELA DE SUCESSO
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-white shadow-lg rounded-xl p-8 text-center animate-in fade-in zoom-in duration-300">
          <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100 mb-6">
            <Check className="h-10 w-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Agendamento Confirmado!</h2>
          <p className="text-gray-600 mb-6">
            Obrigado, <strong>{appointment.customerInfo.name}</strong>. Seu horário no <strong>{salon?.name}</strong> foi reservado com sucesso.
          </p>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-sm text-left space-y-2 border border-gray-100">
             <div className="flex justify-between">
                <span className="text-gray-500">Data:</span>
                <span className="font-semibold">{appointment.selectedDateTime?.toLocaleDateString('pt-BR')} às {appointment.selectedDateTime?.toLocaleTimeString('pt-BR', { hour: '2-digit', minute:'2-digit'})}</span>
             </div>
             <div className="flex justify-between">
                <span className="text-gray-500">Serviço:</span>
                <span className="font-semibold">{appointment.selectedService?.name}</span>
             </div>
          </div>

          <button 
            onClick={() => window.location.reload()}
            className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 transition shadow-lg shadow-indigo-200"
          >
            Fazer Novo Agendamento
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-4 pb-20">
      <header className="w-full max-w-lg bg-white shadow-sm rounded-xl p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <Link href="/" className="text-sm text-gray-500 hover:text-indigo-600 flex items-center transition-colors">
            <ChevronLeft className="w-4 h-4 mr-1" />
            Voltar
          </Link>
          <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">
            Etapa {step} de {totalSteps}
          </span>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-800 leading-tight">
          {salonName}
        </h1>
        
        <div className="mt-6 flex gap-2">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div 
              key={i} 
              className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                i + 1 <= step ? 'bg-indigo-600' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
      </header>

      <main className="w-full max-w-lg bg-white shadow-md rounded-xl p-6 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
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
            salonId={salon?.id || ''}
            salon={salon}
          />
        )}
        
        {step === 4 && (
          <Step4 
            appointment={appointment}
            salon={salon}
            onUpdateCustomerInfo={(info) => updateAppointment({ customerInfo: info })}
            onFinalize={finalizeAppointment}
            prevStep={prevStep} 
          />
        )}
      </main>
      
      <footer className="mt-8 text-center text-gray-400 text-sm">
        <p>Desenvolvido por Reserve.me</p>
      </footer>
    </div>
  );
}

// =========================================================================
// SUB-COMPONENTES
// =========================================================================

const Step1 = ({ services, selectedService, onSelectService }: Step1Props) => (
  <div className="space-y-6">
    <h2 className="text-xl font-semibold flex items-center text-gray-800">
      <Calendar className="w-5 h-5 mr-2 text-indigo-600" /> 
      Escolha o Serviço
    </h2>
    
    <div className="space-y-3">
      {services.length === 0 ? (
        <p className="text-gray-500 text-center py-4">Nenhum serviço cadastrado.</p>
      ) : (
        services.map((service) => (
          <button
            key={service.id}
            onClick={() => onSelectService(service)}
            className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 hover:shadow-md group ${
              selectedService?.id === service.id
                ? 'border-indigo-600 bg-indigo-50 ring-1 ring-indigo-600'
                : 'border-gray-100 hover:border-indigo-200 bg-white'
            }`}
          >
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-gray-900 group-hover:text-indigo-700">{service.name}</h3>
                <div className="flex items-center mt-1 text-sm text-gray-500">
                  <Clock className="w-3.5 h-3.5 mr-1" />
                  {service.duration_min} min
                </div>
              </div>
              <span className="font-bold text-indigo-600 bg-white px-3 py-1 rounded-lg shadow-sm border border-gray-100">
                R$ {service.price.toFixed(2)}
              </span>
            </div>
          </button>
        ))
      )}
    </div>
  </div>
);

const Step2 = ({ professionals, selectedProfessional, onSelectProfessional, prevStep }: Step2Props) => (
  <div className="space-y-6">
    <h2 className="text-xl font-semibold flex items-center text-gray-800">
      <User className="w-5 h-5 mr-2 text-indigo-600" /> 
      Escolha o Profissional
    </h2>
    
    <div className="grid grid-cols-1 gap-3">
      <button
        onClick={() => onSelectProfessional({ id: 'any', name: 'Qualquer Profissional', salon_id: '' } as Professional)}
        className={`flex items-center p-4 rounded-xl border-2 transition-all ${
          selectedProfessional?.id === 'any'
            ? 'border-indigo-600 bg-indigo-50'
            : 'border-gray-100 hover:border-indigo-200'
        }`}
      >
        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 mr-4 font-bold">
          ?
        </div>
        <div className="text-left">
          <div className="font-semibold text-gray-900">Qualquer Profissional</div>
          <div className="text-xs text-gray-500">Primeiro horário disponível</div>
        </div>
      </button>

      {professionals.map((prof) => (
        <button
          key={prof.id}
          onClick={() => onSelectProfessional(prof)}
          className={`flex items-center p-4 rounded-xl border-2 transition-all ${
            selectedProfessional?.id === prof.id
              ? 'border-indigo-600 bg-indigo-50'
              : 'border-gray-100 hover:border-indigo-200'
          }`}
        >
          {prof.photo_url ? (
             // eslint-disable-next-line @next/next/no-img-element
             <img src={prof.photo_url} alt={prof.name} className="w-10 h-10 rounded-full object-cover mr-4" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-4">
              <User className="w-5 h-5 text-gray-500" />
            </div>
          )}
          <div className="text-left">
            <div className="font-semibold text-gray-900">{prof.name}</div>
            <div className="text-xs text-gray-500">{prof.specialty || 'Profissional'}</div>
          </div>
        </button>
      ))}
    </div>

    <button onClick={prevStep} className="w-full py-3 text-gray-500 hover:text-gray-800 font-medium">
      Voltar
    </button>
  </div>
);

const Step3 = ({ onSelectDateTime, prevStep, salonId, salon }: Step3Props) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [occupiedTimes, setOccupiedTimes] = useState<string[]>([]);
  const [loadingTimes, setLoadingTimes] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  
  const dates = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d;
  });

  // 1. Calcula horários baseados no JSON do salão
  useEffect(() => {
    if (salon?.working_hours && selectedDate) {
      const slots = generateSlotsForDate(selectedDate, salon.working_hours);
      setAvailableSlots(slots);
    } else {
      // Fallback (lista fixa antiga) caso não tenha configuração
      setAvailableSlots(['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00']);
    }
  }, [selectedDate, salon]);

  // 2. Verifica disponibilidade no banco
  useEffect(() => {
    if (!selectedDate || !salonId) return;

    const checkAvailability = async () => {
      setLoadingTimes(true);
      try {
        const appointments = await db.getAppointmentsByDate(salonId, selectedDate.toISOString());
        
        const busy = appointments.map(app => {
          const d = new Date(app.appointment_date);
          return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        });

        setOccupiedTimes(busy);
      } catch (err) {
        console.error("Erro ao verificar horário:", err);
      } finally {
        setLoadingTimes(false);
      }
    };

    checkAvailability();
  }, [selectedDate, salonId]);

  const handleTimeClick = (time: string) => {
    if (!selectedDate) return;
    const [h, m] = time.split(':');
    const newDate = new Date(selectedDate);
    newDate.setHours(parseInt(h), parseInt(m));
    onSelectDateTime(newDate);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold flex items-center text-gray-800">
        <Clock className="w-5 h-5 mr-2 text-indigo-600" /> 
        Data e Horário
      </h2>

      <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
        {dates.map((date, i) => (
          <button
            key={i}
            onClick={() => setSelectedDate(date)}
            className={`flex-shrink-0 w-16 h-20 rounded-xl flex flex-col items-center justify-center border-2 transition-all ${
              selectedDate?.toDateString() === date.toDateString()
                ? 'border-indigo-600 bg-indigo-600 text-white shadow-md transform scale-105'
                : 'border-gray-100 hover:border-indigo-200 text-gray-600 bg-white'
            }`}
          >
            <span className="text-xs font-medium uppercase">
              {date.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '')}
            </span>
            <span className="text-xl font-bold mt-1">{date.getDate()}</span>
          </button>
        ))}
      </div>

      {selectedDate ? (
        <div className="min-h-[150px]">
          {loadingTimes ? (
            <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>
          ) : (
            <div className="grid grid-cols-4 gap-2 animate-in fade-in duration-300">
              {availableSlots.length > 0 ? (
                availableSlots.map(time => {
                  const isOccupied = occupiedTimes.includes(time);
                  return (
                    <button
                      key={time}
                      disabled={isOccupied}
                      onClick={() => handleTimeClick(time)}
                      className={`py-2 px-1 rounded-lg text-sm font-medium border transition-colors ${
                        isOccupied 
                          ? 'bg-gray-100 text-gray-400 border-gray-100 cursor-not-allowed decoration-slice line-through' 
                          : 'border-gray-200 hover:border-indigo-500 hover:text-indigo-600 bg-white'
                      }`}
                    >
                      {time}
                    </button>
                  );
                })
              ) : (
                <div className="col-span-4 text-center py-8 bg-gray-50 rounded-lg border border-dashed">
                  <p className="text-gray-500">Fechado neste dia.</p>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
          Selecione uma data acima para ver os horários
        </div>
      )}

      <button onClick={prevStep} className="w-full py-3 text-gray-500 hover:text-gray-800 font-medium mt-4">
        Voltar
      </button>
    </div>
  );
};

const Step4 = ({ appointment, salon, onUpdateCustomerInfo, onFinalize, prevStep }: Step4Props) => {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await onFinalize();
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold flex items-center text-gray-800">
        <Check className="w-5 h-5 mr-2 text-green-600" /> 
        Confirmar Agendamento
      </h2>

      <div className="bg-gray-50 p-5 rounded-xl border border-gray-100 space-y-3 text-sm">
        {salon && (
             <div className="flex justify-between border-b pb-2 mb-2">
                <span className="text-gray-500">Local</span>
                <span className="font-semibold text-gray-900">{salon.name}</span>
             </div>
        )}

        <div className="flex justify-between">
          <span className="text-gray-500">Serviço</span>
          <span className="font-semibold text-gray-900">{appointment.selectedService?.name}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Profissional</span>
          <span className="font-semibold text-gray-900">{appointment.selectedProfessional?.name}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Data</span>
          <span className="font-semibold text-gray-900">
            {appointment.selectedDateTime?.toLocaleDateString('pt-BR')} às {appointment.selectedDateTime?.toLocaleTimeString('pt-BR', { hour: '2-digit', minute:'2-digit'})}
          </span>
        </div>
        <div className="pt-3 border-t border-gray-200 flex justify-between text-base">
          <span className="font-medium text-gray-900">Total a pagar</span>
          <span className="font-bold text-indigo-600">R$ {appointment.selectedService?.price.toFixed(2)}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
          <input
            type="text"
            placeholder="Ex: Anderson Junior"
            required
            className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            value={appointment.customerInfo.name}
            onChange={e => onUpdateCustomerInfo({...appointment.customerInfo, name: e.target.value})}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
          <input
            type="tel"
            placeholder="Ex: (21) 99999-9999"
            required
            className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            value={appointment.customerInfo.phone}
            onChange={e => onUpdateCustomerInfo({...appointment.customerInfo, phone: e.target.value})}
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button 
            type="button" 
            onClick={prevStep}
            className="flex-1 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition"
          >
            Voltar
          </button>
          <button 
            type="submit"
            disabled={loading}
            className="flex-[2] py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? 'Confirmando...' : 'Confirmar Agendamento'}
          </button>
        </div>
      </form>
    </div>
  );
};
