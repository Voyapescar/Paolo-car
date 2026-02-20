import { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'paolo2026';

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const session = sessionStorage.getItem('paolo_admin_session');
    return session === 'active';
  });

  const login = (password) => {
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      sessionStorage.setItem('paolo_admin_session', 'active');
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('paolo_admin_session');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
