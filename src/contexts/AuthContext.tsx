import { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { AdminUser } from '../types/database';

/* ============================
   TYPES
============================ */

interface AuthContextType {
  user: User | null;
  adminUser: AdminUser | null;
  loading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/* ============================
   PROVIDER
============================ */

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  /* ============================
     SESSION HANDLING
  ============================ */

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);

      if (session?.user) {
        loadAdminUser(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      (async () => {
        setUser(session?.user ?? null);

        if (session?.user) {
          if (_event === 'SIGNED_IN') {
            await createAdminUserIfNotExists(session.user);
          }
          await loadAdminUser(session.user.id);
        } else {
          setAdminUser(null);
          setLoading(false);
        }
      })();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  /* ============================
     AUTH ACTIONS
  ============================ */

  async function signInWithEmail(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('Error signing out:', error);
      throw error;
    }

    setUser(null);
    setAdminUser(null);
  }

  /* ============================
     ADMIN USER HANDLING
  ============================ */

  async function createAdminUserIfNotExists(user: User) {
    try {
      const { data: existing } = await supabase
        .from('admin_users')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (!existing) {
        const adminData = {
          id: user.id,
          email: user.email || '',
          full_name:
            user.user_metadata?.full_name ||
            user.email ||
            'Admin User',
          avatar_url: user.user_metadata?.avatar_url || null,
        };

        const { error } = await supabase
          .from('admin_users')
          .insert(adminData);

        if (error) {
          console.error('Error creating admin user:', error);
        }
      }
    } catch (error) {
      console.error('Error in createAdminUserIfNotExists:', error);
    }
  }

  async function loadAdminUser(userId: string) {
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setAdminUser(data);

        await supabase
          .from('admin_users')
          .update({ last_login_at: new Date().toISOString() })
          .eq('id', userId);
      }
    } catch (error) {
      console.error('Error loading admin user:', error);
    } finally {
      setLoading(false);
    }
  }

  /* ============================
     PROVIDER EXPORT
  ============================ */

  return (
    <AuthContext.Provider
      value={{
        user,
        adminUser,
        loading,
        signInWithEmail,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/* ============================
   HOOK
============================ */

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
