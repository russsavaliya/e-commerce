import axios from 'axios';
import { API_BASE_URL } from '../../utils/constants';

const userApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Get categories list (for filters)
export const getCategoriesList = async () => {
  try {
    const response = await userApi.get('/users/categories/list');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

