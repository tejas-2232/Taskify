import React, { createContext, useContext, useEffect, useState } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import { authApi } from '../lib/api';
import { User, LoginCredentials, RegisterData } from '../types';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  updateUser: (data: { name?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const queryClient = useQueryClient();

  // Check if token exists
  const token = localStorage.getItem('token');

  // Fetch current user if token exists
  const {
    data: userData,
    isLoading,
    error,
  } = useQuery(
    'currentUser',
    authApi.getCurrentUser,
    {
      enabled: !!token,
      retry: false,
      onSuccess: () => {
        setIsAuthenticated(true);
      },
      onError: () => {
        localStorage.removeItem('token');
        setIsAuthenticated(false);
      },
    }
  );

  const user = userData?.user || null;

  useEffect(() => {
    if (token && !error) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  }, [token, error]);

  const login = async (credentials: LoginCredentials) => {
    try {
      const response = await authApi.login(credentials);
      localStorage.setItem('token', response.token);
      setIsAuthenticated(true);
      queryClient.setQueryData('currentUser', { user: response.user });
      toast.success('Login successful!');
    } catch (error: any) {
      const message = error.response?.data?.error || 'Login failed';
      toast.error(message);
      throw error;
    }
  };

  const register = async (data: RegisterData) => {
    try {
      const response = await authApi.register(data);
      localStorage.setItem('token', response.token);
      setIsAuthenticated(true);
      queryClient.setQueryData('currentUser', { user: response.user });
      toast.success('Registration successful!');
    } catch (error: any) {
      const message = error.response?.data?.error || 'Registration failed';
      toast.error(message);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    queryClient.clear();
    toast.success('Logged out successfully');
  };

  const updateUser = async (data: { name?: string }) => {
    try {
      const response = await authApi.updateProfile(data);
      queryClient.setQueryData('currentUser', { user: response.user });
      toast.success('Profile updated successfully!');
    } catch (error: any) {
      const message = error.response?.data?.error || 'Update failed';
      toast.error(message);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    isLoading: isLoading && !!token,
    isAuthenticated,
    login,
    register,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
