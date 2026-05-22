import React, { createContext, useContext, useState, ReactNode } from 'react';
import { authApi } from '@/services/api';

export type UserRole = 'doctor' | 'communityhealthworker' | 'administrator';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  facilityId?: number | null;
  facilityName?: string | null;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role: UserRole) => Promise<boolean>;
  logout: () => void;
  register: (userData: Omit<User, 'id'> & { password: string; phone?: string; facilityId?: number }) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });

  const login = async (email: string, password: string, role: UserRole): Promise<boolean> => {
    const data = await authApi.login(email, password, role);
    const user: User = {
      id: String(data.id),
      name: data.fullName,
      email: data.email,
      role: authApi.toFrontendRole(data.role) as UserRole,
      department: data.department,
      facilityId: data.facilityId,
      facilityName: data.facilityName,
    };
    setUser(user);
    localStorage.setItem('user', JSON.stringify(user));
    return true;
  };

  const register = async (userData: Omit<User, 'id'> & { password: string; phone?: string; facilityId?: number }): Promise<boolean> => {
    await authApi.register({
      fullName: userData.name,
      email: userData.email,
      phone: userData.phone ?? '',
      password: userData.password,
      role: userData.role,
      department: userData.department,
      facilityId: userData.facilityId,
    });
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
