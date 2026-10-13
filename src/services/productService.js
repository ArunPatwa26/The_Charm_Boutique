import api from './api';

export const getProducts = async (params = {}) => {
  try {
    const response = await api.get('/products', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getProductById = async (id) => {
  try {
    const response = await api.get(`/products/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getAIRecommendations = async (userId) => {
  try {
    const response = await api.get('/ai/recommendations', {
      params: userId ? { user_id: userId } : {},
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getTrendingProducts = async () => {
  try {
    const response = await api.get('/ai/trending');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const searchProducts = async (query) => {
  try {
    const response = await api.get('/ai/search/predict', {
      params: { query },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getCategories = async () => {
  try {
    const response = await api.get('/categories');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const adminGetProducts = async (params) => {
  try {
    const response = await api.get('/products/admin/all', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const adminCreateProduct = async (data) => {
  try {
    const response = await api.post('/products', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const adminUpdateProduct = async (id, data) => {
  try {
    console.log('🔄 Updating product with ID:', id);
    for (let [key, value] of data.entries()) {
      console.log(`📤 ${key}:`, value instanceof File ? `File: ${value.name}` : value);
    }

    const response = await api.put(`/products/${id}`, data, {
      headers: { 
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('❌ Update product error:', error.response?.data);
    // Throw the error response from server
    throw error.response?.data || error;
  }
};

export const adminDeleteProduct = async (id) => {
  try {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};