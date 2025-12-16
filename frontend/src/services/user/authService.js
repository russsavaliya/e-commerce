/**
 * User Authentication Service
 * Handles all user authentication API calls
 * 
 * Update API_BASE_URL in utils/constants.js with your backend URL
 */

import axios from 'axios';
import {
  API_BASE_URL,
  USER_AUTH_ENDPOINTS,
  STORAGE_KEYS,
} from '../../utils/constants';

// Create axios instance with default config
const userApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
});

/**
 * Request Interceptor - Add token to requests
 */
userApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(STORAGE_KEYS.USER_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor - Handle token expiry and errors
 */
userApi.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle token expiry
    if (error.response?.status === 401) {
      // Clear stored auth data
      localStorage.removeItem(STORAGE_KEYS.USER_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER_USER);
      
      // Note: Navigation should be handled by components using React Router
      // This prevents full page reloads and maintains SPA behavior
    }
    return Promise.reject(error);
  }
);

/**
 * User Login Service
 * @param {object} credentials - { email, password }
 * @returns {Promise<object>} - { user, token }
 */
export const userLogin = async (credentials) => {
  try {
    const response = await userApi.post(
      USER_AUTH_ENDPOINTS.LOGIN,
      credentials
    );

    const { user, token } = response.data;

    // Store token and user data
    localStorage.setItem(STORAGE_KEYS.USER_TOKEN, token);
    localStorage.setItem(STORAGE_KEYS.USER_USER, JSON.stringify(user));

    return { user, token };
  } catch (error) {
    if (error.response) {
      throw new Error(
        error.response.data?.message || 'Login failed. Please try again.'
      );
    } else if (error.request) {
      throw new Error('Network error. Please check your connection.');
    } else {
      throw new Error('An unexpected error occurred. Please try again.');
    }
  }
};

/**
 * User Signup Service
 * @param {object} userData - { name, email, phone, password }
 * @returns {Promise<object>} - { user, token }
 */
export const userSignup = async (userData) => {
  try {
    const response = await userApi.post(
      USER_AUTH_ENDPOINTS.SIGNUP,
      userData
    );

    const { user, token } = response.data;

    // Store token and user data
    localStorage.setItem(STORAGE_KEYS.USER_TOKEN, token);
    localStorage.setItem(STORAGE_KEYS.USER_USER, JSON.stringify(user));

    return { user, token };
  } catch (error) {
    if (error.response) {
      throw new Error(
        error.response.data?.message || 'Signup failed. Please try again.'
      );
    } else if (error.request) {
      throw new Error('Network error. Please check your connection.');
    } else {
      throw new Error('An unexpected error occurred. Please try again.');
    }
  }
};

/**
 * User Logout Service
 * @returns {Promise<void>}
 */
export const userLogout = async () => {
  try {
    await userApi.post(USER_AUTH_ENDPOINTS.LOGOUT);
  } catch (error) {
    console.error('Logout API error:', error);
  } finally {
    localStorage.removeItem(STORAGE_KEYS.USER_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER_USER);
    localStorage.removeItem(STORAGE_KEYS.REMEMBER_ME);
  }
};

/**
 * Get stored user token
 * @returns {string|null}
 */
export const getUserToken = () => {
  return localStorage.getItem(STORAGE_KEYS.USER_TOKEN);
};

/**
 * Get stored user
 * @returns {object|null}
 */
export const getUser = () => {
  const userStr = localStorage.getItem(STORAGE_KEYS.USER_USER);
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch (error) {
      return null;
    }
  }
  return null;
};

/**
 * Check if user is authenticated
 * @returns {boolean}
 */
export const isUserAuthenticated = () => {
  return !!getUserToken();
};

export default userApi;

