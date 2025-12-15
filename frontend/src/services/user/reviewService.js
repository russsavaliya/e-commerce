import axios from 'axios';
import { API_BASE_URL } from '../../utils/constants';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getReviews = async (productId, page = 1, limit = 5) => {
  try {
    const response = await api.get('/users/reviews', {
      params: {
        productId,
        page,
        limit,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 'Failed to load reviews'
    );
  }
};

export const addReview = async (payload) => {
  try {
    const response = await api.post('/users/reviews', payload);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 'Failed to submit review'
    );
  }
};

export default {
  getReviews,
  addReview,
};


