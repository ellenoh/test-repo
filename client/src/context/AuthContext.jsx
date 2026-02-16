import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('bomad_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      fetch('/api/profile', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => (r.ok ? r.json() : Promise.reject()))
        .then(setUser)
        .catch(() => {
          localStorage.removeItem('bomad_token');
          setToken(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  function login(newToken, newUser) {
    localStorage.setItem('bomad_token', newToken);
    setToken(newToken);
    setUser(newUser);
  }

  function logout() {
    localStorage.removeItem('bomad_token');
    setToken(null);
    setUser(null);
  }

  function updateUser(updated) {
    setUser((prev) => ({ ...prev, ...updated }));
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
