import axios from 'axios';
import { API_BASE_URL } from '../../utils/constants';
import { getAdminToken } from './authService';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = getAdminToken();
  if (token) {
    config.headers.admin_token = token;
  }
  return config;
});

/**
 * Get all draft orders with pagination and filters
 */
export const getDraftOrdersList = async ({ page = 1, limit = 10, status = '', search = '' }) => {
  try {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (status) {
      params.append('status', status);
    }
    if (search) {
      params.append('search', search);
    }

    const response = await api.get(`/draft-orders/list?${params.toString()}`);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 'Failed to fetch draft orders'
    );
  }
};

export default {
  getDraftOrdersList,
};

