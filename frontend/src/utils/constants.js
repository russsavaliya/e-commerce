/**
 * Application Constants
 * Centralized configuration for API endpoints, messages, and app settings
 */

// API Base URLs - Update these with your backend URLs
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:1200';
// export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://h7dnb20f-1200.inc1.devtunnels.ms';

// User Auth Endpoints (for future use)
export const USER_AUTH_ENDPOINTS = {
  LOGIN: '/api/user/auth/login',
  SIGNUP: '/api/user/auth/signup',
  LOGOUT: '/api/user/auth/logout',
  FORGOT_PASSWORD: '/api/user/auth/forgot-password',
  VERIFY_TOKEN: '/api/user/auth/verify-token',
};

// Local Storage Keys
export const STORAGE_KEYS = {
  ADMIN_TOKEN: 'admin_token',
  ADMIN_USER: 'admin_user',
  USER_TOKEN: 'user_token',
  USER_USER: 'user_user',
  REMEMBER_ME: 'remember_me',
};

// Validation Messages
export const VALIDATION_MESSAGES = {
  EMAIL_REQUIRED: 'Email is required',
  EMAIL_INVALID: 'Please enter a valid email address',
  PASSWORD_REQUIRED: 'Password is required',
  PASSWORD_MIN_LENGTH: 'Password must be at least 8 characters',
  PASSWORD_WEAK: 'Password must contain at least one uppercase, one lowercase, one number, and one special character',
  PASSWORD_MISMATCH: 'Passwords do not match',
  NAME_REQUIRED: 'Name is required',
  NAME_MIN_LENGTH: 'Name must be at least 3 characters',
  PHONE_INVALID: 'Please enter a valid 10-digit phone number',
  TERMS_REQUIRED: 'You must accept the terms and conditions',
};

// Routes
export const ROUTES = {
  ADMIN_LOGIN: '/admin/login',
  ADMIN_SIGNUP: '/admin/signup',
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_SETTINGS: '/admin/settings',
  ADMIN_CATEGORIES: '/admin/settings/categories',
  ADMIN_ATTRIBUTES: '/admin/settings/attributes',
  ADMIN_ROLES: '/admin/settings/roles',
  ADMIN_MANAGEMENT: '/admin/settings/admins',
  ADMIN_PROFILE: '/admin/profile',
  ADMIN_PRODUCTS: '/admin/products',
  ADMIN_PRODUCTS_LIST: '/admin/products/list',
  ADMIN_PRODUCTS_ADD: '/admin/products/add',
  ADMIN_PRODUCTS_EDIT: '/admin/products/edit/:id',
  ADMIN_MARKETING_SPEND: '/admin/marketing-spend',
  ADMIN_BANNERS: '/admin/banners',
  ADMIN_ORDERS: '/admin/orders',
  ADMIN_ORDERS_LIST: '/admin/orders/list',
  ADMIN_ORDERS_DETAIL: '/admin/orders/:orderId',
  ADMIN_SHIPMENTS_LIST: '/admin/shipments/list',
  ADMIN_CUSTOMERS: '/admin/customers',
  ADMIN_CUSTOMERS_LIST: '/admin/customers/list',
  ADMIN_REVIEWS: '/admin/reviews',
  ADMIN_REVIEWS_LIST: '/admin/reviews/list',
  ADMIN_REVIEWS_ADD: '/admin/reviews/add',
  ADMIN_NOTES: '/admin/notes',
  ADMIN_COUPONS: '/admin/coupons',
  HOME: '/',
};

