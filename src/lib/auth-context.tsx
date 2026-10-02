'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { User, Organization, Role } from './types';
import { mockCurrentUser, mockOrg, mockUsers } from './mock-data';

interface AuthState {
  user: User | null;
  org: Organization | null;
  role: Role;
  isAuthenticated: boolean;
  totpEnabled: boolean;
}

interface AuthContextValue extends AuthState {
  login: (phone: string, password: string, totpCode?: string) => Promise<boolean>;
  logout: () => void;
  switchRole: (role: Role) => void;
  toggleTotp: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const DEMO_USERS_BY_ROLE: Record<Role, { user: User; role: Role }> = {
  owner: {
    user: mockCurrentUser,
    role: 'owner',
  },
  manager: {
    user: mockUsers[1] || {
      id: 'usr-manager',
      email: 'ama@example.com',
      phone: '+233244234567',
      full_name: 'Ama Mensah',
      is_platform_admin: false,
      is_active: true,
      last_login_at: '2026-10-01T14:30:00Z',
    },
    role: 'manager',
  },
  driver: {
    user: mockUsers[2] || {
      id: 'usr-driver',
      email: null,
      phone: '+233244345678',
      full_name: 'Kwame Asante',
      is_platform_admin: false,
      is_active: true,
      last_login_at: '2026-10-01T08:00:00Z',
    },
    role: 'driver',
  },
  viewer: {
    user: {
      id: 'usr-viewer',
      email: 'kofi.auditor@gmail.com',
      phone: '+233244456789',
      full_name: 'Kofi Boateng (Accountant)',
      is_platform_admin: false,
      is_active: true,
      last_login_at: '2026-10-01T09:15:00Z',
    },
    role: 'viewer',
  },
  platform_admin: {
    user: {
      id: 'usr-admin',
      email: 'support@lextech.com.gh',
      phone: '+233244999999',
      full_name: 'Lextech Platform Admin',
      is_platform_admin: true,
      is_active: true,
      last_login_at: '2026-10-01T16:00:00Z',
    },
    role: 'platform_admin',
  },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: mockCurrentUser,
    org: mockOrg,
    role: 'owner',
    isAuthenticated: true,
    totpEnabled: true,
  });

  const login = useCallback(async (phone: string, _password: string, _totpCode?: string): Promise<boolean> => {
    // Detect demo role from phone
    let selected = DEMO_USERS_BY_ROLE.owner;
    if (phone.includes('234567')) {
      selected = DEMO_USERS_BY_ROLE.manager;
    } else if (phone.includes('345678')) {
      selected = DEMO_USERS_BY_ROLE.driver;
    } else if (phone.includes('456789')) {
      selected = DEMO_USERS_BY_ROLE.viewer;
    } else if (phone.includes('999999')) {
      selected = DEMO_USERS_BY_ROLE.platform_admin;
    }

    setState(prev => ({
      ...prev,
      user: selected.user,
      org: mockOrg,
      role: selected.role,
      isAuthenticated: true,
    }));
    return true;
  }, []);

  const logout = useCallback(() => {
    setState(prev => ({ ...prev, user: null, org: null, isAuthenticated: false }));
  }, []);

  const switchRole = useCallback((role: Role) => {
    const config = DEMO_USERS_BY_ROLE[role];
    setState(prev => ({
      ...prev,
      role: config.role,
      user: config.user,
      isAuthenticated: true,
    }));
  }, []);

  const toggleTotp = useCallback(() => {
    setState(prev => ({ ...prev, totpEnabled: !prev.totpEnabled }));
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, logout, switchRole, toggleTotp }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}
