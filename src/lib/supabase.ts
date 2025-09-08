import { createClient } from '@supabase/supabase-js';

// 🔧 DIAGNÓSTICO DETALHADO
console.log('🔧 DIAGNÓSTICO SUPABASE:');
console.log('🔧 VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('🔧 VITE_SUPABASE_ANON_KEY exists:', !!import.meta.env.VITE_SUPABASE_ANON_KEY);

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Check if we have proper Supabase configuration
export const hasSupabaseConfig = !!(
  import.meta.env.VITE_SUPABASE_URL && 
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

console.log('🔧 hasSupabaseConfig:', hasSupabaseConfig);

// Create client
export const supabase = hasSupabaseConfig
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

console.log('🔧 Supabase client created:', !!supabase);

if (supabase) {
  console.log('🔧 Testando conexão com Supabase...');
  supabase.auth.getSession().then(({ data, error }) => {
    if (error) {
      console.error('🔧 Erro na conexão:', error);
    } else {
      console.log('🔧 Conexão OK, sessão:', !!data.session);
    }
  });
}

// ===== SERVIÇOS INTEGRADOS =====
export const profileService = {
  async getAll() {
    if (!supabase) {
      console.warn('⚠️ Supabase não configurado');
      return [];
    }

    try {
      console.log('🔍 Buscando todos os perfis...');
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Erro ao buscar perfis:', error);
        throw error;
      }

      console.log('✅ Perfis encontrados:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('💥 Erro inesperado ao buscar perfis:', error);
      throw error;
    }
  },

  async create(userData: {
    email: string;
    password: string;
    full_name: string;
    role: 'admin' | 'user';
    institution_id?: string;
  }) {
    if (!supabase) {
      throw new Error('Supabase não configurado');
    }

    try {
      console.log('📝 Criando novo usuário...', userData.email);

      // 1. Criar usuário na autenticação
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: true,
        user_metadata: {
          full_name: userData.full_name,
        },
      });

      if (authError) {
        console.error('❌ Erro ao criar usuário na auth:', authError);
        throw new Error(`Erro na autenticação: ${authError.message}`);
      }

      console.log('✅ Usuário criado na auth:', authData.user.id);

      // 2. Criar perfil na tabela profiles
      const profileData = {
        id: authData.user.id,
        email: userData.email,
        full_name: userData.full_name,
        role: userData.role,
        institution_id: userData.institution_id || '00000000-0000-0000-0000-000000000001',
        avatar_url: null,
      };

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .insert(profileData)
        .select()
        .single();

      if (profileError) {
        console.error('❌ Erro ao criar perfil:', profileError);
        
        // Se falhar ao criar perfil, tentar deletar o usuário da auth
        try {
          await supabase.auth.admin.deleteUser(authData.user.id);
        } catch (cleanupError) {
          console.error('❌ Erro ao limpar usuário da auth:', cleanupError);
        }
        
        throw new Error(`Erro ao criar perfil: ${profileError.message}`);
      }

      console.log('✅ Perfil criado com sucesso:', profile);
      return profile;

    } catch (error: any) {
      console.error('💥 Erro ao criar usuário:', error);
      throw error;
    }
  },

  async update(id: string, updates: any) {
    if (!supabase) {
      throw new Error('Supabase não configurado');
    }

    try {
      console.log('📝 Atualizando perfil...', id);

      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('❌ Erro ao atualizar perfil:', error);
        throw error;
      }

      console.log('✅ Perfil atualizado:', data);
      return data;
    } catch (error) {
      console.error('💥 Erro ao atualizar perfil:', error);
      throw error;
    }
  },

  async delete(id: string) {
    if (!supabase) {
      throw new Error('Supabase não configurado');
    }

    try {
      console.log('🗑️ Deletando usuário...', id);

      // 1. Deletar perfil
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', id);

      if (profileError) {
        console.error('❌ Erro ao deletar perfil:', profileError);
        throw profileError;
      }

      // 2. Deletar usuário da autenticação
      const { error: authError } = await supabase.auth.admin.deleteUser(id);

      if (authError) {
        console.error('❌ Erro ao deletar usuário da auth:', authError);
        console.warn('⚠️ Perfil deletado, mas usuário da auth pode ainda existir');
      }

      console.log('✅ Usuário deletado com sucesso');
    } catch (error) {
      console.error('💥 Erro ao deletar usuário:', error);
      throw error;
    }
  }
};

// ===== TIPOS DE DADOS =====
export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'user';
  institution_id: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
  status?: 'active' | 'inactive';
}

export interface Lead {
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
  created_at: string;
  updated_at: string;
}

export interface Visit {
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
}

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Profile, 'id' | 'created_at'>>;
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
        Row: Lead;
        Insert: Omit<Lead, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Lead, 'id' | 'created_at'>>;
      };
      visits: {
        Row: Visit;
        Insert: Omit<Visit, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Visit, 'id' | 'created_at'>>;
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
    };
  };
};
