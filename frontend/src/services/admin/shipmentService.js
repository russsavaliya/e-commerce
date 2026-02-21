import apiClient from '../../utils/api';

/**
 * Create shipment for an order
 */
export const createShipment = async (orderId, shipmentData = {}) => {
  try {
    const response = await apiClient.post(`/shipments/create/${orderId}`, shipmentData);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 'Failed to create shipment'
    );
  }
};

/**
 * Get shipment details by shipment ID
 */
export const getShipmentById = async (shipmentId) => {
  try {
    const response = await apiClient.get('/shipments/one', {
      params: { shipment_id: shipmentId },
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 'Failed to fetch shipment'
    );
  }
};

/**
 * Get shipment details by order ID
 */
export const getShipmentByOrder = async (orderId) => {
  try {
    const response = await apiClient.get(`/shipments/order/${orderId}`);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 'Failed to fetch shipment'
    );
  }
};

/**
 * Get all shipments with pagination and filters
 */
export const getAllShipments = async (page = 1, limit = 10, search = '', shipment_status = '') => {
  try {
    const response = await apiClient.get('/shipments/list', {
      params: { page, limit, search, shipment_status },
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 'Failed to fetch shipments'
    );
  }
};

/**
 * Update shipment status
 */
export const updateShipmentStatus = async (shipmentId, shipment_status) => {
  try {
    const response = await apiClient.patch(`/shipments/${shipmentId}/status`, {
      shipment_status,
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 'Failed to update shipment status'
    );
  }
};

export default {
  createShipment,
  getShipmentById,
  getShipmentByOrder,
  getAllShipments,
  updateShipmentStatus,
};
