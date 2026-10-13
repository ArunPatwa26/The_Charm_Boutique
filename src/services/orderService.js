import api from './api';

export const createOrder = async (data) => {
  try {
    const response = await api.post('/orders/', data);
    console.log('📦 Order response:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Order creation error:', error.response?.data);
    throw error.response?.data || error;
  }
};

export const getOrders = async (page = 1, limit = 10) => {
  try {
    const response = await api.get('/orders/', {
      params: { page, limit },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getOrderById = async (orderId) => {
  try {
    const response = await api.get(`/orders/${orderId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const adminGetOrders = async (params) => {
  try {
    const response = await api.get('/orders/admin/all', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const adminUpdateOrder = async (orderId, data) => {
  try {
    const response = await api.put(`/orders/admin/${orderId}`, data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};


// ============================================================
// MANUAL UPI PAYMENT PROOF — CUSTOMER
// ============================================================

/**
 * Submit UPI payment screenshot for verification.
 * @param {string} orderId
 * @param {File} screenshotFile
 * @param {string} [customerNote]
 */
export const submitPaymentProof = async (
  orderId,
  screenshotFile,
  customerNote = null
) => {
  try {
    const formData = new FormData();
    formData.append('screenshot', screenshotFile);
    if (customerNote) {
      formData.append('customer_note', customerNote);
    }

    const response = await api.post(
      `/orders/${orderId}/submit-payment-proof`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    console.log('✅ Payment proof submitted:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Payment proof submission error:', error.response?.data);
    throw error.response?.data || error;
  }
};

/**
 * Get payment proof status for an order.
 * @param {string} orderId
 */
export const getPaymentProof = async (orderId) => {
  try {
    const response = await api.get(`/orders/${orderId}/payment-proof`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};


// ============================================================
// MANUAL UPI PAYMENT PROOF — ADMIN
// ============================================================

/**
 * Get pending payment proofs awaiting admin verification.
 * @param {object} params - { page, limit, status_filter }
 */
export const adminGetPendingPayments = async (params = {}) => {
  try {
    const response = await api.get('/orders/admin/payments/pending', {
      params: {
        page: params.page || 1,
        limit: params.limit || 20,
        status_filter: params.status_filter || 'verification_pending',
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Verify (approve) a payment proof.
 * @param {string} proofId
 * @param {string} upiReference
 */
export const adminVerifyPayment = async (proofId, upiReference) => {
  try {
    const response = await api.post(
      `/orders/admin/payments/${proofId}/verify`,
      { upi_reference: upiReference }
    );
    console.log('✅ Payment verified:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Payment verification error:', error.response?.data);
    throw error.response?.data || error;
  }
};

/**
 * Reject a payment proof.
 * @param {string} proofId
 * @param {string} rejectionReason
 */
export const adminRejectPayment = async (proofId, rejectionReason) => {
  try {
    const response = await api.post(
      `/orders/admin/payments/${proofId}/reject`,
      { rejection_reason: rejectionReason }
    );
    console.log('❌ Payment rejected:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Payment rejection error:', error.response?.data);
    throw error.response?.data || error;
  }
};