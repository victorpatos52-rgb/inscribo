# 🗄️ Configuração do Banco de Dados Supabase

## 📋 Passo a Passo

### 1️⃣ **Criar Projeto no Supabase**
1. Acesse [supabase.com](https://supabase.com)
2. Clique em "Start your project"
3. Faça login ou crie uma conta
4. Clique em "New Project"
5. Escolha sua organização
6. Preencha:
   - **Project Name**: `inscribo-crm`
   - **Database Password**: Crie uma senha forte
   - **Region**: Escolha a mais próxima (ex: South America)
7. Clique em "Create new project"
8. ⏳ Aguarde alguns minutos para o projeto ser criado

### 2️⃣ **Obter Credenciais**
1. No painel do Supabase, vá em **Settings** → **API**
2. Copie as seguintes informações:
   - **Project URL** (ex: `https://xyzabc123.supabase.co`)
   - **anon public key** (chave longa que começa com `eyJ...`)

### 3️⃣ **Configurar Variáveis de Ambiente**
1. Na raiz do projeto, crie um arquivo `.env`
2. Cole as credenciais:

```env
VITE_SUPABASE_URL=https://seuprojetoid.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4️⃣ **Executar Migração do Banco**
1. No painel do Supabase, vá em **SQL Editor**
2. Clique em "New query"
3. Primeiro, cole todo o conteúdo do arquivo `supabase/migrations/create_initial_schema_safe.sql`
4. Clique em "Run" para executar
5. Em seguida, cole o conteúdo do arquivo `supabase/migrations/create_admin_user.sql`
6. Clique em "Run" novamente
7. ✅ Verifique se todas as tabelas foram criadas em **Table Editor**
8. ✅ Verifique se o usuário admin foi criado em **Authentication** → **Users**

### 5️⃣ **Configurar Autenticação**
1. Vá em **Authentication** → **Settings**
2. Em **Site URL**, adicione: `http://localhost:5173`
3. Em **Redirect URLs**, adicione: `http://localhost:5173/**`
4. **Desabilite** "Enable email confirmations" (para facilitar testes)

### 6️⃣ **Testar Conexão**
1. Reinicie o servidor de desenvolvimento (`npm run dev`)
2. Acesse o sistema
3. Tente fazer login - agora usará o banco real!

## 🔧 **Dados Iniciais (Opcional)**

Para popular o banco com dados de exemplo, execute no SQL Editor:

```sql
-- Criar instituição exemplo
INSERT INTO institutions (name, primary_color, secondary_color) 
VALUES ('Escola Exemplo', '#8B5CF6', '#06B6D4');

-- Criar usuário admin (após fazer signup no sistema)
-- O perfil será criado automaticamente via trigger
```

## ✅ **Verificação**

Após configurar, você deve ver:
- ✅ Login real funcionando
- ✅ Dados persistindo entre sessões
- ✅ Todas as funcionalidades mantidas
- ✅ Segurança RLS ativa

## 🆘 **Problemas Comuns**

### Erro "Invalid API Key"
- Verifique se copiou a chave correta (anon public)
- Certifique-se que não há espaços extras

### Erro "Failed to fetch"
- Verifique se a URL está correta
- Confirme se o projeto está ativo no Supabase

### Tabelas não aparecem
- Execute novamente a migração SQL
- Verifique se não houve erros na execução

---

💡 **Dica**: Mantenha o arquivo `.env` seguro e nunca o commite no Git!