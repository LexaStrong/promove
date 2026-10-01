'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { User, Organization, Role } from './types';
import { mockCurrentUser, mockOrg } from './mock-data';

interface AuthState {
  user: User | null;
  org: Organization | null;
  role: Role;
  isAuthenticated: boolean;
}

interface AuthContextValue extends AuthState {
  login: (phone: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: mockCurrentUser,
    org: mockOrg,
    role: 'owner',
    isAuthenticated: true,
  });

  const login = useCallback(async (_phone: string, _password: string): Promise<boolean> => {
    // Mock login — always succeeds
    setState({
      user: mockCurrentUser,
      org: mockOrg,
      role: 'owner',
      isAuthenticated: true,
    });
    return true;
  }, []);

  const logout = useCallback(() => {
    setState({ user: null, org: null, role: 'owner', isAuthenticated: false });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}
