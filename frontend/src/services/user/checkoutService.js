/**
 * Checkout Service
 * Handles checkout-related API calls like pincode validation
 */

import axios from 'axios';
import { API_BASE_URL } from '../../utils/constants';

const userApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Validate pincode
export const validatePincode = async (pincode) => {
  try {
    const response = await userApi.get('/users/checkout/pincode/validate', {
      params: { pincode },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Step 1: Create order with shipping (before payment)
export const initOrder = async (shippingData) => {
  try {
    const response = await userApi.post('/users/orders/init', shippingData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Step 2: Save payment selection / finalize placeholder payment
export const updatePayment = async (orderId, payment_method) => {
  try {
    const response = await userApi.patch(`/users/orders/${orderId}/payment`, {
      payment_method,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

