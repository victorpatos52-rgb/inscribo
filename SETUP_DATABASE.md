# 🗄️ Configuração do Banco de Dados Supabase

## 📋 Passo a Passo

### ⚠️ IMPORTANTE: Configurar Autenticação PRIMEIRO

**Antes de executar qualquer SQL, configure a autenticação:**

1. **Vá para Authentication → Settings** no Supabase
2. **Desabilite "Enable email confirmations"**
3. **Salve as configurações**

**Sem isso, o login não funcionará!**

---

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
3. **Execute APENAS este SQL (não use os outros arquivos):**

```sql
-- Criar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela de instituições
CREATE TABLE institutions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  logo_url text,
  primary_color text DEFAULT '#8B5CF6',
  secondary_color text DEFAULT '#06B6D4',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabela de perfis de usuário
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  avatar_url text,
  role text DEFAULT 'user' CHECK (role IN ('admin', 'manager', 'user')),
  institution_id uuid REFERENCES institutions(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabela de estágios de leads
CREATE TABLE lead_stages (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  institution_id uuid REFERENCES institutions(id) NOT NULL,
  name text NOT NULL,
  color text DEFAULT '#6B7280',
  order_index integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabela de leads
CREATE TABLE leads (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  institution_id uuid REFERENCES institutions(id) NOT NULL,
  name text NOT NULL,
  email text,
  phone text,
  course_interest text,
  stage_id uuid REFERENCES lead_stages(id),
  source text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabela de visitas
CREATE TABLE visits (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id uuid REFERENCES leads(id) ON DELETE CASCADE,
  scheduled_date timestamptz NOT NULL,
  status text DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no_show')),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabela de interações
CREATE TABLE interactions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id uuid REFERENCES leads(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('call', 'email', 'whatsapp', 'visit', 'other')),
  description text NOT NULL,
  date timestamptz DEFAULT now(),
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabela de mudanças de estágio
CREATE TABLE stage_changes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id uuid REFERENCES leads(id) ON DELETE CASCADE,
  from_stage_id uuid REFERENCES lead_stages(id),
  to_stage_id uuid REFERENCES lead_stages(id),
  changed_by uuid REFERENCES profiles(id),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabela de webhooks
CREATE TABLE webhooks (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  institution_id uuid REFERENCES institutions(id) NOT NULL,
  name text NOT NULL,
  url text NOT NULL,
  events text[] NOT NULL,
  active boolean DEFAULT true,
  secret text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE stage_changes ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;

-- Políticas RLS básicas
CREATE POLICY "Authenticated users can read institutions" ON institutions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can read own profile" ON profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Inserir dados iniciais
INSERT INTO institutions (id, name, logo_url, primary_color, secondary_color) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Escola Exemplo', null, '#8B5CF6', '#06B6D4');

INSERT INTO lead_stages (id, institution_id, name, color, order_index) VALUES
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Novo Lead', '#6B7280', 1),
  ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Contato Inicial', '#F59E0B', 2),
  ('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'Visita Agendada', '#3B82F6', 3),
  ('00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 'Matriculado', '#10B981', 4);

-- Função para criar perfil automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, institution_id)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    'user',
    '00000000-0000-0000-0000-000000000001'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar perfil automaticamente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Criar usuário admin diretamente no auth.users
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-000000000001',
  'authenticated',
  'authenticated',
  'admin@inscribo.com',
  crypt('admin123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"full_name": "Administrador"}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
);

-- Criar perfil para o admin
INSERT INTO public.profiles (id, email, full_name, role, institution_id)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'admin@inscribo.com',
  'Administrador',
  'admin',
  '00000000-0000-0000-0000-000000000001'
);
```

4. Clique em "Run" para executar

### 5️⃣ **Criar o Usuário Admin**

**Depois de executar o SQL acima:**

1. **Vá para Authentication → Users** no Supabase
2. **Clique em "Add user"**
3. **Preencha:**
   - Email: `admin@inscribo.com`
   - Password: `admin123`
   - Auto Confirm User: ✅ **MARQUE ESTA OPÇÃO**
4. **Clique em "Create user"**

### 6️⃣ **Configurar Autenticação**
1. Vá em **Authentication** → **Settings**
2. Em **Site URL**, adicione: `http://localhost:5173`
3. Em **Redirect URLs**, adicione: `http://localhost:5173/**`
4. **Desabilite** "Enable email confirmations" (para facilitar testes)

### 7️⃣ **Verificar se funcionou**

1. Vá em **Authentication** → **Users**
2. Você deve ver o usuário `admin@inscribo.com`
3. Vá em **Table Editor** e verifique se todas as tabelas foram criadas
4. Teste o login no sistema

### 8️⃣ **Testar Conexão**
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

## 🔑 Credenciais de Acesso

- **E-mail:** `admin@inscribo.com`
- **Senha:** `admin123`

## ✅ **Verificação**

Após configurar, você deve ver:
- ✅ Login real funcionando
- ✅ Dados persistindo entre sessões
- ✅ Todas as funcionalidades mantidas
- ✅ Segurança RLS ativa

## ⚠️ Importante

- ✅ **Confirmação de e-mail DEVE estar desabilitada**
- ✅ **Auto Confirm User DEVE estar marcado** ao criar o usuário
- Este é um setup básico para desenvolvimento/demonstração

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