# 📝 Passo a Passo - Configurar Variáveis na Vercel

## ⚠️ IMPORTANTE
Adicione **UMA variável por vez**, clicando em "Save" após cada uma.

---

## 📍 Passo 1: Entrar no Projeto

1. Acesse [vercel.com](https://vercel.com)
2. Faça login
3. Clique no seu projeto (reserve-me)

---

## 📍 Passo 2: Ir em Settings → Environment Variables

1. Clique em **"Settings"** (no topo)
2. Clique em **"Environment Variables"** (menu lateral)

---

## 📍 Passo 3: Adicionar PRIMEIRA Variável

### Variável: `SUPABASE_SERVICE_ROLE_KEY`

1. No campo "Key", digite:
   ```
   SUPABASE_SERVICE_ROLE_KEY
   ```

2. No campo "Value", cole a chave que você pegou no Supabase:
   - Vá no Supabase → Settings → API
   - Encontre "service_role"
   - Clique em "Reveal"
   - Copie toda a chave
   - Cole no campo "Value"

3. **IMPORTANTE**: Marque TODAS as opções:
   - ✅ Production
   - ✅ Preview
   - ✅ Development

4. Clique em **"Add"** (não "Save" ainda!)

5. **DEPOIS** de ver que aparece embaixo, clique em **"Save"**

---

## 📍 Passo 4: Adicionar SEGUNDA Variável

### Variável: `NEXT_PUBLIC_SUPABASE_URL`

1. Digite no campo "Key":
   ```
   NEXT_PUBLIC_SUPABASE_URL
   ```

2. No campo "Value", cole a URL do Supabase:
   - Formato: `https://xxxxx.supabase.co`
   - Você encontra em: Supabase → Settings → API → Project URL

3. Marque TODAS as opções:
   - ✅ Production
   - ✅ Preview
   - ✅ Development

4. Clique em **"Add"**

5. Clique em **"Save"**

---

## 📍 Passo 5: Adicionar TERCEIRA Variável

### Variável: `NEXT_PUBLIC_SUPABASE_ANON_KEY`

1. Digite no campo "Key":
   ```
   NEXT_PUBLIC_SUPABASE_ANON_KEY
   ```

2. No campo "Value", cole a chave anon:
   - Vá no Supabase → Settings → API
   - Encontre "anon public"
   - Copie a chave
   - Cole no campo "Value"

3. Marque TODAS as opções:
   - ✅ Production
   - ✅ Preview
   - ✅ Development

4. Clique em **"Add"**

5. Clique em **"Save"**

---

## ✅ Verificar se Funcionou

Após adicionar as 3 variáveis, você deve ver uma tabela com:
- ✅ SUPABASE_SERVICE_ROLE_KEY
- ✅ NEXT_PUBLIC_SUPABASE_URL
- ✅ NEXT_PUBLIC_SUPABASE_ANON_KEY

---

## 🔄 Fazer Redeploy

1. Vá na aba **"Deployments"** (no topo)
2. Clique nos **3 pontinhos** (⋮) do último deploy
3. Clique em **"Redeploy"**
4. Confirme

Aguarde o deploy finalizar e teste criar um usuário novamente!

---

## 🐛 Se Ainda Não Funcionar

Tire um print da tela e me envie:
- Tela com as variáveis configuradas
- Mensagem de erro que aparece ao criar usuário

