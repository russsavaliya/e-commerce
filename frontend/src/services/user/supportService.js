import axios from 'axios';
import { API_BASE_URL } from '../../utils/constants';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const sendSupportMessage = async (payload) => {
  try {
    const response = await api.post('/users/support/contact', payload);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 'Failed to send your message'
    );
  }
};

export default {
  sendSupportMessage,
};


