import apiClient from '../../utils/api';

export const getAllAttributes = async (page = 1, limit = 10, search = '') => {
  try {
    const response = await apiClient.get('/attributes/list', {
      params: {
        page: page,
        limit: limit,
        search: search,
      },
    });
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data?.message || 'Failed to fetch attributes');
    } else if (error.request) {
      throw new Error('Network error. Please check your connection.');
    } else {
      throw new Error('An unexpected error occurred.');
    }
  }
};

/**
 * Create a new attribute
 */
export const createAttribute = async (attributeData) => {
  try {
    const response = await apiClient.post('/attributes/create', attributeData);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data?.message || 'Failed to create attribute');
    } else if (error.request) {
      throw new Error('Network error. Please check your connection.');
    } else {
      throw new Error('An unexpected error occurred.');
    }
  }
};

export const updateAttribute = async (id, attributeData) => {
  try {
    const response = await apiClient.put(`/attributes/update/${id}`, attributeData);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data?.message || 'Failed to update attribute');
    } else if (error.request) {
      throw new Error('Network error. Please check your connection.');
    } else {
      throw new Error('An unexpected error occurred.');
    }
  }
};

export const deleteAttribute = async (id) => {
  try {
    await apiClient.delete(`/attributes/delete/${id}`);
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data?.message || 'Failed to delete attribute');
    } else if (error.request) {
      throw new Error('Network error. Please check your connection.');
    } else {
      throw new Error('An unexpected error occurred.');
    }
  }
};


