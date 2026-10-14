import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  EyeIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  ShoppingBagIcon,
  MapPinIcon,
  CreditCardIcon,
  MagnifyingGlassPlusIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  DocumentDuplicateIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

import {
  adminGetOrders,
  adminUpdateOrder,
  adminVerifyPayment,
  adminRejectPayment,
} from '../../services/orderService';
import PaymentStatusBadge from '../../components/common/PaymentStatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

// ==========================================
// STATUS CONFIG
// ==========================================
const STATUS_META = {
  pending: { label: 'Pending', dot: 'bg-ink-400', text: 'text-ink-600' },
  processing: { label: 'Processing', dot: 'bg-blue-500', text: 'text-blue-700' },
  shipped: { label: 'Shipped', dot: 'bg-purple-500', text: 'text-purple-700' },
  delivered: { label: 'Delivered', dot: 'bg-green-600', text: 'text-green-700' },
  cancelled: { label: 'Cancelled', dot: 'bg-red-500', text: 'text-red-700' },
};

const STATUS_OPTIONS = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');

  // Payment verification state
  const [zoomImage, setZoomImage] = useState(null);
  const [paymentAction, setPaymentAction] = useState(null);
  const [upiReference, setUpiReference] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [submittingPayment, setSubmittingPayment] = useState(false);

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, statusFilter]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        status: statusFilter === 'all' ? undefined : statusFilter,
        search: searchTerm || undefined,
      };
      const response = await adminGetOrders(params);
      if (response.success) {
        setOrders(response.orders || []);
        setPagination(response.pagination);
      }
    } catch {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const resolveOrderId = (order) => {
    if (!order) return null;
    const id = order.id || order._id;
    if (!id || id === 'undefined' || id === 'null') return null;
    return id;
  };

  // ==========================================
  // UPDATE ORDER STATUS
  // ==========================================
  const handleStatusUpdate = async () => {
    if (!selectedOrder || !newStatus) return;
    const orderId = resolveOrderId(selectedOrder);
    if (!orderId) return toast.error('Invalid order ID');

    try {
      const response = await adminUpdateOrder(orderId, { status: newStatus });
      if (response.success) {
        toast.success(`Status updated`);
        setShowStatusModal(false);
        setSelectedOrder(null);
        setNewStatus('');
        fetchOrders();
      }
    } catch (error) {
      toast.error(error.message || 'Failed to update');
    }
  };

  // ==========================================
  // PAYMENT VERIFICATION
  // ==========================================
  const handleVerifyPayment = async () => {
    const proof = selectedOrder?.payment_proof_data;
    if (!proof || !upiReference.trim() || upiReference.trim().length < 4) {
      return toast.error('Enter a valid UPI reference (min 4 chars)');
    }
    setSubmittingPayment(true);
    try {
      const response = await adminVerifyPayment(proof.id, upiReference.trim());
      if (response.success) {
        toast.success('Payment verified');
        setPaymentAction(null);
        setUpiReference('');
        setShowViewModal(false);
        setSelectedOrder(null);
        fetchOrders();
      }
    } catch (err) {
      toast.error(err.message || err.detail || 'Failed to verify');
    } finally {
      setSubmittingPayment(false);
    }
  };

  const handleRejectPayment = async () => {
    const proof = selectedOrder?.payment_proof_data;
    if (!proof || !rejectionReason.trim() || rejectionReason.trim().length < 5) {
      return toast.error('Provide a reason (min 5 chars)');
    }
    setSubmittingPayment(true);
    try {
      const response = await adminRejectPayment(proof.id, rejectionReason.trim());
      if (response.success) {
        toast.success('Payment rejected');
        setPaymentAction(null);
        setRejectionReason('');
        setShowViewModal(false);
        setSelectedOrder(null);
        fetchOrders();
      }
    } catch (err) {
      toast.error(err.message || err.detail || 'Failed to reject');
    } finally {
      setSubmittingPayment(false);
    }
  };

  // ==========================================
  // MODAL HELPERS
  // ==========================================
  const handleViewOrder = (order) => {
    if (!resolveOrderId(order)) return toast.error('Invalid order');
    setSelectedOrder(order);
    setShowViewModal(true);
  };

  const handleOpenStatusModalDirect = (order) => {
    if (!resolveOrderId(order)) return;
    setSelectedOrder(order);
    setNewStatus(order.status);
    setShowStatusModal(true);
  };

  const handleOpenStatusModalFromView = (order) => {
    setShowViewModal(false);
    setSelectedOrder(order);
    setNewStatus(order.status);
    setTimeout(() => setShowStatusModal(true), 150);
  };

  // ==========================================
  // HELPERS
  // ==========================================
  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatPrice = (price) =>
    `₹${Number(price || 0).toLocaleString('en-IN')}`;

  const getStatusCount = (status) =>
    orders.filter((o) => o.status === status).length;

  const needsPaymentVerification = (order) =>
    order.payment_status === 'verification_pending' &&
    order.payment_proof_data?.status === 'verification_pending';

  const copyUpiRef = async (ref) => {
    try {
      await navigator.clipboard.writeText(ref);
      toast.success('Reference copied');
    } catch {
      toast.error('Failed to copy');
    }
  };

  return (
    <div className="max-w-7xl mx-auto pb-8 space-y-6">
      {/* ==========================================
          HEADER
      ========================================== */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-kicker font-semibold text-ink-500 mb-2">
            Manage
          </p>
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-ink-800">
            Orders
          </h1>
          <p className="text-xs md:text-sm text-ink-500 mt-1.5">
            {pagination.total} total ·{' '}
            <span className="text-burgundy-500 font-medium">
              {orders.filter((o) => needsPaymentVerification(o)).length} pending verification
            </span>
          </p>
        </div>

        <button
          onClick={() => fetchOrders()}
          disabled={loading}
          className="self-start md:self-auto inline-flex items-center gap-2 px-3.5 py-2 border border-line rounded text-[11px] uppercase tracking-wider font-medium text-ink-700 hover:border-ink-800 transition-colors disabled:opacity-50"
        >
          <ArrowPathIcon className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* ==========================================
          STATS
      ========================================== */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
        <div className="bg-white border border-line rounded-lg p-3.5">
          <p className="font-serif text-xl md:text-2xl font-bold text-ink-800">
            {pagination.total}
          </p>
          <p className="text-[10px] uppercase tracking-wider text-ink-500 font-medium mt-1">
            Total
          </p>
        </div>
        {STATUS_OPTIONS.map((status) => {
          const meta = STATUS_META[status];
          return (
            <div
              key={status}
              className="bg-white border border-line rounded-lg p-3.5"
            >
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
                <span className="text-[9px] uppercase tracking-wider text-ink-500 font-medium">
                  {meta.label}
                </span>
              </div>
              <p className="font-serif text-xl md:text-2xl font-bold text-ink-800">
                {getStatusCount(status)}
              </p>
            </div>
          );
        })}
      </div>

      {/* ==========================================
          FILTERS
      ========================================== */}
      <div className="bg-white border border-line rounded-lg p-3 md:p-4">
        <div className="flex flex-col lg:flex-row gap-3">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              fetchOrders();
            }}
            className="flex-1"
          >
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
              <input
                type="text"
                placeholder="Search by order number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-cream-100 border border-line rounded focus:border-ink-800 outline-none transition-colors text-sm"
              />
            </div>
          </form>

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-2 rounded text-[11px] uppercase tracking-wider font-medium transition-colors border ${
                statusFilter === 'all'
                  ? 'bg-ink-800 text-cream-100 border-ink-800'
                  : 'bg-transparent text-ink-600 border-line hover:border-ink-800 hover:text-ink-800'
              }`}
            >
              All
            </button>
            {STATUS_OPTIONS.map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-2 rounded text-[11px] uppercase tracking-wider font-medium transition-colors border capitalize ${
                  statusFilter === status
                    ? 'bg-ink-800 text-cream-100 border-ink-800'
                    : 'bg-transparent text-ink-600 border-line hover:border-ink-800 hover:text-ink-800'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ==========================================
          ORDERS LIST
      ========================================== */}
      {loading ? (
        <div className="flex justify-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 bg-white border border-line rounded-lg">
          <ShoppingBagIcon className="w-10 h-10 text-ink-300 mx-auto mb-4" />
          <h3 className="font-serif text-lg font-bold text-ink-800 mb-1">
            No orders found
          </h3>
          <p className="text-sm text-ink-500">
            {searchTerm ? 'Try a different search' : 'Orders will appear here'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {orders.map((order, index) => {
              const orderKey = order.id || order._id || `order-${index}`;
              const meta = STATUS_META[order.status] || STATUS_META.pending;
              const needsVerification = needsPaymentVerification(order);

              return (
                <motion.div
                  key={orderKey}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(index * 0.04, 0.3) }}
                  className={`bg-white border rounded-lg overflow-hidden transition-colors ${
                    needsVerification
                      ? 'border-burgundy-300 bg-burgundy-50/20'
                      : 'border-line'
                  }`}
                >
                  {/* Header */}
                  <div
                    className={`p-4 md:p-5 border-b ${
                      needsVerification
                        ? 'border-burgundy-100 bg-burgundy-50/40'
                        : 'border-line bg-cream-100/50'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-medium text-ink-800 text-sm md:text-base">
                              #{order.order_number || 'N/A'}
                            </p>
                            <span className="inline-flex items-center gap-1.5 text-xs">
                              <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
                              <span className={`font-medium ${meta.text}`}>
                                {meta.label}
                              </span>
                            </span>
                            <PaymentStatusBadge status={order.payment_status} size="sm" />
                          </div>
                          {needsVerification && (
                            <p className="text-[10px] uppercase tracking-wider text-burgundy-500 font-semibold mt-1.5 flex items-center gap-1">
                              <ExclamationTriangleIcon className="w-3 h-3" />
                              Payment needs verification
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 ml-auto">
                        <div className="text-right">
                          <p className="text-[10px] uppercase tracking-wider text-ink-500">
                            Total
                          </p>
                          <p className="font-serif text-base md:text-lg font-bold text-ink-800">
                            {formatPrice(order.total_price)}
                          </p>
                        </div>
                        {needsVerification ? (
                          <button
                            onClick={() => handleViewOrder(order)}
                            className="px-3.5 py-2 bg-ink-800 hover:bg-burgundy-500 text-cream-100 rounded text-[11px] uppercase tracking-wider font-semibold flex items-center gap-1.5 transition-colors"
                          >
                            <CreditCardIcon className="w-3.5 h-3.5" />
                            Verify Payment
                          </button>
                        ) : (
                          <button
                            onClick={() => handleOpenStatusModalDirect(order)}
                            className="px-3.5 py-2 border border-line text-ink-700 rounded text-[11px] uppercase tracking-wider font-medium hover:border-ink-800 transition-colors flex items-center gap-1.5"
                          >
                            <ArrowPathIcon className="w-3.5 h-3.5" />
                            Update
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-4 md:p-5">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-ink-500 font-medium mb-1">
                          Customer
                        </p>
                        <p className="text-sm font-medium text-ink-800 truncate">
                          {order.user_name || 'Guest'}
                        </p>
                        <p className="text-xs text-ink-500 truncate mt-0.5">
                          {order.user_email || 'No email'}
                        </p>
                      </div>

                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-ink-500 font-medium mb-1">
                          Date
                        </p>
                        <p className="text-sm text-ink-800">
                          {formatDate(order.created_at)}
                        </p>
                      </div>

                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-ink-500 font-medium mb-1">
                          Items
                        </p>
                        <p className="text-sm text-ink-800">
                          {order.items?.length || 0}{' '}
                          {order.items?.length === 1 ? 'piece' : 'pieces'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="px-4 md:px-5 py-3 border-t border-line bg-cream-100/50 flex justify-between items-center flex-wrap gap-2">
                    <div className="text-[11px] text-ink-500 truncate">
                      {order.items?.slice(0, 2).map((i) => i.name).join(' · ')}
                      {(order.items?.length || 0) > 2 &&
                        ` +${order.items.length - 2} more`}
                    </div>
                    <button
                      onClick={() => handleViewOrder(order)}
                      className="inline-flex items-center gap-1 text-[11px] uppercase tracking-wider font-medium text-ink-700 hover:text-burgundy-500 transition-colors"
                    >
                      View Details
                      <EyeIcon className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* ==========================================
          PAGINATION
      ========================================== */}
      {!loading && orders.length > 0 && pagination.pages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <p className="text-xs text-ink-500 order-2 sm:order-1">
            Page {pagination.page} of {pagination.pages}
          </p>
          <nav className="flex items-center gap-1 order-1 sm:order-2">
            <button
              onClick={() =>
                setPagination({ ...pagination, page: pagination.page - 1 })
              }
              disabled={pagination.page === 1}
              className="px-3 py-1.5 text-[11px] uppercase tracking-wider font-medium border border-line rounded hover:border-ink-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              Prev
            </button>
            <span className="px-3 text-xs text-ink-600 font-medium">
              {pagination.page} / {pagination.pages}
            </span>
            <button
              onClick={() =>
                setPagination({ ...pagination, page: pagination.page + 1 })
              }
              disabled={pagination.page === pagination.pages}
              className="px-3 py-1.5 text-[11px] uppercase tracking-wider font-medium border border-line rounded hover:border-ink-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </nav>
        </div>
      )}

      {/* ==========================================
          VIEW ORDER MODAL
      ========================================== */}
      <AnimatePresence>
        {showViewModal && selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-2 md:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-ink-950/60 backdrop-blur-sm"
              onClick={() => setShowViewModal(false)}
            />

            <motion.div
              initial={{ scale: 0.97, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.97, opacity: 0, y: 12 }}
              className="relative bg-white rounded-lg shadow-2xl max-w-3xl w-full max-h-[95vh] overflow-hidden flex flex-col border border-line"
            >
              {/* Close */}
              <button
                onClick={() => setShowViewModal(false)}
                className="absolute top-3 right-3 z-20 p-1.5 bg-white border border-line rounded hover:bg-cream-100 transition-colors"
                aria-label="Close"
              >
                <XMarkIcon className="w-4 h-4 text-ink-500" />
              </button>

              <div className="overflow-y-auto flex-1">
                {/* Header */}
                <div className="p-5 md:p-6 border-b border-line">
                  <div className="flex flex-wrap items-end justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-[10px] uppercase tracking-kicker font-semibold text-ink-500 mb-2">
                        Order Detail
                      </p>
                      <h2 className="font-serif text-xl md:text-2xl font-bold text-ink-800">
                        #{selectedOrder.order_number || 'N/A'}
                      </h2>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] uppercase tracking-wider text-ink-500 mb-1">
                        Total
                      </p>
                      <p className="font-serif text-xl md:text-2xl font-bold text-ink-800">
                        {formatPrice(selectedOrder.total_price)}
                      </p>
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="flex items-center gap-3 mt-4 flex-wrap">
                    <span className="inline-flex items-center gap-1.5 text-xs">
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          (STATUS_META[selectedOrder.status] || STATUS_META.pending).dot
                        }`}
                      />
                      <span
                        className={`font-medium ${
                          (STATUS_META[selectedOrder.status] || STATUS_META.pending).text
                        }`}
                      >
                        {(STATUS_META[selectedOrder.status] || STATUS_META.pending).label}
                      </span>
                    </span>
                    <span className="text-ink-300">·</span>
                    <PaymentStatusBadge status={selectedOrder.payment_status} size="sm" />
                  </div>
                </div>

                <div className="p-5 md:p-6 space-y-5">
                  {/* Info grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-ink-500 font-medium mb-1.5">
                        Customer
                      </p>
                      <p className="text-sm font-medium text-ink-800 truncate">
                        {selectedOrder.user_name || 'Guest'}
                      </p>
                      <p className="text-xs text-ink-500 truncate mt-0.5">
                        {selectedOrder.user_email || 'No email'}
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-ink-500 font-medium mb-1.5">
                        Payment Method
                      </p>
                      <p className="text-sm font-medium text-ink-800">
                        {selectedOrder.payment_method === 'cash_on_delivery'
                          ? 'Cash on Delivery'
                          : 'UPI Payment'}
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-ink-500 font-medium mb-1.5">
                        Order Date
                      </p>
                      <p className="text-sm text-ink-800">
                        {formatDate(selectedOrder.created_at)}
                      </p>
                    </div>
                  </div>

                  {/* ==========================================
                      PAYMENT VERIFICATION PANEL
                  ========================================== */}
                  {selectedOrder.payment_method === 'upi' &&
                    selectedOrder.payment_proof_data && (
                      <div
                        className={`border rounded-lg p-4 md:p-5 ${
                          selectedOrder.payment_proof_data.status ===
                          'verification_pending'
                            ? 'border-burgundy-300 bg-burgundy-50/30'
                            : 'border-line bg-cream-100/50'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                          <p className="text-[11px] uppercase tracking-kicker font-semibold text-ink-800">
                            UPI Payment Verification
                          </p>
                          <PaymentStatusBadge
                            status={selectedOrder.payment_proof_data.status}
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Screenshot */}
                          <div>
                            <p className="text-[10px] uppercase tracking-wider text-ink-500 font-medium mb-2">
                              Payment Screenshot
                            </p>
                            <div className="relative group rounded overflow-hidden border border-line bg-white">
                              <img
                                src={
                                  selectedOrder.payment_proof_data
                                    .screenshot_url
                                }
                                alt="Payment proof"
                                className="w-full h-56 object-contain cursor-zoom-in bg-cream-100"
                                onClick={() =>
                                  setZoomImage(
                                    selectedOrder.payment_proof_data
                                      .screenshot_url
                                  )
                                }
                              />
                              <button
                                onClick={() =>
                                  setZoomImage(
                                    selectedOrder.payment_proof_data
                                      .screenshot_url
                                  )
                                }
                                className="absolute top-2 right-2 p-1.5 bg-ink-800/80 hover:bg-ink-800 rounded text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                aria-label="Zoom"
                              >
                                <MagnifyingGlassPlusIcon className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Info + Actions */}
                          <div className="flex flex-col">
                            {selectedOrder.payment_proof_data.customer_note && (
                              <div className="border border-line rounded p-3 mb-3 bg-white">
                                <p className="text-[10px] uppercase tracking-wider text-ink-500 font-medium mb-1">
                                  Customer Note
                                </p>
                                <p className="text-xs text-ink-700 leading-relaxed">
                                  {selectedOrder.payment_proof_data.customer_note}
                                </p>
                              </div>
                            )}

                            <div className="border border-line rounded p-3 mb-3 bg-white">
                              <p className="text-[10px] uppercase tracking-wider text-ink-500 font-medium mb-1">
                                Submitted
                              </p>
                              <p className="text-xs text-ink-700">
                                {formatDate(
                                  selectedOrder.payment_proof_data.submitted_at
                                )}
                              </p>
                            </div>

                            <div className="border border-line rounded p-3 mb-3 bg-white">
                              <p className="text-[10px] uppercase tracking-wider text-ink-500 font-medium mb-1">
                                Amount to Verify
                              </p>
                              <p className="font-serif text-lg font-bold text-ink-800">
                                {formatPrice(selectedOrder.total_price)}
                              </p>
                            </div>

                            {/* Actions */}
                            {selectedOrder.payment_proof_data.status ===
                              'verification_pending' && (
                              <div className="flex gap-2 mt-auto">
                                <button
                                  onClick={() => setPaymentAction('verify')}
                                  className="flex-1 py-2.5 bg-ink-800 hover:bg-burgundy-500 text-cream-100 rounded text-[11px] uppercase tracking-wider font-semibold flex items-center justify-center gap-1.5 transition-colors"
                                >
                                  <CheckCircleIcon className="w-3.5 h-3.5" />
                                  Approve
                                </button>
                                <button
                                  onClick={() => setPaymentAction('reject')}
                                  className="flex-1 py-2.5 border border-line text-ink-700 rounded text-[11px] uppercase tracking-wider font-semibold hover:border-red-400 hover:text-red-600 flex items-center justify-center gap-1.5 transition-colors"
                                >
                                  <XCircleIcon className="w-3.5 h-3.5" />
                                  Reject
                                </button>
                              </div>
                            )}

                            {selectedOrder.payment_proof_data.status ===
                              'verified' && (
                              <div className="mt-auto border border-green-200 bg-green-50 rounded p-3 flex items-start gap-2.5">
                                <CheckCircleIcon className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                                <div className="min-w-0 flex-1">
                                  <p className="text-xs font-semibold text-green-800">
                                    Payment Verified
                                  </p>
                                  <p className="text-[10px] text-green-700 mt-0.5">
                                    {formatDate(
                                      selectedOrder.payment_proof_data.verified_at
                                    )}
                                  </p>
                                  {selectedOrder.upi_reference && (
                                    <button
                                      onClick={() =>
                                        copyUpiRef(selectedOrder.upi_reference)
                                      }
                                      className="inline-flex items-center gap-1 text-[10px] text-green-700 font-mono mt-1.5 hover:text-green-900 transition-colors"
                                    >
                                      Ref: {selectedOrder.upi_reference}
                                      <DocumentDuplicateIcon className="w-3 h-3" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            )}

                            {selectedOrder.payment_proof_data.status ===
                              'rejected' && (
                              <div className="mt-auto border border-red-200 bg-red-50 rounded p-3 flex items-start gap-2.5">
                                <XCircleIcon className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                                <div className="min-w-0">
                                  <p className="text-xs font-semibold text-red-800">
                                    Payment Rejected
                                  </p>
                                  <p className="text-[10px] text-red-700 mt-0.5 leading-relaxed">
                                    {selectedOrder.payment_proof_data.rejection_reason}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                  {/* Shipping */}
                  {selectedOrder.shipping_address && (
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-ink-500 font-medium mb-2 flex items-center gap-1.5">
                        <MapPinIcon className="w-3 h-3" />
                        Shipping Address
                      </p>
                      <div className="text-sm text-ink-700 leading-relaxed">
                        <p className="font-medium text-ink-800">
                          {selectedOrder.shipping_address.street}
                        </p>
                        <p>
                          {selectedOrder.shipping_address.city},{' '}
                          {selectedOrder.shipping_address.state}{' '}
                          {selectedOrder.shipping_address.zip_code}
                        </p>
                        <p>{selectedOrder.shipping_address.country}</p>
                      </div>
                    </div>
                  )}

                  {/* Items */}
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-ink-500 font-medium mb-3">
                      Items ({selectedOrder.items?.length || 0})
                    </p>
                    <div className="divide-y divide-line border border-line rounded">
                      {selectedOrder.items?.map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-3 p-3"
                        >
                          <img
                            src={
                              item.image || 'https://via.placeholder.com/60'
                            }
                            alt={item.name}
                            className="w-12 h-12 object-cover rounded border border-line flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-ink-800 truncate">
                              {item.name}
                            </p>
                            <p className="text-xs text-ink-500 mt-0.5">
                              {formatPrice(item.price)} × {item.quantity}
                            </p>
                          </div>
                          <p className="text-sm font-medium text-ink-800 whitespace-nowrap">
                            {formatPrice(item.price * item.quantity)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Price Summary */}
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-ink-500 font-medium mb-3">
                      Price Summary
                    </p>
                    <div className="space-y-2 text-sm">
                      <Row label="Items Total" value={formatPrice(selectedOrder.items_price)} />
                      <Row label="Tax (10%)" value={formatPrice(selectedOrder.tax_price)} />
                      <Row
                        label="Shipping"
                        value={
                          selectedOrder.shipping_price === 0
                            ? 'Free'
                            : formatPrice(selectedOrder.shipping_price)
                        }
                        isFree={selectedOrder.shipping_price === 0}
                      />
                      <div className="border-t border-line pt-2.5 mt-2.5 flex justify-between items-baseline">
                        <span className="text-[11px] uppercase tracking-wider font-semibold text-ink-800">
                          Total
                        </span>
                        <span className="font-serif text-lg font-bold text-ink-800">
                          {formatPrice(selectedOrder.total_price)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-line p-4 md:p-5 flex flex-wrap gap-2 justify-end bg-white flex-shrink-0">
                <button
                  onClick={() => handleOpenStatusModalFromView(selectedOrder)}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-ink-800 text-cream-100 rounded text-[11px] uppercase tracking-wider font-semibold hover:bg-burgundy-500 transition-colors"
                >
                  <ArrowPathIcon className="w-3.5 h-3.5" />
                  Update Status
                </button>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="px-4 py-2.5 border border-line text-ink-700 rounded text-[11px] uppercase tracking-wider font-semibold hover:border-ink-800 transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ==========================================
          ZOOM IMAGE
      ========================================== */}
      <AnimatePresence>
        {zoomImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setZoomImage(null)}
            className="fixed inset-0 bg-ink-950/95 z-[60] flex items-center justify-center p-4 cursor-zoom-out"
          >
            <button
              onClick={() => setZoomImage(null)}
              className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
              aria-label="Close"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
            <img
              src={zoomImage}
              alt="Payment proof"
              className="max-w-full max-h-full object-contain rounded"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ==========================================
          PAYMENT VERIFY / REJECT MODAL
      ========================================== */}
      <AnimatePresence>
        {paymentAction && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-ink-950/70 z-[60] flex items-center justify-center p-4"
            onClick={() => !submittingPayment && setPaymentAction(null)}
          >
            <motion.div
              initial={{ scale: 0.97, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.97, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6 border border-line"
            >
              {paymentAction === 'verify' ? (
                <>
                  <div className="mb-5">
                    <p className="text-[10px] uppercase tracking-kicker font-semibold text-burgundy-500 mb-2">
                      Verify Payment
                    </p>
                    <h3 className="font-serif text-lg font-bold text-ink-800">
                      Order #{selectedOrder?.order_number}
                    </h3>
                  </div>

                  <div className="border border-line rounded p-3 mb-4 bg-cream-100">
                    <p className="text-[10px] uppercase tracking-wider text-ink-500 font-medium mb-1">
                      Amount
                    </p>
                    <p className="font-serif text-2xl font-bold text-ink-800">
                      {formatPrice(selectedOrder?.total_price)}
                    </p>
                  </div>

                  <label className="block text-[11px] uppercase tracking-wider font-medium text-ink-500 mb-2">
                    UPI Reference Number *
                  </label>
                  <input
                    type="text"
                    value={upiReference}
                    onChange={(e) => setUpiReference(e.target.value)}
                    placeholder="e.g. 423156789012"
                    className="w-full px-3.5 py-2.5 bg-cream-100 border border-line rounded focus:border-ink-800 outline-none transition-colors text-sm mb-2"
                    autoFocus
                  />
                  <p className="text-[11px] text-ink-500 mb-5">
                    Enter the UPI transaction ID visible in the screenshot.
                  </p>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setPaymentAction(null)}
                      disabled={submittingPayment}
                      className="flex-1 py-2.5 border border-line text-ink-700 rounded text-[11px] uppercase tracking-wider font-semibold hover:border-ink-800 transition-colors disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleVerifyPayment}
                      disabled={submittingPayment || !upiReference.trim()}
                      className="flex-1 py-2.5 bg-ink-800 hover:bg-burgundy-500 text-cream-100 rounded text-[11px] uppercase tracking-wider font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
                    >
                      {submittingPayment ? (
                        <>
                          <LoadingSpinner size="sm" />
                          Verifying
                        </>
                      ) : (
                        <>
                          <CheckCircleIcon className="w-3.5 h-3.5" />
                          Confirm
                        </>
                      )}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="mb-5">
                    <p className="text-[10px] uppercase tracking-kicker font-semibold text-red-500 mb-2">
                      Reject Payment
                    </p>
                    <h3 className="font-serif text-lg font-bold text-ink-800">
                      Order #{selectedOrder?.order_number}
                    </h3>
                  </div>

                  <div className="border border-red-200 bg-red-50 rounded p-3 mb-4 flex gap-2">
                    <ExclamationTriangleIcon className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-[11px] text-red-700 leading-relaxed">
                      Customer will be notified by email. Stock will be
                      restored.
                    </p>
                  </div>

                  <label className="block text-[11px] uppercase tracking-wider font-medium text-ink-500 mb-2">
                    Reason for Rejection *
                  </label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    rows={3}
                    maxLength={500}
                    placeholder="e.g. Amount does not match order total"
                    className="w-full px-3.5 py-2.5 bg-cream-100 border border-line rounded focus:border-ink-800 outline-none transition-colors text-sm resize-none mb-2"
                    autoFocus
                  />
                  <p className="text-[11px] text-ink-500 mb-5">
                    {rejectionReason.length}/500 (min 5)
                  </p>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setPaymentAction(null)}
                      disabled={submittingPayment}
                      className="flex-1 py-2.5 border border-line text-ink-700 rounded text-[11px] uppercase tracking-wider font-semibold hover:border-ink-800 transition-colors disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleRejectPayment}
                      disabled={
                        submittingPayment || rejectionReason.trim().length < 5
                      }
                      className="flex-1 py-2.5 border border-red-400 bg-red-500 hover:bg-red-600 text-white rounded text-[11px] uppercase tracking-wider font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
                    >
                      {submittingPayment ? (
                        <>
                          <LoadingSpinner size="sm" />
                          Rejecting
                        </>
                      ) : (
                        <>
                          <XCircleIcon className="w-3.5 h-3.5" />
                          Confirm
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

      {/* ==========================================
          STATUS UPDATE MODAL
      ========================================== */}
      <AnimatePresence>
        {showStatusModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-ink-950/50 backdrop-blur-sm"
              onClick={() => setShowStatusModal(false)}
            />
            <motion.div
              initial={{ scale: 0.97, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.97, opacity: 0 }}
              className="relative bg-white rounded-lg shadow-2xl max-w-md w-full p-6 border border-line"
            >
              <button
                onClick={() => setShowStatusModal(false)}
                className="absolute top-3 right-3 p-1.5 hover:bg-cream-100 rounded transition-colors"
                aria-label="Close"
              >
                <XMarkIcon className="w-4 h-4 text-ink-500" />
              </button>

              <div className="mb-5">
                <p className="text-[10px] uppercase tracking-kicker font-semibold text-ink-500 mb-2">
                  Update Status
                </p>
                <h3 className="font-serif text-lg font-bold text-ink-800">
                  Order #{selectedOrder?.order_number}
                </h3>
              </div>

              <div className="space-y-1.5">
                {STATUS_OPTIONS.map((status) => {
                  const meta = STATUS_META[status];
                  const active = newStatus === status;
                  return (
                    <label
                      key={status}
                      className={`flex items-center gap-3 p-3 border rounded cursor-pointer transition-colors ${
                        active
                          ? 'border-ink-800 bg-cream-100'
                          : 'border-line hover:border-ink-400'
                      }`}
                    >
                      <span
                        className={`relative flex-shrink-0 w-4 h-4 rounded-full border-2 transition-colors ${
                          active
                            ? 'border-ink-800 bg-ink-800'
                            : 'border-ink-300'
                        }`}
                      >
                        {active && (
                          <span className="absolute inset-0 m-auto w-1.5 h-1.5 rounded-full bg-cream-100" />
                        )}
                      </span>
                      <span className="flex items-center gap-2 flex-1">
                        <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
                        <span
                          className={`capitalize text-sm ${
                            active ? 'text-ink-800 font-medium' : 'text-ink-600'
                          }`}
                        >
                          {meta.label}
                        </span>
                      </span>
                      <input
                        type="radio"
                        value={status}
                        checked={active}
                        onChange={(e) => setNewStatus(e.target.value)}
                        className="sr-only"
                      />
                    </label>
                  );
                })}
              </div>

              <div className="flex gap-2 mt-6">
                <button
                  onClick={() => setShowStatusModal(false)}
                  className="flex-1 px-4 py-2.5 border border-line rounded text-[11px] uppercase tracking-wider font-semibold text-ink-700 hover:border-ink-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleStatusUpdate}
                  disabled={newStatus === selectedOrder?.status}
                  className="flex-1 px-4 py-2.5 bg-ink-800 text-cream-100 rounded text-[11px] uppercase tracking-wider font-semibold hover:bg-burgundy-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Update
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ==========================================
// ROW
// ==========================================
const Row = ({ label, value, isFree }) => (
  <div className="flex justify-between text-sm">
    <span className="text-ink-600">{label}</span>
    <span className="font-medium text-ink-800">
      {isFree ? <span className="text-burgundy-500">Free</span> : value}
    </span>
  </div>
);

export default AdminOrders;