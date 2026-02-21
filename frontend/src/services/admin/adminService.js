import apiClient from '../../utils/api';

export const getAllAdmins = async (page = 1, limit = 10, search = '') => {
  try {
    const response = await apiClient.get('/admin/list', {
      params: {
        page: page,
        limit: limit,
        search: search,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 'Failed to fetch admins'
    );
  }
};

export const createAdmin = async (adminData) => {
  try {
    const response = await apiClient.post('/admin/auth/signup', adminData);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 'Failed to create admin'
    );
  }
};

export const deleteAdmin = async (id) => {
  try {
    const response = await apiClient.delete('/admin/delete', {
      params: {
        id: id,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 'Failed to delete admin'
    );
  }
};

export const getAdminProfile = async () => {
  try {
    const response = await apiClient.get('/admin/profile');
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 'Failed to fetch profile'
    );
  }
};

export const updatePassword = async (passwordData) => {
  try {
    const response = await apiClient.put('/admin/update-password', passwordData);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 'Failed to update password'
    );
  }
};

export default {
  getAllAdmins,
  createAdmin,
  deleteAdmin,
  getAdminProfile,
  updatePassword,
};

