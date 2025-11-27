# Reserve.me

Um sistema completo de agendamento online feito especialmente para salões de beleza e barbearias. Surgiu da necessidade de ajudar pequenos negócios a se organizarem melhor e não perderem clientes por causa de desorganização na agenda.

## Sobre o Projeto

A ideia nasceu quando percebi que muitos profissionais do ramo de beleza e barbearias ainda dependem de anotações manuais ou sistemas caros demais. Criei o Reserve.me pensando em quem está começando ou já tem um negócio estabelecido mas ainda não automatizou os agendamentos.

O sistema é simples, direto ao ponto e focado em resolver o problema real: fazer os clientes agendarem sozinhos, 24 horas por dia, enquanto você cuida do que realmente importa.

## Configuração do Stripe

Integração Stripe em produção: consultar documentação interna de operação.

(link interno será adicionado quando disponível)

## Como Usar o Sistema de Pagamento

### Para Clientes:
1. Cliente agenda um serviço ou escolhe um plano
2. É redirecionado para o Stripe Checkout
3. Finaliza com cartão de crédito/débito ou carteiras digitais
4. Recebe confirmação automática do Stripe por email sobre o pagamento

### Para Estabelecimentos:
1. Recebem o status atualizado no dashboard
2. Supabase registra o ID do pagamento e o status
3. Métricas de receita usam os dados do Stripe nos planos pagos

## Funcionalidades Principais

**Agendamento Online** – Clientes acessam o link único do estabelecimento e agendam sozinhos, 24/7.

**Gestão de Profissionais** – Controle de profissionais com limites por plano.

**Gestão de Serviços** – Cadastro de serviços com preço e duração, limitado por plano.

**Métricas de Receita (Planos Pagos)** – Visual de receita diária/semanal/mensal no dashboard, com exportação CSV.

**Link Personalizado** – Cada estabelecimento ganha seu próprio link público de agendamento.

**WhatsApp de Confirmação** – Botão de WhatsApp com template personalizável para confirmar presença (envio manual pelo usuário). Não há disparo automático neste momento.

**Checkout Seguro (Stripe)** – Pagamentos de serviços e assinaturas com atualização automática do status.

## Tecnologias que Usei

- **Next.js 16** - Framework React mais rápido que já usei
- **TypeScript** - Prefiro ter certeza do que estou fazendo, TypeScript me ajuda nisso
- **Tailwind CSS** - CSS sem frescura, escrevo direto no componente
- **Supabase** - Banco de dados PostgreSQL + autenticação. Prático demais
- **Lucide Icons** - Ícones bonitos e leves

## Como Rodar o Projeto

### 1. Clone o repositório
```bash
git clone https://github.com/AndersonJr-Dev/reserve-me-saas.git
cd reserve-me-saas
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Configure o Supabase

Primeiro, crie uma conta no [Supabase](https://supabase.com) e crie um novo projeto.

Depois, copie o arquivo `env.example` e renomeie para `.env.local`. Preencha com as credenciais do seu projeto Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-publica
```

### 4. Configure o Banco de Dados

No Supabase, acesse o SQL Editor e rode os scripts que estão no arquivo `permanent-rls-solution.sql`. Isso vai criar as tabelas e configurar as permissões.

### 5. Execute o projeto
```bash
npm run dev
```

Acesse `http://localhost:3000` e veja funcionando.

## Planos Disponíveis

**Grátis (R$ 0/mês)** – Para começar sem custo
- 1 profissional ativo
- Até 5 serviços
- Agenda online e link público
- Botão de WhatsApp para confirmação (manual)
- Sem métricas de receita/CRM

**Básico (R$ 45/mês)** – Para operar com o essencial
- Até 3 profissionais ativos
- Até 10 serviços
- Agenda online
- Link público com slug
- Métricas de receita básicas no dashboard

**Avançado (R$ 90/mês)** – Mais atrativo para crescimento
- Até 6 profissionais ativos
- Até 20 serviços
- Métricas de receita completas
- Priorização de suporte

**Premium (R$ 150/mês)** – Para grandes salões e franquias
- Até 10 profissionais ativos
- Até 50 serviços
- Relatórios completos de receita
- Suporte prioritário

## Estrutura do Projeto

```
reserve-me-saas/
├── app/                      # Páginas Next.js
│   ├── agendar/[slug]/       # Onde os clientes agendam
│   ├── cadastro/             # Cadastro de novos usuários
│   ├── login/                # Login
│   ├── dashboard/            # Painel administrativo
│   │   ├── configuracoes/   # Configurações do salão
│   │   ├── profissionais/    # Gestão de funcionários
│   │   └── servicos/        # Gestão de serviços
│   └── api/auth/            # Endpoints de autenticação
├── src/lib/supabase/        # Cliente do Supabase
├── components/              # Componentes reutilizáveis
├── public/                  # Arquivos estáticos
└── ...
```

## Scripts Disponíveis

- `npm run dev` - Inicia em modo desenvolvimento
- `npm run build` - Gera build de produção
- `npm run start` - Roda o build de produção

## Deploy na Vercel

A forma mais fácil de fazer deploy é na Vercel: conecte o GitHub, configure as variáveis de ambiente e a plataforma cuida dos builds. Toda vez que fizer push na `main`, atualiza automaticamente.

## Licença

MIT License - Usa à vontade, modifica, compartilha.

## Autor

Nome: Anderson Assumpção Junior  
Email: juniorgn7dev@gmail.com  
GitHub: [@AndersonJr-Dev](https://github.com/AndersonJr-Dev)
