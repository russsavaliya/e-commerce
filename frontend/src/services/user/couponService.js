import axios from 'axios';
import { API_BASE_URL } from '../../utils/constants';

const userApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for sessions
});

/**
 * Get available coupons for users
 */
export const getAvailableCoupons = async (paymentMethod = null) => {
  try {
    const params = paymentMethod ? { paymentMethod } : {};
    const response = await userApi.get('/users/coupons/available', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Apply coupon code
 */
export const applyCoupon = async (code, cartTotal, paymentMethod = null) => {
  try {
    const response = await userApi.post('/users/coupons/apply', {
      code,
      cartTotal,
      paymentMethod,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export default {
  getAvailableCoupons,
  applyCoupon,
};

