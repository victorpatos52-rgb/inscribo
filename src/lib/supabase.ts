import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Verificar se as variáveis de ambiente estão configuradas
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas!');
  console.error('VITE_SUPABASE_URL:', supabaseUrl ? '✅ Configurada' : '❌ Não encontrada');
  console.error('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅ Configurada' : '❌ Não encontrada');
  throw new Error('Configuração do Supabase incompleta. Verifique o arquivo .env');
}

// Criar cliente Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Verificar conexão
supabase.auth.getSession().then(({ data, error }) => {
  if (error) {
    console.error('❌ Erro na conexão com Supabase:', error);
  } else {
    console.log('✅ Conectado ao Supabase!');
  }
});

// Tipos TypeScript para o banco de dados
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          role: 'admin' | 'user';
          institution_id: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name: string;
          role?: 'admin' | 'user';
          institution_id?: string | null;
          avatar_url?: string | null;
        };
        Update: {
          full_name?: string;
          role?: 'admin' | 'user';
          institution_id?: string | null;
          avatar_url?: string | null;
          updated_at?: string;
        };
      };
      institutions: {
        Row: {
          id: string;
          name: string;
          logo_url: string | null;
          primary_color: string;
          secondary_color: string;
          created_at: string;
          updated_at: string;
        };
      };
      leads: {
        Row: {
          id: string;
          institution_id: string;
          assigned_to: string | null;
          student_name: string;
          parent_name: string | null;
          email: string | null;
          phone: string | null;
          grade_level: string | null;
          course_interest: string | null;
          current_stage: string | null;
          source: string;
          notes: string | null;
          birth_date: string | null;
          address: string | null;
          city: string | null;
          state: string | null;
          zip_code: string | null;
          parent_phone: string | null;
          parent_email: string | null;
          emergency_contact: string | null;
          emergency_phone: string | null;
          medical_info: string | null;
          previous_school: string | null;
          transfer_reason: string | null;
          interests: string | null;
          learning_difficulties: string | null;
          family_income: string | null;
          scholarship_interest: boolean | null;
          created_at: string;
          updated_at: string;
        };
      };
      lead_stages: {
        Row: {
          id: string;
          institution_id: string;
          name: string;
          color: string;
          order_index: number;
          created_at: string;
        };
      };
      visits: {
        Row: {
          id: string;
          lead_id: string;
          scheduled_by: string | null;
          title: string;
          description: string | null;
          scheduled_date: string;
          duration_minutes: number;
          status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
      };
      interactions: {
        Row: {
          id: string;
          lead_id: string;
          user_id: string | null;
          type: 'call' | 'email' | 'whatsapp' | 'visit' | 'note';
          content: string;
          created_at: string;
        };
      };
      stage_changes: {
        Row: {
          id: string;
          lead_id: string;
          from_stage_id: string | null;
          to_stage_id: string;
          changed_by: string;
          changed_at: string;
          notes: string | null;
        };
      };
    };
  };
};
