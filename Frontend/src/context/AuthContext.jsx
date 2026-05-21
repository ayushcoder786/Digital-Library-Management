import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Rehydrate from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('digilib_user');
      if (stored) setUser(JSON.parse(stored));
    } catch {
      localStorage.removeItem('digilib_user');
    } finally {
      setLoading(false);
    }
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('digilib_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('digilib_user');
  };

  const isAdmin     = () => user?.role === 'ADMIN';
  const isLibrarian = () => user?.role === 'LIBRARIAN';
  const isMember    = () => user?.role === 'MEMBER';
  const isStaff     = () => ['ADMIN', 'LIBRARIAN'].includes(user?.role);

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, isAdmin, isLibrarian, isMember, isStaff }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
