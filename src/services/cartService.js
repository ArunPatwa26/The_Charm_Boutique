import api from './api';

// Get user's cart
export const getCart = async () => {
  try {
    const response = await api.get('/cart');

    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Add product to cart
export const addToCartAPI = async (productId, quantity = 1) => {
  try {
    const response = await api.post('/cart/add', {
      product_id: productId,
      quantity: quantity,
    });

    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Update cart item quantity
export const updateCartItemAPI = async (productId, quantity) => {
  try {
    const response = await api.put(`/cart/update/${productId}`, {
      quantity: quantity,
    });

    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Remove product from cart
export const removeFromCartAPI = async (productId) => {
  try {
    const response = await api.delete(`/cart/remove/${productId}`);

    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Clear entire cart
export const clearCartAPI = async () => {
  try {
    const response = await api.delete('/cart/clear');

    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};