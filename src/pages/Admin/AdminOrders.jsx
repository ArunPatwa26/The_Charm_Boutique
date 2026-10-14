import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  EyeIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  TruckIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  ShoppingBagIcon,
  UserIcon,
  CalendarIcon,
  CurrencyRupeeIcon,
  FunnelIcon,
  ArrowPathIcon,
  DocumentTextIcon,
  MapPinIcon,
  CreditCardIcon,
  MagnifyingGlassPlusIcon,
  ExclamationTriangleIcon,
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
  const [paymentAction, setPaymentAction] = useState(null); // 'verify' | 'reject'
  const [upiReference, setUpiReference] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [submittingPayment, setSubmittingPayment] = useState(false);

  useEffect(() => {
    fetchOrders();
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
    } catch (error) {
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
  // ORDER STATUS UPDATE
  // ==========================================
  const handleStatusUpdate = async () => {
    if (!selectedOrder || !newStatus) return;
    const orderId = resolveOrderId(selectedOrder);
    if (!orderId) {
      toast.error('Invalid order ID');
      return;
    }

    try {
      const response = await adminUpdateOrder(orderId, { status: newStatus });
      if (response.success) {
        toast.success(`Status updated to ${newStatus}`);
        setShowStatusModal(false);
        setSelectedOrder(null);
        setNewStatus('');
        fetchOrders();
      }
    } catch (error) {
      toast.error(error.message || 'Failed to update status');
    }
  };

  // ==========================================
  // PAYMENT VERIFICATION (from inside order modal)
  // ==========================================
  const handleVerifyPayment = async () => {
    const proof = selectedOrder?.payment_proof_data;
    if (!proof || !upiReference.trim() || upiReference.trim().length < 4) {
      toast.error('Please enter a valid UPI reference (min 4 chars)');
      return;
    }

    setSubmittingPayment(true);
    try {
      const response = await adminVerifyPayment(proof.id, upiReference.trim());
      if (response.success) {
        toast.success('Payment verified! Order confirmed.');
        setPaymentAction(null);
        setUpiReference('');
        setShowViewModal(false);
        setSelectedOrder(null);
        fetchOrders();
      }
    } catch (err) {
      toast.error(err.message || err.detail || 'Failed to verify payment');
    } finally {
      setSubmittingPayment(false);
    }
  };

  const handleRejectPayment = async () => {
    const proof = selectedOrder?.payment_proof_data;
    if (!proof || !rejectionReason.trim() || rejectionReason.trim().length < 5) {
      toast.error('Please provide a reason (min 5 chars)');
      return;
    }

    setSubmittingPayment(true);
    try {
      const response = await adminRejectPayment(proof.id, rejectionReason.trim());
      if (response.success) {
        toast.success('Payment rejected. Customer notified.');
        setPaymentAction(null);
        setRejectionReason('');
        setShowViewModal(false);
        setSelectedOrder(null);
        fetchOrders();
      }
    } catch (err) {
      toast.error(err.message || err.detail || 'Failed to reject payment');
    } finally {
      setSubmittingPayment(false);
    }
  };

  // ==========================================
  // MODAL HELPERS
  // ==========================================
  const handleViewOrder = (order) => {
    if (!resolveOrderId(order)) {
      toast.error('Invalid order');
      return;
    }
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
  // STYLE HELPERS
  // ==========================================
  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-amber-100 text-amber-700 border-amber-200',
      processing: 'bg-blue-100 text-blue-700 border-blue-200',
      shipped: 'bg-purple-100 text-purple-700 border-purple-200',
      delivered: 'bg-green-100 text-green-700 border-green-200',
      cancelled: 'bg-red-100 text-red-700 border-red-200',
    };
    return colors[status] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: ClockIcon,
      processing: ArrowPathIcon,
      shipped: TruckIcon,
      delivered: CheckCircleIcon,
      cancelled: XCircleIcon,
    };
    const Icon = icons[status] || ClockIcon;
    return <Icon className="w-4 h-4" />;
  };

  const getStatusBadge = (status) => (
    <span
      className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 border ${getStatusColor(status)}`}
    >
      {getStatusIcon(status)}
      <span className="capitalize">{status}</span>
    </span>
  );

  const getStatusMessage = (status) => {
    const messages = {
      pending: 'Order placed and awaiting confirmation.',
      processing: 'Order is being prepared for shipping.',
      shipped: 'Order has been shipped and is on the way.',
      delivered: 'Order has been delivered successfully.',
      cancelled: 'Order has been cancelled.',
    };
    return messages[status] || 'Order status updated.';
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatPrice = (price) => `₹${Number(price || 0).toFixed(2)}`;

  const statusOptions = [
    'pending',
    'processing',
    'shipped',
    'delivered',
    'cancelled',
  ];

  const getStatusCount = (status) =>
    orders.filter((o) => o.status === status).length;

  // ==========================================
  // CHECK IF ORDER NEEDS PAYMENT VERIFICATION
  // ==========================================
  const needsPaymentVerification = (order) =>
    order.payment_status === 'verification_pending' &&
    order.payment_proof_data?.status === 'verification_pending';

  return (
    <div className="max-w-7xl mx-auto pb-8">
      {/* ==========================================
          HEADER
      ========================================== */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 flex items-center gap-3 flex-wrap">
            Orders
            <span className="text-xs md:text-sm font-normal text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              {pagination.total} total
            </span>
          </h1>
          <p className="text-sm md:text-base text-gray-500 mt-1">
            Manage orders and verify UPI payments inline
          </p>
        </div>
        <button
          onClick={() => fetchOrders()}
          className="self-start md:self-auto px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2 text-sm font-medium"
        >
          <ArrowPathIcon className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* ==========================================
          STATS
      ========================================== */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4 mb-6">
        <div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100">
          <p className="text-xl md:text-2xl font-bold text-gray-900">
            {orders.length}
          </p>
          <p className="text-xs md:text-sm text-gray-500">Total</p>
        </div>
        {statusOptions.map((status) => (
          <div
            key={status}
            className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100"
          >
            <p
              className={`text-xl md:text-2xl font-bold ${getStatusColor(status)
                .split(' ')[0]
                .replace('bg-', 'text-')}`}
            >
              {getStatusCount(status)}
            </p>
            <p className="text-xs md:text-sm text-gray-500 capitalize">
              {status}
            </p>
          </div>
        ))}
      </div>

      {/* ==========================================
          FILTERS
      ========================================== */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-3">
          <form onSubmit={(e) => { e.preventDefault(); fetchOrders(); }} className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search order number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-transparent focus:bg-white outline-none transition-all text-sm"
              />
            </div>
          </form>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs md:text-sm text-gray-500 flex items-center gap-1">
              <FunnelIcon className="w-4 h-4" />
              Filter:
            </span>
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 md:px-4 md:py-2 rounded-xl text-xs md:text-sm font-medium transition-all ${
                statusFilter === 'all'
                  ? 'bg-amber-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            {statusOptions.map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 md:px-4 md:py-2 rounded-xl text-xs md:text-sm font-medium capitalize transition-all ${
                  statusFilter === status
                    ? 'bg-amber-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
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
        <div className="flex items-center justify-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 md:py-20 bg-white rounded-3xl shadow-sm border border-gray-100">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <ShoppingBagIcon className="w-10 h-10 text-gray-300" />
          </div>
          <h3 className="text-xl md:text-2xl font-bold mb-2">No orders found</h3>
          <p className="text-sm md:text-base text-gray-500">
            {searchTerm
              ? 'Try adjusting your search'
              : 'Orders will appear here once customers place them'}
          </p>
        </div>
      ) : (
        <div className="space-y-3 md:space-y-4">
          <AnimatePresence>
            {orders.map((order, index) => {
              const orderKey = order.id || order._id || `order-${index}`;
              const needsVerification = needsPaymentVerification(order);

              return (
                <motion.div
                  key={orderKey}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(index * 0.04, 0.3) }}
                  className={`bg-white rounded-2xl shadow-sm border overflow-hidden hover:shadow-md transition-all ${
                    needsVerification
                      ? 'border-amber-300 ring-2 ring-amber-100'
                      : 'border-gray-100'
                  }`}
                >
                  {/* Header */}
                  <div
                    className={`p-4 md:p-5 border-b ${
                      needsVerification
                        ? 'bg-amber-50/50 border-amber-100'
                        : 'bg-gray-50/50 border-gray-100'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                            needsVerification
                              ? 'bg-amber-100'
                              : 'bg-amber-50'
                          }`}
                        >
                          <DocumentTextIcon className="w-5 h-5 text-amber-600" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold text-gray-900 text-sm md:text-base">
                              #{order.order_number || 'N/A'}
                            </p>
                            {getStatusBadge(order.status)}
                            <PaymentStatusBadge
                              status={order.payment_status}
                              size="sm"
                            />
                          </div>
                          {needsVerification && (
                            <p className="text-xs text-amber-700 font-semibold mt-1 flex items-center gap-1">
                              <ExclamationTriangleIcon className="w-3.5 h-3.5" />
                              Payment needs verification
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 md:gap-4 ml-auto">
                        <div className="text-right">
                          <p className="text-[10px] md:text-xs text-gray-500">
                            Total
                          </p>
                          <p className="text-base md:text-xl font-bold text-amber-600">
                            {formatPrice(order.total_price)}
                          </p>
                        </div>
                        {needsVerification ? (
                          <button
                            onClick={() => handleViewOrder(order)}
                            className="px-3 md:px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl transition-colors text-xs md:text-sm font-semibold flex items-center gap-1.5 shadow-sm"
                          >
                            <CreditCardIcon className="w-4 h-4" />
                            Verify Payment
                          </button>
                        ) : (
                          <button
                            onClick={() => handleOpenStatusModalDirect(order)}
                            className="px-3 md:px-4 py-2 bg-amber-50 text-amber-600 rounded-xl hover:bg-amber-100 transition-colors text-xs md:text-sm font-medium flex items-center gap-1.5"
                          >
                            <ArrowPathIcon className="w-4 h-4" />
                            Update
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-4 md:p-5">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
                      <div className="flex items-start gap-2">
                        <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                          <UserIcon className="w-4 h-4 text-blue-500" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs md:text-sm font-medium text-gray-900 truncate">
                            {order.user_name || 'Guest'}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {order.user_email || 'No email'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center flex-shrink-0">
                          <CalendarIcon className="w-4 h-4 text-purple-500" />
                        </div>
                        <div>
                          <p className="text-xs md:text-sm font-medium text-gray-900">
                            Order Date
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDate(order.created_at)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
                          <ShoppingBagIcon className="w-4 h-4 text-green-500" />
                        </div>
                        <div>
                          <p className="text-xs md:text-sm font-medium text-gray-900">
                            {order.items?.length || 0} item
                            {order.items?.length !== 1 ? 's' : ''}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {order.items?.[0]?.name || ''}
                            {(order.items?.length || 0) > 1 ? ' + more' : ''}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="px-4 md:px-5 py-3 bg-gray-50/50 border-t border-gray-100 flex justify-between items-center flex-wrap gap-2">
                    <div className="text-xs text-gray-500 truncate">
                      Items: {formatPrice(order.items_price)} · Tax:{' '}
                      {formatPrice(order.tax_price)} · Shipping:{' '}
                      {order.shipping_price === 0
                        ? 'Free'
                        : formatPrice(order.shipping_price)}
                    </div>
                    <button
                      onClick={() => handleViewOrder(order)}
                      className="text-xs md:text-sm font-medium text-amber-600 hover:text-amber-700 flex items-center gap-1 transition-colors"
                    >
                      View Details
                      <EyeIcon className="w-4 h-4" />
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
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 p-4 bg-white rounded-2xl shadow-sm border border-gray-100">
          <p className="text-xs md:text-sm text-gray-500 order-2 sm:order-1">
            Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
            {pagination.total}
          </p>
          <div className="flex items-center gap-2 order-1 sm:order-2">
            <button
              onClick={() =>
                setPagination({ ...pagination, page: pagination.page - 1 })
              }
              disabled={pagination.page === 1}
              className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeftIcon className="w-5 h-5" />
            </button>
            <span className="px-3 md:px-4 py-2 text-xs md:text-sm font-medium">
              Page {pagination.page} of {pagination.pages}
            </span>
            <button
              onClick={() =>
                setPagination({ ...pagination, page: pagination.page + 1 })
              }
              disabled={pagination.page === pagination.pages}
              className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRightIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* ==========================================
          VIEW ORDER MODAL — WITH INLINE PAYMENT VERIFICATION
      ========================================== */}
      <AnimatePresence>
        {showViewModal && selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-2 md:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowViewModal(false)}
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-hidden flex flex-col"
            >
              <button
                onClick={() => setShowViewModal(false)}
                className="absolute top-4 right-4 z-20 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-colors"
              >
                <XMarkIcon className="w-5 h-5 text-gray-700" />
              </button>

              <div className="overflow-y-auto flex-1">
                {/* Header */}
                <div
                  className={`p-4 md:p-6 border-b-4 ${getStatusColor(
                    selectedOrder.status
                  )}`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${getStatusColor(
                          selectedOrder.status
                        )}`}
                      >
                        {getStatusIcon(selectedOrder.status)}
                      </div>
                      <div className="min-w-0">
                        <h2 className="text-lg md:text-2xl font-bold text-gray-900">
                          Order #{selectedOrder.order_number || 'N/A'}
                        </h2>
                        <p className="text-xs md:text-sm text-gray-600 mt-0.5">
                          {getStatusMessage(selectedOrder.status)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] md:text-xs text-gray-500">
                        Total Amount
                      </p>
                      <p className="text-xl md:text-3xl font-bold text-amber-600">
                        {formatPrice(selectedOrder.total_price)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 md:p-6 space-y-5">
                  {/* Info Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="bg-gray-50 rounded-xl p-3 md:p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <UserIcon className="w-4 h-4 text-blue-500" />
                        <h3 className="font-semibold text-gray-900 text-xs md:text-sm">
                          Customer
                        </h3>
                      </div>
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {selectedOrder.user_name || 'Guest'}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {selectedOrder.user_email || 'No email'}
                      </p>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-3 md:p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <CreditCardIcon className="w-4 h-4 text-purple-500" />
                        <h3 className="font-semibold text-gray-900 text-xs md:text-sm">
                          Payment
                        </h3>
                      </div>
                      <p className="text-sm font-medium text-gray-900">
                        {selectedOrder.payment_method === 'cash_on_delivery'
                          ? 'Cash on Delivery'
                          : selectedOrder.payment_method === 'upi'
                          ? 'UPI Payment'
                          : selectedOrder.payment_method || 'N/A'}
                      </p>
                      <PaymentStatusBadge
                        status={selectedOrder.payment_status}
                        size="sm"
                      />
                    </div>

                    <div className="bg-gray-50 rounded-xl p-3 md:p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <CalendarIcon className="w-4 h-4 text-green-500" />
                        <h3 className="font-semibold text-gray-900 text-xs md:text-sm">
                          Order Date
                        </h3>
                      </div>
                      <p className="text-sm font-medium text-gray-900">
                        {formatDate(selectedOrder.created_at)}
                      </p>
                    </div>
                  </div>

                  {/* ==========================================
                      PAYMENT VERIFICATION PANEL
                      (inline, no separate page needed)
                  ========================================== */}
                  {selectedOrder.payment_method === 'upi' &&
                    selectedOrder.payment_proof_data && (
                      <div className="border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl p-4 md:p-5">
                        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                          <h3 className="font-bold text-gray-900 text-sm md:text-base flex items-center gap-2">
                            <CreditCardIcon className="w-5 h-5 text-amber-600" />
                            UPI Payment Verification
                          </h3>
                          <PaymentStatusBadge
                            status={
                              selectedOrder.payment_proof_data.status
                            }
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Screenshot */}
                          <div>
                            <p className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wide">
                              Payment Screenshot
                            </p>
                            <div className="relative group rounded-xl overflow-hidden border-2 border-gray-200 bg-white">
                              <img
                                src={
                                  selectedOrder.payment_proof_data
                                    .screenshot_url
                                }
                                alt="Payment proof"
                                className="w-full h-64 object-contain cursor-zoom-in bg-gray-50"
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
                                className="absolute top-2 right-2 p-2 bg-black/60 hover:bg-black/80 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <MagnifyingGlassPlusIcon className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {/* Info + Actions */}
                          <div className="flex flex-col">
                            {selectedOrder.payment_proof_data
                              .customer_note && (
                              <div className="bg-white rounded-xl p-3 mb-3">
                                <p className="text-xs text-gray-500 mb-1 font-medium">
                                  Customer Note
                                </p>
                                <p className="text-sm text-gray-700">
                                  {
                                    selectedOrder.payment_proof_data
                                      .customer_note
                                  }
                                </p>
                              </div>
                            )}

                            <div className="bg-white rounded-xl p-3 mb-3">
                              <p className="text-xs text-gray-500 mb-1 font-medium">
                                Submitted
                              </p>
                              <p className="text-sm text-gray-700">
                                {formatDate(
                                  selectedOrder.payment_proof_data
                                    .submitted_at
                                )}
                              </p>
                            </div>

                            <div className="bg-white rounded-xl p-3 mb-3">
                              <p className="text-xs text-gray-500 mb-1 font-medium">
                                Amount to Verify
                              </p>
                              <p className="text-xl md:text-2xl font-bold text-amber-600">
                                {formatPrice(selectedOrder.total_price)}
                              </p>
                            </div>

                            {/* Actions */}
                            {selectedOrder.payment_proof_data.status ===
                              'verification_pending' && (
                              <div className="flex gap-2 mt-auto">
                                <button
                                  onClick={() =>
                                    setPaymentAction('verify')
                                  }
                                  className="flex-1 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm text-sm"
                                >
                                  <CheckCircleIcon className="w-4 h-4" />
                                  Approve
                                </button>
                                <button
                                  onClick={() =>
                                    setPaymentAction('reject')
                                  }
                                  className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm text-sm"
                                >
                                  <XCircleIcon className="w-4 h-4" />
                                  Reject
                                </button>
                              </div>
                            )}

                            {selectedOrder.payment_proof_data.status ===
                              'verified' && (
                              <div className="mt-auto bg-green-50 border border-green-200 rounded-xl p-3 flex items-start gap-2">
                                <CheckCircleIcon className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                <div className="min-w-0">
                                  <p className="text-sm font-semibold text-green-800">
                                    Payment Verified
                                  </p>
                                  <p className="text-xs text-green-700 mt-0.5">
                                    {formatDate(
                                      selectedOrder.payment_proof_data
                                        .verified_at                                    )}
                                  </p>
                                  {selectedOrder.upi_reference && (
                                    <p className="text-xs text-green-700 font-mono mt-1 truncate">
                                      Ref: {selectedOrder.upi_reference}
                                    </p>
                                  )}
                                </div>
                              </div>
                            )}

                            {selectedOrder.payment_proof_data.status ===
                              'rejected' && (
                              <div className="mt-auto bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2">
                                <XCircleIcon className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                <div className="min-w-0">
                                  <p className="text-sm font-semibold text-red-800">
                                    Payment Rejected
                                  </p>
                                  <p className="text-xs text-red-700 mt-0.5">
                                    {
                                      selectedOrder.payment_proof_data
                                        .rejection_reason
                                    }
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
                    <div className="bg-gray-50 rounded-2xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <MapPinIcon className="w-4 h-4 text-amber-500" />
                        <h3 className="font-semibold text-gray-900 text-sm">
                          Shipping Address
                        </h3>
                      </div>
                      <div className="text-sm text-gray-600 leading-relaxed">
                        <p className="font-medium text-gray-900">
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
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2 text-sm md:text-base">
                      <ShoppingBagIcon className="w-5 h-5 text-amber-500" />
                      Order Items ({selectedOrder.items?.length || 0})
                    </h3>
                    <div className="space-y-2">
                      {selectedOrder.items?.map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-3 p-2 md:p-3 bg-gray-50 rounded-xl"
                        >
                          <img
                            src={
                              item.image ||
                              'https://via.placeholder.com/60'
                            }
                            alt={item.name}
                            className="w-12 h-12 md:w-14 md:h-14 object-cover rounded-lg border border-gray-200"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 text-xs md:text-sm truncate">
                              {item.name}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {formatPrice(item.price)} × {item.quantity}
                            </p>
                          </div>
                          <p className="font-bold text-gray-900 text-xs md:text-sm whitespace-nowrap">
                            {formatPrice(item.price * item.quantity)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Price */}
                  <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-100 rounded-2xl p-4">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2 text-sm md:text-base">
                      <CurrencyRupeeIcon className="w-5 h-5 text-amber-600" />
                      Price Summary
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Items Total</span>
                        <span>{formatPrice(selectedOrder.items_price)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tax (10%)</span>
                        <span>{formatPrice(selectedOrder.tax_price)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Shipping</span>
                        <span>
                          {selectedOrder.shipping_price === 0
                            ? 'Free'
                            : formatPrice(selectedOrder.shipping_price)}
                        </span>
                      </div>
                      <div className="border-t border-amber-200 pt-2 mt-2 flex justify-between font-bold">
                        <span>Total</span>
                        <span className="text-amber-600 text-lg">
                          {formatPrice(selectedOrder.total_price)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-gray-100 p-4 md:p-5 flex flex-wrap gap-3 justify-end bg-white flex-shrink-0">
                <button
                  onClick={() =>
                    handleOpenStatusModalFromView(selectedOrder)
                  }
                  className="inline-flex items-center justify-center gap-2 px-4 md:px-5 py-2.5 md:py-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-xl hover:from-amber-600 hover:to-yellow-600 transition-all font-medium shadow-md text-sm"
                >
                  <ArrowPathIcon className="w-4 h-4" />
                  Update Order Status
                </button>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="px-4 md:px-5 py-2.5 md:py-3 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-medium text-sm"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ==========================================
          ZOOM IMAGE MODAL
      ========================================== */}
      <AnimatePresence>
        {zoomImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setZoomImage(null)}
            className="fixed inset-0 bg-black/95 z-[60] flex items-center justify-center p-4 cursor-zoom-out"
          >
            <button
              onClick={() => setZoomImage(null)}
              className="absolute top-4 right-4 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white"
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

      {/* ==========================================
          PAYMENT VERIFY / REJECT MODAL
      ========================================== */}
      <AnimatePresence>
        {paymentAction && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center p-4"
            onClick={() =>
              !submittingPayment && setPaymentAction(null)
            }
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
            >
              {paymentAction === 'verify' ? (
                <>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircleIcon className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-gray-900">
                        Verify Payment
                      </h3>
                      <p className="text-sm text-gray-500">
                        Order #{selectedOrder?.order_number}
                      </p>
                    </div>
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4">
                    <p className="text-xs text-amber-700 mb-1 font-medium">
                      Amount
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatPrice(selectedOrder?.total_price)}
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
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-400 focus:border-transparent focus:bg-white outline-none transition-all text-sm mb-2"
                    autoFocus
                  />
                  <p className="text-xs text-gray-500 mb-5">
                    Enter the UPI transaction ID visible in the screenshot.
                  </p>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setPaymentAction(null)}
                      disabled={submittingPayment}
                      className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors disabled:opacity-50 text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleVerifyPayment}
                      disabled={
                        submittingPayment || !upiReference.trim()
                      }
                      className="flex-1 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                    >
                      {submittingPayment ? (
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
                      <h3 className="font-bold text-lg text-gray-900">
                        Reject Payment
                      </h3>
                      <p className="text-sm text-gray-500">
                        Order #{selectedOrder?.order_number}
                      </p>
                    </div>
                  </div>

                  <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 flex gap-2">
                    <ExclamationTriangleIcon className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-red-700">
                      Customer will receive this reason by email. Stock
                      will be restored.
                    </p>
                  </div>

                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason for Rejection *
                  </label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    rows={3}
                    maxLength={500}
                    placeholder="e.g. Amount does not match order total"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-400 focus:border-transparent focus:bg-white outline-none transition-all text-sm resize-none mb-2"
                    autoFocus
                  />
                  <p className="text-xs text-gray-500 mb-5">
                    {rejectionReason.length}/500 (min 5)
                  </p>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setPaymentAction(null)}
                      disabled={submittingPayment}
                      className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors disabled:opacity-50 text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleRejectPayment}
                      disabled={
                        submittingPayment ||
                        rejectionReason.trim().length < 5
                      }
                      className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                    >
                      {submittingPayment ? (
                        <>
                          <LoadingSpinner size="sm" />
                          Rejecting...
                        </>
                      ) : (
                        <>
                          <XCircleIcon className="w-5 h-5" />
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
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setShowStatusModal(false)}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full p-6"
            >
              <button
                onClick={() => setShowStatusModal(false)}
                className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <XMarkIcon className="w-5 h-5 text-gray-400" />
              </button>

              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-2xl bg-amber-100 flex items-center justify-center mx-auto mb-4">
                  <ArrowPathIcon className="w-8 h-8 text-amber-600" />
                </div>
                <h3 className="text-xl font-bold">Update Order Status</h3>
                <p className="text-gray-500 text-sm mt-1">
                  Order #{selectedOrder?.order_number}
                </p>
              </div>

              <div className="space-y-2">
                {statusOptions.map((status) => (
                  <label
                    key={status}
                    className={`flex items-center gap-3 p-3 border-2 rounded-xl cursor-pointer transition-all ${
                      newStatus === status
                        ? 'border-amber-500 bg-amber-50 shadow-md'
                        : 'border-gray-200 hover:border-amber-300 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      value={status}
                      checked={newStatus === status}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="w-4 h-4 text-amber-500 focus:ring-amber-400"
                    />
                    <span
                      className={`capitalize font-medium text-sm ${
                        newStatus === status
                          ? 'text-amber-700'
                          : 'text-gray-700'
                      }`}
                    >
                      {status}
                    </span>
                  </label>
                ))}
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowStatusModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-medium text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleStatusUpdate}
                  disabled={newStatus === selectedOrder?.status}
                  className="flex-1 px-4 py-3 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed text-sm"
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

export default AdminOrders;