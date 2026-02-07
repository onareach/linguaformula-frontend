'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type User = { id: number; email: string; display_name: string | null };

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  register: (email: string, password: string, displayName?: string) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (updates: { email?: string; display_name?: string; new_password?: string }) => Promise<{ error?: string }>;
  refetch: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

const API = process.env.NEXT_PUBLIC_API_URL || '';
const SESSION_KEY = 'linguaformula_auth_session';
const JUST_LOGGED_IN_COOKIE = 'linguaformula_just_logged_in';

function authFetch(path: string, options: RequestInit = {}) {
  return fetch(`${API}${path}`, { ...options, credentials: 'include' });
}

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

function hasJustLoggedInCookie(): boolean {
  if (typeof document === 'undefined') return false;
  return document.cookie.includes(`${JUST_LOGGED_IN_COOKIE}=`);
}

function setJustLoggedInCookie() {
  if (typeof document === 'undefined') return;
  document.cookie = `${JUST_LOGGED_IN_COOKIE}=1; max-age=60; path=/; SameSite=Lax`;
}

function clearJustLoggedInCookie() {
  if (typeof document === 'undefined') return;
  document.cookie = `${JUST_LOGGED_IN_COOKIE}=; max-age=0; path=/`;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    try {
      if (!hasSessionStorageSession() && !hasJustLoggedInCookie()) {
        await authFetch('/api/auth/logout', { method: 'POST' });
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
        clearJustLoggedInCookie();
        setLoading(false);
        return;
      }
      const nextUser = data.user || null;
      setUser(nextUser);
      if (nextUser) {
        setSessionStorageSession();
        clearJustLoggedInCookie();
      } else {
        clearSessionStorageSession();
        clearJustLoggedInCookie();
        await authFetch('/api/auth/logout', { method: 'POST' });
      }
    } catch {
      setUser(null);
      clearSessionStorageSession();
      clearJustLoggedInCookie();
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
      setUser(data.user as User);
      setSessionStorageSession();
      setJustLoggedInCookie();
      if (typeof window !== 'undefined') window.location.href = '/';
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
      setUser(data.user as User);
      setSessionStorageSession();
      setJustLoggedInCookie();
      if (typeof window !== 'undefined') window.location.href = '/';
      return {};
    } catch {
      return { error: 'Something went wrong. Please try again.' };
    }
  }, []);

  const logout = useCallback(async () => {
    clearSessionStorageSession();
    clearJustLoggedInCookie();
    await authFetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (updates: { email?: string; display_name?: string; new_password?: string }) => {
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
