import api from './api';

// ============================================
// PUBLIC ENDPOINTS
// ============================================

export const getCategories = async (params = {}) => {
  try {
    const response = await api.get('/categories', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getCategoryById = async (id) => {
  try {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getCategoryBySlug = async (slug) => {
  try {
    const response = await api.get(`/categories/slug/${slug}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getCategoryProducts = async (id, params = {}) => {
  try {
    const response = await api.get(`/categories/${id}/products`, { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// ============================================
// ADMIN ENDPOINTS
// ============================================

export const adminGetCategories = async (params) => {
  try {
    const response = await api.get('/categories/admin/all', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const adminCreateCategory = async (data) => {
  try {
    const response = await api.post('/categories', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const adminUpdateCategory = async (id, data) => {
  try {
    const response = await api.put(`/categories/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const adminDeleteCategory = async (id) => {
  try {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};