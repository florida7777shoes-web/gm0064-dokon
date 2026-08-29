import React, { createContext, useContext, useState } from 'react';
import { api } from './api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('gm0064_user');
    return saved ? JSON.parse(saved) : null;
  });

  async function login(username, password) {
    const data = await api.login(username, password);
    localStorage.setItem('gm0064_token', data.token);
    localStorage.setItem('gm0064_user', JSON.stringify(data.user));
    setUser(data.user);
  }

  function logout() {
    localStorage.removeItem('gm0064_token');
    localStorage.removeItem('gm0064_user');
    setUser(null);
  }

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
