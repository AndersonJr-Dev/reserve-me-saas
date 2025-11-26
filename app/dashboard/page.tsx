'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Calendar, Users, CheckCircle, BarChart3, Clock, Settings, PlusCircle, ArrowRight } from 'lucide-react';

// CORREÇÃO DE IMPORTAÇÃO (ESTRUTURA: app/dashboard -> src/lib):
// ../.. volta para a raiz do projeto
// /src entra na pasta src
import { db, Appointment, Service, Professional } from '@/lib/supabase/client'; 

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    todayCount: 0,
    confirmedCount: 0,
    professionalsCount: 0,
    revenueDay: 0,
    revenueWeek: 0,
    revenueMonth: 0
  });
  const [upcoming, setUpcoming] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [salonId, setSalonId] = useState<string | null>(null);
  const [salonSlug, setSalonSlug] = useState<string | null>(null);
  const [planType, setPlanType] = useState<string | null>(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const supabase = createClientComponentClient();

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        // Buscar dados seguros via API (garante cookie e slug)
        const meRes = await fetch('/api/auth/me', { credentials: 'include' });
        if (!meRes.ok) {
          setLoading(false);
          return;
        }
        const meJson = await meRes.json();
        const finalSalonId: string | null = meJson?.user?.salonId ?? null;
        const finalSalonSlug: string | null = meJson?.user?.salonSlug ?? null;
        const finalPlanType: string | null = meJson?.user?.planType ?? null;
        const finalSubscriptionStatus: string | null = meJson?.user?.subscriptionStatus ?? null;

        if (!finalSalonId) {
          console.error('ERRO: Salão não encontrado para este usuário.');
          setLoading(false);
          return;
        }

        setSalonId(finalSalonId);
        setSalonSlug(finalSalonSlug);
        setPlanType(finalPlanType);
        setSubscriptionStatus(finalSubscriptionStatus);

        // 3. Busca dados do banco em paralelo
        const [dashboardData, prosData, servicesData, revenue] = await Promise.all([
          db.getDashboardData(finalSalonId),
          db.getProfessionalsBySalonId(finalSalonId),
          db.getServicesBySalonId(finalSalonId),
          db.getRevenueStats(finalSalonId)
        ]);

        if (dashboardData) {
          setStats({
            todayCount: dashboardData.stats.todayCount || 0,
            confirmedCount: dashboardData.stats.confirmedCount || 0,
            professionalsCount: prosData ? prosData.length : 0,
            revenueDay: revenue?.day || 0,
            revenueWeek: revenue?.week || 0,
            revenueMonth: revenue?.month || 0
          });
          setUpcoming(dashboardData.upcoming || []);
          setProfessionals(prosData || []);
          setServices(servicesData || []);
        }

      } catch (error) {
        console.error("Erro ao carregar dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [supabase]);

  // Loading State
  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-orange-500"></div>
          <p className="text-sm font-medium text-gray-500 animate-pulse">Carregando Reserve.me...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-orange-500 to-red-500 p-2 rounded-lg">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <span className="ml-2 text-xl font-bold text-gray-900">Reserve.me</span>
            </div>
            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              {new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>
        </div>
      </header>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        </div>
      
        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-orange-50 p-3 rounded-lg">
                <Calendar className="w-6 h-6 text-orange-600" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Hoje</span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900">{stats.todayCount}</h3>
            <p className="text-sm text-gray-600 mt-1">Agendamentos</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-green-50 p-3 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Total</span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900">{stats.confirmedCount}</h3>
            <p className="text-sm text-gray-600 mt-1">Confirmados</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-orange-50 p-3 rounded-lg">
                <Users className="w-6 h-6 text-orange-600" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Equipe</span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900">{stats.professionalsCount}</h3>
            <p className="text-sm text-gray-600 mt-1">Profissionais ativos</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-orange-50 p-3 rounded-lg">
                <BarChart3 className="w-6 h-6 text-orange-600" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Receita Hoje</span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900">{(['basic','advanced','premium'].includes((planType || '').toLowerCase()) && subscriptionStatus === 'active') ? `R$ ${stats.revenueDay.toFixed(2)}` : '—'}</h3>
            <p className="text-sm text-gray-600 mt-1">{(['basic','advanced','premium'].includes((planType || '').toLowerCase()) && subscriptionStatus === 'active') ? 'Confirmados' : 'Disponível nos planos pagos'}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-orange-50 p-3 rounded-lg">
                <BarChart3 className="w-6 h-6 text-orange-600" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Receita Semana</span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900">{(['basic','advanced','premium'].includes((planType || '').toLowerCase()) && subscriptionStatus === 'active') ? `R$ ${stats.revenueWeek.toFixed(2)}` : '—'}</h3>
            <p className="text-sm text-gray-600 mt-1">{(['basic','advanced','premium'].includes((planType || '').toLowerCase()) && subscriptionStatus === 'active') ? 'Confirmados' : 'Disponível nos planos pagos'}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-orange-50 p-3 rounded-lg">
                <BarChart3 className="w-6 h-6 text-orange-600" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Receita Mês</span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900">{(['basic','advanced','premium'].includes((planType || '').toLowerCase()) && subscriptionStatus === 'active') ? `R$ ${stats.revenueMonth.toFixed(2)}` : '—'}</h3>
            <p className="text-sm text-gray-600 mt-1">{(['basic','advanced','premium'].includes((planType || '').toLowerCase()) && subscriptionStatus === 'active') ? 'Confirmados' : 'Disponível nos planos pagos'}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Ações Rápidas */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border h-fit">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Ações Rápidas</h2>
              <div className="space-y-3">
                <Link href="/dashboard/servicos" className="w-full flex items-center p-4 rounded-xl border hover:border-orange-300 transition-colors text-gray-800">
                  <span className="mr-3 bg-orange-50 text-orange-600 p-2 rounded-md">
                    <PlusCircle className="w-5 h-5" />
                  </span>
                  Adicionar Serviço
                </Link>
                <Link href="/dashboard/profissionais" className="w-full flex items-center p-4 rounded-xl border hover:border-orange-300 transition-colors text-gray-800">
                  <span className="mr-3 bg-orange-50 text-orange-600 p-2 rounded-md">
                    <Users className="w-5 h-5" />
                  </span>
                  Adicionar Profissional
                </Link>
                <Link href="/dashboard/configuracoes" className="w-full flex items-center p-4 rounded-xl border hover:border-orange-300 transition-colors text-gray-800">
                  <span className="mr-3 bg-orange-50 text-orange-600 p-2 rounded-md">
                    <Settings className="w-5 h-5" />
                  </span>
                  Abrir Configurações
                </Link>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Upgrade de Plano</h2>
              <Link href="/planos" className="w-full inline-flex items-center justify-center bg-orange-500 text-white py-3 rounded-lg hover:bg-orange-600 transition-colors font-semibold">
                Ver Planos
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </div>
          </div>

          {/* Lista de Próximos Agendamentos */}
          <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900">Próximos Agendamentos</h2>
              <span className="text-sm text-gray-500">Atualiza automaticamente</span>
            </div>
          
            {upcoming.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                <Clock className="w-12 h-12 mb-3 opacity-20" />
                <p className="font-medium">Nenhum agendamento futuro</p>
                <p className="text-sm opacity-60">Sua agenda está livre por enquanto.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {upcoming.map((app) => {
                  const date = new Date(app.appointment_date);
                  const service = services.find(s => s.id === app.service_id);
                  const professional = professionals.find(p => p.id === app.professional_id);
                  return (
                    <div key={app.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-gray-50 rounded-xl border transition-all">
                      <div className="flex items-center gap-4">
                        <div className="bg-orange-50 text-orange-700 font-bold p-3 rounded-xl text-center min-w-[60px] border">
                          <div className="text-xs uppercase tracking-wide">{date.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')}</div>
                          <div className="text-xl leading-none mt-1">{date.getDate()}</div>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-lg">{app.customer_name}</p>
                          <div className="flex items-center gap-3 mt-1">
                              <span className="text-xs text-gray-600 flex items-center bg-gray-100 px-2 py-0.5 rounded-md">
                              <Clock className="w-3 h-3 mr-1" />
                              {date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              {professional && (
                                <span className="text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded-md">
                                  {professional.name}
                                </span>
                              )}
                              {service && (
                                <span className="text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded-md">
                                  {service.name}
                                </span>
                              )}
                              {service && (
                                <span className="text-xs text-orange-700 bg-orange-50 px-2 py-0.5 rounded-md border border-orange-200">
                                  R$ {Number(service.price).toFixed(2)}
                                </span>
                              )}
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 sm:mt-0 flex items-center justify-end">
                          <span className="px-3 py-1 text-xs font-semibold bg-green-100 text-green-700 rounded-full border flex items-center">
                          <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5"></span>
                          Confirmado
                          </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Barra inferior com link público de agendamento */}
      <div className="border-t bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="text-sm text-gray-700">
            Link público para seus clientes:
          </div>
          <div className="flex items-center gap-2">
            <div className="px-3 py-2 rounded-lg bg-gray-50 border text-gray-900 text-sm">
              {salonSlug ? `${process.env.NEXT_PUBLIC_BASE_URL || (typeof window !== 'undefined' ? window.location.origin : '')}/agendar/${salonSlug}` : 'Configurar URL do salão nas Configurações'}
            </div>
            <button
              onClick={() => {
                const base = process.env.NEXT_PUBLIC_BASE_URL || (typeof window !== 'undefined' ? window.location.origin : '');
                const url = salonSlug ? `${base}/agendar/${salonSlug}` : '';
                if (url) {
                  navigator.clipboard.writeText(url);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }
              }}
              className="px-3 py-2 rounded-lg bg-orange-500 text-white text-sm hover:bg-orange-600"
            >
              Copiar
            </button>
            {copied && <span className="text-sm text-green-600">Copiado!</span>}
          </div>
        </div>
      </div>
    </div>
  );
}