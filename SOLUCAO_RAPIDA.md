# 🚀 Solução Rápida - Variáveis de Ambiente Vercel

## ❌ Problema: "No environment variables were created"

Isso acontece porque você precisa adicionar **UMA variável por vez** e **clicar em "Save"** após cada uma.

---

## ✅ Solução Passo a Passo

### 1️⃣ Abra o Painel da Vercel
- Vá em: https://vercel.com
- Entre no seu projeto
- Clique em **Settings** → **Environment Variables**

### 2️⃣ Adicione a Primeira Variável

Na linha que aparece, preencha:

**Key:** Cole EXATAMENTE assim (sem espaços):
```
SUPABASE_SERVICE_ROLE_KEY
```

**Value:** Cole a chave que você pegou no Supabase

**Checkboxes:** Marque TODAS:
- ✅ Production
- ✅ Preview  
- ✅ Development

Clique em **"Add"**

Depois, role até embaixo e clique em **"Save"** (botão grande)

---

### 3️⃣ Adicione a Segunda Variável

Clique em **"Add Variable"** novamente e repita:

**Key:**
```
NEXT_PUBLIC_SUPABASE_URL
```

**Value:** Cole a URL do seu projeto Supabase (ex: https://abc123.supabase.co)

Marque TODAS as checkboxes

Clique em **"Add"** → Depois **"Save"**

---

### 4️⃣ Adicione a Terceira Variável

**Key:**
```
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

**Value:** Cole a chave anon do Supabase

Marque TODAS as checkboxes

Clique em **"Add"** → Depois **"Save"**

---

## ✅ Verificar

Você deve ver 3 variáveis listadas na tabela.

---

## 🔄 Redeploy

1. Vá em **Deployments**
2. Clique nos ⋮ (3 pontinhos) do último deploy
3. Clique em **Redeploy**
4. Aguarde finalizar

---

## ✨ Testar

Tente criar um usuário novamente no site!

---

## ⚠️ Se Ainda Der Erro

Enviam-me um print da tela mostrando:
1. As 3 variáveis configuradas
2. A mensagem de erro que aparece ao tentar criar usuário

