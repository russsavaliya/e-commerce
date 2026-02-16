import apiClient from '../../utils/api';

export const addRandomData = async () => {
  try {
    const response = await apiClient.post('/utils/add-random-data');
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 'Failed to add random data'
    );
  }
};

export default {
  addRandomData,
};

