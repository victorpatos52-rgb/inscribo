// src/lib/supabase.ts
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

// ===== SERVIÇOS INTEGRADOS =====
export const profileService = {
  async getAll() {
    if (!supabase) return [];
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar perfis:', error);
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
    if (!supabase) throw new Error('Supabase não configurado');
    
    try {
      // 1. Criar usuário na autenticação
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: true,
        user_metadata: { full_name: userData.full_name },
      });

      if (authError) throw new Error(`Erro na autenticação: ${authError.message}`);

      // 2. Criar perfil
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          email: userData.email,
          full_name: userData.full_name,
          role: userData.role,
          institution_id: userData.institution_id || '00000000-0000-0000-0000-000000000001',
          avatar_url: null,
        })
        .select()
        .single();

      if (profileError) {
        // Tentar limpar o usuário da auth se falhar
        try {
          await supabase.auth.admin.deleteUser(authData.user.id);
        } catch {}
        throw new Error(`Erro ao criar perfil: ${profileError.message}`);
      }

      return profile;
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      throw error;
    }
  },

  async update(id: string, updates: any) {
    if (!supabase) throw new Error('Supabase não configurado');
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      throw error;
    }
  },

  async delete(id: string) {
    if (!supabase) throw new Error('Supabase não configurado');
    
    try {
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', id);

      if (profileError) throw profileError;

      const { error: authError } = await supabase.auth.admin.deleteUser(id);
      if (authError) console.warn('Erro ao deletar usuário da auth:', authError);
    } catch (error) {
      console.error('Erro ao deletar usuário:', error);
      throw error;
    }
  }
};

// Tipos atualizados baseados na sua estrutura
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

export interface LeadStage {
  id: string;
  institution_id: string;
  name: string;
  color: string;
  order_index: number;
  created_at: string;
}

export interface Interaction {
  id: string;
  lead_id: string;
  user_id: string | null;
  type: 'call' | 'email' | 'whatsapp' | 'visit' | 'note';
  content: string;
  created_at: string;
}

