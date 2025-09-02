/*
  # Initial Schema for Inscribo CRM

  1. New Tables
    - `profiles` - User profiles with role management
    - `institutions` - Institution/school configuration
    - `leads` - Lead management with funnel stages
    - `visits` - Visit scheduling and tracking
    - `interactions` - Lead interaction history
    - `activity_logs` - System activity tracking

  2. Security
    - Enable RLS on all tables
    - Add policies for role-based access control
    - Admin users can access all data
    - Regular users can only access their own data

  3. Features
    - Role-based permissions (admin, user)
    - Lead funnel management
    - Visit scheduling
    - Activity tracking
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table for user management
CREATE TABLE IF NOT EXISTS profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  role text NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  institution_id uuid,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  PRIMARY KEY (id)
);

-- Institutions table
CREATE TABLE IF NOT EXISTS institutions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  logo_url text,
  primary_color text DEFAULT '#6366F1',
  secondary_color text DEFAULT '#3B82F6',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Lead stages configuration
CREATE TABLE IF NOT EXISTS lead_stages (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  institution_id uuid REFERENCES institutions(id) ON DELETE CASCADE,
  name text NOT NULL,
  color text DEFAULT '#6366F1',
  order_index integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Leads table
CREATE TABLE IF NOT EXISTS leads (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  institution_id uuid REFERENCES institutions(id) ON DELETE CASCADE,
  assigned_to uuid REFERENCES profiles(id),
  student_name text NOT NULL,
  parent_name text,
  email text,
  phone text,
  grade_level text,
  course_interest text,
  current_stage uuid REFERENCES lead_stages(id),
  source text DEFAULT 'website',
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Visits table
CREATE TABLE IF NOT EXISTS visits (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id uuid REFERENCES leads(id) ON DELETE CASCADE,
  scheduled_by uuid REFERENCES profiles(id),
  title text NOT NULL,
  description text,
  scheduled_date timestamptz NOT NULL,
  duration_minutes integer DEFAULT 60,
  status text DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no_show')),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Interactions table for lead history
CREATE TABLE IF NOT EXISTS interactions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id uuid REFERENCES leads(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id),
  type text NOT NULL CHECK (type IN ('call', 'email', 'whatsapp', 'visit', 'note')),
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Activity logs for system tracking
CREATE TABLE IF NOT EXISTS activity_logs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES profiles(id),
  action text NOT NULL,
  resource_type text NOT NULL,
  resource_id uuid,
  details jsonb,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can read own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can read all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for institutions
CREATE POLICY "Users can read their institution" ON institutions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND institution_id = institutions.id
    )
  );

CREATE POLICY "Admins can manage institutions" ON institutions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for lead_stages
CREATE POLICY "Users can read stages from their institution" ON lead_stages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND institution_id = lead_stages.institution_id
    )
  );

-- RLS Policies for leads
CREATE POLICY "Users can read leads from their institution" ON leads
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND institution_id = leads.institution_id
    )
  );

CREATE POLICY "Users can manage their assigned leads" ON leads
  FOR ALL USING (assigned_to = auth.uid());

CREATE POLICY "Admins can manage all leads" ON leads
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for visits
CREATE POLICY "Users can manage visits they scheduled" ON visits
  FOR ALL USING (scheduled_by = auth.uid());

CREATE POLICY "Users can view visits for their leads" ON visits
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM leads 
      WHERE id = visits.lead_id AND assigned_to = auth.uid()
    )
  );

-- RLS Policies for interactions
CREATE POLICY "Users can read interactions for their leads" ON interactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM leads 
      WHERE id = interactions.lead_id AND assigned_to = auth.uid()
    )
  );

CREATE POLICY "Users can create interactions" ON interactions
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- RLS Policies for activity_logs
CREATE POLICY "Users can read their own activity" ON activity_logs
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can read all activity" ON activity_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Insert default lead stages
INSERT INTO lead_stages (institution_id, name, color, order_index) VALUES
(uuid_generate_v4(), 'Novo', '#6B7280', 1),
(uuid_generate_v4(), 'Contato', '#3B82F6', 2),
(uuid_generate_v4(), 'Agendado', '#F59E0B', 3),
(uuid_generate_v4(), 'Visita', '#8B5CF6', 4),
(uuid_generate_v4(), 'Proposta', '#EF4444', 5),
(uuid_generate_v4(), 'Matrícula', '#10B981', 6);

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    'user'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE handle_new_user();