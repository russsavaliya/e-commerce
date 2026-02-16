import apiClient from '../../utils/api';

export const getAllRoles = async (page = 1, limit = 10, search = '') => {
  try {
    const response = await apiClient.get('/role/list', {
      params: { page, limit, search },
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 'Failed to fetch roles'
    );
  }
};

export const getRoleById = async (id) => {
  try {
    const response = await apiClient.get('/role/one', {
      params: { id },
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 'Failed to fetch role'
    );
  }
};

export const createRole = async (roleData) => {
  try {
    const response = await apiClient.post('/role/create', roleData);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 'Failed to create role'
    );
  }
};

export const updateRole = async (id, roleData) => {
  try {
    const response = await apiClient.put('/role/update', roleData, {
      params: { id },
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 'Failed to update role'
    );
  }
};

export const deleteRole = async (id) => {
  try {
    const response = await apiClient.delete('/role/delete', {
      params: { id },
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 'Failed to delete role'
    );
  }
};

export default {
  getAllRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
};

