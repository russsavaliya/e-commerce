import apiClient from '../../utils/api';

/**
 * Get all return orders with pagination and filters
 */
export const getReturnOrdersList = async ({ page = 1, limit = 10, status = '' }) => {
  try {
    const params = { page, limit };
    if (status) params.status = status;

    const response = await apiClient.get('/return-order/list', { params });
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
    const response = await apiClient.get('/return-order/get-one', { params: { returnOrderId } });
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
    const response = await apiClient.patch('/return-order/update-status', {
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
    const response = await apiClient.get('/return-order/get-shipment-details', { params: { returnOrderId } });
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
    const response = await apiClient.post('/return-order/create-shiprocket-return', {
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

