import axios from 'axios';
import { API_BASE_URL } from '../../utils/constants';

// Axios instance
const api = axios.create({
  baseURL: API_BASE_URL + '/admin/auth',
});

// Common Error Handler
const handleError = (error, defaultMsg) => {
  if (error.response) {
    throw new Error(error.response.data?.message || defaultMsg);
  } else if (error.request) {
    throw new Error('Network error. Please check your connection.');
  } else {
    throw new Error('Unexpected error occurred.');
  }
};

// ---------------------- AUTH SERVICES ----------------------

// Login
export const adminLogin = async (credentials) => {
  return await api.post('/login', credentials);
};

// Signup
// export const adminSignup = async (userData) => {
//   try {
//     const { data } = await api.post('/signup', userData);

//     localStorage.setItem("admin_token", data.token);
//     localStorage.setItem("admin_user", JSON.stringify(data.user));

//     return data;
//   } catch (error) {
//     handleError(error, 'Signup failed. Please try again.');
//   }
// };

// Logout
export const adminLogout = async () => {
  try {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
    localStorage.removeItem("remember_me");
  } catch (error) {
    console.error('Logout error:', error);
  }
};

// Forgot Password
export const adminForgotPassword = async (email) => {
  try {
    await api.post('/forgot-password', { email });
  } catch (error) {
    handleError(error, 'Failed to send reset link.');
  }
};

// Verify Token
export const adminVerifyToken = async () => {
  try {
    const { data } = await api.get('/verify-token');

    localStorage.setItem("admin_token", data.token);
    localStorage.setItem("admin_user", JSON.stringify(data.user));

    return data;
  } catch (error) {
    localStorage.clear();
    throw error;
  }
};

// Helpers
export const getAdminUser = () => {
  try {
    return JSON.parse(localStorage.getItem("admin_user"));
  } catch {
    return null;
  }
};
export const getAdminToken = () => localStorage.getItem("admin_token");
export const isAdminAuthenticated = () => !!getAdminToken();
