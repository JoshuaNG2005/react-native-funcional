import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  id: number;
  nombre: string;
  email: string;
  telefono: string;
  direccion?: string;
  rol: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; user?: User }>;
  logout: () => Promise<void>;
  updateProfile: (userData: Partial<User>) => Promise<boolean>;
  isLoading: boolean;
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
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const getBaseUrl = () => {
    // Usar la URL de entorno (definida en eas.json o variables globales)
    const envApiUrl = process.env.EXPO_PUBLIC_API_URL;
    if (envApiUrl) {
      return envApiUrl;
    }
    // URL por defecto del backend en Vercel
    return 'https://veterinaria-backend-virid.vercel.app';
  };

  // Forzar logout automático al iniciar la app
  useEffect(() => {
    const forceLogout = async () => {
      try {
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('user');
        setToken(null);
        setUser(null);
        console.log('Logout automático: token y usuario eliminados');
      } catch (error) {
        console.error('Error forzando logout:', error);
      } finally {
        setIsLoading(false);
      }
    };
    forceLogout();
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; user?: User }> => {
    try {
      let baseUrl = getBaseUrl();
      // Evitar duplicación de /api/v1/
      if (baseUrl.endsWith('/api/v1')) {
        baseUrl = baseUrl.slice(0, -7); // Remover /api/v1 si ya está
      }
      console.log('Attempting login to:', baseUrl, 'with email:', email);
      const response = await fetch(`${baseUrl}/api/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);

      if (data.success) {
        const { user, token } = data.data;
        console.log('\n=== AuthContext Login Success ===');
        console.log('User object:', user);
        console.log('User rol:', user.rol);
        console.log('User email:', user.email);
        console.log('================================\n');
        setUser(user);
        setToken(token);
        await AsyncStorage.setItem('token', token);
        await AsyncStorage.setItem('user', JSON.stringify(user));
        return { success: true, user };
      } else {
        console.log('Login failed:', data.message);
        return { success: false };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false };
    }
  };

  const logout = async () => {
    try {
      console.log('Logging out...');
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      setToken(null);
      setUser(null);
      console.log('Logout successful, storage cleared');
    } catch (error) {
      console.error('Logout error:', error);
      setToken(null);
      setUser(null);
    }
  };

  const updateProfile = async (userData: Partial<User>): Promise<boolean> => {
    try {
      if (!token) return false;

      let baseUrl = getBaseUrl();
      // Evitar duplicación de /api/v1/
      if (baseUrl.endsWith('/api/v1')) {
        baseUrl = baseUrl.slice(0, -7); // Remover /api/v1 si ya está
      }
      const response = await fetch(`${baseUrl}/api/v1/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();
      if (data.success) {
        const updatedUser = { ...user, ...data.data } as User;
        setUser(updatedUser);
        await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Update profile error:', error);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, updateProfile, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
