
import { createContext, useContext, useState, useEffect } from 'react';
import {
  userLogin as loginService,
  userSignup as signupService,
  userLogout as logoutService,
  getUserToken,
  getUser,
} from '../services/user/authService';

const UserAuthContext = createContext(null);

export const UserAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = () => {
      try {
        const storedToken = getUserToken();
        const storedUser = getUser();

        if (storedToken && storedUser) {
          setUser(storedUser);
          setToken(storedToken);
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setToken(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        setUser(null);
        setToken(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (credentials) => {
    try {
      setLoading(true);
      const { user: loggedInUser, token: authToken } =
        await loginService(credentials);
      setUser(loggedInUser);
      setToken(authToken);
      setIsAuthenticated(true);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (userData) => {
    try {
      setLoading(true);
      const { user: newUser, token: authToken } =
        await signupService(userData);
      setUser(newUser);
      setToken(authToken);
      setIsAuthenticated(true);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await logoutService();
      setUser(null);
      setToken(null);
      setIsAuthenticated(false);
    } catch (error) {
      setUser(null);
      setToken(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    token,
    isAuthenticated,
    loading,
    login,
    signup,
    logout,
  };

  return (
    <UserAuthContext.Provider value={value}>
      {children}
    </UserAuthContext.Provider>
  );
};

export const useUserAuth = () => {
  const context = useContext(UserAuthContext);
  if (!context) {
    throw new Error('useUserAuth must be used within UserAuthProvider');
  }
  return context;
};

export default UserAuthContext;

