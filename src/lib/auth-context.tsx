'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import { useUser, useClerk } from '@clerk/nextjs';
import { User, Organization, Role } from './types';
import { mockCurrentUser, mockOrg, mockUsers } from './mock-data';
import { FLEET_STORAGE_BASE, fleetKey, purgeLegacyFleetKeys } from './fleet-storage';

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
  const { user: clerkUser, isLoaded, isSignedIn } = useUser();
  const clerk = useClerk();

  const [localDemoState, setLocalDemoState] = useState<AuthState>({
    user: null,
    org: null,
    role: 'owner',
    isAuthenticated: false,
    totpEnabled: false,
  });

  // Fleet data is scoped per user (see fleet-storage.ts), so a new Clerk user
  // automatically starts with an empty workspace. Just drop legacy shared keys.
  useEffect(() => {
    if (typeof window === 'undefined' || !isLoaded || !isSignedIn || !clerkUser) return;
    localStorage.setItem('promove_active_clerk_user', clerkUser.id);
    purgeLegacyFleetKeys();
  }, [isLoaded, isSignedIn, clerkUser]);

  // If signed in with Clerk, derive identity from Clerk user
  const state = useMemo<AuthState>(() => {
    if (isLoaded && isSignedIn && clerkUser) {
      const clerkRole = (clerkUser.publicMetadata?.role as Role) || localDemoState.role || 'owner';
      
      let registeredOrgName = '';
      if (typeof window !== 'undefined') {
        try {
          const fleetInfo = localStorage.getItem(fleetKey(FLEET_STORAGE_BASE.FLEET_INFO, clerkUser.id));
          if (fleetInfo) {
            const parsed = JSON.parse(fleetInfo);
            // Strictly exclude leftover mock organization names
            if (parsed.orgName && parsed.orgName !== 'Twum Transport Services') {
              registeredOrgName = parsed.orgName;
            }
          }
        } catch {
          // ignore
        }
      }

      const defaultOrgName = clerkUser.fullName
        ? `${clerkUser.fullName}'s Fleet`
        : 'New Fleet Workspace';

      const userOrg: Organization = {
        id: `org-${clerkUser.id}`,
        name: registeredOrgName || defaultOrgName,
        phone: clerkUser.primaryPhoneNumber?.phoneNumber || '',
        region: 'Greater Accra',
        currency: 'GHS',
        timezone: 'Africa/Accra',
        status: 'active',
        created_at: new Date().toISOString(),
      };

      return {
        user: {
          id: clerkUser.id,
          email: clerkUser.primaryEmailAddress?.emailAddress || null,
          phone: clerkUser.primaryPhoneNumber?.phoneNumber || '',
          full_name: clerkUser.fullName || clerkUser.firstName || clerkUser.primaryEmailAddress?.emailAddress?.split('@')[0] || 'Fleet Owner',
          is_platform_admin: clerkRole === 'platform_admin',
          is_active: true,
          last_login_at: clerkUser.lastSignInAt ? new Date(clerkUser.lastSignInAt).toISOString() : new Date().toISOString(),
        },
        org: userOrg,
        role: clerkRole,
        isAuthenticated: true,
        totpEnabled: clerkUser.twoFactorEnabled ?? false,
      };
    }
    return localDemoState;
  }, [isLoaded, isSignedIn, clerkUser, localDemoState]);

  const login = useCallback(async (phone: string, _password: string, _totpCode?: string): Promise<boolean> => {
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

    setLocalDemoState(prev => ({
      ...prev,
      user: selected.user,
      org: mockOrg,
      role: selected.role,
      isAuthenticated: true,
    }));
    return true;
  }, []);

  const logout = useCallback(() => {
    if (isSignedIn) {
      clerk.signOut();
    }
    setLocalDemoState(prev => ({ ...prev, user: null, org: null, isAuthenticated: false }));
  }, [isSignedIn, clerk]);

  const switchRole = useCallback((role: Role) => {
    const config = DEMO_USERS_BY_ROLE[role];
    setLocalDemoState(prev => ({
      ...prev,
      role: config.role,
      user: config.user,
      isAuthenticated: true,
    }));
  }, []);

  const toggleTotp = useCallback(() => {
    setLocalDemoState(prev => ({ ...prev, totpEnabled: !prev.totpEnabled }));
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
