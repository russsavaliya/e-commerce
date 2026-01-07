import axios from 'axios';
import { API_BASE_URL } from '../../utils/constants';
import { getAdminToken } from './authService';
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = getAdminToken();
  if (token) {
    config.headers.admin_token = token;
  }
  return config;
});

/**
 * Get all return orders with pagination and filters
 */
export const getReturnOrdersList = async ({ page = 1, limit = 10, status = '' }) => {
  try {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (status) {
      params.append('status', status);
    }

    const response = await api.get(`/return-order/list?${params.toString()}`);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 'Failed to fetch return orders'
    );
  }
};

/**
 * Get single return order details
 */
export const getReturnOrderOne = async (returnOrderId) => {
  try {
    const response = await api.get(`/return-order/get-one?returnOrderId=${returnOrderId}`);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 'Failed to fetch return order'
    );
  }
};

/**
 * Update return order status
 */
export const updateReturnOrderStatus = async ({ returnOrderId, status }) => {
  try {
    const response = await api.patch('/return-order/update-status', {
      returnOrderId,
      status,
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 'Failed to update return order status'
    );
  }
};

/**
 * Get shipment details for return order
 * Fetches original shipment dimensions and weight
 */
export const getShipmentDetails = async (returnOrderId) => {
  try {
    const response = await api.get(`/return-order/get-shipment-details?returnOrderId=${returnOrderId}`);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 'Failed to fetch shipment details'
    );
  }
};

/**
 * Create Shiprocket return order
 * This schedules a pickup for the return items in Shiprocket
 */
export const createShiprocketReturn = async ({ returnOrderId, length, breadth, height, weight, return_type }) => {
  try {
    const response = await api.post('/return-order/create-shiprocket-return', {
      returnOrderId,
      length,
      breadth,
      height,
      weight,
      return_type,
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 'Failed to create Shiprocket return order'
    );
  }
};

export default {
  getReturnOrdersList,
  getReturnOrderOne,
  updateReturnOrderStatus,
  createShiprocketReturn,
};

