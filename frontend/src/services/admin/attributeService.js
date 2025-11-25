/**
 * Attribute Service
 * Handles all attribute-related API calls
 */

import axios from 'axios';
import { API_BASE_URL } from '../../utils/constants';
import { getAdminToken } from './authService';

// Create axios instance
const attributeApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor for adding token
attributeApi.interceptors.request.use(
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

export const getAllAttributes = async (page = 1, limit = 10, search = '') => {
  try {
    const response = await attributeApi.get('/attributes/list', {
      params: {
        page: page,
        limit: limit,
        search: search,
      },
    });
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data?.message || 'Failed to fetch attributes');
    } else if (error.request) {
      throw new Error('Network error. Please check your connection.');
    } else {
      throw new Error('An unexpected error occurred.');
    }
  }
};

/**
 * Create a new attribute
 * @param {object} attributeData - { name: string, values: Array<{value: string}> }
 * @returns {Promise<object>} - Created attribute
 */
export const createAttribute = async (attributeData) => {
  try {
    const response = await attributeApi.post('/attributes/create', attributeData);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data?.message || 'Failed to create attribute');
    } else if (error.request) {
      throw new Error('Network error. Please check your connection.');
    } else {
      throw new Error('An unexpected error occurred.');
    }
  }
};

export const updateAttribute = async (id, attributeData) => {
  try {
    const response = await attributeApi.put(`/attributes/update/${id}`, attributeData);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data?.message || 'Failed to update attribute');
    } else if (error.request) {
      throw new Error('Network error. Please check your connection.');
    } else {
      throw new Error('An unexpected error occurred.');
    }
  }
};

export const deleteAttribute = async (id) => {
  try {
    await attributeApi.delete(`/attributes/delete/${id}`);
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data?.message || 'Failed to delete attribute');
    } else if (error.request) {
      throw new Error('Network error. Please check your connection.');
    } else {
      throw new Error('An unexpected error occurred.');
    }
  }
};

export default attributeApi;

