/*
  # Schema Inicial do Inscribo CRM

  1. Tabelas Principais
    - `institutions` - Dados das instituições de ensino
    - `profiles` - Perfis dos usuários (conectado ao auth.users)
    - `lead_stages` - Etapas do funil de leads
    - `leads` - Leads/prospects da instituição
    - `visits` - Visitas agendadas
    - `interactions` - Histórico de interações com leads
    - `stage_changes` - Histórico de mudanças de etapa
    - `webhooks` - Configuração de webhooks

  2. Segurança
    - RLS habilitado em todas as tabelas
    - Políticas baseadas em instituição e role do usuário
    - Triggers para atualização automática de timestamps

  3. Funcionalidades
    - Auditoria completa de mudanças
    - Sistema de webhooks
    - Gestão de usuários por instituição
*/

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create institutions table
CREATE TABLE IF NOT EXISTS institutions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  logo_url text,
  primary_color text DEFAULT '#8B5CF6',
  secondary_color text DEFAULT '#06B6D4',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create profiles table (extends auth.users)
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

-- Create lead_stages table
CREATE TABLE IF NOT EXISTS lead_stages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  name text NOT NULL,
  color text NOT NULL DEFAULT '#6366F1',
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create leads table
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

-- Create visits table
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

-- Create interactions table
CREATE TABLE IF NOT EXISTS interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id),
  type text NOT NULL CHECK (type IN ('call', 'email', 'whatsapp', 'visit', 'note')),
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create stage_changes table
CREATE TABLE IF NOT EXISTS stage_changes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  from_stage_id uuid REFERENCES lead_stages(id),
  to_stage_id uuid NOT NULL REFERENCES lead_stages(id),
  changed_by uuid NOT NULL REFERENCES profiles(id),
  changed_at timestamptz DEFAULT now(),
  notes text
);

-- Create webhooks table
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_institution_id ON profiles(institution_id);
CREATE INDEX IF NOT EXISTS idx_leads_institution_id ON leads(institution_id);
CREATE INDEX IF NOT EXISTS idx_leads_assigned_to ON leads(assigned_to);
CREATE INDEX IF NOT EXISTS idx_leads_current_stage ON leads(current_stage);
CREATE INDEX IF NOT EXISTS idx_visits_lead_id ON visits(lead_id);
CREATE INDEX IF NOT EXISTS idx_visits_scheduled_date ON visits(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_interactions_lead_id ON interactions(lead_id);
CREATE INDEX IF NOT EXISTS idx_stage_changes_lead_id ON stage_changes(lead_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
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

-- Enable Row Level Security
ALTER TABLE institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE stage_changes ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies

-- Institutions policies
CREATE POLICY "Authenticated users can read institutions"
  ON institutions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage institutions"
  ON institutions FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Profiles policies
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Lead stages policies
CREATE POLICY "Users can read lead stages"
  ON lead_stages FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage lead stages"
  ON lead_stages FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Leads policies
CREATE POLICY "Users can read leads from their institution"
  ON leads FOR SELECT
  TO authenticated
  USING (
    institution_id IN (
      SELECT profiles.institution_id
      FROM profiles
      WHERE profiles.id = auth.uid()
    )
  );

CREATE POLICY "Users can create leads"
  ON leads FOR INSERT
  TO authenticated
  WITH CHECK (
    institution_id IN (
      SELECT profiles.institution_id
      FROM profiles
      WHERE profiles.id = auth.uid()
    )
  );

CREATE POLICY "Users can update leads from their institution"
  ON leads FOR UPDATE
  TO authenticated
  USING (
    institution_id IN (
      SELECT profiles.institution_id
      FROM profiles
      WHERE profiles.id = auth.uid()
    )
  );

-- Visits policies
CREATE POLICY "Users can read visits from their institution"
  ON visits FOR SELECT
  TO authenticated
  USING (
    lead_id IN (
      SELECT leads.id
      FROM leads
      WHERE leads.institution_id IN (
        SELECT profiles.institution_id
        FROM profiles
        WHERE profiles.id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can manage visits"
  ON visits FOR ALL
  TO authenticated
  USING (
    lead_id IN (
      SELECT leads.id
      FROM leads
      WHERE leads.institution_id IN (
        SELECT profiles.institution_id
        FROM profiles
        WHERE profiles.id = auth.uid()
      )
    )
  );

-- Interactions policies
CREATE POLICY "Users can read interactions from their institution"
  ON interactions FOR SELECT
  TO authenticated
  USING (
    lead_id IN (
      SELECT leads.id
      FROM leads
      WHERE leads.institution_id IN (
        SELECT profiles.institution_id
        FROM profiles
        WHERE profiles.id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can create interactions"
  ON interactions FOR INSERT
  TO authenticated
  WITH CHECK (
    lead_id IN (
      SELECT leads.id
      FROM leads
      WHERE leads.institution_id IN (
        SELECT profiles.institution_id
        FROM profiles
        WHERE profiles.id = auth.uid()
      )
    )
  );

-- Stage changes policies
CREATE POLICY "Users can read stage changes from their institution"
  ON stage_changes FOR SELECT
  TO authenticated
  USING (
    lead_id IN (
      SELECT leads.id
      FROM leads
      WHERE leads.institution_id IN (
        SELECT profiles.institution_id
        FROM profiles
        WHERE profiles.id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can create stage changes"
  ON stage_changes FOR INSERT
  TO authenticated
  WITH CHECK (
    lead_id IN (
      SELECT leads.id
      FROM leads
      WHERE leads.institution_id IN (
        SELECT profiles.institution_id
        FROM profiles
        WHERE profiles.id = auth.uid()
      )
    )
  );

-- Webhooks policies
CREATE POLICY "Admins can manage webhooks"
  ON webhooks FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Usuário'),
    'user'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile when user signs up
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Insert default institution and stages
INSERT INTO institutions (id, name, primary_color, secondary_color)
VALUES (
  'default-institution',
  'Instituição Padrão',
  '#8B5CF6',
  '#06B6D4'
) ON CONFLICT (id) DO NOTHING;

-- Insert default lead stages
INSERT INTO lead_stages (institution_id, name, color, order_index) VALUES
  ('default-institution', 'Novo', '#8B5CF6', 1),
  ('default-institution', 'Contato', '#06B6D4', 2),
  ('default-institution', 'Agendado', '#F59E0B', 3),
  ('default-institution', 'Visita', '#EC4899', 4),
  ('default-institution', 'Proposta', '#EF4444', 5),
  ('default-institution', 'Matrícula', '#10B981', 6)
ON CONFLICT DO NOTHING;