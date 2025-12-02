import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, setAuthToken, removeAuthToken, getAuthToken } from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const token = getAuthToken();
    if (token) {
      authAPI.getCurrentUser()
        .then((data) => {
          if (data.success) {
            setUser(data.user);
          } else {
            removeAuthToken();
          }
        })
        .catch(() => {
          removeAuthToken();
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const result = await authAPI.login(email, password);
    if (result.success && result.access_token) {
      setAuthToken(result.access_token);
      setUser(result.user);
    }
    return result;
  };

  const signup = async (email, password) => {
    const result = await authAPI.signup(email, password);
    return result;
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (e) {
      // Ignore logout errors
    }
    removeAuthToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
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
