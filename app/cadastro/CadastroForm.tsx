'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Calendar, Mail, Lock, User, ArrowRight, Building } from 'lucide-react';

export default function CadastroForm() {
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    salonName: '',
    salonSlug: '',
    phone: '',
    address: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isTrialSignup, setIsTrialSignup] = useState(false);

  // Detectar se é teste grátis
  useEffect(() => {
    const plan = searchParams.get('plan');
    const trial = searchParams.get('trial');
    
    if (plan === 'basic' && trial === 'true') {
      setIsTrialSignup(true);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validações
    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          salon: {
            name: formData.salonName,
            slug: formData.salonSlug,
            phone: formData.phone,
            address: formData.address
          }
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao criar conta');
      }

      const data = await response.json();
      // Redirecionar para dashboard
      window.location.href = '/dashboard';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .trim();
  };

  const handleSalonNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setFormData({
      ...formData,
      salonName: name,
      salonSlug: generateSlug(name)
    });
  };

  return (
    <>
      {/* Logo */}
      <div className="text-center mb-8">
        <Link href="/" className="inline-flex items-center">
          <div className="bg-gradient-to-r from-orange-500 to-red-500 p-3 rounded-lg">
            <Calendar className="w-8 h-8 text-white" />
          </div>
          <span className="ml-3 text-2xl font-bold text-gray-900">Reserve.me</span>
        </Link>
      </div>

      {/* Formulário */}
      <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          {isTrialSignup ? 'Teste Grátis por 7 Dias - Plano Básico' : 'Criar sua conta'}
        </h1>

        {isTrialSignup && (
          <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <Calendar className="w-6 h-6 text-orange-500 mr-3" />
              <div>
                <h3 className="font-semibold text-orange-800">Teste Grátis por 7 Dias</h3>
                <p className="text-sm text-orange-700">
                  Após o período de teste, você será cobrado R$ 45/mês pelo Plano Básico.
                  Cancele a qualquer momento sem compromisso.
                </p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Dados Pessoais */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Nome Completo
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 placeholder-gray-500"
                  placeholder="Seu nome completo"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                E-mail
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  id="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 placeholder-gray-500"
                  placeholder="seu@email.com"
                />
              </div>
            </div>
          </div>

          {/* Senhas */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  id="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 placeholder-gray-500"
                  placeholder="Mínimo 6 caracteres"
                />
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirmar Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  id="confirmPassword"
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 placeholder-gray-500"
                  placeholder="Digite a senha novamente"
                />
              </div>
            </div>
          </div>

          {/* Dados do Estabelecimento */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Building className="w-5 h-5 mr-2 text-orange-500" />
              Dados do Estabelecimento
            </h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="salonName" className="block text-sm font-medium text-gray-700 mb-2">
                  Nome do Estabelecimento
                </label>
                <input
                  type="text"
                  id="salonName"
                  required
                  value={formData.salonName}
                  onChange={handleSalonNameChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 placeholder-gray-500"
                  placeholder="Ex: Barbearia Estilo"
                />
              </div>

              <div>
                <label htmlFor="salonSlug" className="block text-sm font-medium text-gray-700 mb-2">
                  URL Personalizada
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                    reserve.me/agendar/
                  </span>
                  <input
                    type="text"
                    id="salonSlug"
                    required
                    value={formData.salonSlug}
                    onChange={(e) => setFormData({ ...formData, salonSlug: e.target.value })}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900"
                    placeholder="barbearia-estilo"
                  />
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mt-6">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Telefone
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 placeholder-gray-500"
                  placeholder="(11) 99999-9999"
                />
              </div>

              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                  Endereço
                </label>
                <input
                  type="text"
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 placeholder-gray-500"
                  placeholder="Rua das Flores, 123"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-lg hover:from-orange-600 hover:to-red-600 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? 'Criando conta...' : (isTrialSignup ? 'Iniciar Teste Grátis' : 'Criar Conta')}
            {!loading && <ArrowRight className="w-5 h-5 ml-2" />}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Já tem uma conta?{' '}
            <Link href="/login" className="text-orange-500 hover:text-orange-600 font-semibold">
              Fazer login
            </Link>
          </p>
        </div>
      </div>

      {/* Link para voltar */}
      <div className="text-center mt-6">
        <Link href="/" className="text-gray-600 hover:text-gray-800 text-sm">
          ← Voltar ao site
        </Link>
      </div>
    </>
  );
}

