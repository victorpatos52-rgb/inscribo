import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase, hasSupabaseConfig } from '../lib/supabase';

interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'user';
  institution_id: string | null;
  avatar_url: string | null;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If no Supabase config, set demo mode
    if (!hasSupabaseConfig || !supabase) {
      setLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change:', event, session?.user?.email); // 🔧 Debug log
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchProfile(session.user.id);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    
    try {
      console.log('Buscando perfil para usuário:', userId); // 🔧 Debug log
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.log('Erro ao buscar perfil (pode ser normal para novos usuários):', error.message);
        // 🔧 Não tratar como erro fatal - usuário pode não ter perfil ainda
        setProfile(null);
      } else {
        console.log('Perfil encontrado:', data); // 🔧 Debug log
        setProfile(data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setProfile(null); // 🔧 Garantir que profile seja null em caso de erro
    } finally {
      console.log('Finalizando carregamento do perfil'); // 🔧 Debug log
      setLoading(false); // 🔧 IMPORTANTE: Sempre setar loading como false
    }
  };

  const signIn = async (email: string, password: string) => {
    if (!supabase) {
      throw new Error('Configuração do Supabase não encontrada.');
    }
    
    try {
      setLoading(true); // 🔧 Iniciar loading no login
      console.log('Tentando fazer login com:', email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      console.log('Resultado do login:', { data, error });
      if (error) {
        console.error('Erro específico:', error.message, error.status);
        throw error;
      }
      // 🔧 Não definir loading=false aqui, deixar para o onAuthStateChange
      console.log('Login realizado com sucesso!');
    } catch (error) {
      console.error('Supabase auth error:', error);
      setLoading(false); // 🔧 Parar loading em caso de erro
      throw new Error(`Erro ao fazer login: ${error.message}`);
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    if (!supabase) {
      throw new Error('Configuração do Supabase não encontrada.');
    }
    
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });
      if (error) throw error;
    } catch (error) {
      console.error('Supabase signup error:', error);
      throw new Error('Erro ao criar conta. Tente novamente.');
    }
  };

  const signOut = async () => {
    if (!supabase) {
      setUser(null);
      setProfile(null);
      return;
    }
    
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Supabase signout error:', error);
      // Still clear local state even if signout fails
      setUser(null);
      setProfile(null);
    }
  };

  const resetPassword = async (email: string) => {
    if (!supabase) {
      throw new Error('Configuração do Supabase não encontrada.');
    }
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
    } catch (error) {
      console.error('Supabase reset password error:', error);
      throw new Error('Erro ao enviar e-mail de recuperação. Tente novamente.');
    }
  };

  const value = {
    user,
    profile,
    signIn,
    signUp,
    signOut,
    resetPassword,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
