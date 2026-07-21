import React, { createContext, useContext, useState, ReactNode } from 'react';
import { authApi } from '@/services/api';

export type UserRole = 'doctor' | 'communityhealthworker' | 'administrator';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
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
  updateUser: (updatedData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });

  const login = async (email: string, password: string, role: UserRole): Promise<boolean> => {
    const data = await authApi.login(email, password, role);
    const responseUser = data.user;
    const user: User = {
      id: String(responseUser.id),
      name: responseUser.fullName,
      email: responseUser.email,
      phone: responseUser.phone,
      role: authApi.toFrontendRole(responseUser.role) as UserRole,
      department: responseUser.department,
      facilityId: responseUser.facilityId,
      facilityName: responseUser.facilityName,
    };
    setUser(user);
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('authToken', data.token);
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
    localStorage.removeItem('authToken');
  };

  const updateUser = (updatedData: Partial<User>) => {
    setUser(prev => {
      if (!prev) return null;
      const newUser = { ...prev, ...updatedData };
      localStorage.setItem('user', JSON.stringify(newUser));
      return newUser;
    });
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register, updateUser }}>
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
