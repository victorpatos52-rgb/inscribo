/*
  # Schema Inicial do Inscribo CRM

  1. Tabelas Principais
    - `profiles` - Perfis de usuários
    - `institutions` - Instituições de ensino
    - `leads` - Leads/prospects
    - `visits` - Visitas agendadas
    - `lead_stages` - Etapas do funil
    - `interactions` - Interações com leads
    - `stage_changes` - Histórico de mudanças de etapa

  2. Segurança
    - RLS habilitado em todas as tabelas
    - Políticas de acesso baseadas em autenticação
    - Triggers para auditoria automática

  3. Funcionalidades
    - Timestamps automáticos
    - Soft deletes onde apropriado
    - Índices para performance
*/

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela de instituições
CREATE TABLE IF NOT EXISTS institutions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  logo_url text,
  primary_color text DEFAULT '#8B5CF6',
  secondary_color text DEFAULT '#06B6D4',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabela de perfis de usuários
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  role text NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  institution_id uuid REFERENCES institutions(id),
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabela de etapas do funil
CREATE TABLE IF NOT EXISTS lead_stages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  name text NOT NULL,
  color text NOT NULL DEFAULT '#6366F1',
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Tabela de leads
CREATE TABLE IF NOT EXISTS leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  assigned_to uuid REFERENCES profiles(id),
  student_name text NOT NULL,
  parent_name text,
  email text,
  phone text,
  grade_level text,
  course_interest text,
  current_stage uuid REFERENCES lead_stages(id),
  source text NOT NULL DEFAULT 'website',
  notes text,
  birth_date date,
  address text,
  city text,
  state text,
  zip_code text,
  parent_phone text,
  parent_email text,
  emergency_contact text,
  emergency_phone text,
  medical_info text,
  previous_school text,
  transfer_reason text,
  interests text,
  learning_difficulties text,
  family_income text,
  scholarship_interest boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabela de visitas
CREATE TABLE IF NOT EXISTS visits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  scheduled_by uuid REFERENCES profiles(id),
  title text NOT NULL,
  description text,
  scheduled_date timestamptz NOT NULL,
  duration_minutes integer DEFAULT 60,
  status text NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no_show')),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabela de interações
CREATE TABLE IF NOT EXISTS interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id),
  type text NOT NULL CHECK (type IN ('call', 'email', 'whatsapp', 'visit', 'note')),
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Tabela de mudanças de etapa
CREATE TABLE IF NOT EXISTS stage_changes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  from_stage_id uuid REFERENCES lead_stages(id),
  to_stage_id uuid NOT NULL REFERENCES lead_stages(id),
  changed_by uuid NOT NULL REFERENCES profiles(id),
  changed_at timestamptz DEFAULT now(),
  notes text
);

-- Tabela de webhooks
CREATE TABLE IF NOT EXISTS webhooks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  name text NOT NULL,
  url text NOT NULL,
  events text[] NOT NULL DEFAULT '{}',
  active boolean DEFAULT true,
  secret_key text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE stage_changes ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança para profiles
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Políticas para institutions (admins podem gerenciar)
CREATE POLICY "Authenticated users can read institutions"
  ON institutions
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage institutions"
  ON institutions
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Políticas para lead_stages
CREATE POLICY "Users can read lead stages"
  ON lead_stages
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage lead stages"
  ON lead_stages
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Políticas para leads
CREATE POLICY "Users can read leads from their institution"
  ON leads
  FOR SELECT
  TO authenticated
  USING (
    institution_id IN (
      SELECT institution_id FROM profiles 
      WHERE profiles.id = auth.uid()
    )
  );

CREATE POLICY "Users can create leads"
  ON leads
  FOR INSERT
  TO authenticated
  WITH CHECK (
    institution_id IN (
      SELECT institution_id FROM profiles 
      WHERE profiles.id = auth.uid()
    )
  );

