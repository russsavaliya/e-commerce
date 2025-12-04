import axios from 'axios';
import { API_BASE_URL } from '../../utils/constants';

const userApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Get bestseller products (no authentication required)
export const getBestsellerProducts = async (limit = 12) => {
  try {
    const response = await userApi.get(`/users/products/bestsellers?limit=${limit}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get trending products (no authentication required)
export const getTrendingProducts = async (limit = 12) => {
  try {
    const response = await userApi.get(`/users/products/trending?limit=${limit}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get products by category (for Sale page)
export const getProductsByCategory = async (categoryId, page = 1, limit = 20) => {
  try {
    const response = await userApi.get('/users/products/by-category', {
      params: {
        category_id: categoryId,
        page,
        limit,
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get all products with filters and pagination
export const getAllProducts = async (filters = {}) => {
  try {
    const {
      page = 1,
      limit = 20,
      category_id,
      min_price,
      max_price,
      attribute_id,
      attribute_value_id,
      sort_by = 'createdAt',
      sort_order = 'desc',
    } = filters;

    const response = await userApi.get('/users/products/all', {
      params: {
        page,
        limit,
        category_id,
        min_price,
        max_price,
        attribute_id,
        attribute_value_id,
        sort_by,
        sort_order,
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};


