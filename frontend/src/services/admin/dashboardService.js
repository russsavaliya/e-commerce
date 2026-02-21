import apiClient from '../../utils/api';

export const getDashboardSummary = async () => {
  try {
    const response = await apiClient.get('/dashboard/summary');
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 'Failed to fetch dashboard summary'
    );
  }
};

export default {
  getDashboardSummary,
};

