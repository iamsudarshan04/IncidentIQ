import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

// Setup Axios defaults
axios.defaults.withCredentials = true;
axios.defaults.baseURL = 'http://localhost:5000';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [sessionRole, setSessionRole] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const res = await axios.get('/api/auth/me');
      setUser(res.data.user);
    } catch (err) {
      setUser(null);
      setSessionRole(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (email, password) => {
    const res = await axios.post('/api/auth/login', { email, password });
    setUser(res.data.user);
    setSessionRole(null); // Explicitly clear any lingering session role on new login
    return res.data.user;
  };

  const register = async (name, email, password) => {
    const res = await axios.post('/api/auth/register', { name, email, password });
    return res.data;
  };

  const logout = async () => {
    await axios.post('/api/auth/logout');
    setUser(null);
    setSessionRole(null);
  };

  const updateRole = async (role) => {
    try {
      await axios.post('/api/auth/role', { role });
      setSessionRole(role);
    } catch (err) {
      console.error('Failed to persist role to backend', err);
      throw err;
    }
  };

  return (
    <AuthContext.Provider value={{ user, sessionRole, login, register, logout, updateRole, loading, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};
