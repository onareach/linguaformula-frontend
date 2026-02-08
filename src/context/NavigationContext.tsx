'use client';

import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

type NavigationContextValue = {
  isNavigating: boolean;
  startNavigation: () => void;
  endNavigation: () => void;
};

const NavigationContext = createContext<NavigationContextValue | null>(null);

export function useNavigation() {
  const ctx = useContext(NavigationContext);
  if (!ctx) throw new Error('useNavigation must be used within NavigationProvider');
  return ctx;
}

function NavigationOverlay() {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh] bg-black/10 dark:bg-black/20"
      role="status"
      aria-live="polite"
      aria-label="Loading"
    >
      <div className="px-5 py-4 rounded-lg shadow-lg bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-600 flex flex-col items-center gap-3">
        <div className="bouncing-dots" aria-hidden>
          <span /><span /><span />
        </div>
        <p className="text-sm text-gray-600 dark:text-zinc-400">Loading…</p>
      </div>
    </div>
  );
}

function NavigationListener() {
  const pathname = usePathname();
  const { startNavigation, endNavigation } = useNavigation();

  useEffect(() => {
    endNavigation();
  }, [pathname, endNavigation]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest('a');
      if (!a) return;
      const href = a.getAttribute('href');
      if (!href || !href.startsWith('/') || href.startsWith('//')) return;
      if (a.getAttribute('target') === '_blank') return;
      startNavigation();
    };
    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
  }, [startNavigation]);

  return null;
}

const NAV_TIMEOUT_MS = 8000;

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const [isNavigating, setIsNavigating] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const endNavigation = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsNavigating(false);
  }, []);

  const startNavigation = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsNavigating(true);
    timeoutRef.current = setTimeout(() => {
      timeoutRef.current = null;
      setIsNavigating(false);
    }, NAV_TIMEOUT_MS);
  }, []);

  return (
    <NavigationContext.Provider value={{ isNavigating, startNavigation, endNavigation }}>
      {isNavigating && <NavigationOverlay />}
      {children}
      <NavigationListener />
    </NavigationContext.Provider>
  );
}
