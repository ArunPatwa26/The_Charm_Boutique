import api from './api';

export const getWishlist = async () => {
  try {
    const response = await api.get('/wishlist');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const addToWishlistAPI = async (productId) => {
  try {
    const response = await api.post(`/wishlist/add/${productId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const removeFromWishlistAPI = async (productId) => {
  try {
    const response = await api.delete(`/wishlist/remove/${productId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const clearWishlistAPI = async () => {
  try {
    const response = await api.delete('/wishlist/clear');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const checkInWishlist = async (productId) => {
  try {
    const response = await api.get(`/wishlist/check/${productId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const toggleWishlist = async (productId) => {
  try {
    // First check if product is in wishlist
    const checkResponse = await checkInWishlist(productId);
    
    if (checkResponse.in_wishlist) {
      return await removeFromWishlistAPI(productId);
    } else {
      return await addToWishlistAPI(productId);
    }
  } catch (error) {
    throw error.response?.data || error;
  }
};