import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiRequest } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check existing session on application load
  useEffect(() => {
    async function checkAuth() {
      const savedToken = localStorage.getItem('token');
      if (!savedToken) {
        setLoading(false);
        return;
      }

      try {
        const data = await apiRequest('/auth/me');
        setUser(data.user);
      } catch (err) {
        console.warn('Session expired or invalid token:', err.message);
        localStorage.removeItem('token');
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    checkAuth();
  }, []);

  // Login handler
  const login = async (email, password) => {
    const data = await apiRequest('/auth/login', {
      method: 'POST',
      body: { email, password },
    });
    localStorage.setItem('token', data.token);
    setUser(data.user);
    return data.user;
  };

  // Registration handler (Normal user)
  const register = async (userData) => {
    const data = await apiRequest('/auth/register', {
      method: 'POST',
      body: userData,
    });
    localStorage.setItem('token', data.token);
    setUser(data.user);
    return data.user;
  };

  // Update password handler
  const updatePassword = async (currentPassword, newPassword) => {
    return await apiRequest('/auth/update-password', {
      method: 'PUT',
      body: { currentPassword, newPassword },
    });
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updatePassword,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
