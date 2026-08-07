import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('craems_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('craems_access_token'));
  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const normalizedPassword = password.trim();
      const response = await api.post('/auth/login', { email: normalizedEmail, password: normalizedPassword });
      const { access_token, refresh_token, user: userData } = response.data;

      localStorage.setItem('craems_access_token', access_token);
      localStorage.setItem('craems_refresh_token', refresh_token);
      localStorage.setItem('craems_user', JSON.stringify(userData));

      setToken(access_token);
      setUser(userData);
      return { success: true, user: userData };
    } catch (error) {
      const msg =
        error.response?.data?.detail ||
        error.response?.statusText ||
        error.message ||
        'Authentication failed.';
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  };

  const register = async (formData) => {
    setLoading(true);
    try {
      await api.post('/auth/register', formData);
      return { success: true };
    } catch (error) {
      const msg = error.response?.data?.detail || 'Registration failed.';
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('craems_access_token');
    localStorage.removeItem('craems_refresh_token');
    localStorage.removeItem('craems_user');
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
