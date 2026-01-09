import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types/auth';
import authService from '../services/auth.service';

interface AuthContextType {
  user: User | null;
  originalUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isImpersonating: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  impersonate: (userId: string) => Promise<void>;
  stopImpersonating: () => void;
  hasRole: (role: string) => boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [originalUser, setOriginalUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load user and original user from localStorage on mount
    const currentUser = authService.getCurrentUser();
    const original = authService.getOriginalUser();
    setUser(currentUser);
    setOriginalUser(original);
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const authResponse = await authService.login({ email, password });
    authService.saveAuthData(authResponse);
    setUser(authResponse.user);
    setOriginalUser(null); // Clear any previous impersonation
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setOriginalUser(null);
  };

  const impersonate = async (userId: string) => {
    const authResponse = await authService.impersonate(userId);
    setUser(authResponse.user);
    const original = authService.getOriginalUser();
    setOriginalUser(original);
  };

  const stopImpersonating = () => {
    authService.stopImpersonating();
    // Reload user from localStorage after restoring original session
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    setOriginalUser(null);
  };

  const hasRole = (role: string): boolean => {
    if (!user) return false;
    return user.roles.includes(role);
  };

  const value: AuthContextType = {
    user,
    originalUser,
    isAuthenticated: !!user,
    isLoading,
    isImpersonating: !!originalUser,
    login,
    logout,
    impersonate,
    stopImpersonating,
    hasRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

