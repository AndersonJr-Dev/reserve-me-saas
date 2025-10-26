'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calendar, ArrowLeft, Plus, Save, X, Edit, Trash2, User, Users } from 'lucide-react';

interface Professional {
  id: string;
  salon_id: string;
  name: string;
  specialty?: string;
  phone?: string;
  email?: string;
  photo_url?: string;
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

export default function ProfissionaisPage() {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingProfessional, setEditingProfessional] = useState<Professional | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    specialty: '',
    phone: '',
    email: '',
    photo_url: ''
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

    const fetchProfessionals = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/dashboard/professionals');
        if (response.ok) {
          const data = await response.json();
          setProfessionals(data.professionals || []);
        } else {
          console.error('Erro ao carregar profissionais');
        }
      } catch (error) {
        console.error('Erro:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
    fetchProfessionals();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.salonId) {
      alert('Erro: Dados do usuário não encontrados');
      return;
    }

    try {
      const professionalData = {
        name: formData.name,
        specialty: formData.specialty,
        phone: formData.phone,
        email: formData.email,
        photo_url: formData.photo_url
      };

      if (editingProfessional) {
        // Atualizar profissional existente
        const response = await fetch('/api/dashboard/professionals', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingProfessional.id, ...professionalData })
        });

        if (response.ok) {
          const { professional } = await response.json();
          setProfessionals(professionals.map(p => p.id === professional.id ? professional : p));
          setEditingProfessional(null);
        } else {
          alert('Erro ao atualizar profissional');
        }
      } else {
        // Criar novo profissional
        const response = await fetch('/api/dashboard/professionals', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(professionalData)
        });

        if (response.ok) {
          const { professional } = await response.json();
          setProfessionals([...professionals, professional]);
        } else {
          alert('Erro ao criar profissional');
        }
      }

      setFormData({ name: '', specialty: '', phone: '', email: '', photo_url: '' });
      setShowForm(false);
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao salvar profissional');
    }
  };

  const handleEdit = (professional: Professional) => {
    setEditingProfessional(professional);
    setFormData({
      name: professional.name,
      specialty: professional.specialty || '',
      phone: professional.phone || '',
      email: professional.email || '',
      photo_url: professional.photo_url || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (professionalId: string) => {
    if (!confirm('Tem certeza que deseja excluir este profissional?')) {
      return;
    }

    try {
      const response = await fetch(`/api/dashboard/professionals?id=${professionalId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setProfessionals(professionals.filter(p => p.id !== professionalId));
      } else {
        alert('Erro ao excluir profissional');
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao excluir profissional');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingProfessional(null);
    setFormData({ name: '', specialty: '', phone: '', email: '', photo_url: '' });
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
          <h1 className="text-3xl font-bold text-gray-900">Profissionais</h1>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center"
          >
            <Plus className="w-5 h-5 mr-2" />
            Adicionar Profissional
          </button>
        </div>

        {/* Formulário de Adicionar Profissional */}
        {showForm && (
          <div className="bg-white rounded-xl p-6 shadow-sm border mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingProfessional ? 'Editar Profissional' : 'Novo Profissional'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome Completo
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    placeholder="Ex: João Silva"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Especialidade
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.specialty}
                    onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    placeholder="Ex: Cortes masculinos"
                  />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telefone
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    placeholder="(11) 99999-9999"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    E-mail
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    placeholder="profissional@exemplo.com"
                  />
                </div>
              </div>
              
              {/* Campo de Foto */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Foto do Profissional (URL)
                </label>
                <div className="flex items-center space-x-4">
                  <input
                    type="url"
                    value={formData.photo_url}
                    onChange={(e) => setFormData({ ...formData, photo_url: e.target.value })}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    placeholder="https://exemplo.com/foto.jpg"
                  />
                  <div className="flex items-center justify-center w-16 h-16 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300">
                    {formData.photo_url ? (
                      <img 
                        src={formData.photo_url} 
                        alt="Preview" 
                        className="w-full h-full object-cover rounded-lg"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                          if (nextElement) {
                            nextElement.style.display = 'flex';
                          }
                        }}
                      />
                    ) : null}
                    <User className="w-8 h-8 text-gray-400" style={{ display: formData.photo_url ? 'none' : 'flex' }} />
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Cole aqui a URL da foto do profissional. Os clientes verão esta foto ao agendar.
                </p>
              </div>
              
              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center"
                >
                  <Save className="w-5 h-5 mr-2" />
                  Salvar Profissional
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

        {/* Lista de Profissionais */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Profissionais Cadastrados</h2>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-gray-600">Carregando profissionais...</p>
              </div>
            ) : professionals.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">Nenhum profissional cadastrado ainda.</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {professionals.map((professional) => (
                  <div key={professional.id} className="border border-gray-200 rounded-lg p-6 hover:bg-gray-50 transition-colors">
                    <div className="text-center">
                      <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 overflow-hidden bg-gray-100">
                        {professional.photo_url ? (
                          <img 
                            src={professional.photo_url} 
                            alt={professional.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                              if (nextElement) {
                                nextElement.style.display = 'flex';
                              }
                            }}
                          />
                        ) : null}
                        <User className="w-8 h-8 text-gray-400" style={{ display: professional.photo_url ? 'none' : 'flex' }} />
                      </div>
                      <h3 className="font-semibold text-gray-900 text-lg">{professional.name}</h3>
                      <p className="text-blue-600 text-sm mt-1">{professional.specialty}</p>
                      <div className="mt-4 space-y-2 text-sm text-gray-600">
                        <p>📞 {professional.phone}</p>
                        {professional.email && <p>✉️ {professional.email}</p>}
                      </div>
                      <div className="flex space-x-2 mt-4">
                        <button 
                          onClick={() => handleEdit(professional)}
                          className="flex-1 bg-blue-500 text-white py-2 px-3 rounded-lg hover:bg-blue-600 transition-colors text-sm flex items-center justify-center"
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Editar
                        </button>
                        <button 
                          onClick={() => handleDelete(professional.id)}
                          className="flex-1 bg-red-500 text-white py-2 px-3 rounded-lg hover:bg-red-600 transition-colors text-sm flex items-center justify-center"
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
