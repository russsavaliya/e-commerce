import apiClient from '../../utils/api';

/**
 * Get all reviews with pagination and filters
 */
export const getReviewList = async (page = 1, limit = 10, search = '', productId = '', rating = '') => {
  try {
    const response = await apiClient.get('/reviews/list', {
      params: { page, limit, search, productId, rating },
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
    const response = await apiClient.get(`/reviews/${reviewId}`);
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
    const response = await apiClient.post('/reviews', reviewData);
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
    const response = await apiClient.put(`/reviews/${reviewId}`, reviewData);
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
    const response = await apiClient.delete(`/reviews/${reviewId}`);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 'Failed to delete review'
    );
  }
};

export default {
  getReviewList,
  getReviewById,
  addReview,
  updateReview,
  deleteReview,
};

