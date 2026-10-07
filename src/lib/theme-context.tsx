'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';

export type Theme = 'system' | 'light' | 'dark';
export type ResolvedTheme = 'light' | 'dark';

interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const STORAGE_KEY = 'pm-theme';
const COOKIE_KEY = 'pm-theme';

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function getStoredTheme(): Theme {
  if (typeof window === 'undefined') return 'system';
  try {
    const fromStorage = localStorage.getItem(STORAGE_KEY);
    if (fromStorage === 'light' || fromStorage === 'dark' || fromStorage === 'system') {
      return fromStorage;
    }
    const match = document.cookie.match(new RegExp(`(?:^|; )${COOKIE_KEY}=([^;]*)`));
    if (match) {
      const val = decodeURIComponent(match[1]);
      if (val === 'light' || val === 'dark' || val === 'system') {
        return val;
      }
    }
  } catch {
    // Ignore storage/cookie access errors
  }
  return 'system';
}

function applyThemeToDOM(theme: Theme) {
  if (typeof window === 'undefined') return 'light' as ResolvedTheme;
  const root = document.documentElement;
  const resolved: ResolvedTheme = theme === 'system' ? getSystemTheme() : theme;

  root.setAttribute('data-theme', resolved);
  if (resolved === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }

  // Update mobile browser chrome / navigation bar theme color
  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  if (metaThemeColor) {
    metaThemeColor.setAttribute('content', resolved === 'dark' ? '#09131B' : '#0B4F6C');
  }

  return resolved;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('system');
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>('light');
  const [mounted, setMounted] = useState(false);

  // Initialize theme from storage or DOM on mount
  useEffect(() => {
    const initialTheme = getStoredTheme();
    setThemeState(initialTheme);
    const resolved = applyThemeToDOM(initialTheme);
    setResolvedTheme(resolved);
    setMounted(true);
  }, []);

  // Set theme handler with full persistence & broadcasting
  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem(STORAGE_KEY, newTheme);
      // Persist across server sessions / reloads via cookie
      document.cookie = `${COOKIE_KEY}=${encodeURIComponent(newTheme)}; path=/; max-age=31536000; SameSite=Lax`;
    } catch {
      // Ignore storage errors in restricted contexts
    }

    const resolved = applyThemeToDOM(newTheme);
    setResolvedTheme(resolved);

    // Broadcast change to other windows / components
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('pm-theme-change', { detail: { theme: newTheme, resolved } }));
    }
  }, []);

  // Quick toggle (cycles light -> dark -> system)
  const toggleTheme = useCallback(() => {
    setThemeState(current => {
      const next: Theme = current === 'light' ? 'dark' : current === 'dark' ? 'system' : 'light';
      try {
        localStorage.setItem(STORAGE_KEY, next);
        document.cookie = `${COOKIE_KEY}=${encodeURIComponent(next)}; path=/; max-age=31536000; SameSite=Lax`;
      } catch {}
      const resolved = applyThemeToDOM(next);
      setResolvedTheme(resolved);
      return next;
    });
  }, []);

  // Listen to OS system theme changes when theme is set to 'system'
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleMediaChange = (e: MediaQueryListEvent) => {
      if (theme === 'system') {
        const nextResolved: ResolvedTheme = e.matches ? 'dark' : 'light';
        applyThemeToDOM('system');
        setResolvedTheme(nextResolved);
      }
    };

    mediaQuery.addEventListener('change', handleMediaChange);

    // Cross-tab sync listener
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        const newTheme = e.newValue as Theme;
        if (newTheme === 'light' || newTheme === 'dark' || newTheme === 'system') {
          setThemeState(newTheme);
          const resolved = applyThemeToDOM(newTheme);
          setResolvedTheme(resolved);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      mediaQuery.removeEventListener('change', handleMediaChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [theme]);

  const value = useMemo(
    () => ({
      theme: mounted ? theme : 'system',
      resolvedTheme: mounted ? resolvedTheme : 'light',
      setTheme,
      toggleTheme,
    }),
    [theme, resolvedTheme, mounted, setTheme, toggleTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
