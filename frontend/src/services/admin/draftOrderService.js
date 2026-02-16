import apiClient from '../../utils/api';

/**
 * Get all draft orders with pagination and filters
 */
export const getDraftOrdersList = async ({ page = 1, limit = 10, status = '', search = '' }) => {
  try {
    const params = { page, limit };
    if (status) params.status = status;
    if (search) params.search = search;

    const response = await apiClient.get('/draft-orders/list', { params });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 'Failed to fetch draft orders'
    );
  }
};

export default {
  getDraftOrdersList,
};

