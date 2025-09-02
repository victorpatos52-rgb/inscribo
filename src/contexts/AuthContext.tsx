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
    if (!hasSupabaseConfig) {
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
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    // In demo mode, simulate successful login
    if (!hasSupabaseConfig) {
      // Simulate a successful login with demo user
      setUser({
        id: 'demo-user',
        email: email,
        user_metadata: { full_name: 'Admin Demo' },
        app_metadata: {},
        aud: 'authenticated',
        created_at: new Date().toISOString(),
      } as any);
      return;
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
    } catch (error) {
      console.error('Supabase auth error:', error);
      throw new Error('Erro ao fazer login. Verifique suas credenciais.');
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    // In demo mode, simulate successful signup
    if (!hasSupabaseConfig) {
      // Just show success message, don't actually create user
      return;
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
    // In demo mode, just clear user state
    if (!hasSupabaseConfig) {
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
    // In demo mode, simulate password reset
    if (!hasSupabaseConfig) {
      return;
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