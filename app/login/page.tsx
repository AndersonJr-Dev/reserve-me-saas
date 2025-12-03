'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Calendar, Mail, Lock, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const verifyBanner = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('verify') === 'true';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao fazer login');
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

  const resendConfirmation = async () => {
    setResending(true);
    setError('');
    setInfo('');
    try {
      const r = await fetch('/api/auth/resend', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: formData.email }) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j?.error || 'Falha ao reenviar confirmação');
      setInfo('E-mail de confirmação reenviado. Verifique sua caixa de entrada e spam.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao reenviar confirmação');
    } finally {
      setResending(false);
    }
  };

  const confirmManually = async () => {
    setConfirming(true);
    setError('');
    setInfo('');
    try {
      const r = await fetch('/api/auth/confirm', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: formData.email }), credentials: 'include' });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j?.error || 'Falha ao confirmar');
      setInfo('E-mail marcado como confirmado. Faça login normalmente.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao confirmar');
    } finally {
      setConfirming(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center">
            <div className="bg-gradient-to-r from-orange-500 to-red-500 p-3 rounded-lg">
              <Calendar className="w-8 h-8 text-white" />
            </div>
            <span className="ml-3 text-2xl font-bold text-gray-900">Reserve.me</span>
          </Link>
        </div>

        {verifyBanner && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg mb-6 text-center">
            Verifique seu e-mail para ativar seu plano de teste. Após confirmar, faça login normalmente.
          </div>
        )}

        {/* Formulário */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Entrar na sua conta
          </h1>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}
          {info && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
              {info}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
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
              <div className="mt-2 flex items-center justify-end gap-3">
                <button type="button" onClick={resendConfirmation} disabled={resending || !formData.email}
                  className="text-xs text-orange-600 hover:text-orange-700">
                  {resending ? 'Reenviando…' : 'Reenviar confirmação'}
                </button>
                <button type="button" onClick={confirmManually} disabled={confirming}
                  className="text-xs text-gray-600 hover:text-gray-800">
                  {confirming ? 'Confirmando…' : 'Confirmar manualmente'}
                </button>
              </div>
            </div>

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
                  placeholder="Sua senha"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-lg hover:from-orange-600 hover:to-red-600 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? 'Entrando...' : 'Entrar'}
              {!loading && <ArrowRight className="w-5 h-5 ml-2" />}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Não tem uma conta?{' '}
              <Link href="/cadastro" className="text-orange-500 hover:text-orange-600 font-semibold">
                Criar conta
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
      </div>
    </div>
  );
}
