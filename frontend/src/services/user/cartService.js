import userApi from './apiClient';

/**
 * Cart Service
 * Handles all cart operations using session-based cart
 */

// Get cart items
export const getCart = async () => {
  try {
    const response = await userApi.get('/users/cart');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Add item to cart
export const addToCart = async (productId, variantId = null, quantity = 1) => {
  try {
    const response = await userApi.post('/users/cart/add', {
      productId,
      variantId,
      quantity,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Update cart item quantity
export const updateCartItem = async (cartItemId, quantity) => {
  try {
    const response = await userApi.put(`/users/cart/update/${cartItemId}`, {
      quantity,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Remove item from cart
export const removeFromCart = async (cartItemId) => {
  try {
    const response = await userApi.delete(`/users/cart/remove/${cartItemId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Clear entire cart
export const clearCart = async () => {
  try {
    const response = await userApi.delete('/users/cart/clear');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get cart item count (for navbar badge)
export const getCartCount = async () => {
  try {
    const response = await userApi.get('/users/cart/count');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

