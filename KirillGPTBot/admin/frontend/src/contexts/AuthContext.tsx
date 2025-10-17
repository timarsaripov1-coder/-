import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiClient } from '@/services/api';
import { wsManager } from '@/services/websocket';

interface AuthContextType {
  isAuthenticated: boolean;
  token: string | null;
  login: (token: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for existing token on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('admin_token');
    if (savedToken) {
      verifyToken(savedToken);
    } else {
      setLoading(false);
    }
  }, []);

  const verifyToken = async (tokenToVerify: string) => {
    try {
      apiClient.setToken(tokenToVerify);
      await apiClient.verifyAuth();
      setToken(tokenToVerify);
      setIsAuthenticated(true);
      
      // Connect WebSocket
      try {
        await wsManager.connect(tokenToVerify);
      } catch (error) {
        console.warn('Failed to connect WebSocket:', error);
      }
    } catch (error) {
      console.error('Token verification failed:', error);
      localStorage.removeItem('admin_token');
      apiClient.setToken(null);
      setToken(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (newToken: string): Promise<boolean> => {
    try {
      setLoading(true);
      apiClient.setToken(newToken);
      await apiClient.verifyAuth();
      
      setToken(newToken);
      setIsAuthenticated(true);
      
      // Connect WebSocket
      try {
        await wsManager.connect(newToken);
      } catch (error) {
        console.warn('Failed to connect WebSocket:', error);
      }
      
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      apiClient.setToken(null);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setIsAuthenticated(false);
    apiClient.setToken(null);
    wsManager.disconnect();
    localStorage.removeItem('admin_token');
  };

  const value = {
    isAuthenticated,
    token,
    login,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};