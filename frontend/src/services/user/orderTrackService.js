import axios from 'axios';
import { API_BASE_URL } from '../../utils/constants';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const trackOrder = async ({ orderId, email }) => {
  try {
    const response = await api.get('/users/orders/track', {
      params: { orderId, email },
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 'Failed to fetch order status'
    );
  }
};

export const cancelOrder = async ({ orderId, email, reason }) => {
  try {
    const response = await api.post('/users/orders/cancel', {
      orderId,
      email,
      reason,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || new Error('Failed to cancel order');
  }
};

export default { trackOrder, cancelOrder };