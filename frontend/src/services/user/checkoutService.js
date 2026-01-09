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

// Step 2: Save payment selection / finalize COD payment
export const updatePayment = async (draftOrderId, payment_method, couponDetails = null) => {
  try {
    const payload = {
      draftOrderId,
      payment_method,
    };

    // Add coupon details if provided
    if (couponDetails) {
      payload.coupon_id = couponDetails.couponId;
      payload.coupon_code = couponDetails.couponCode;
      payload.discount_amount = couponDetails.discountAmount;
    }

    const response = await userApi.patch('/users/orders/payment', payload);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Razorpay Payment APIs
export const createRazorpayOrder = async (draftOrderId, amount) => {
  try {
    const response = await userApi.post('/users/payments/razorpay/create', {
      draftOrderId,
      amount,
      currency: 'INR',
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const verifyRazorpayPayment = async (draftOrderId, paymentData, couponDetails = null) => {
  try {
    const payload = {
      draftOrderId,
      ...paymentData,
    };

    // Add coupon details if provided
    if (couponDetails) {
      payload.coupon_id = couponDetails.couponId;
      payload.coupon_code = couponDetails.couponCode;
      payload.discount_amount = couponDetails.discountAmount;
    }

    const response = await userApi.post('/users/payments/razorpay/verify', payload);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getPaymentStatus = async (orderId) => {
  try {
    const response = await userApi.get(`/users/payments/status/${orderId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

