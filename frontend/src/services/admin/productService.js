import apiClient from '../../utils/api';

/**
 * Create a new product
 */
export const createProduct = async (formData) => {
  try {
    const response = await apiClient.post('/product/create', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data?.message || 'Failed to create product');
    } else if (error.request) {
      throw new Error('Network error. Please check your connection.');
    } else {
      throw new Error('An unexpected error occurred.');
    }
  }
};

/**
 * Update an existing product
 */
export const updateProduct = async (id, formData) => {
  try {
    const response = await apiClient.put(`/product/update/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data?.message || 'Failed to update product');
    } else if (error.request) {
      throw new Error('Network error. Please check your connection.');
    } else {
      throw new Error('An unexpected error occurred.');
    }
  }
};

/**
 * Get all products (if list endpoint exists)
 */
export const getAllProducts = async (page = 1, limit = 10, search = '') => {
  try {
    const response = await apiClient.get('/product/list', {
      params: { page, limit, search },
    });
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data?.message || 'Failed to fetch products');
    } else if (error.request) {
      throw new Error('Network error. Please check your connection.');
    } else {
      throw new Error('An unexpected error occurred.');
    }
  }
};

/**
 * Get single product by ID
 */
export const getProductById = async (id) => {
  try {
    const response = await apiClient.get(`/product/get_one/${id}`);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data?.message || 'Failed to fetch product');
    } else if (error.request) {
      throw new Error('Network error. Please check your connection.');
    } else {
      throw new Error('An unexpected error occurred.');
    }
  }
};

