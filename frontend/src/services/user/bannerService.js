import axios from 'axios';
import { API_BASE_URL } from '../../utils/constants';

const userApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Get active banners by position (no authentication required)
export const getActiveBanners = async (position = null) => {
  try {
    const params = position ? { position } : {};
    const response = await userApi.get('/users/banners/list', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get all homepage banners in one API call (optimized)
export const getHomepageBanners = async () => {
  try {
    const response = await userApi.get('/users/banners/list', { params: { homepage: 'true' } });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

