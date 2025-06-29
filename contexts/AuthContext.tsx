import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, Session, User } from '@supabase/supabase-js';

// Get env vars (edit if using constants)
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY as string;

// Supabase client (single instance app-wide)
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

type AuthContextProps = {
  user: User | null;
  loadingSession: boolean;
  signUp: (email: string, password: string) => Promise<{ data: any; error: any }>;
  signIn: (email: string, password: string) => Promise<{ data: any; error: any }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loadingSession, setLoadingSession] = useState(true);

  // Restore session on mount
  useEffect(() => {
    (async () => {
      const json = await AsyncStorage.getItem('@sb_session');
      if (json) {
        const session: Session = JSON.parse(json);
        supabase.auth.setSession(session); // set in Supabase
        setUser(session.user);
      }
      setLoadingSession(false);
    })();

    // Subscribe to auth state changes
    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        setUser(session.user);
        await AsyncStorage.setItem('@sb_session', JSON.stringify(session));
      } else {
        setUser(null);
        await AsyncStorage.removeItem('@sb_session');
      }
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    return { data, error };
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    return { data, error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    // Session removal is handled by the onAuthStateChange above
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loadingSession,
        signUp,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};