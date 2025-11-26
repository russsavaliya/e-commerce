import axios from 'axios';
import { API_BASE_URL } from '../../utils/constants';
import { getAdminToken } from './authService';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding token
api.interceptors.request.use(
  (config) => {
    const token = getAdminToken();
    if (token) {
      config.headers.admin_token = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const getAllAdmins = async (page = 1, limit = 10, search = '') => {
  try {
    const response = await api.get('/admin/list', {
      params: {
        page: page,
        limit: limit,
        search: search,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 'Failed to fetch admins'
    );
  }
};

export const createAdmin = async (adminData) => {
  try {
    const response = await api.post('/admin/auth/signup', adminData);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 'Failed to create admin'
    );
  }
};

export const deleteAdmin = async (id) => {
  try {
    const response = await api.delete('/admin/delete', {
      params: {
        id: id,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 'Failed to delete admin'
    );
  }
};

export const getAdminProfile = async () => {
  try {
    const response = await api.get('/admin/profile');
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 'Failed to fetch profile'
    );
  }
};

export const updatePassword = async (passwordData) => {
  try {
    const response = await api.put('/admin/update-password', passwordData);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 'Failed to update password'
    );
  }
};

export default {
  getAllAdmins,
  createAdmin,
  deleteAdmin,
  getAdminProfile,
  updatePassword,
};

