import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  MagnifyingGlassPlusIcon,
  XMarkIcon,
  ArrowPathIcon,
  CurrencyRupeeIcon,
  UserIcon,
  EnvelopeIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import {
  adminGetPendingPayments,
  adminVerifyPayment,
  adminRejectPayment,
} from '../../services/orderService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

// ============================================================
// TABS CONFIG
// ============================================================
const TABS = [
  { key: 'verification_pending', label: 'Pending', icon: ClockIcon, color: 'blue' },
  { key: 'verified', label: 'Verified', icon: CheckCircleIcon, color: 'green' },
  { key: 'rejected', label: 'Rejected', icon: XCircleIcon, color: 'red' },
  { key: 'all', label: 'All', icon: DocumentTextIcon, color: 'gray' },
];

const AdminPaymentsPage = () => {
  const [activeTab, setActiveTab] = useState('verification_pending');
  const [proofs, setProofs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  // Modals
  const [zoomImage, setZoomImage] = useState(null);
  const [actionModal, setActionModal] = useState(null); // { type: 'verify' | 'reject', proof }

  // Form state for modals
  const [upiReference, setUpiReference] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // ============================================================
  // Fetch proofs
  // ============================================================
  const fetchProofs = useCallback(
    async (page = 1, showSpinner = false) => {
      if (showSpinner) setRefreshing(true);
      else setLoading(true);

      try {
        const response = await adminGetPendingPayments({
          page,
          limit: 20,
          status_filter: activeTab,
        });

        if (response.success) {
          setProofs(response.proofs || []);
          setPagination(response.pagination || { page: 1, pages: 1, total: 0 });
        }
      } catch (err) {
        console.error('❌ Failed to load payments:', err);
        toast.error('Failed to load payments');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [activeTab]
  );

  // Fetch on tab change
  useEffect(() => {
    fetchProofs(1);
  }, [fetchProofs]);

  // Auto-refresh every 60s when on Pending tab
  useEffect(() => {
    if (activeTab !== 'verification_pending') return;

    const interval = setInterval(() => {
      fetchProofs(pagination.page, true);
    }, 60000);

    return () => clearInterval(interval);
  }, [activeTab, pagination.page, fetchProofs]);

  // ============================================================
  // Verify action
  // ============================================================
  const handleVerify = async () => {
    if (!upiReference.trim() || upiReference.trim().length < 4) {
      toast.error('Please enter a valid UPI reference (min 4 chars)');
      return;
    }

    setSubmitting(true);
    try {
      const response = await adminVerifyPayment(actionModal.proof.id, upiReference.trim());

      if (response.success) {
        toast.success('Payment verified! Order confirmed.');
        setActionModal(null);
        setUpiReference('');
        fetchProofs(1, true);
      }
    } catch (err) {
      console.error('❌ Verify error:', err);
      toast.error(err.message || err.detail || 'Failed to verify payment');
    } finally {
      setSubmitting(false);
    }
  };

  // ============================================================
  // Reject action
  // ============================================================
  const handleReject = async () => {
    if (!rejectionReason.trim() || rejectionReason.trim().length < 5) {
      toast.error('Please provide a reason (min 5 chars)');
      return;
    }

    setSubmitting(true);
    try {
      const response = await adminRejectPayment(actionModal.proof.id, rejectionReason.trim());

      if (response.success) {
        toast.success('Payment rejected. Customer notified.');
        setActionModal(null);
        setRejectionReason('');
        fetchProofs(1, true);
      }
    } catch (err) {
      console.error('❌ Reject error:', err);
      toast.error(err.message || err.detail || 'Failed to reject payment');
    } finally {
      setSubmitting(false);
    }
  };

  // ============================================================
  // Helpers
  // ============================================================
  const formatDate = (iso) => {
    if (!iso) return 'N/A';
    return new Date(iso).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const statusBadge = (status) => {
    const map = {
      verification_pending: 'bg-blue-100 text-blue-700 border-blue-200',
      verified: 'bg-green-100 text-green-700 border-green-200',
      rejected: 'bg-red-100 text-red-700 border-red-200',
    };
    const labelMap = {
      verification_pending: 'Pending',
      verified: 'Verified',
      rejected: 'Rejected',
    };
    return (
      <span
        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${map[status] || 'bg-gray-100 text-gray-700 border-gray-200'}`}
      >
        {labelMap[status] || status}
      </span>
    );
  };

  const totalVerifiedAmount = proofs
    .filter((p) => p.status === 'verified')
    .reduce((sum, p) => sum + (p.total_price || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-custom">
        {/* ============================================================ */}
        {/* Header */}
        {/* ============================================================ */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Payment Verification</h1>
            <p className="text-gray-600 mt-1">
              Verify customer UPI payments manually
            </p>
          </div>
          <button
            onClick={() => fetchProofs(pagination.page, true)}
            disabled={refreshing}
            className="p-3 bg-white hover:bg-gray-100 rounded-full shadow-sm transition-colors disabled:opacity-50"
            title="Refresh"
          >
            <ArrowPathIcon
              className={`w-5 h-5 text-gray-600 ${refreshing ? 'animate-spin' : ''}`}
            />
          </button>
        </div>

        {/* ============================================================ */}
        {/* Stats */}
        {/* ============================================================ */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <ClockIcon className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Pending</p>
                <p className="text-2xl font-bold text-gray-900">
                  {pagination.total || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircleIcon className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Verified</p>
                <p className="text-2xl font-bold text-gray-900">
                  {proofs.filter((p) => p.status === 'verified').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <XCircleIcon className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Rejected</p>
                <p className="text-2xl font-bold text-gray-900">
                  {proofs.filter((p) => p.status === 'rejected').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gold-100 rounded-full flex items-center justify-center">
                <CurrencyRupeeIcon className="w-5 h-5 text-gold-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Verified ₹</p>
                <p className="text-2xl font-bold text-gray-900">
                  ₹{totalVerifiedAmount.toFixed(0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* Tabs */}
        {/* ============================================================ */}
        <div className="bg-white rounded-2xl shadow-sm p-2 mb-6 inline-flex flex-wrap gap-1">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-gold-500 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* ============================================================ */}
        {/* List */}
        {/* ============================================================ */}
        {loading ? (
          <div className="flex justify-center py-20">
            <LoadingSpinner />
          </div>
        ) : proofs.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-16 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <DocumentTextIcon className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-1">
              No {activeTab === 'all' ? '' : activeTab.replace('_', ' ')} payments
            </h3>
            <p className="text-sm text-gray-500">
              {activeTab === 'verification_pending'
                ? 'All caught up! New submissions will appear here.'
                : 'Nothing to show for this filter.'}
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {proofs.map((proof) => (
              <motion.div
                key={proof.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col"
              >
                {/* Screenshot */}
                <div className="relative bg-gray-100 aspect-[4/3] overflow-hidden group">
                  <img
                    src={proof.screenshot_url}
                    alt="Payment proof"
                    className="w-full h-full object-contain cursor-zoom-in"
                    onClick={() => setZoomImage(proof.screenshot_url)}
                  />
                  <button
                    onClick={() => setZoomImage(proof.screenshot_url)}
                    className="absolute top-3 right-3 p-2 bg-black/60 hover:bg-black/80 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MagnifyingGlassPlusIcon className="w-4 h-4" />
                  </button>
                  <div className="absolute top-3 left-3">
                    {statusBadge(proof.status)}
                  </div>
                </div>

                {/* Details */}
                <div className="p-4 flex-1 flex flex-col">
                  {/* Order + Amount */}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-xs text-gray-500">Order</p>
                      <p className="font-semibold text-gray-900 text-sm">
                        #{proof.order_number || 'N/A'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Amount</p>
                      <p className="font-bold text-gold-600 text-lg">
                        ₹{Number(proof.total_price || 0).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* Customer */}
                  <div className="space-y-1.5 mb-3 text-xs">
                    <div className="flex items-center gap-2 text-gray-700">
                      <UserIcon className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                      <span className="truncate">{proof.user_name || 'Unknown'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <EnvelopeIcon className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                      <span className="truncate">{proof.user_email || 'N/A'}</span>
                    </div>
                  </div>

                  {/* Customer note */}
                  {proof.customer_note && (
                    <div className="bg-gray-50 rounded-lg p-2 mb-3">
                      <p className="text-xs text-gray-500 mb-0.5">Customer note</p>
                      <p className="text-xs text-gray-700 line-clamp-2">
                        {proof.customer_note}
                      </p>
                    </div>
                  )}

                  {/* Timestamp */}
                  <p className="text-xs text-gray-400 mb-3">
                    Submitted {formatDate(proof.created_at)}
                  </p>

                  {/* Actions */}
                  <div className="mt-auto">
                    {proof.status === 'verification_pending' ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => setActionModal({ type: 'verify', proof })}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold rounded-xl transition-colors"
                        >
                          <CheckCircleIcon className="w-4 h-4" />
                          Approve
                        </button>
                        <button
                          onClick={() => setActionModal({ type: 'reject', proof })}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-xl transition-colors"
                        >
                          <XCircleIcon className="w-4 h-4" />
                          Reject
                        </button>
                      </div>
                    ) : proof.status === 'verified' ? (
                      <div className="text-center py-2 text-sm text-green-700 font-medium flex items-center justify-center gap-1.5">
                        <CheckCircleIcon className="w-4 h-4" />
                        Verified {formatDate(proof.verified_at)}
                      </div>
                    ) : (
                      <div className="text-center py-2 text-sm text-red-700 font-medium">
                        <p className="line-clamp-2">{proof.rejection_reason || 'Rejected'}</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* ============================================================ */}
        {/* Pagination */}
        {/* ============================================================ */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <button
              onClick={() => fetchProofs(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="px-4 py-2 bg-white hover:bg-gray-100 rounded-xl text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600 px-4">
              Page {pagination.page} of {pagination.pages}
            </span>
            <button
              onClick={() => fetchProofs(pagination.page + 1)}
              disabled={pagination.page === pagination.pages}
              className="px-4 py-2 bg-white hover:bg-gray-100 rounded-xl text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/* Zoom Modal */}
      {/* ============================================================ */}
      <AnimatePresence>
        {zoomImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setZoomImage(null)}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 cursor-zoom-out"
          >
            <button
              onClick={() => setZoomImage(null)}
              className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
            <img
              src={zoomImage}
              alt="Payment proof"
              className="max-w-full max-h-full object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ============================================================ */}
      {/* Verify / Reject Modal */}
      {/* ============================================================ */}
      <AnimatePresence>
        {actionModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
            onClick={() => !submitting && setActionModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
            >
              {actionModal.type === 'verify' ? (
                <>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircleIcon className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-gray-900">Verify Payment</h3>
                      <p className="text-sm text-gray-500">
                        Order #{actionModal.proof.order_number}
                      </p>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-3 mb-4">
                    <p className="text-xs text-gray-500 mb-1">Amount</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ₹{Number(actionModal.proof.total_price || 0).toFixed(2)}
                    </p>
                  </div>

                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    UPI Reference Number *
                  </label>
                  <input
                    type="text"
                    value={upiReference}
                    onChange={(e) => setUpiReference(e.target.value)}
                    placeholder="e.g. 423156789012"
                    className="input-field mb-2"
                    autoFocus
                  />
                  <p className="text-xs text-gray-500 mb-5">
                    Enter the UPI transaction ID visible in the screenshot (or your UPI app).
                  </p>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setActionModal(null)}
                      disabled={submitting}
                      className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleVerify}
                      disabled={submitting || !upiReference.trim()}
                      className="flex-1 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {submitting ? (
                        <>
                          <LoadingSpinner size="sm" />
                          Verifying...
                        </>
                      ) : (
                        <>
                          <CheckCircleIcon className="w-5 h-5" />
                          Confirm
                        </>
                      )}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                      <XCircleIcon className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-gray-900">Reject Payment</h3>
                      <p className="text-sm text-gray-500">
                        Order #{actionModal.proof.order_number}
                      </p>
                    </div>
                  </div>

                  <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 flex gap-2">
                    <ExclamationTriangleIcon className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-red-700">
                      The customer will receive this reason by email. Stock will be restored.
                    </p>
                  </div>

                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason for rejection *
                  </label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    rows={3}
                    maxLength={500}
                    placeholder="e.g. Amount does not match order total"
                    className="input-field resize-none mb-2"
                    autoFocus
                  />
                  <p className="text-xs text-gray-500 mb-5">
                    {rejectionReason.length}/500 characters (min 5)
                  </p>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setActionModal(null)}
                      disabled={submitting}
                      className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleReject}
                      disabled={submitting || rejectionReason.trim().length < 5}
                      className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {submitting ? (
                        <>
                          <LoadingSpinner size="sm" />
                          Rejecting...
                        </>
                      ) : (
                        <>
                          <XCircleIcon className="w-5 h-5" />
                          Confirm Reject
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminPaymentsPage;