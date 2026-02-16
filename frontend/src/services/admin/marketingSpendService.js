import apiClient from '../../utils/api';

export const getAllMarketingSpends = async (page = 1, limit = 10, search = '', product_id = '', date = '') => {
  try {
    const response = await apiClient.get('/marketing-spend/list', {
      params: { page, limit, search, product_id, date },
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 'Failed to fetch marketing spends'
    );
  }
};

export const getMarketingSpendById = async (id) => {
  try {
    const response = await apiClient.get(`/marketing-spend/one/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 'Failed to fetch marketing spend'
    );
  }
};

export const createMarketingSpend = async (marketingSpendData) => {
  try {
    const response = await apiClient.post('/marketing-spend/create', marketingSpendData);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 'Failed to create marketing spend'
    );
  }
};

export const updateMarketingSpend = async (id, marketingSpendData) => {
  try {
    const response = await apiClient.put(`/marketing-spend/update/${id}`, marketingSpendData);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 'Failed to update marketing spend'
    );
  }
};

export const deleteMarketingSpend = async (id) => {
  try {
    const response = await apiClient.delete(`/marketing-spend/delete/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 'Failed to delete marketing spend'
    );
  }
};

export default {
  getAllMarketingSpends,
  getMarketingSpendById,
  createMarketingSpend,
  updateMarketingSpend,
  deleteMarketingSpend,
};

