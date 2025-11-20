/**
 * Admin Authentication Context
 * Manages admin authentication state across the application
 */

import { createContext, useContext, useState, useEffect } from 'react';
import {
  adminLogin as loginService,
  adminLogout as logoutService,
  getAdminToken,
  getAdminUser,
} from '../services/admin/authService';

const AdminAuthContext = createContext(null);

/**
 * AdminAuthProvider Component
 * Provides authentication state and methods to child components
 */
export const AdminAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Initialize auth state on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedToken = getAdminToken();
        const storedUser = getAdminUser();

        if (storedToken && storedUser) {
          // Set user from storage first (optimistic)
          try {
            setUser(storedUser);
            setToken(storedToken);
            setIsAuthenticated(true);
          } catch (error) {
            console.error('Error parsing stored user:', error);
            setUser(null);
            setToken(null);
            setIsAuthenticated(false);
          }
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

  /**
   * Login function
   * @param {object} credentials - { email, password }
   * @returns {Promise<void>}
   */
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

  /**
   * Signup function
   * @param {object} userData - { name, email, phone, password }
   * @returns {Promise<void>}
   */
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

  /**
   * Logout function
   * @returns {Promise<void>}
   */
  const logout = async () => {
    try {
      setLoading(true);
      await logoutService();
      setUser(null);
      setToken(null);
      setIsAuthenticated(false);
    } catch (error) {
      // Even if API call fails, clear local state
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
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider');
  }
  return context;
};

export default AdminAuthContext;

