'use client';

import Link from 'next/link';
import { CheckCircle } from 'lucide-react';
import PlanSubscribeButton from '../components/plan-subscribe-button';

export default function PlansPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50">
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Grátis */}
          <div className="bg-white p-5 sm:p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow border-2 border-gray-200 flex flex-col">
            <div className="text-center mb-5 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Gratuito</h2>
              <div className="text-2xl sm:text-3xl font-bold text-green-500 mb-1 sm:mb-2">R$ 0</div>
              <div className="text-sm sm:text-base text-gray-600">/mês</div>
            </div>
            <ul className="space-y-2 mb-6 text-sm">
              <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" /><span className="text-gray-800">1 profissional ativo</span></li>
              <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" /><span className="text-gray-800">Até 5 serviços</span></li>
              <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" /><span className="text-gray-800">Agenda online 24/7</span></li>
              <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" /><span className="text-gray-800">Link público com slug</span></li>
              <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" /><span className="text-gray-800">Botão de WhatsApp para confirmação</span></li>
              <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" /><span className="text-gray-800">Sem métricas de receita/CRM</span></li>
            </ul>
            <Link href="/cadastro?plan=free" className="w-full bg-green-500 text-white py-2.5 sm:py-2 rounded-lg hover:bg-green-600 transition-colors font-semibold text-sm block text-center">Começar Grátis</Link>
          </div>

          {/* Básico */}
          <div className="bg-white p-5 sm:p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow flex flex-col">
            <div className="text-center mb-5 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Básico</h2>
              <div className="text-2xl sm:text-3xl font-bold text-orange-500 mb-1 sm:mb-2">R$ 45</div>
              <div className="text-sm sm:text-base text-gray-600">/mês</div>
            </div>
            <ul className="space-y-2 mb-6 text-sm">
              <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" /><span className="text-gray-800">Agenda online 24/7</span></li>
              <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" /><span className="text-gray-800">Link público com slug</span></li>
              <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" /><span className="text-gray-800">Botão de WhatsApp para confirmação</span></li>
              <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" /><span className="text-gray-800">Até 3 profissionais ativos</span></li>
              <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" /><span className="text-gray-800">Até 10 serviços</span></li>
              <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" /><span className="text-gray-800">Métricas de receita básicas</span></li>
            </ul>
            <PlanSubscribeButton planKey="basic" label="Assinar Agora" buttonClassName="bg-orange-500 text-white py-2 hover:bg-orange-600" />
          </div>

          {/* Avançado (Mais atrativo) */}
          <div className="relative bg-gradient-to-br from-orange-500 to-red-500 p-5 sm:p-6 rounded-xl shadow-xl transform scale-105 flex flex-col">
            <span className="absolute -top-2 left-0 right-0 h-1 bg-white/70 rounded-t-xl"></span>
            <div className="text-center mb-5 sm:mb-6">
              <div className="bg-white text-orange-500 px-2 py-1 rounded-full text-xs font-semibold mb-2 sm:mb-3 inline-block">Mais Popular</div>
              <h2 className="text-lg sm:text-xl font-bold text-white mb-2">Avançado</h2>
              <div className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">R$ 90</div>
              <div className="text-sm sm:text-base text-orange-100">/mês</div>
            </div>
            <ul className="space-y-2 mb-6 text-sm">
              <li className="flex items-center"><CheckCircle className="w-4 h-4 text-white mr-2 flex-shrink-0" /><span className="text-white">Agenda online 24/7</span></li>
              <li className="flex items-center"><CheckCircle className="w-4 h-4 text-white mr-2 flex-shrink-0" /><span className="text-white">Link público com slug</span></li>
              <li className="flex items-center"><CheckCircle className="w-4 h-4 text-white mr-2 flex-shrink-0" /><span className="text-white">Botão de WhatsApp para confirmação</span></li>
              <li className="flex items-center"><CheckCircle className="w-4 h-4 text-white mr-2 flex-shrink-0" /><span className="text-white">Até 6 profissionais ativos</span></li>
              <li className="flex items-center"><CheckCircle className="w-4 h-4 text-white mr-2 flex-shrink-0" /><span className="text-white">Até 20 serviços</span></li>
              <li className="flex items-center"><CheckCircle className="w-4 h-4 text-white mr-2 flex-shrink-0" /><span className="text-white">Métricas de receita completas</span></li>
              <li className="flex items-center"><CheckCircle className="w-4 h-4 text-white mr-2 flex-shrink-0" /><span className="text-white">Suporte priorizado</span></li>
            </ul>
            <PlanSubscribeButton planKey="advanced" label="Assinar Agora" buttonClassName="bg-white text-orange-500 py-2 hover:bg-gray-100" />
          </div>

          {/* Premium */}
          <div className="bg-white p-5 sm:p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow border-2 border-purple-200 flex flex-col">
            <div className="text-center mb-5 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Premium</h2>
              <div className="text-2xl sm:text-3xl font-bold text-purple-600 mb-1 sm:mb-2">R$ 150</div>
              <div className="text-sm sm:text-base text-gray-600">/mês</div>
            </div>
            <ul className="space-y-2 mb-6 text-sm">
              <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" /><span className="text-gray-800">Agenda online 24/7</span></li>
              <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" /><span className="text-gray-800">Link público com slug</span></li>
              <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" /><span className="text-gray-800">Botão de WhatsApp para confirmação</span></li>
              <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" /><span className="text-gray-800">Até 10 profissionais ativos</span></li>
              <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" /><span className="text-gray-800">Até 50 serviços</span></li>
              <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" /><span className="text-gray-800">Relatórios completos de receita</span></li>
              <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" /><span className="text-gray-800">Suporte prioritário</span></li>
            </ul>
            <PlanSubscribeButton planKey="premium" label="Assinar Agora" buttonClassName="bg-purple-600 text-white py-2 hover:bg-purple-700" />
          </div>
        </div>
      </main>
    </div>
  );
}
