import axios from 'axios';
import { API_BASE_URL } from '../../utils/constants';
import { getAdminToken } from './authService';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
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

/**
 * Create a new coupon
 */
export const createCoupon = async (couponData) => {
  try {
    const response = await api.post('/coupons', couponData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Get all coupons
 */
export const getAllCoupons = async () => {
  try {
    const response = await api.get('/coupons/list');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Get single coupon by ID
 */
export const getCouponById = async (couponId) => {
  try {
    const response = await api.get('/coupons/get-one', {
      params: { coupon_id: couponId },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Update coupon by ID
 */
export const updateCoupon = async (couponId, couponData) => {
  try {
    const response = await api.put('/coupons/update', couponData, {
      params: { coupon_id: couponId },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Delete/Disable coupon by ID
 */
export const deleteCoupon = async (couponId) => {
  try {
    const response = await api.delete('/coupons/delete', {
      params: { coupon_id: couponId },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export default {
  createCoupon,
  getAllCoupons,
  getCouponById,
  updateCoupon,
  deleteCoupon,
};

