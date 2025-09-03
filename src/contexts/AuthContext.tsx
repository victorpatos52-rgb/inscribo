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
    console.log('🔧 Iniciando AuthProvider...');
    console.log('🔧 hasSupabaseConfig:', hasSupabaseConfig);
    console.log('🔧 supabase client exists:', !!supabase);
    
    // Se não há configuração do Supabase, usar modo demo
    if (!hasSupabaseConfig || !supabase) {
      console.log('🔧 Modo demo ativado - sem Supabase');
      setLoading(false);
      return;
    }

    // Função para inicializar autenticação
    const initializeAuth = async () => {
      try {
        console.log('🔧 Verificando sessão inicial...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('🔧 Erro ao verificar sessão:', error);
          setLoading(false);
          return;
        }

        console.log('🔧 Sessão encontrada:', !!session?.user);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error('🔧 Erro na inicialização:', error);
        setLoading(false);
      }
    };

    // Executar inicialização
    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔧 Auth state change:', event, !!session?.user);
      
      setUser(session?.user ?? null);
      
      if (session?.user && event !== 'SIGNED_OUT') {
        await fetchProfile(session.user.id);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      console.log('🔧 Limpando subscription...');
      subscription.unsubscribe();
    };
  }, []);

  const fetchProfile = async (userId: string) => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    
    try {
      console.log('🔧 Buscando perfil para:', userId);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          console.log('🔧 Perfil não encontrado, criando perfil básico...');
          // Perfil não existe, criar um perfil padrão
          const newProfile = {
            id: userId,
            email: user?.email || '',
            full_name: user?.user_metadata?.full_name || 'Usuário',
            role: 'user' as const,
            institution_id: null,
            avatar_url: null,
          };
          setProfile(newProfile);
        } else {
          console.error('🔧 Erro ao buscar perfil:', error);
          setProfile(null);
        }
      } else {
        console.log('🔧 Perfil encontrado:', data);
        setProfile(data);
      }
    } catch (error) {
      console.error('🔧 Erro inesperado ao buscar perfil:', error);
      setProfile(null);
    } finally {
      console.log('🔧 Finalizando carregamento do perfil');
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    if (!supabase) {
      throw new Error('Configuração do Supabase não encontrada.');
    }
    
    try {
      setLoading(true);
      console.log('🔧 Tentando fazer login...');
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('🔧 Erro no login:', error);
        throw error;
      }
      
      console.log('🔧 Login bem-sucedido');
      // O onAuthStateChange vai lidar com o resto
      
    } catch (error) {
      console.error('🔧 Erro no signIn:', error);
      setLoading(false);
      throw error;
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
      console.error('🔧 Erro no signup:', error);
      throw error;
    }
  };

  const signOut = async () => {
    console.log('🔧 Executando signOut...');
    
    if (!supabase) {
      setUser(null);
      setProfile(null);
      return;
    }
    
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('🔧 Erro no signOut:', error);
        throw error;
      }
      console.log('🔧 SignOut bem-sucedido');
      
      // Limpar estado local
      setUser(null);
      setProfile(null);
      
    } catch (error) {
      console.error('🔧 Erro no signOut:', error);
      // Limpar estado mesmo se der erro
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
      console.error('🔧 Erro no resetPassword:', error);
      throw error;
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
