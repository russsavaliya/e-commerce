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

export const getAllRoles = async (page = 1, limit = 10, search = '') => {
  try {
    const response = await api.get('/role/list', {
      params: {
        page: page,
        limit: limit,
        search: search,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 'Failed to fetch roles'
    );
  }
};

export const getRoleById = async (id) => {
  try {
    const response = await api.get('/role/one', {
      params: {
        id: id,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 'Failed to fetch role'
    );
  }
};

export const createRole = async (roleData) => {
  try {
    const response = await api.post('/role/create', roleData);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 'Failed to create role'
    );
  }
};

export const updateRole = async (id, roleData) => {
  try {
    const response = await api.put('/role/update', roleData, {
      params: {
        id: id,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 'Failed to update role'
    );
  }
};

export const deleteRole = async (id) => {
  try {
    const response = await api.delete('/role/delete', {
      params: {
        id: id,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 'Failed to delete role'
    );
  }
};

export default {
  getAllRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
};

