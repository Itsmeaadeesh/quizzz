import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured, AppUser, getStoredUser, setStoredUser } from '../services/supabase';

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  signInWithEmail: (email: string, pass: string) => Promise<{ error?: string }>;
  signUpWithEmail: (email: string, pass: string, name?: string) => Promise<{ error?: string }>;
  signInWithGoogle: () => Promise<void>;
  signInAsGuest: () => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check initial session
    const init = async () => {
      if (isSupabaseConfigured && supabase) {
        const { data } = await supabase.auth.getSession();
        if (data.session?.user) {
          const u = data.session.user;
          const appUser: AppUser = {
            id: u.id,
            email: u.email || 'user@stayaheadd.com',
            name: u.user_metadata?.full_name || u.email?.split('@')[0] || 'Scholar',
            isGuest: false,
          };
          setUser(appUser);
          setStoredUser(appUser);
        } else {
          // Check local stored guest
          const local = getStoredUser();
          if (local) setUser(local);
        }

        // Listen for auth state changes
        const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
          if (session?.user) {
            const u = session.user;
            const appUser: AppUser = {
              id: u.id,
              email: u.email || 'user@stayaheadd.com',
              name: u.user_metadata?.full_name || u.email?.split('@')[0] || 'Scholar',
              isGuest: false,
            };
            setUser(appUser);
            setStoredUser(appUser);
          } else {
            setUser(null);
            setStoredUser(null);
          }
        });

        setLoading(false);
        return () => listener.subscription.unsubscribe();
      } else {
        // Supabase not configured: load stored guest or create default guest
        const local = getStoredUser();
        if (local) {
          setUser(local);
        } else {
          // Default to a guest so user has zero friction
          const guest: AppUser = {
            id: `guest_${Math.random().toString(36).slice(2, 8)}`,
            email: 'guest@stayaheadd.com',
            name: 'Student Learner',
            isGuest: true,
          };
          setUser(guest);
          setStoredUser(guest);
        }
        setLoading(false);
      }
    };

    init();
  }, []);

  const signInWithEmail = async (email: string, pass: string) => {
    if (!isSupabaseConfigured || !supabase) {
      // Mock login for guest/demo
      const appUser: AppUser = {
        id: `user_${Math.random().toString(36).slice(2, 8)}`,
        email,
        name: email.split('@')[0],
        isGuest: false,
      };
      setUser(appUser);
      setStoredUser(appUser);
      return {};
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass });
    if (error) return { error: error.message };

    if (data.user) {
      const appUser: AppUser = {
        id: data.user.id,
        email: data.user.email || email,
        name: data.user.user_metadata?.full_name || email.split('@')[0],
        isGuest: false,
      };
      setUser(appUser);
      setStoredUser(appUser);
    }
    return {};
  };

  const signUpWithEmail = async (email: string, pass: string, name?: string) => {
    if (!isSupabaseConfigured || !supabase) {
      const appUser: AppUser = {
        id: `user_${Math.random().toString(36).slice(2, 8)}`,
        email,
        name: name || email.split('@')[0],
        isGuest: false,
      };
      setUser(appUser);
      setStoredUser(appUser);
      return {};
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password: pass,
      options: { data: { full_name: name } },
    });
    if (error) return { error: error.message };

    if (data.user) {
      const appUser: AppUser = {
        id: data.user.id,
        email: data.user.email || email,
        name: name || email.split('@')[0],
        isGuest: false,
      };
      setUser(appUser);
      setStoredUser(appUser);
    }
    return {};
  };

  const signInWithGoogle = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signInWithOAuth({ provider: 'google' });
    } else {
      // Mock Google sign-in
      const appUser: AppUser = {
        id: `google_${Math.random().toString(36).slice(2, 8)}`,
        email: 'google.student@gmail.com',
        name: 'Google Learner',
        isGuest: false,
      };
      setUser(appUser);
      setStoredUser(appUser);
    }
  };

  const signInAsGuest = () => {
    const guest: AppUser = {
      id: `guest_${Math.random().toString(36).slice(2, 8)}`,
      email: 'guest@stayaheadd.com',
      name: 'Student Learner',
      isGuest: true,
    };
    setUser(guest);
    setStoredUser(guest);
  };

  const signOut = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setStoredUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        signInAsGuest,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
