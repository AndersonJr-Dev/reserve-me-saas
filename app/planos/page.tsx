'use client';

import Link from 'next/link';
import PlanSubscribeButton from '../components/plan-subscribe-button';

export default function PlansPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <div className="bg-gradient-to-r from-orange-500 to-red-500 p-2 rounded-lg" />
            <span className="ml-2 text-xl font-bold text-gray-900">Planos</span>
          </div>
          <Link href="/dashboard" className="text-sm text-gray-600 hover:text-orange-600">Voltar ao Dashboard</Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Escolha o plano ideal</h1>
          <p className="text-gray-600">Benefícios e vantagens para cada fase do seu negócio</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Grátis */}
          <div className="bg-white rounded-2xl border shadow-sm p-6 flex flex-col">
            <h2 className="text-xl font-bold text-gray-900 mb-1">Grátis</h2>
            <p className="text-gray-600 mb-1">Para começar sem custo</p>
            <p className="text-sm font-semibold text-gray-900 mb-4">R$ 0/mês</p>
            <ul className="text-sm text-gray-700 space-y-2 mb-6">
              <li>• 1 profissional ativo</li>
              <li>• Até 5 serviços</li>
              <li>• Agenda online 24/7</li>
              <li>• Link público com slug</li>
              <li>• Botão de WhatsApp para confirmação</li>
              <li>• Sem métricas de receita/CRM</li>
            </ul>
            <Link href="/cadastro" className="w-full rounded-lg font-semibold text-sm bg-gray-900 text-white py-2.5 text-center">Começar Grátis</Link>
          </div>

          {/* Básico */}
          <div className="bg-white rounded-2xl border shadow-sm p-6 flex flex-col">
            <h2 className="text-xl font-bold text-gray-900 mb-1">Básico</h2>
            <p className="text-gray-600 mb-1">Para começar com o essencial</p>
            <p className="text-sm font-semibold text-gray-900 mb-4">R$ 45/mês</p>
            <ul className="text-sm text-gray-700 space-y-2 mb-6">
              <li>• Até 3 profissionais ativos</li>
              <li>• Até 10 serviços</li>
              <li>• Agenda online 24/7</li>
              <li>• Link público com slug</li>
              <li>• Botão de WhatsApp para confirmação</li>
              <li>• Métricas de receita básicas</li>
            </ul>
            <PlanSubscribeButton planKey="basic" label="Assinar Básico" buttonClassName="bg-orange-500 text-white py-2.5" />
          </div>

          {/* Avançado (Mais atrativo) */}
          <div className="bg-white rounded-2xl border shadow-sm p-6 flex flex-col relative">
            <span className="absolute -top-3 right-4 text-xs font-semibold bg-orange-500 text-white px-3 py-1 rounded-full shadow">Mais Popular</span>
            <h2 className="text-xl font-bold text-gray-900 mb-1">Avançado</h2>
            <p className="text-gray-600 mb-1">Crescimento e equipe maior</p>
            <p className="text-sm font-semibold text-gray-900 mb-4">R$ 90/mês</p>
            <ul className="text-sm text-gray-700 space-y-2 mb-6">
              <li>• Agenda online 24/7</li>
              <li>• Link público com slug</li>
              <li>• Botão de WhatsApp para confirmação</li>
              <li>• Até 6 profissionais ativos</li>
              <li>• Até 20 serviços</li>
              <li>• Métricas de receita completas</li>
              <li>• Priorização de suporte</li>
            </ul>
            <PlanSubscribeButton planKey="advanced" label="Assinar Avançado" buttonClassName="bg-orange-500 text-white py-2.5" />
          </div>

          {/* Premium */}
          <div className="bg-white rounded-2xl border shadow-sm p-6 flex flex-col">
            <h2 className="text-xl font-bold text-gray-900 mb-1">Premium</h2>
            <p className="text-gray-600 mb-1">Total controle e escala</p>
            <p className="text-sm font-semibold text-gray-900 mb-4">R$ 150/mês</p>
            <ul className="text-sm text-gray-700 space-y-2 mb-6">
              <li>• Agenda online 24/7</li>
              <li>• Link público com slug</li>
              <li>• Botão de WhatsApp para confirmação</li>
              <li>• Até 10 profissionais ativos</li>
              <li>• Até 50 serviços</li>
              <li>• Relatórios completos de receita</li>
              <li>• Suporte prioritário</li>
            </ul>
            <PlanSubscribeButton planKey="premium" label="Assinar Premium" buttonClassName="bg-orange-500 text-white py-2.5" />
          </div>
        </div>
      </main>
    </div>
  );
}