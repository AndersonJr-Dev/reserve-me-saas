'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calendar, Users, Clock, CheckCircle, Settings, LogOut, Plus, BarChart3 } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  salonId?: string;
  salonSlug?: string;
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar se usuário está logado
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const userData = await response.json();
          setUser(userData.user);
        } else {
          // Redirecionar para login se não estiver autenticado
          window.location.href = '/login';
        }
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        window.location.href = '/login';
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleLogout = () => {
    // Limpar localStorage e redirecionar
    localStorage.removeItem('token');
    window.location.href = '/';
  };

  const handleCopyLink = () => {
    const link = `${window.location.origin}/agendar/${user?.salonSlug || 'seu-salao'}`;
    navigator.clipboard.writeText(link).then(() => {
      alert('Link copiado para a área de transferência!');
    }).catch(() => {
      alert('Erro ao copiar link');
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Será redirecionado pelo useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <div className="bg-gradient-to-r from-orange-500 to-red-500 p-2 rounded-lg">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <span className="ml-2 text-xl font-bold text-gray-900">Reserve.me</span>
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Bem Vindo, {user?.name}</span>
              <button
                onClick={handleLogout}
                className="flex items-center text-gray-600 hover:text-gray-800"
              >
                <LogOut className="w-4 h-4 mr-1" />
                Sair
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-xl p-8 text-white mb-8">
          <h1 className="text-3xl font-bold mb-2">Bem Vindo, {user?.name}!</h1>
          <p className="text-orange-100">
            Gerencie seus agendamentos e configure seu estabelecimento
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Agendamentos Hoje</p>
                <p className="text-2xl font-bold text-gray-900">12</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Confirmados</p>
                <p className="text-2xl font-bold text-gray-900">8</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center">
              <div className="bg-orange-100 p-3 rounded-lg">
                <Users className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Profissionais</p>
                <p className="text-2xl font-bold text-gray-900">3</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center">
              <div className="bg-purple-100 p-3 rounded-lg">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Receita Mensal</p>
                <p className="text-2xl font-bold text-gray-900">R$ 2.450</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Ações Rápidas</h2>
            <div className="space-y-3">
              <Link href="/dashboard/servicos" className="w-full flex items-center p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors">
                <Plus className="w-5 h-5 text-orange-600 mr-3" />
                <span className="text-gray-900 font-medium">Adicionar Serviço</span>
              </Link>
              <Link href="/dashboard/profissionais" className="w-full flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                <Users className="w-5 h-5 text-blue-600 mr-3" />
                <span className="text-gray-900 font-medium">Gerenciar Profissionais</span>
              </Link>
              <Link href="/dashboard/configuracoes" className="w-full flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                <Settings className="w-5 h-5 text-green-600 mr-3" />
                <span className="text-gray-900 font-medium">Configurações</span>
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Próximos Agendamentos</h2>
            <div className="space-y-3">
              <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                <Clock className="w-4 h-4 text-gray-500 mr-3" />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">João Silva</p>
                  <p className="text-sm text-gray-600">Corte Masculino - 14:00</p>
                </div>
              </div>
              <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                <Clock className="w-4 h-4 text-gray-500 mr-3" />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Maria Santos</p>
                  <p className="text-sm text-gray-600">Manicure - 15:30</p>
                </div>
              </div>
              <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                <Clock className="w-4 h-4 text-gray-500 mr-3" />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Pedro Costa</p>
                  <p className="text-sm text-gray-600">Barba - 16:00</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Link para agendamento público */}
        <div className="mt-8 bg-white rounded-xl p-6 shadow-sm border">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Seu Link de Agendamento</h2>
          <div className="flex items-center space-x-4">
            <div className="flex-1 bg-gray-50 p-3 rounded-lg">
              <code className="text-sm text-gray-700">
                {typeof window !== 'undefined' ? `${window.location.origin}/agendar/${user?.salonSlug || 'seu-salao'}` : 'https://reserve.me/agendar/seu-salao'}
              </code>
            </div>
            <button 
              onClick={handleCopyLink}
              className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
            >
              Copiar Link
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Compartilhe este link com seus clientes para que eles possam agendar online
          </p>
        </div>
      </div>
    </div>
  );
}
