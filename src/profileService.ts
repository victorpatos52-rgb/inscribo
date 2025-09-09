// src/profileService.ts
import { supabase } from '@/lib/supabase'; // Caminho corrigido com alias

export const profileService = {
  async getAll() {
    if (!supabase) {
      console.warn('Supabase não configurado, retornando array vazio');
      return [];
    }
    
    try {
      const { data, error } = await supabase.from('profiles').select('*');
      if (error) {
        console.error('Erro ao buscar perfis:', error);
        throw error;
      }
      return data || [];
    } catch (error) {
      console.error('Erro no profileService.getAll():', error);
      throw error;
    }
  },

  async create(userData: any) {
    if (!supabase) throw new Error('Supabase não configurado');
    
    try {
      // Verificar se tem permissões de admin
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: true
      });
      
      if (authError) {
        console.error('Erro ao criar usuário auth:', authError);
        throw authError;
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          email: userData.email,
          full_name: userData.full_name,
          role: userData.role,
          institution_id: userData.institution_id || '00000000-0000-0000-0000-000000000001'
        })
        .select()
        .single();

      if (profileError) {
        console.error('Erro ao criar perfil:', profileError);
        throw profileError;
      }
      
      return profile;
    } catch (error) {
      console.error('Erro no profileService.create():', error);
      throw error;
    }
  },

  async update(id: string, updates: any) {
    if (!supabase) throw new Error('Supabase não configurado');
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
        
      if (error) {
        console.error('Erro ao atualizar perfil:', error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Erro no profileService.update():', error);
      throw error;
    }
  },

  async delete(id: string) {
    if (!supabase) throw new Error('Supabase não configurado');
    
    try {
      const { error } = await supabase.from('profiles').delete().eq('id', id);
      if (error) {
        console.error('Erro ao deletar perfil:', error);
        throw error;
      }
    } catch (error) {
      console.error('Erro no profileService.delete():', error);
      throw error;
    }
  }
};