// ===== SERVIÇOS PARA USUÁRIOS/PERFIS =====
export const profileService = {
  // Buscar todos os perfis
  async getAll(): Promise<Profile[]> {
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

  // Buscar perfil por ID
  async getById(id: string): Promise<Profile | null> {
    if (!supabase) return null;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Erro ao buscar perfil por ID:', error);
      throw error;
    }
  },

  // Criar novo usuário (auth + profile)
  async create(userData: {
    email: string;
    password: string;
    full_name: string;
    role: 'admin' | 'user';
    institution_id?: string;
  }): Promise<Profile> {
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

  // Atualizar perfil
  async update(id: string, updates: Partial<Profile>): Promise<Profile> {
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

  // Deletar usuário (profile + auth)
  async delete(id: string): Promise<void> {
    if (!supabase) {
      throw new Error('Supabase não configurado');
    }

    try {
      console.log('🗑️ Deletando usuário...', id);

      // 1. Deletar perfil (isso pode cascatear dependendo das foreign keys)
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
        // Não necessariamente um erro fatal se o perfil já foi deletado
        console.warn('⚠️ Perfil deletado, mas usuário da auth pode ainda existir');
      }

      console.log('✅ Usuário deletado com sucesso');
    } catch (error) {
      console.error('💥 Erro ao deletar usuário:', error);
      throw error;
    }
  }
};

// ===== SERVIÇOS PARA LEADS =====
export const leadService = {
  async getAll(): Promise<Lead[]> {
    if (!supabase) return [];

    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar leads:', error);
      throw error;
    }
  },

  async create(leadData: Omit<Lead, 'id' | 'created_at' | 'updated_at'>): Promise<Lead> {
    if (!supabase) throw new Error('Supabase não configurado');

    try {
      const { data, error } = await supabase
        .from('leads')
        .insert(leadData)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao criar lead:', error);
      throw error;
    }
  },

  async update(id: string, updates: Partial<Lead>): Promise<Lead> {
    if (!supabase) throw new Error('Supabase não configurado');

    try {
      const { data, error } = await supabase
        .from('leads')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao atualizar lead:', error);
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    if (!supabase) throw new Error('Supabase não configurado');

    try {
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao deletar lead:', error);
      throw error;
    }
  }
};

// ===== SERVIÇOS PARA VISITAS =====
export const visitService = {
  async getAll(): Promise<Visit[]> {
    if (!supabase) return [];

    try {
      const { data, error } = await supabase
        .from('visits')
        .select(`
          *,
          lead:leads(student_name, email),
          scheduled_by_profile:profiles!visits_scheduled_by_fkey(full_name)
        `)
        .order('scheduled_date', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar visitas:', error);
      throw error;
    }
  },

  async create(visitData: Omit<Visit, 'id' | 'created_at' | 'updated_at'>): Promise<Visit> {
    if (!supabase) throw new Error('Supabase não configurado');

    try {
      const { data, error } = await supabase
        .from('visits')
        .insert(visitData)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao criar visita:', error);
      throw error;
    }
  },

  async update(id: string, updates: Partial<Visit>): Promise<Visit> {
    if (!supabase) throw new Error('Supabase não configurado');

    try {
      const { data, error } = await supabase
        .from('visits')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao atualizar visita:', error);
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    if (!supabase) throw new Error('Supabase não configurado');

    try {
      const { error } = await supabase
        .from('visits')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao deletar visita:', error);
      throw error;
    }
  }
};

// ===== SERVIÇOS PARA ESTÁGIOS DE LEADS =====
export const leadStageService = {
  async getAll(institutionId: string): Promise<LeadStage[]> {
    if (!supabase) return [];

    try {
      const { data, error } = await supabase
        .from('lead_stages')
        .select('*')
        .eq('institution_id', institutionId)
        .order('order_index', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar estágios:', error);
      throw error;
    }
  }
};

// ===== DADOS MOCK PARA FALLBACK =====
export const mockData = {
  profiles: [
    {
      id: '1',
      email: 'admin@inscribo.com',
      full_name: 'Administrador Sistema',
      role: 'admin' as const,
      created_at: new Date(Date.now() - 2592000000).toISOString(),
      updated_at: new Date().toISOString(),
      institution_id: '00000000-0000-0000-0000-000000000001',
      avatar_url: null,
      status: 'active' as const,
    },
    {
      id: '2',
      email: 'maria@escola.com',
      full_name: 'Maria Santos',
      role: 'user' as const,
      created_at: new Date(Date.now() - 1296000000).toISOString(),
      updated_at: new Date(Date.now() - 86400000).toISOString(),
      institution_id: '00000000-0000-0000-0000-000000000001',
      avatar_url: null,
      status: 'active' as const,
    },
  ] as Profile[],

  leads: [
    {
      id: '1',
      institution_id: '00000000-0000-0000-0000-000000000001',
      assigned_to: '1',
      student_name: 'João Silva',
      parent_name: 'Maria Silva',
      email: 'maria@email.com',
      phone: '(11) 99999-9999',
      grade_level: '1º Ano',
      course_interest: 'Ensino Fundamental',
      current_stage: 'Contato Inicial',
      source: 'Site',
      notes: 'Interessado em matrícula para 2024',
      created_at: new Date(Date.now() - 86400000).toISOString(),
      updated_at: new Date().toISOString(),
    },
  ] as Lead[],

  visits: [
    {
      id: '1',
      lead_id: '1',
      scheduled_by: '1',
      title: 'Visita de Apresentação',
      description: 'Apresentação da escola e metodologia',
      scheduled_date: new Date(Date.now() + 86400000).toISOString(),
      duration_minutes: 60,
      status: 'scheduled' as const,
      notes: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ] as Visit[]
};

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Profile, 'id' | 'created_at'>>;
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
        Row: LeadStage;
        Insert: Omit<LeadStage, 'id' | 'created_at'>;
        Update: Partial<Omit<LeadStage, 'id' | 'created_at'>>;
      };
      interactions: {
        Row: Interaction;
        Insert: Omit<Interaction, 'id' | 'created_at'>;
        Update: Partial<Omit<Interaction, 'id' | 'created_at'>>;
      };
    };
  };
};
