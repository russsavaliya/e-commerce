import apiClient from '../../utils/api';

export const getCustomers = async ({ page = 1, limit = 10, search = '', has_order = '' } = {}) => {
  try {
    const response = await apiClient.get('/customers/list', {
      params: {
        page,
        limit,
        search,
        has_order,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch customers');
  }
};

export default {
  getCustomers,
};

