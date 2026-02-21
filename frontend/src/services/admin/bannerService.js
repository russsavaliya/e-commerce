import apiClient from '../../utils/api';

// Get all banners
export const getAllBanners = async () => {
  try {
    const response = await apiClient.get('/banners');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Create banner
export const createBanner = async (formData) => {
  try {
    const response = await apiClient.post('/banners', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Update banner
export const updateBanner = async (id, formData) => {
  try {
    const response = await apiClient.put(`/banners/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Delete banner
export const deleteBanner = async (id) => {
  try {
    const response = await apiClient.delete(`/banners/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Toggle banner status
export const toggleBannerStatus = async (id) => {
  try {
    const response = await apiClient.patch(`/banners/${id}/toggle`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

