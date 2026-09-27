// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState } from 'react';

type UserRole = 'driver' | 'student';

interface User {
  uid: string;
  email: string;
  name: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string, role: UserRole) => Promise<void>;
  register: (email: string, name: string, role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  // 🔥 Login SIMULADO - No usa Firebase
  const login = async (email: string, _password: string, role: UserRole) => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));

    setUser({
      uid: `demo-${Date.now()}`,
      email,
      name: email.split('@')[0] || 'Usuario Demo',
      role,
    });
    setLoading(false);
  };

  const register = async (email: string, name: string, role: UserRole) => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));

    setUser({
      uid: `demo-${Date.now()}`,
      email,
      name,
      role,
    });
    setLoading(false);
  };

  const logout = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 300));
    setUser(null);
    setLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};