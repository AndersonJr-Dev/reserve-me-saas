'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Calendar, Users, CheckCircle, BarChart3, Clock } from 'lucide-react';
import { db, Appointment } from '../../src/lib/supabase/client'; // Ajuste o caminho se necessário

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    todayCount: 0,
    confirmedCount: 0,
    professionalsCount: 0,
    revenue: 0
  });
  const [upcoming, setUpcoming] = useState<Appointment[]>([]);
  const [salonId, setSalonId] = useState<string | null>(null);

  const supabase = createClientComponentClient();

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        
        // 1. Pega o usuário logado
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // 2. Descobre o ID do salão desse usuário
        // (Assumindo que você tem uma tabela users ligando o auth.id ao salon_id
        // ou busca na tabela salons onde owner_id = user.id)
        const { data: userSalon } = await supabase
          .from('users') // ou 'salons' dependendo da sua estrutura
          .select('salon_id') // ou 'id' se for na tabela salons
          .eq('id', user.id) // ou 'owner_id'
          .single();

        // Se não achou na tabela users, tenta buscar direto na salons pelo owner_id
        let finalSalonId = userSalon?.salon_id;
        if (!finalSalonId) {
             const { data: salonByOwner } = await supabase
                .from('salons')
                .select('id')
                .eq('owner_id', user.id) // Importante: owner_id precisa existir na tabela salons
                .single();
             finalSalonId = salonByOwner?.id;
        }

        if (!finalSalonId) {
            console.error("Salão não encontrado para este usuário");
            setLoading(false);
            return;
        }

        setSalonId(finalSalonId);

        // 3. Busca os dados reais usando a função nova
        const dashboardData = await db.getDashboardData(finalSalonId);
        
        // 4. Busca contagem de profissionais
        const professionals = await db.getProfessionalsBySalonId(finalSalonId);

        if (dashboardData) {
          setStats({
            todayCount: dashboardData.stats.todayCount,
            confirmedCount: dashboardData.stats.confirmedCount,
            professionalsCount: professionals.length,
            revenue: 0 // Implementar lógica de receita depois
          });
          setUpcoming(dashboardData.upcoming);
        }

      } catch (error) {
        console.error("Erro ao carregar dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  if (loading) {
    return <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Visão Geral</h1>
      
      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-50 p-3 rounded-lg">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-sm font-medium text-gray-500">Hoje</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-800">{stats.todayCount}</h3>
          <p className="text-sm text-gray-500 mt-1">Agendamentos</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-green-50 p-3 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-sm font-medium text-gray-500">Total</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-800">{stats.confirmedCount}</h3>
          <p className="text-sm text-gray-500 mt-1">Confirmados</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-orange-50 p-3 rounded-lg">
              <Users className="w-6 h-6 text-orange-600" />
            </div>
            <span className="text-sm font-medium text-gray-500">Equipe</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-800">{stats.professionalsCount}</h3>
          <p className="text-sm text-gray-500 mt-1">Profissionais</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-purple-50 p-3 rounded-lg">
              <BarChart3 className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-sm font-medium text-gray-500">Receita</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-800">R$ {stats.revenue},00</h3>
          <p className="text-sm text-gray-500 mt-1">Mensal</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Ações Rápidas (Mantive igual) */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Ações Rápidas</h2>
          <div className="space-y-3">
            <button className="w-full p-3 text-left bg-orange-50 hover:bg-orange-100 rounded-lg text-orange-700 font-medium transition-colors flex items-center">
              <span className="mr-2 text-xl">+</span> Adicionar Serviço
            </button>
            <button className="w-full p-3 text-left bg-blue-50 hover:bg-blue-100 rounded-lg text-blue-700 font-medium transition-colors flex items-center">
              <Users className="w-5 h-5 mr-2" /> Gerenciar Profissionais
            </button>
            <button className="w-full p-3 text-left bg-green-50 hover:bg-green-100 rounded-lg text-green-700 font-medium transition-colors flex items-center">
              <span className="mr-2">⚙️</span> Configurações
            </button>
          </div>
        </div>

        {/* Lista de Próximos Agendamentos (Dinâmica) */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Próximos Agendamentos</h2>
          
          {upcoming.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-gray-400">
              <Clock className="w-12 h-12 mb-2 opacity-20" />
              <p>Nenhum agendamento futuro</p>
            </div>
          ) : (
            <div className="space-y-4">
              {upcoming.map((app) => {
                const date = new Date(app.appointment_date);
                return (
                  <div key={app.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg border border-gray-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="bg-indigo-100 text-indigo-700 font-bold p-2 rounded-lg text-center min-w-[50px]">
                        <div className="text-xs uppercase">{date.toLocaleDateString('pt-BR', { month: 'short' })}</div>
                        <div className="text-lg">{date.getDate()}</div>
                      </div>
                      <div>
                        <p className="font-bold text-gray-800">{app.customer_name}</p>
                        <p className="text-xs text-gray-500 flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                    <span className="px-2 py-1 text-xs font-semibold bg-green-100 text-green-700 rounded-full">
                      Confirmado
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};