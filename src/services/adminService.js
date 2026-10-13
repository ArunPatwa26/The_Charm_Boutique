import api from './api';

export const getDashboardStats = async () => {
  try {
    const response = await api.get('/admin/dashboard/stats');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getSalesAnalytics = async (params) => {
  try {
    const response = await api.get('/admin/analytics/sales', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};          