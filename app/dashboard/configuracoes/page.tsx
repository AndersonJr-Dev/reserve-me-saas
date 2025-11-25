'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Calendar, ArrowLeft, Save, Settings, Building, Phone, Mail, MapPin } from 'lucide-react';

interface SalonSettings {
  name: string;
  slug: string;
  description: string;
  phone: string;
  email: string;
  address: string;
  workingHours: {
    monday: { open: string; close: string; closed: boolean };
    tuesday: { open: string; close: string; closed: boolean };
    wednesday: { open: string; close: string; closed: boolean };
    thursday: { open: string; close: string; closed: boolean };
    friday: { open: string; close: string; closed: boolean };
    saturday: { open: string; close: string; closed: boolean };
    sunday: { open: string; close: string; closed: boolean };
  };
}

const defaultSettings: SalonSettings = {
  name: '',
  slug: '',
  description: '',
  phone: '',
  email: '',
  address: '',
  workingHours: {
    monday: { open: '09:00', close: '18:00', closed: false },
    tuesday: { open: '09:00', close: '18:00', closed: false },
    wednesday: { open: '09:00', close: '18:00', closed: false },
    thursday: { open: '09:00', close: '18:00', closed: false },
    friday: { open: '09:00', close: '18:00', closed: false },
    saturday: { open: '10:00', close: '16:00', closed: false },
    sunday: { open: '00:00', close: '00:00', closed: true }
  }
};

export default function ConfiguracoesPage() {
  const [settings, setSettings] = useState<SalonSettings>(defaultSettings);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/dashboard/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: settings.name,
          slug: settings.slug,
          description: settings.description,
          phone: settings.phone,
          email: settings.email,
          address: settings.address,
          workingHours: settings.workingHours
        }),
        credentials: 'include'
      });

      const json = await res.json();
      if (!res.ok) {
        setErrorMsg(json?.error || 'Erro ao salvar configurações');
      } else {
        setSaved(true);
        // Atualizar estado com resposta do servidor se houver
        if (json?.salon) {
          const s = json.salon;
          setSettings(prev => ({
            name: s.name || prev?.name || '',
            slug: s.slug || prev?.slug || '',
            description: s.description || prev?.description || '',
            phone: s.phone || prev?.phone || '',
            email: s.email || prev?.email || '',
            address: s.address || prev?.address || '',
            workingHours: s.working_hours || prev?.workingHours || prev!.workingHours
          } as SalonSettings));
        }
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  const updateWorkingHours = (day: keyof SalonSettings['workingHours'], field: 'open' | 'close' | 'closed', value: string | boolean) => {
    setSettings(prev => ({
      ...prev,
      workingHours: {
        ...prev.workingHours,
        [day]: {
          ...prev.workingHours[day],
          [field]: value
        }
      }
    }));
  };

  const days = [
    { key: 'monday', label: 'Segunda-feira' },
    { key: 'tuesday', label: 'Terça-feira' },
    { key: 'wednesday', label: 'Quarta-feira' },
    { key: 'thursday', label: 'Quinta-feira' },
    { key: 'friday', label: 'Sexta-feira' },
    { key: 'saturday', label: 'Sábado' },
    { key: 'sunday', label: 'Domingo' }
  ] as const;

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

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center mb-8">
          <div className="bg-green-100 p-3 rounded-lg mr-4">
            <Settings className="w-6 h-6 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Configurações</h1>
        </div>

        {saved && (
          <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg mb-6">
            ✅ Configurações salvas com sucesso!
          </div>
        )}
        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
            ❌ {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Informações Básicas */}
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <Building className="w-5 h-5 mr-2 text-orange-500" />
              Informações do Estabelecimento
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome do Estabelecimento
                </label>
                <input
                  type="text"
                  required
                  value={settings?.name || ''}
                  onChange={(e) => setSettings(prev => prev ? { ...prev, name: e.target.value } : prev)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL Personalizada
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                    reserve.me/agendar/
                  </span>
                  <input
                    type="text"
                    required
                    value={settings?.slug || ''}
                    onChange={(e) => setSettings(prev => prev ? { ...prev, slug: e.target.value } : prev)}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descrição
              </label>
              <textarea
                value={settings?.description || ''}
                onChange={(e) => setSettings(prev => prev ? { ...prev, description: e.target.value } : prev)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900"
                rows={3}
              />
            </div>

            <div className="grid md:grid-cols-3 gap-6 mt-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone className="w-4 h-4 inline mr-1" />
                  Telefone
                </label>
                <input
                  type="tel"
                  value={settings?.phone || ''}
                  onChange={(e) => setSettings(prev => prev ? { ...prev, phone: e.target.value } : prev)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail className="w-4 h-4 inline mr-1" />
                  E-mail
                </label>
                <input
                  type="email"
                  value={settings?.email || ''}
                  onChange={(e) => setSettings(prev => prev ? { ...prev, email: e.target.value } : prev)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Endereço
                </label>
                <input
                  type="text"
                  value={settings?.address || ''}
                  onChange={(e) => setSettings(prev => prev ? { ...prev, address: e.target.value } : prev)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900"
                />
              </div>
            </div>
          </div>

          {/* Horários de Funcionamento */}
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Horários de Funcionamento</h2>
            
            <div className="space-y-4">
              {days.map((day) => (
                <div key={day.key} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                  <div className="w-24">
                    <label className="text-sm font-medium text-gray-700">{day.label}</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={!settings.workingHours[day.key].closed}
                      onChange={(e) => updateWorkingHours(day.key, 'closed', !e.target.checked)}
                      className="rounded border-gray-300 text-green-500 focus:ring-green-500"
                    />
                    <span className="text-sm text-gray-600">Aberto</span>
                  </div>
                  {!settings.workingHours[day.key].closed && (
                    <>
                      <input
                        type="time"
                        value={settings.workingHours[day.key].open}
                        onChange={(e) => updateWorkingHours(day.key, 'open', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900"
                      />
                      <span className="text-gray-500">até</span>
                      <input
                        type="time"
                        value={settings.workingHours[day.key].close}
                        onChange={(e) => updateWorkingHours(day.key, 'close', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900"
                      />
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Botão Salvar */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="bg-green-500 text-white px-8 py-3 rounded-lg hover:bg-green-600 transition-colors font-semibold flex items-center disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2" />
                  Salvar Configurações
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
