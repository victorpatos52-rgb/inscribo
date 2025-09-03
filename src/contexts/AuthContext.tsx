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
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    // 🔧 TIMEOUT DE SEGURANÇA - Se não resolver em 5 segundos, para o loading
    const safetyTimeout = setTimeout(() => {
      console.warn('⚠️ Timeout de segurança ativado - parando loading');
      setLoading(false);
      setInitializing(false);
    }, 5000);

    const initializeAuth = async () => {
      try {
        console.log('🚀 Inicializando autenticação...');
        
        // Se não tem configuração do Supabase, modo demo
        if (!hasSupabaseConfig || !supabase) {
          console.log('⚠️ Supabase não configurado - modo demo');
          clearTimeout(safetyTimeout);
          setLoading(false);
          setInitializing(false);
          return;
        }

        console.log('🔍 Buscando sessão atual...');
        
        // Buscar sessão atual com timeout
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 3000)
        );

        const { data: { session }, error } = await Promise.race([
          sessionPromise,
          timeoutPromise
        ]) as any;

        if (error) {
          console.error('❌ Erro ao buscar sessão:', error);
          throw error;
        }

        console.log('📋 Sessão encontrada:', !!session?.user);

        if (session?.user) {
          setUser(session.user);
          await fetchUserProfile(session.user.id);
        } else {
          setUser(null);
          setProfile(null);
        }

        // Setup do listener de mudanças de auth
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            console.log('🔄 Auth state mudou:', event);
            
            if (event === 'SIGNED_OUT') {
              console.log('👋 Usuário deslogou');
              setUser(null);
              setProfile(null);
              return;
            }

            if (event === 'SIGNED_IN' && session?.user) {
              console.log('✅ Usuário logou');
              setUser(session.user);
              await fetchUserProfile(session.user.id);
            }

            if (event === 'TOKEN_REFRESHED' && session?.user) {
              console.log('🔄 Token renovado');
              setUser(session.user);
            }
          }
        );

        // Cleanup
        return () => {
          subscription.unsubscribe();
        };

      } catch (error) {
        console.error('💥 Erro na inicialização:', error);
        setUser(null);
        setProfile(null);
      } finally {
        clearTimeout(safetyTimeout);
        setLoading(false);
        setInitializing(false);
        console.log('✅ Inicialização completa');
      }
    };

    initializeAuth();

    return () => {
      clearTimeout(safetyTimeout);
    };
  }, []);

  const fetchUserProfile = async (userId: string) => {
    if (!supabase) {
      console.log('⚠️ Supabase não disponível para buscar perfil');
      return;
    }

    try {
      console.log('👤 Buscando perfil do usuário:', userId);

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('❌ Erro ao buscar perfil:', error);
        return;
      }

      if (data) {
        console.log('✅ Perfil encontrado:', data.full_name);
        setProfile(data);
      } else {
        console.log('📝 Perfil não encontrado, criando...');
        await createUserProfile(userId);
      }
    } catch (error) {
      console.error('💥 Erro inesperado ao buscar perfil:', error);
    }
  };

  const createUserProfile = async (userId: string) => {
    if (!supabase || !user) return;

    try {
      const newProfile = {
        id: userId,
        email: user.email || 'user@email.com',
        full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuário',
        role: 'user' as const,
        institution_id: '00000000-0000-0000-0000-000000000001', // Instituição padrão
        avatar_url: null,
      };

      console.log('📝 Criando novo perfil:', newProfile);

      const { data, error } = await supabase
        .from('profiles')
        .insert(newProfile)
        .select()
        .single();

      if (error) {
        console.error('❌ Erro ao criar perfil:', error);
        // Usar perfil local como fallback
        setProfile(newProfile);
      } else {
        console.log('✅ Perfil criado com sucesso:', data);
        setProfile(data);
      }
    } catch (error) {
      console.error('💥 Erro ao criar perfil:', error);
    }
  };

  const signIn = async (email: string, password: string) => {
    if (!supabase) {
      throw new Error('Configuração do Supabase não encontrada.');
    }

    try {
      setLoading(true);
      console.log('🔑 Fazendo login...');

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('❌ Erro no login:', error);
        throw error;
      }

      console.log('✅ Login realizado com sucesso');
      // O onAuthStateChange vai lidar com o resto
    } catch (error: any) {
      console.error('💥 Erro de login:', error);
      setLoading(false);
      throw new Error(error.message || 'Erro ao fazer login');
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    if (!supabase) {
      throw new Error('Configuração do Supabase não encontrada.');
    }

    try {
      console.log('📝 Criando nova conta...');

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
        console.error('❌ Erro no signup:', error);
        throw error;
      }

      console.log('✅ Conta criada com sucesso:', data);
    } catch (error: any) {
      console.error('💥 Erro ao criar conta:', error);
      throw new Error(error.message || 'Erro ao criar conta');
    }
  };

  const signOut = async () => {
    console.log('🚪 Fazendo logout...');

    try {
      setLoading(true);

      if (supabase) {
        const { error } = await supabase.auth.signOut();
        if (error) {
          console.error('❌ Erro no logout:', error);
        }
      }

      // Limpar estado local
      setUser(null);
      setProfile(null);

      // Forçar reload da página para limpar qualquer estado residual
      setTimeout(() => {
        window.location.reload();
      }, 100);

    } catch (error: any) {
      console.error('💥 Erro no logout:', error);
      // Mesmo com erro, limpar estado
      setUser(null);
      setProfile(null);
      window.location.reload();
    } finally {
      setLoading(false);
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
    } catch (error: any) {
      console.error('Supabase reset password error:', error);
      throw new Error('Erro ao enviar e-mail de recuperação. Tente novamente.');
    }
  };

  // 🔧 MOSTRAR LOADING APENAS SE REALMENTE INICIALIZANDO
  const shouldShowLoading = initializing || loading;

  const value = {
    user,
    profile,
    signIn,
    signUp,
    signOut,
    resetPassword,
    loading: shouldShowLoading,
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
