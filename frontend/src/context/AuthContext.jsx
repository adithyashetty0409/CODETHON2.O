import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('smart_campus_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('smart_campus_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyAuth = async () => {
      const storedToken = localStorage.getItem('smart_campus_token');
      if (storedToken) {
        try {
          const res = await authApi.getMe();
          if (res.data && res.data.user) {
            setUser(res.data.user);
            localStorage.setItem('smart_campus_user', JSON.stringify(res.data.user));
          }
        } catch (err) {
          // Token expired or invalid
          setUser(null);
          setToken(null);
          localStorage.removeItem('smart_campus_token');
          localStorage.removeItem('smart_campus_user');
        }
      }
      setLoading(false);
    };

    verifyAuth();
  }, []);

  const login = async (email, password) => {
    const res = await authApi.login({ email, password });
    if (res.data && res.data.token) {
      const { token: newToken, user: newUser } = res.data;
      setToken(newToken);
      setUser(newUser);
      localStorage.setItem('smart_campus_token', newToken);
      localStorage.setItem('smart_campus_user', JSON.stringify(newUser));
      return newUser;
    }
    throw new Error('Invalid login response');
  };

  const register = async (userData) => {
    const res = await authApi.register(userData);
    if (res.data && res.data.token) {
      const { token: newToken, user: newUser } = res.data;
      setToken(newToken);
      setUser(newUser);
      localStorage.setItem('smart_campus_token', newToken);
      localStorage.setItem('smart_campus_user', JSON.stringify(newUser));
      return newUser;
    }
    throw new Error('Invalid registration response');
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('smart_campus_token');
    localStorage.removeItem('smart_campus_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isAdmin: user?.role === 'admin' || user?.role === 'faculty',
        isStudent: user?.role === 'student',
        loading,
        login,
        register,
        logout,
      }}
    >
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
