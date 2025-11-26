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

export const getAllMarketingSpends = async (page = 1, limit = 10, search = '', product_id = '', date = '') => {
  try {
    const response = await api.get('/marketing-spend/list', {
      params: {
        page: page,
        limit: limit,
        search: search,
        product_id: product_id,
        date: date,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 'Failed to fetch marketing spends'
    );
  }
};

export const getMarketingSpendById = async (id) => {
  try {
    const response = await api.get(`/marketing-spend/one/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 'Failed to fetch marketing spend'
    );
  }
};

export const createMarketingSpend = async (marketingSpendData) => {
  try {
    const response = await api.post('/marketing-spend/create', marketingSpendData);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 'Failed to create marketing spend'
    );
  }
};

export const updateMarketingSpend = async (id, marketingSpendData) => {
  try {
    const response = await api.put(`/marketing-spend/update/${id}`, marketingSpendData);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 'Failed to update marketing spend'
    );
  }
};

export const deleteMarketingSpend = async (id) => {
  try {
    const response = await api.delete(`/marketing-spend/delete/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 'Failed to delete marketing spend'
    );
  }
};

export default {
  getAllMarketingSpends,
  getMarketingSpendById,
  createMarketingSpend,
  updateMarketingSpend,
  deleteMarketingSpend,
};

