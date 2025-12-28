import React, { createContext, useContext, useState, useEffect } from 'react';
import { usersAPI, authAPI } from '@/lib/api';
import type { User } from '@/lib/types';
import { APIClientError } from '@/lib/api-client';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, login: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const userData = await usersAPI.getMe();
      setUser(userData);
    } catch (error) {
      setUser(null);
    }
  };

  useEffect(() => {
    // Try to get current user on mount, but skip on public pages
    const isPublicPage = window.location.pathname === '/login' || 
                         window.location.pathname === '/register';
    
    if (isPublicPage) {
      setLoading(false);
    } else {
      refreshUser().finally(() => setLoading(false));
    }
  }, []);

  const login = async (email: string, password: string) => {
    await authAPI.login({ email, password });
    await refreshUser();
  };

  const register = async (email: string, login: string, password: string) => {
    await authAPI.register({ email, login, password });
    await refreshUser();
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      // Ignore errors on logout
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

