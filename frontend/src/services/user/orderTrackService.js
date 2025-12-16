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

export default { trackOrder };