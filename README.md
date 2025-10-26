# Reserve.me

Um sistema completo de agendamento online feito especialmente para salões de beleza, barbearias e clínicas. Surgiu da necessidade de ajudar pequenos negócios a se organizarem melhor e não perderem clientes por causa de desorganização na agenda.

## Sobre o Projeto

A ideia nasceu quando percebi que muitos profissionais do ramo de beleza e barbearias ainda dependem de anotações manuais ou sistemas caros demais. Criei o Reserve.me pensando em quem está começando ou já tem um negócio estabelecido mas ainda não automatizou os agendamentos.

O sistema é simples, direto ao ponto e focado em resolver o problema real: fazer os clientes agendarem sozinhos, 24 horas por dia, enquanto você cuida do que realmente importa.

## Configuração do Mercado Pago

### 1. Criar Conta no Mercado Pago
- Acesse [mercadopago.com.br](https://mercadopago.com.br)
- Crie uma conta de desenvolvedor
- Acesse suas credenciais na seção "Suas integrações"

### 2. Configurar Variáveis de Ambiente
Adicione no arquivo `.env.local`:

```env
# Mercado Pago
MERCADOPAGO_ACCESS_TOKEN=APP_USR-3624930204910165-102611-c89ff9d10d57094a4a97fff725d4caf0-433618265
MERCADOPAGO_PUBLIC_KEY=APP_USR-5bca32b9-8570-4a01-8085-b5a384f8720c
NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=APP_USR-5bca32b9-8570-4a01-8085-b5a384f8720c
NEXT_PUBLIC_BASE_URL=https://seu-dominio.com
```

### 3. Configurar Webhook
No painel do Mercado Pago:
- Acesse "Webhooks" nas configurações
- Adicione a URL: `https://seu-dominio.com/api/payment/webhook`
- Selecione os eventos: `payment`

### 4. Atualizar Banco de Dados
Execute o SQL no Supabase:

```sql
-- Adicionar campos de pagamento
ALTER TABLE public.appointments 
ADD COLUMN IF NOT EXISTS payment_id TEXT,
ADD COLUMN IF NOT EXISTS payment_status TEXT,
ADD COLUMN IF NOT EXISTS payment_amount DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS payment_method TEXT,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
```

## Como Usar o Sistema de Pagamento

### Para Clientes:
1. Cliente agenda um serviço
2. É redirecionado para página de pagamento
3. Escolhe entre cartão ou PIX
4. Completa o pagamento no Mercado Pago
5. Recebe confirmação por email

### Para Estabelecimentos:
1. Recebem notificação de pagamento aprovado
2. Podem ver status dos pagamentos no dashboard
3. Relatórios de faturamento automáticos

## Funcionalidades Principais

**Agendamento Online** - Clientes acessam o link único do estabelecimento e agendam sozinhos, qualquer hora do dia ou da noite.

**Gestão de Profissionais** - Cada profissional tem sua própria agenda. Dá pra ver quem tem mais cliente, quem tá disponível e controlar tudo com facilidade.

**CRM de Clientes** - Guarda nome, telefone, email de cada cliente. Vai acumulando histórico conforme vão agendando.

**Relatórios** - Nos planos pagos, dá pra ver faturamento, quantos atendimentos foram feitos no mês, ticket médio e outras métricas importantes.

**Link Personalizado** - Cada estabelecimento ganha seu próprio link: reserve.me/agendar/seu-salao. É só compartilhar e os clientes agendam direto.

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

**Gratuito (R$ 0/mês)** - Pra profissional autônomo que tá começando
- 1 usuário
- 1 estabelecimento  
- Agenda online e página pública de agendamento
- Gestão de serviços
- CRM básico de clientes

**Básico (R$ 45/mês)** - Pra quem tem até 3 funcionários
- Até 3 funcionários
- Agenda individual por funcionário
- CRM completo com histórico
- Relatórios simples de faturamento

**Avançado (R$ 90/mês)** - Mais popular, pra negócios em crescimento
- Até 6 funcionários
- Lembretes automáticos via WhatsApp
- Relatórios financeiros (fluxo de caixa, ticket médio)
- Gestão de comissões

**Premium (R$ 150/mês)** - Pra quem tem múltiplos estabelecimentos
- Até 7 funcionários
- Até 2 estabelecimentos (multi-loja)
- Gestão de estoque
- Relatórios de desempenho e comparativos
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
└── CONFIGURACAO-SUPABASE.md # Instruções do banco
```

## Scripts Disponíveis

- `npm run dev` - Inicia em modo desenvolvimento
- `npm run build` - Gera build de produção
- `npm run start` - Roda o build de produção
- `npm run lint` - Verifica erros de código

## Deploy na Vercel

A forma mais fácil de fazer deploy é na Vercel. Criei um documento detalhado em `DEPLOY-VERCEL.md` explicando passo a passo.

Resumindo: conecta o GitHub, configura as variáveis de ambiente e pronto. Toda vez que fizer push na main, atualiza automaticamente.

## Licença

MIT License - Usa à vontade, modifica, compartilha.

## Contato

Email: juniorgn7dev@gmail.com

GitHub: [@AndersonJr-Dev](https://github.com/AndersonJr-Dev)

Site: https://andersondev-silk.vercel.app

---

Desenvolvido por mim, Anderson Junior. Decidi criar isso porque acredito que automatização não deve custar um rim. Qualquer dúvida, só chamar.
