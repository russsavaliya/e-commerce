
import apiClient from '../../utils/api';


export const getAllCategories = async (page = 1, limit = 10, search = '') => {
  try {
    // Add pagination and search query parameters
    const response = await apiClient.get('/category/list', {
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
    const response = await apiClient.post('/category/create', categoryData);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 'Failed to create category'
    );
  }
};

export const deleteCategory = async (id) => {
  try {
    const response = await apiClient.delete('/category/delete?id=' + id);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 'Failed to delete category'
    );
  }
};
export const updateCategory = async (id, categoryData) => {
  try {
    const response = await apiClient.put(
      '/category/update/?id=' + id,
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

