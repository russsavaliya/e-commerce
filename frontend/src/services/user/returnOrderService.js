import axios from 'axios';
import { API_BASE_URL } from '../../utils/constants';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Send OTP for return order verification
 */
export const sendOTP = async ({ orderId, email }) => {
  try {
    const response = await api.post('/users/return/send-otp', {
      orderId,
      email,
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 'Failed to send OTP'
    );
  }
};

/**
 * Verify OTP for return order
 */
export const verifyOTP = async ({ orderId, email, otp }) => {
  try {
    const response = await api.post('/users/return/verify-otp', {
      orderId,
      email,
      otp,
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 'Failed to verify OTP'
    );
  }
};

/**
 * Create return order request
 */
export const createReturn = async ({ orderId, email, products, reason }) => {
  try {
    const response = await api.post('/users/return/create', {
      orderId,
      email,
      products,
      reason,
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 'Failed to create return request'
    );
  }
};

export default {
  sendOTP,
  verifyOTP,
  createReturn,
};

