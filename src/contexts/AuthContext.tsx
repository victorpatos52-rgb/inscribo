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
      console.log('⚠️ Supabase não configurado - modo demo');
      setLoading(false);
      return;
    }

    let mounted = true; // 🔧 Prevenir race conditions

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Erro ao obter sessão inicial:', error);
          if (mounted) {
            setLoading(false);
          }
          return;
        }

        if (mounted) {
          setUser(session?.user ?? null);
          if (session?.user) {
            await fetchProfile(session.user.id);
          } else {
            setLoading(false);
          }
        }
      } catch (error) {
        console.error('Erro na sessão inicial:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 Auth state change:', event, session?.user?.email);
      
      if (!mounted) return;

      if (event === 'SIGNED_OUT') {
        console.log('👋 Usuário saiu');
        setUser(null);
        setProfile(null);
        setLoading(false);
        return;
      }

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        console.log('✅ Usuário logado');
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          setProfile(null);
          setLoading(false);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const fetchProfile = async (userId: string) => {
    if (!supabase) {
      console.log('⚠️ Supabase não disponível');
      setLoading(false);
      return;
    }
    
    try {
      console.log('🔍 Buscando perfil para usuário:', userId);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle(); // 🔧 Use maybeSingle() ao invés de single()

      if (error) {
        console.error('❌ Erro ao buscar perfil:', error.message);
        
        // 🔧 Se erro for "not found", criar perfil padrão
        if (error.code === 'PGRST116') {
          console.log('📝 Perfil não encontrado, criando perfil padrão...');
          await createDefaultProfile(userId);
        } else {
          setProfile(null);
        }
      } else if (data) {
        console.log('✅ Perfil encontrado:', data);
        setProfile(data);
      } else {
        console.log('📝 Nenhum perfil encontrado, criando perfil padrão...');
        await createDefaultProfile(userId);
      }
    } catch (error) {
      console.error('💥 Erro inesperado ao buscar perfil:', error);
      setProfile(null);
    } finally {
      console.log('✨ Finalizando carregamento do perfil');
      setLoading(false); // 🔧 SEMPRE finalizar loading
    }
  };

  // 🔧 NOVA FUNÇÃO: Criar perfil padrão
  const createDefaultProfile = async (userId: string) => {
    if (!supabase || !user) return;

    try {
      const defaultProfile = {
        id: userId,
        email: user.email || 'user@email.com',
        full_name: user.user_metadata?.full_name || 'Usuário',
        role: 'user' as const,
        institution_id: null,
        avatar_url: null,
      };

      console.log('📝 Criando perfil padrão:', defaultProfile);

      const { data, error } = await supabase
        .from('profiles')
        .insert(defaultProfile)
        .select()
        .single();

      if (error) {
        console.error('❌ Erro ao criar perfil padrão:', error);
        // Mesmo com erro, usar perfil temporário
        setProfile(defaultProfile);
      } else {
        console.log('✅ Perfil padrão criado:', data);
        setProfile(data);
      }
    } catch (error) {
      console.error('💥 Erro ao criar perfil padrão:', error);
      // Usar perfil temporário como fallback
      setProfile({
        id: userId,
        email: user.email || 'user@email.com',
        full_name: user.user_metadata?.full_name || 'Usuário',
        role: 'user' as const,
        institution_id: null,
        avatar_url: null,
      });
    }
  };

  const signIn = async (email: string, password: string) => {
    if (!supabase) {
      throw new Error('Configuração do Supabase não encontrada.');
    }
    
    try {
      setLoading(true);
      console.log('🔑 Tentando fazer login com:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('❌ Erro no login:', error.message);
        throw error;
      }
      
      console.log('✅ Login realizado com sucesso!');
      // Não definir loading=false aqui, deixar para o onAuthStateChange
    } catch (error: any) {
      console.error('💥 Erro de autenticação:', error);
      setLoading(false);
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
    } catch (error: any) {
      console.error('Supabase signup error:', error);
      throw new Error('Erro ao criar conta. Tente novamente.');
    }
  };

  const signOut = async () => {
    console.log('🚪 Iniciando logout...');
    
    if (!supabase) {
      console.log('⚠️ Supabase não disponível, limpando estado local');
      setUser(null);
      setProfile(null);
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true); // 🔧 Mostrar loading durante logout
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('❌ Erro no logout:', error);
        throw error;
      }
      
      console.log('✅ Logout realizado com sucesso');
      
      // 🔧 Limpar estado imediatamente
      setUser(null);
      setProfile(null);
      
    } catch (error: any) {
      console.error('💥 Erro no logout:', error);
      // Mesmo com erro, limpar estado local
      setUser(null);
      setProfile(null);
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
