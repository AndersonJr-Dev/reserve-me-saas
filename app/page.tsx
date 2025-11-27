import Link from 'next/link';
import { Calendar, Users, Clock, CheckCircle, Star, ArrowRight, Phone, Mail, MapPin, BarChart3, CreditCard, Scissors } from 'lucide-react';

import PlanSubscribeButton from './components/plan-subscribe-button';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-3 sm:py-4">
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-orange-500 to-red-500 p-2 rounded-lg">
                <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <span className="ml-2 sm:ml-3 text-xl sm:text-2xl font-bold text-gray-900">Reserve.me</span>
            </div>
            <nav className="hidden lg:flex space-x-8">
              <a href="#funcionalidades" className="text-gray-600 hover:text-orange-500 transition-colors">Funcionalidades</a>
              <a href="#planos" className="text-gray-600 hover:text-orange-500 transition-colors">Planos</a>
              <a href="#contato" className="text-gray-600 hover:text-orange-500 transition-colors">Contato</a>
            </nav>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Link 
                href="/login" 
                className="hidden sm:inline text-gray-600 hover:text-orange-500 transition-colors font-medium text-sm sm:text-base"
              >
                Entrar
              </Link>
              <Link 
                href="/cadastro" 
                className="bg-orange-500 text-white px-3 py-1.5 sm:px-6 sm:py-2 rounded-lg hover:bg-orange-600 transition-colors font-medium text-sm sm:text-base"
              >
                <span className="hidden sm:inline">Criar Conta</span>
                <span className="sm:hidden">Cadastro</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-orange-50 to-red-50 py-12 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6 px-4">
              Sistema de Agendamento
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500"> Online</span>
          </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-6 sm:mb-8 max-w-3xl mx-auto px-4">
              Automatize seus agendamentos e transforme seu salão ou barbearia em um negócio que funciona 24 horas por dia. 
              Seus clientes agendam online, você foca no que importa.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
              <Link 
                href="/cadastro"
                className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 sm:px-8 sm:py-4 rounded-lg hover:from-orange-600 hover:to-red-600 transition-all font-semibold text-base sm:text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                Começar Agora
                <ArrowRight className="inline ml-2 w-4 h-4 sm:w-5 sm:h-5" />
              </Link>
              <Link 
                href="/cadastro?plan=basic&trial=true"
                className="border-2 border-orange-500 text-orange-500 px-6 py-3 sm:px-8 sm:py-4 rounded-lg hover:bg-orange-500 hover:text-white transition-all font-semibold text-base sm:text-lg"
              >
                Teste Grátis 7 Dias
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="funcionalidades" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Funcionalidades que Fazem a Diferença
            </h2>
            <p className="text-xl text-gray-600">
              Tudo que você precisa para gerenciar seu negócio de forma profissional
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-orange-50 to-red-50 p-8 rounded-xl hover:shadow-lg transition-shadow">
              <div className="bg-orange-500 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Agendamento 24/7</h3>
              <p className="text-gray-600">
                Seus clientes podem agendar a qualquer hora do dia ou da noite, mesmo quando você está dormindo.
              </p>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-red-50 p-8 rounded-xl hover:shadow-lg transition-shadow">
              <div className="bg-orange-500 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Gestão de Profissionais</h3>
              <p className="text-gray-600">
                Organize sua equipe, defina especialidades e permita que clientes escolham seu profissional favorito.
              </p>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-red-50 p-8 rounded-xl hover:shadow-lg transition-shadow">
              <div className="bg-orange-500 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Horários Flexíveis</h3>
              <p className="text-gray-600">
                Configure horários de funcionamento, intervalos e disponibilidade personalizada para cada profissional.
              </p>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-red-50 p-8 rounded-xl hover:shadow-lg transition-shadow">
              <div className="bg-orange-500 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Confirmação Simplificada</h3>
              <p className="text-gray-600">
                Confirmações pelo WhatsApp e status automático em pagamentos, reduzindo faltas e agilizando o fluxo.
              </p>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-red-50 p-8 rounded-xl hover:shadow-lg transition-shadow">
              <div className="bg-orange-500 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <Star className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Link Personalizado</h3>
              <p className="text-gray-600">
                Cada estabelecimento tem seu próprio link único: reserve.me/agendar/seu-salao
              </p>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-red-50 p-8 rounded-xl hover:shadow-lg transition-shadow">
              <div className="bg-orange-500 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <Phone className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Integração WhatsApp</h3>
              <p className="text-gray-600">
                Botão de WhatsApp com mensagem personalizada para confirmações e contato direto com clientes.
              </p>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-red-50 p-8 rounded-xl hover:shadow-lg transition-shadow">
              <div className="bg-orange-500 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <Scissors className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Gestão de Serviços</h3>
              <p className="text-gray-600">
                Cadastre serviços com preço e duração, organize sua oferta por plano.
              </p>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-red-50 p-8 rounded-xl hover:shadow-lg transition-shadow">
              <div className="bg-orange-500 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Métricas de Receita/CRM</h3>
              <p className="text-gray-600">
                Acompanhe receita diária, semanal e mensal; exporte dados em CSV.
              </p>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-red-50 p-8 rounded-xl hover:shadow-lg transition-shadow">
              <div className="bg-orange-500 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Checkout Seguro</h3>
              <p className="text-gray-600">
                Pagamentos e assinaturas via Stripe com atualizações automáticas no painel.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="planos" className="py-12 sm:py-20 bg-gradient-to-br from-gray-50 to-orange-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 px-4">
              Planos que Cabem no Seu Bolso
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 px-4">
              Escolha o plano ideal para o tamanho do seu negócio
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {/* Plano Gratuito */}
            <div className="bg-white p-5 sm:p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow border-2 border-gray-200">
              <div className="text-center mb-5 sm:mb-6">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Gratuito</h3>
                <div className="text-2xl sm:text-3xl font-bold text-green-500 mb-1 sm:mb-2">R$ 0</div>
                <div className="text-sm sm:text-base text-gray-600">/mês</div>
              </div>
              <ul className="space-y-2 mb-6 text-sm">
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                  <span className="text-gray-800">1 profissional ativo</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                  <span className="text-gray-800">Até 5 serviços</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                  <span className="text-gray-800">Agenda online 24/7</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                  <span className="text-gray-800">Link público com slug</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                  <span className="text-gray-800">Botão de WhatsApp para confirmação</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                  <span className="text-gray-800">Sem métricas de receita/CRM</span>
                </li>
              </ul>
              <Link href="/cadastro?plan=free" className="w-full bg-green-500 text-white py-2.5 sm:py-2 rounded-lg hover:bg-green-600 transition-colors font-semibold text-sm block text-center">
                Começar Grátis
              </Link>
            </div>

            {/* Plano Básico */}
            <div className="bg-white p-5 sm:p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-center mb-5 sm:mb-6">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Básico</h3>
                <div className="text-2xl sm:text-3xl font-bold text-orange-500 mb-1 sm:mb-2">R$ 45</div>
                <div className="text-sm sm:text-base text-gray-600">/mês</div>
              </div>
              <ul className="space-y-2 mb-6 text-sm">
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                  <span className="text-gray-800">Agenda online 24/7</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                  <span className="text-gray-800">Link público com slug</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                  <span className="text-gray-800">Botão de WhatsApp para confirmação</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                  <span className="text-gray-800">Até 3 profissionais ativos</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                  <span className="text-gray-800">Até 10 serviços</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                  <span className="text-gray-800">Métricas de receita básicas</span>
                </li>
              </ul>
              <PlanSubscribeButton
                planKey="basic"
                label="Assinar Agora"
                buttonClassName="bg-orange-500 text-white py-2 hover:bg-orange-600"
              />
            </div>

            {/* Plano Avançado */}
            <div className="relative bg-gradient-to-br from-orange-500 to-red-500 p-5 sm:p-6 rounded-xl shadow-xl transform scale-105">
              <span className="absolute -top-2 left-0 right-0 h-1 bg-white/70 rounded-t-xl"></span>
              <div className="text-center mb-5 sm:mb-6">
                <div className="bg-white text-orange-500 px-2 py-1 rounded-full text-xs font-semibold mb-2 sm:mb-3 inline-block">
                  Mais Popular
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-white mb-2">Avançado</h3>
                <div className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">R$ 90</div>
                <div className="text-sm sm:text-base text-orange-100">/mês</div>
              </div>
              <ul className="space-y-2 mb-6 text-sm">
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-white mr-2 flex-shrink-0" />
                  <span className="text-white">Agenda online 24/7</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-white mr-2 flex-shrink-0" />
                  <span className="text-white">Link público com slug</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-white mr-2 flex-shrink-0" />
                  <span className="text-white">Botão de WhatsApp para confirmação</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-white mr-2 flex-shrink-0" />
                  <span className="text-white">Até 6 profissionais ativos</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-white mr-2 flex-shrink-0" />
                  <span className="text-white">Até 20 serviços</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-white mr-2 flex-shrink-0" />
                  <span className="text-white">Métricas de receita completas</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-white mr-2 flex-shrink-0" />
                  <span className="text-white">Suporte priorizado</span>
                </li>
              </ul>
              <PlanSubscribeButton
                planKey="advanced"
                label="Assinar Agora"
                buttonClassName="bg-white text-orange-500 py-2 hover:bg-gray-100"
              />
            </div>

            {/* Plano Premium */}
            <div className="bg-white p-5 sm:p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow border-2 border-purple-200">
              <div className="text-center mb-5 sm:mb-6">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Premium</h3>
                <div className="text-2xl sm:text-3xl font-bold text-purple-600 mb-1 sm:mb-2">R$ 150</div>
                <div className="text-sm sm:text-base text-gray-600">/mês</div>
              </div>
              <ul className="space-y-2 mb-6 text-sm">
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                  <span className="text-gray-800">Agenda online 24/7</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                  <span className="text-gray-800">Link público com slug</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                  <span className="text-gray-800">Botão de WhatsApp para confirmação</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                  <span className="text-gray-800">Até 10 profissionais ativos</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                  <span className="text-gray-800">Até 50 serviços</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                  <span className="text-gray-800">Relatórios completos de receita</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                  <span className="text-gray-800">Suporte prioritário</span>
                </li>
              </ul>
              <PlanSubscribeButton
                planKey="premium"
                label="Assinar Agora"
                buttonClassName="bg-purple-600 text-white py-2 hover:bg-purple-700"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-orange-500 to-red-500">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-6">
            Pronto para Transformar seu Negócio?
          </h2>
          <p className="text-xl text-orange-100 mb-8">
            Junte-se a centenas de salões e barbearias que já automatizaram seus agendamentos
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/cadastro?plan=basic&trial=true"
              className="bg-white text-orange-500 px-8 py-4 rounded-lg hover:bg-gray-100 transition-colors font-semibold text-lg shadow-lg"
            >
              Teste Grátis por 7 Dias
            </Link>
            <Link 
              href="mailto:reserve.me.suporte@gmail.com?subject=Falar com Vendas"
              className="border-2 border-white text-white px-8 py-4 rounded-lg hover:bg-white hover:text-orange-500 transition-colors font-semibold text-lg"
            >
              Falar com Vendas
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contato" className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <div className="bg-gradient-to-r from-orange-500 to-red-500 p-2 rounded-lg">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <span className="ml-2 text-xl font-bold">Reserve.me</span>
              </div>
              <p className="text-gray-400">
                A plataforma de agendamento online que seu negócio precisa para crescer.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Produto</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#funcionalidades" className="hover:text-orange-500 transition-colors">Funcionalidades</a></li>
                <li><a href="#planos" className="hover:text-orange-500 transition-colors">Planos</a></li>
                <li><a href="https://github.com/AndersonJr-Dev/reserve-me-saas#readme" className="hover:text-orange-500 transition-colors" target="_blank" rel="noopener noreferrer">Documentação</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Suporte</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="mailto:reserve.me.suporte@gmail.com" className="hover:text-orange-500 transition-colors">Central de Ajuda</a></li>
                <li><a href="mailto:reserve.me.suporte@gmail.com" className="hover:text-orange-500 transition-colors">Contato</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Contato</h3>
              <div className="space-y-2 text-gray-400">
                <div className="flex items-center">
                  <Mail className="w-4 h-4 mr-2" />
                  <span>reserve.me.suporte@gmail.com</span>
                </div>
                <div className="flex items-center">
                  <Phone className="w-4 h-4 mr-2" />
                  <span>(21) 99422-0180</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-2" />
                  <span>Rio de Janeiro, RJ</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Reserve.me. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
