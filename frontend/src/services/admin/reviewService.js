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

/**
 * Get all reviews with pagination and filters
 */
export const getReviewList = async (page = 1, limit = 10, search = '', productId = '', rating = '') => {
  try {
    const response = await api.get('/reviews/list', {
      params: {
        page,
        limit,
        search,
        productId,
        rating,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 'Failed to fetch reviews'
    );
  }
};

/**
 * Get single review by ID
 */
export const getReviewById = async (reviewId) => {
  try {
    const response = await api.get(`/reviews/${reviewId}`);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 'Failed to fetch review'
    );
  }
};

/**
 * Add a new review
 */
export const addReview = async (reviewData) => {
  try {
    const response = await api.post('/reviews', reviewData);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 'Failed to add review'
    );
  }
};

/**
 * Update a review
 */
export const updateReview = async (reviewId, reviewData) => {
  try {
    const response = await api.put(`/reviews/${reviewId}`, reviewData);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 'Failed to update review'
    );
  }
};

/**
 * Delete a review
 */
export const deleteReview = async (reviewId) => {
  try {
    const response = await api.delete(`/reviews/${reviewId}`);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 'Failed to delete review'
    );
  }
};

export default api;

