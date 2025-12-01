import axios from 'axios';
import { API_BASE_URL } from '../../utils/constants';
import { getAdminToken } from './authService';

const bannerApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
bannerApi.interceptors.request.use(
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

// Get all banners
export const getAllBanners = async () => {
  try {
    const response = await bannerApi.get('/banners');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Create banner
export const createBanner = async (formData) => {
  try {
    const token = getAdminToken();
    const response = await axios.post(`${API_BASE_URL}/banners`, formData, {
      headers: {
        'admin_token': token,
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Update banner
export const updateBanner = async (id, formData) => {
  try {
    const token = getAdminToken();
    const response = await axios.put(`${API_BASE_URL}/banners/${id}`, formData, {
      headers: {
        'admin_token': token,
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Delete banner
export const deleteBanner = async (id) => {
  try {
    const response = await bannerApi.delete(`/banners/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Toggle banner status
export const toggleBannerStatus = async (id) => {
  try {
    const response = await bannerApi.patch(`/banners/${id}/toggle`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

