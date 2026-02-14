'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const HIGH_CONTRAST_KEY = 'linguaformula_high_contrast';

type AccessibilityContextType = {
  highContrast: boolean;
  setHighContrast: (value: boolean) => void;
};

const AccessibilityContext = createContext<AccessibilityContextType | null>(null);

export function useAccessibility() {
  const ctx = useContext(AccessibilityContext);
  if (!ctx) throw new Error('useAccessibility must be used within AccessibilityProvider');
  return ctx;
}

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [highContrast, setHighContrastState] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setHighContrastState(localStorage.getItem(HIGH_CONTRAST_KEY) === '1');
    setMounted(true);
  }, []);

  const setHighContrast = useCallback((value: boolean) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(HIGH_CONTRAST_KEY, value ? '1' : '0');
    setHighContrastState(value);
  }, []);

  useEffect(() => {
    if (!mounted || typeof document === 'undefined') return;
    document.documentElement.classList.toggle('high-contrast', highContrast);
  }, [highContrast, mounted]);

  return (
    <AccessibilityContext.Provider value={{ highContrast, setHighContrast }}>
      {children}
    </AccessibilityContext.Provider>
  );
}
