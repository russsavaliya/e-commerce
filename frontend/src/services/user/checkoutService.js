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

