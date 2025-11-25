'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Calendar, Users, CheckCircle, BarChart3, Clock } from 'lucide-react';

// CORREÇÃO DE IMPORTAÇÃO (ESTRUTURA: app/dashboard -> src/lib):
// ../.. volta para a raiz do projeto
// /src entra na pasta src
import { db, Appointment } from '../../src/lib/supabase/client'; 

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    todayCount: 0,
    confirmedCount: 0,
    professionalsCount: 0,
    revenue: 0
  });
  const [upcoming, setUpcoming] = useState<Appointment[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [salonId, setSalonId] = useState<string | null>(null);

  const supabase = createClientComponentClient();

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        
        // 1. Verifica autenticação
        const { data } = await supabase.auth.getUser();
        const user = data?.user;

        if (!user) {
          console.log("Usuário não autenticado.");
          setLoading(false);
          return;
        }

        // 2. Lógica para encontrar o ID do salão
        let finalSalonId: string | null = null;

        // Tentativa A: Tabela users
        const { data: userSalon } = await supabase
          .from('users')
          .select('salon_id')
          .eq('id', user.id)
          .maybeSingle(); 

        if (userSalon?.salon_id) {
          finalSalonId = userSalon.salon_id;
        } 
        
        // Tentativa B: Tabela salons (pelo owner_id)
        if (!finalSalonId) {
             const { data: salonByOwner } = await supabase
                .from('salons')
                .select('id')
                .eq('owner_id', user.id)
                .maybeSingle();
             finalSalonId = salonByOwner?.id || null;
        }

        if (!finalSalonId) {
            console.error("ERRO: Salão não encontrado para este usuário.");
            setLoading(false);
            return;
        }

        setSalonId(finalSalonId);

        // 3. Busca dados do banco em paralelo
        const [dashboardData, professionals] = await Promise.all([
          db.getDashboardData(finalSalonId),
          db.getProfessionalsBySalonId(finalSalonId)
        ]);

        if (dashboardData) {
          setStats({
            todayCount: dashboardData.stats.todayCount || 0,
            confirmedCount: dashboardData.stats.confirmedCount || 0,
            professionalsCount: professionals ? professionals.length : 0,
            revenue: 0 
          });
          setUpcoming(dashboardData.upcoming || []);
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
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-indigo-600"></div>
          <p className="text-sm font-medium text-gray-500 animate-pulse">Carregando Reserve.me...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Visão Geral</h1>
        <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
          {new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </span>
      </div>
      
      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-50 p-3 rounded-lg">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Hoje</span>
          </div>
          <h3 className="text-3xl font-bold text-gray-800">{stats.todayCount}</h3>
          <p className="text-sm text-gray-500 mt-1">Agendamentos</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-green-50 p-3 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Total</span>
          </div>
          <h3 className="text-3xl font-bold text-gray-800">{stats.confirmedCount}</h3>
          <p className="text-sm text-gray-500 mt-1">Confirmados</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-orange-50 p-3 rounded-lg">
              <Users className="w-6 h-6 text-orange-600" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Equipe</span>
          </div>
          <h3 className="text-3xl font-bold text-gray-800">{stats.professionalsCount}</h3>
          <p className="text-sm text-gray-500 mt-1">Profissionais ativos</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-purple-50 p-3 rounded-lg">
              <BarChart3 className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Receita</span>
          </div>
          <h3 className="text-3xl font-bold text-gray-800">R$ {stats.revenue},00</h3>
          <p className="text-sm text-gray-500 mt-1">Estimada (Mensal)</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Ações Rápidas (Coluna da Esquerda - Menor) */}
        <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-fit">
          <h2 className="text-lg font-bold text-gray-800 mb-6">Ações Rápidas</h2>
          <div className="space-y-3">
            <button className="w-full p-4 text-left bg-gradient-to-r from-orange-50 to-white hover:from-orange-100 border border-orange-100 rounded-xl text-orange-700 font-medium transition-all flex items-center group">
              <span className="mr-3 bg-white p-1 rounded-md shadow-sm group-hover:scale-110 transition-transform text-xl">+</span> 
              Novo Agendamento
            </button>
            <button className="w-full p-4 text-left bg-gradient-to-r from-blue-50 to-white hover:from-blue-100 border border-blue-100 rounded-xl text-blue-700 font-medium transition-all flex items-center group">
              <span className="mr-3 bg-white p-1 rounded-md shadow-sm group-hover:scale-110 transition-transform">
                <Users className="w-5 h-5" />
              </span> 
              Profissionais
            </button>
            <button className="w-full p-4 text-left bg-gradient-to-r from-gray-50 to-white hover:from-gray-100 border border-gray-100 rounded-xl text-gray-700 font-medium transition-all flex items-center group">
              <span className="mr-3 bg-white p-1 rounded-md shadow-sm group-hover:scale-110 transition-transform">
                ⚙️
              </span> 
              Configurações
            </button>
          </div>
        </div>

        {/* Lista de Próximos Agendamentos (Coluna da Direita - Maior) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-800">Próximos Agendamentos</h2>
            <button className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">Ver agenda completa</button>
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
                return (
                  <div key={app.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-gray-50 rounded-xl border border-gray-100 transition-all group">
                    <div className="flex items-center gap-4">
                      <div className="bg-indigo-50 text-indigo-700 font-bold p-3 rounded-xl text-center min-w-[60px] border border-indigo-100 group-hover:bg-indigo-100 transition-colors">
                        <div className="text-xs uppercase tracking-wide">{date.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')}</div>
                        <div className="text-xl leading-none mt-1">{date.getDate()}</div>
                      </div>
                      <div>
                        <p className="font-bold text-gray-800 text-lg">{app.customer_name}</p>
                        <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs text-gray-500 flex items-center bg-gray-100 px-2 py-0.5 rounded-md">
                            <Clock className="w-3 h-3 mr-1" />
                            {date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 sm:mt-0 flex items-center justify-end">
                        <span className="px-3 py-1 text-xs font-semibold bg-green-100 text-green-700 rounded-full border border-green-200 flex items-center">
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
  );
}