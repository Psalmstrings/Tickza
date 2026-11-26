import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../lib/axios.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('tickapp_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      fetchMe();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchMe = async () => {
    try {
      const { data } = await api.get('/auth/me');
      if (data.user && !data.user.emailVerified) {
        localStorage.removeItem('tickapp_token');
        setToken(null);
        setUser(null);
      } else {
        setUser(data.user);
      }
    } catch (err) {
      localStorage.removeItem('tickapp_token');
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    const { token: t, user: u } = data;
    localStorage.setItem('tickapp_token', t);
    setToken(t);
    setUser(u);
    return u;
  };

  const register = async (formData) => {
    const { data } = await api.post('/auth/register', formData);
    const { token: t, user: u } = data;
    if (t && u?.emailVerified) {
      localStorage.setItem('tickapp_token', t);
      setToken(t);
      setUser(u);
    }
    return data;
  };

  const verifyEmail = async (email, code) => {
    const { data } = await api.post('/auth/verify-email', { email, code });
    const { token: t, user: u } = data;
    if (t) {
      localStorage.setItem('tickapp_token', t);
      setToken(t);
      setUser(u);
    }
    return data;
  };

  const resendVerification = async (email) => {
    const { data } = await api.post('/auth/resend-verification', { email });
    return data;
  };

  const logout = () => {
    localStorage.removeItem('tickapp_token');
    setToken(null);
    setUser(null);
  };

  const updateUser = (updatedUser) => {
    setUser(prev => (prev ? { ...prev, ...updatedUser } : updatedUser));
  };

  const requestOrganizerAccess = async (payload) => {
    const { data } = await api.post('/organizer/request-access', payload);
    if (data?.user) {
      setUser(data.user);
    } else {
      await fetchMe();
    }
    return data;
  };

  const isAdmin = Boolean(user && (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN'));
  const isApproved = Boolean(user && user.status === 'APPROVED');
  const isOrganizer = Boolean(
    isAdmin || (user && (user.role === 'ORGANIZER' || user.role === 'APPROVED_USER' || user.organizerStatus === 'APPROVED'))
  );
  const isOrganizerRequested = Boolean(user && user.organizerStatus === 'REQUESTED');

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      login,
      register,
      verifyEmail,
      resendVerification,
      logout,
      updateUser,
      refreshUser: fetchMe,
      requestOrganizerAccess,
      isAdmin,
      isApproved,
      isOrganizer,
      isOrganizerRequested,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
