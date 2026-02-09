'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authFetch, setStoredToken, clearStoredToken, getStoredToken } from '@/lib/authClient';

export type User = { id: number; email: string; display_name: string | null };

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  register: (email: string, password: string, displayName?: string) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (updates: { email?: string; display_name?: string; new_password?: string; current_password?: string }) => Promise<{ error?: string }>;
  refetch: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

const SESSION_KEY = 'linguaformula_auth_session';

function hasSessionStorageSession(): boolean {
  if (typeof window === 'undefined') return false;
  return !!sessionStorage.getItem(SESSION_KEY);
}

function setSessionStorageSession() {
  if (typeof window !== 'undefined') sessionStorage.setItem(SESSION_KEY, '1');
}

function clearSessionStorageSession() {
  if (typeof window !== 'undefined') sessionStorage.removeItem(SESSION_KEY);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    try {
      // No sessionStorage and no stored JWT = no "session" (e.g. user closed all tabs). Treat as logged out.
      const hasStoredToken = !!getStoredToken();
      if (!hasSessionStorageSession() && !hasStoredToken) {
        await authFetch('/api/auth/logout', { method: 'POST' });
        clearStoredToken();
        setUser(null);
        setLoading(false);
        return;
      }
      const res = await authFetch('/api/auth/me');
      let data: { user?: User | null } = {};
      try {
        data = await res.json();
      } catch {
        setUser(null);
        clearSessionStorageSession();
        clearStoredToken();
        setLoading(false);
        return;
      }
      const nextUser = data.user || null;
      setUser(nextUser);
      if (nextUser) setSessionStorageSession();
      else {
        clearSessionStorageSession();
        clearStoredToken();
        await authFetch('/api/auth/logout', { method: 'POST' });
      }
    } catch {
      setUser(null);
      clearSessionStorageSession();
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const res = await authFetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      let data: { user?: unknown; error?: string } = {};
      try {
        data = await res.json();
      } catch {
        return { error: 'Something went wrong. Please try again.' };
      }
      if (!res.ok) return { error: data.error || 'Login failed' };
      const token = (data as { token?: string }).token;
      if (token) setStoredToken(token);
      setUser(data.user as User);
      setSessionStorageSession();
      return {};
    } catch {
      return { error: 'Something went wrong. Please try again.' };
    }
  }, []);

  const register = useCallback(async (email: string, password: string, displayName?: string) => {
    try {
      const res = await authFetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, display_name: displayName || undefined }),
      });
      let data: { user?: unknown; error?: string } = {};
      try {
        data = await res.json();
      } catch {
        return { error: 'Something went wrong. Please try again.' };
      }
      if (!res.ok) return { error: data.error || 'Registration failed' };
      const token = (data as { token?: string }).token;
      if (token) setStoredToken(token);
      setUser(data.user as User);
      setSessionStorageSession();
      return {};
    } catch {
      return { error: 'Something went wrong. Please try again.' };
    }
  }, []);

  const logout = useCallback(async () => {
    clearSessionStorageSession();
    clearStoredToken();
    await authFetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (updates: { email?: string; display_name?: string; new_password?: string; current_password?: string }) => {
    const res = await authFetch('/api/auth/me', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    const data = await res.json();
    if (!res.ok) return { error: data.error || 'Update failed' };
    if (data.user) setUser(data.user);
    return {};
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile, refetch }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
