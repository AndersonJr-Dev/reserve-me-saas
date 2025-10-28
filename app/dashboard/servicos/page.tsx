'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calendar, ArrowLeft, Plus, Save, X, Edit, Trash2 } from 'lucide-react';

interface Service {
  id: string;
  salon_id: string;
  name: string;
  description?: string;
  duration_min: number;
  price: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  salonId?: string;
}

export default function ServicosPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    duration_min: 30,
    price: 0
  });

  useEffect(() => {
    // Buscar dados do usuário
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        }
      } catch (error) {
        console.error('Erro ao buscar usuário:', error);
      }
    };

    const fetchServices = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/dashboard/services');
        if (response.ok) {
          const data = await response.json();
          setServices(data.services || []);
        } else {
          console.error('Erro ao carregar serviços');
        }
      } catch (error) {
        console.error('Erro:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
    fetchServices();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.salonId) {
      alert('Erro: Dados do usuário não encontrados');
      return;
    }

    try {
      const serviceData = {
        name: formData.name,
        description: formData.description,
        duration_min: formData.duration_min,
        price: formData.price
      };

      if (editingService) {
        // Atualizar serviço existente
        const response = await fetch('/api/dashboard/services', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingService.id, ...serviceData })
        });

        if (response.ok) {
          const { service } = await response.json();
          setServices(services.map(s => s.id === service.id ? service : s));
          setEditingService(null);
        } else {
          alert('Erro ao atualizar serviço');
        }
      } else {
        // Criar novo serviço
        const response = await fetch('/api/dashboard/services', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(serviceData)
        });

        if (response.ok) {
          const { service } = await response.json();
          setServices([...services, service]);
        } else {
          alert('Erro ao criar serviço');
        }
      }

      setFormData({ name: '', description: '', duration_min: 30, price: 0 });
      setShowForm(false);
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao salvar serviço');
    }
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      description: service.description || '',
      duration_min: service.duration_min,
      price: service.price
    });
    setShowForm(true);
  };

  const handleDelete = async (serviceId: string) => {
    if (!confirm('Tem certeza que deseja excluir este serviço?')) {
      return;
    }

    try {
      const response = await fetch(`/api/dashboard/services?id=${serviceId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setServices(services.filter(s => s.id !== serviceId));
      } else {
        alert('Erro ao excluir serviço');
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao excluir serviço');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingService(null);
    setFormData({ name: '', description: '', duration_min: 30, price: 0 });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Link href="/dashboard" className="flex items-center text-gray-600 hover:text-gray-800 mr-4">
                <ArrowLeft className="w-5 h-5 mr-2" />
                Voltar
              </Link>
              <div className="bg-gradient-to-r from-orange-500 to-red-500 p-2 rounded-lg">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <span className="ml-2 text-xl font-bold text-gray-900">Reserve.me</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Serviços</h1>
          <button
            onClick={() => setShowForm(true)}
            className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors flex items-center"
          >
            <Plus className="w-5 h-5 mr-2" />
            Adicionar Serviço
          </button>
        </div>

        {/* Formulário de Adicionar Serviço */}
        {showForm && (
          <div className="bg-white rounded-xl p-6 shadow-sm border mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingService ? 'Editar Serviço' : 'Novo Serviço'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome do Serviço
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 placeholder-gray-500"
                    placeholder="Ex: Corte Masculino"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duração (minutos)
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.duration_min}
                    onChange={(e) => setFormData({ ...formData, duration_min: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 placeholder-gray-500"
                    min="15"
                    step="15"
                  />
                  <p className="text-xs text-gray-500 mt-1">Intervalos sugeridos: 15, 30, 45, 60 minutos.</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 placeholder-gray-500"
                  rows={3}
                  placeholder="Descreva o serviço..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preço (R$)
                </label>
                <input
                  type="number"
                  required
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 placeholder-gray-500"
                  min="0"
                  step="0.01"
                />
                <p className="text-xs text-gray-500 mt-1">Use ponto para centavos, ex: 49.90.</p>
              </div>
              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors flex items-center"
                >
                  <Save className="w-5 h-5 mr-2" />
                  Salvar Serviço
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors flex items-center"
                >
                  <X className="w-5 h-5 mr-2" />
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Lista de Serviços */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Serviços Cadastrados</h2>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
                <p className="text-gray-600">Carregando serviços...</p>
              </div>
            ) : services.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600">Nenhum serviço cadastrado ainda.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {services.map((service) => (
                  <div key={service.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-gray-900">{service.name}</h3>
                        <p className="text-gray-600 text-sm mt-1">{service.description}</p>
                        <div className="flex space-x-4 mt-2 text-sm text-gray-500">
                          <span>Duração: {service.duration_min} min</span>
                          <span>Preço: R$ {service.price.toFixed(2)}</span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleEdit(service)}
                          className="text-orange-500 hover:text-orange-600 text-sm font-medium flex items-center"
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Editar
                        </button>
                        <button 
                          onClick={() => handleDelete(service.id)}
                          className="text-red-500 hover:text-red-600 text-sm font-medium flex items-center"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Excluir
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
