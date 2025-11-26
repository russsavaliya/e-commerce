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

export const addRandomData = async () => {
  try {
    const response = await api.post('/utils/add-random-data');
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 'Failed to add random data'
    );
  }
};

export default {
  addRandomData,
};

