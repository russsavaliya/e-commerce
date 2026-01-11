import axios from 'axios';
import { API_BASE_URL } from '../../utils/constants';
import { getGuestId } from '../../utils/guestId';

const userApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

userApi.interceptors.request.use((config) => {
  const guestId = getGuestId();
  if (guestId) {
    config.headers = {
      ...config.headers,
      'x-guest-id': guestId,
    };
  }
  return config;
});

export default userApi;

