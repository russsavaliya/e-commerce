import axios from 'axios';
import { API_BASE_URL } from '../../utils/constants';
import { getAdminToken } from './authService';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding token
api.interceptors.request.use(
  (config) => {
    const token = getAdminToken();
    if (token) {
      config.headers.admin_token = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const getAllOrders = async (page = 1, limit = 10, search = '', order_status = '', payment_status = '') => {
  try {
    const response = await api.get('/orders/list', {
      params: {
        page: page,
        limit: limit,
        search: search,
        order_status: order_status,
        payment_status: payment_status,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 'Failed to fetch orders'
    );
  }
};

export const getOrderById = async (orderId) => {
  try {
    const response = await api.get(`/orders/${orderId}`);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 'Failed to fetch order'
    );
  }
};

export const updateOrderStatus = async (orderId, order_status) => {
  try {
    const response = await api.patch(`/orders/${orderId}/status`, {
      order_status,
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 'Failed to update order status'
    );
  }
};

export const updatePaymentStatus = async (orderId, payment_status) => {
  try {
    const response = await api.patch(`/orders/${orderId}/payment-status`, {
      payment_status,
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 'Failed to update payment status'
    );
  }
};

export const downloadOrderPdf = async (orderId) => {
  try {
    const response = await api.get('/orders/export-one', {
      params: { orderId },
      responseType: 'blob',
    });
    return response;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 'Failed to download order PDF'
    );
  }
};

export const downloadOrders = async (format = 'csv', filters = {}) => {
  try {
    const params = {
      format,
      search: filters.search || '',
      order_status: filters.order_status || '',
      payment_status: filters.payment_status || '',
    };

    const response = await api.get('/orders/export', {
      params,
      responseType: 'blob',
    });

    return response;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 'Failed to download orders'
    );
  }
};

export default {
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  updatePaymentStatus,
  downloadOrders,
  downloadOrderPdf,
};

