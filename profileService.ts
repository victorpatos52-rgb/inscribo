// src/profileService.ts
import { supabase } from './lib/supabase'; // Importe o cliente Supabase se não estiver importado

export const profileService = {
  async getAll() {
    if (!supabase) return [];
    try {
      const { data, error } = await supabase.from('profiles').select('*');
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro:', error);
      throw error;
    }
  },

  async create(userData: any) {
    if (!supabase) throw new Error('Supabase não configurado');
    try {
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: true
      });
      if (authError) throw authError;

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          email: userData.email,
          full_name: userData.full_name,
          role: userData.role,
          institution_id: '00000000-0000-0000-0000-000000000001'
        })
        .select()
        .single();

      if (profileError) throw profileError;
      return profile;
    } catch (error) {
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
      if (error) throw error;
      return data;
    } catch (error) {
      throw error;
    }
  },

  async delete(id: string) {
    if (!supabase) throw new Error('Supabase não configurado');
    try {
      const { error } = await supabase.from('profiles').delete().eq('id', id);
      if (error) throw error;
    } catch (error) {
      throw error;
    }
  }
};
