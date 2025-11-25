
import axios from 'axios';
import { API_BASE_URL } from '../../utils/constants';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});


export const getAllCategories = async (page = 1, limit = 10, search = '') => {
  try {
    // Add pagination and search query parameters
    const response = await api.get('/category/list', {
      params: {
        page: page,
        limit: limit,
        search: search,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 'Failed to fetch categories'
    );
  }
};

export const createCategory = async (categoryData) => {
  try {
    const response = await api.post('/category/create', categoryData);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 'Failed to create category'
    );
  }
};

export const deleteCategory = async (id) => {
  try {
    const response = await api.delete('/category/delete?id=' + id);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 'Failed to delete category'
    );
  }
};
export const updateCategory = async (id, categoryData) => {
  try {
    const response = await api.put(
      '/category/update/' + id,
      categoryData
    );
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 'Failed to update category'
    );
  }
};
export default {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};

