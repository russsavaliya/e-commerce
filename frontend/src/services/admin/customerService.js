import axios from 'axios';
import { API_BASE_URL } from '../../utils/constants';
import { getAdminToken } from './authService';

// Axios instance for admin customer APIs
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    const token = getAdminToken();
    if (token) {
      config.headers.admin_token = token;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const getCustomers = async ({ page = 1, limit = 10, search = '', has_order = '' } = {}) => {
  try {
    const response = await api.get('/customers/list', {
      params: {
        page,
        limit,
        search,
        has_order,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch customers');
  }
};

export default {
  getCustomers,
};

