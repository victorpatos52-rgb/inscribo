import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://demo.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'demo-key';

// Create client even without proper env vars for demo purposes
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Check if we have proper Supabase configuration
export const hasSupabaseConfig = !!(
  import.meta.env.VITE_SUPABASE_URL && 
  import.meta.env.VITE_SUPABASE_ANON_KEY &&
  import.meta.env.VITE_SUPABASE_URL !== 'https://demo.supabase.co'
);

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
          created_at: string;
          updated_at: string;
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