CREATE POLICY "Users can update leads from their institution"
  ON leads
  FOR UPDATE
  TO authenticated
  USING (
    institution_id IN (
      SELECT institution_id FROM profiles 
      WHERE profiles.id = auth.uid()
    )
  );

-- Políticas para visits
CREATE POLICY "Users can read visits from their institution"
  ON visits
  FOR SELECT
  TO authenticated
  USING (
    lead_id IN (
      SELECT id FROM leads 
      WHERE institution_id IN (
        SELECT institution_id FROM profiles 
        WHERE profiles.id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can manage visits"
  ON visits
  FOR ALL
  TO authenticated
  USING (
    lead_id IN (
      SELECT id FROM leads 
      WHERE institution_id IN (
        SELECT institution_id FROM profiles 
        WHERE profiles.id = auth.uid()
      )
    )
  );

-- Políticas para interactions
CREATE POLICY "Users can read interactions from their institution"
  ON interactions
  FOR SELECT
  TO authenticated
  USING (
    lead_id IN (
      SELECT id FROM leads 
      WHERE institution_id IN (
        SELECT institution_id FROM profiles 
        WHERE profiles.id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can create interactions"
  ON interactions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    lead_id IN (
      SELECT id FROM leads 
      WHERE institution_id IN (
        SELECT institution_id FROM profiles 
        WHERE profiles.id = auth.uid()
      )
    )
  );

-- Políticas para stage_changes
CREATE POLICY "Users can read stage changes from their institution"
  ON stage_changes
  FOR SELECT
  TO authenticated
  USING (
    lead_id IN (
      SELECT id FROM leads 
      WHERE institution_id IN (
        SELECT institution_id FROM profiles 
        WHERE profiles.id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can create stage changes"
  ON stage_changes
  FOR INSERT
  TO authenticated
  WITH CHECK (
    lead_id IN (
      SELECT id FROM leads 
      WHERE institution_id IN (
        SELECT institution_id FROM profiles 
        WHERE profiles.id = auth.uid()
      )
    )
  );

-- Políticas para webhooks (apenas admins)
CREATE POLICY "Admins can manage webhooks"
  ON webhooks
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_institutions_updated_at 
  BEFORE UPDATE ON institutions 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at 
  BEFORE UPDATE ON profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leads_updated_at 
  BEFORE UPDATE ON leads 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_visits_updated_at 
  BEFORE UPDATE ON visits 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_webhooks_updated_at 
  BEFORE UPDATE ON webhooks 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Função para criar perfil automaticamente após signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Usuário'),
    'user'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar perfil automaticamente
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_leads_institution_id ON leads(institution_id);
CREATE INDEX IF NOT EXISTS idx_leads_assigned_to ON leads(assigned_to);
CREATE INDEX IF NOT EXISTS idx_leads_current_stage ON leads(current_stage);
CREATE INDEX IF NOT EXISTS idx_visits_lead_id ON visits(lead_id);
CREATE INDEX IF NOT EXISTS idx_visits_scheduled_date ON visits(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_interactions_lead_id ON interactions(lead_id);
CREATE INDEX IF NOT EXISTS idx_stage_changes_lead_id ON stage_changes(lead_id);
CREATE INDEX IF NOT EXISTS idx_profiles_institution_id ON profiles(institution_id);

-- Inserir dados iniciais (etapas padrão)
INSERT INTO lead_stages (name, color, order_index, institution_id) 
SELECT 
  stage_name,
  stage_color,
  stage_order,
  id as institution_id
FROM (
  VALUES 
    ('Novo', '#8B5CF6', 1),
    ('Contato', '#06B6D4', 2),
    ('Agendado', '#F59E0B', 3),
    ('Visita', '#EC4899', 4),
    ('Proposta', '#EF4444', 5),
    ('Matrícula', '#10B981', 6)
) AS stages(stage_name, stage_color, stage_order)
CROSS JOIN institutions
WHERE NOT EXISTS (
  SELECT 1 FROM lead_stages 
  WHERE lead_stages.institution_id = institutions.id
);