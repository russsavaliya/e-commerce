import apiClient from '../../utils/api';


/**
 * Create a new coupon
 */
export const createCoupon = async (couponData) => {
  try {
    const response = await apiClient.post('/coupons', couponData);
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
    const response = await apiClient.get('/coupons/list');
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
    const response = await apiClient.get('/coupons/get-one', {
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
    const response = await apiClient.put('/coupons/update', couponData, {
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
    const response = await apiClient.delete('/coupons/delete', {
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

