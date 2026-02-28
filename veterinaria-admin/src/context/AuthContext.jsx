import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../api/apiClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    const adminData = localStorage.getItem('adminData');
    if (token && adminData) {
      setAdmin(JSON.parse(adminData));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      if (response.data.success && response.data.data.user.rol === 'admin') {
        localStorage.setItem('adminToken', response.data.data.token);
        localStorage.setItem('adminData', JSON.stringify(response.data.data.user));
        setAdmin(response.data.data.user);
        return { success: true };
      } else {
        return { success: false, message: 'Solo administradores pueden acceder' };
      }
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Error en login' };
    }
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    setAdmin(null);
  };

  return <AuthContext.Provider value={{ admin, loading, login, logout }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
