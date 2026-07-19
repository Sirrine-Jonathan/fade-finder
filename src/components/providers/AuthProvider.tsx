'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  phone?: string | null;
  avatarUrl?: string | null;
  mfaRecoveryKey?: string | null;
  barberProfile?: {
    id: string;
    doplLicenseNumber?: string | null;
    licenseStatus?: string | null;
    verificationStatus?: string | null;
    services?: any[];
    availabilities?: any[];
    portfolioImages?: any[];
  } | null;
}

export type AuthRole = 'CLIENT' | 'PROVIDER' | 'ADMIN' | 'GUEST';

export interface AuthContextType {
  user: User | null;
  role: AuthRole;
  isLoading: boolean;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: 'GUEST',
  isLoading: true,
  logout: async () => {},
  refreshUser: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<AuthRole>('GUEST');
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/auth/me', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.user) {
          setUser(data.user);
          const uRole = (data.user.role || 'CLIENT').toUpperCase();
          if (uRole === 'ADMIN' || uRole === 'PROVIDER' || uRole === 'CLIENT') {
            setRole(uRole as AuthRole);
          } else {
            setRole('CLIENT');
          }
          return;
        }
      }
      setUser(null);
      setRole('GUEST');
    } catch {
      setUser(null);
      setRole('GUEST');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      console.error('Failed to execute logout:', err);
    } finally {
      setUser(null);
      setRole('GUEST');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isLoading,
        logout,
        refreshUser: fetchUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
