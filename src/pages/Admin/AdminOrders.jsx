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
  EnvelopeIcon,
  PrinterIcon,
  CubeIcon,
} from '@heroicons/react/24/outline';
import { adminGetOrders, adminUpdateOrder } from '../../services/orderService';
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

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination({ ...pagination, page: 1 });
    fetchOrders();
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setPagination({ ...pagination, page: 1 });
    fetchOrders();
  };

  // ==========================================
  // HELPER: safely resolve order ID
  // ==========================================
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

    if (!orderId) {
      toast.error('Invalid order ID — please refresh and try again');
      console.error('❌ Missing order ID:', selectedOrder);
      return;
    }

    try {
      const response = await adminUpdateOrder(orderId, { status: newStatus });
      if (response.success) {
        toast.success(`Order status updated to ${newStatus}`);
        setShowStatusModal(false);
        setSelectedOrder(null);
        setNewStatus('');
        fetchOrders();
      }
    } catch (error) {
      console.error('❌ Status update error:', error);
      toast.error(error.message || error.detail || 'Failed to update order status');
    }
  };

  // ==========================================
  // OPEN VIEW MODAL
  // ==========================================
  const handleViewOrder = (order) => {
    if (!resolveOrderId(order)) {
      toast.error('Invalid order — please refresh');
      return;
    }
    setSelectedOrder(order);
    setShowViewModal(true);
  };

  // ==========================================
  // OPEN STATUS MODAL (from card header button)
  // ==========================================
  const handleOpenStatusModalDirect = (order) => {
    if (!resolveOrderId(order)) {
      toast.error('Invalid order — please refresh');
      return;
    }
    setSelectedOrder(order);
    setNewStatus(order.status);
    setShowStatusModal(true);
  };

  // ==========================================
  // OPEN STATUS MODAL (from view modal footer)
  // ==========================================
  const handleOpenStatusModalFromView = (order) => {
    setShowViewModal(false);
    setSelectedOrder(order);
    setNewStatus(order.status);
    setTimeout(() => setShowStatusModal(true), 150);
  };

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

  const getStatusBadge = (status) => {
    return (
      <span className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 border ${getStatusColor(status)}`}>
        {getStatusIcon(status)}
        <span className="capitalize">{status}</span>
      </span>
    );
  };

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
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatPrice = (price) => {
    return `₹${Number(price || 0).toFixed(2)}`;
  };

  const statusOptions = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

  const getStatusCount = (status) => {
    return orders.filter((o) => o.status === status).length;
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 flex items-center gap-3">
            Orders
            <span className="text-sm font-normal text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              {pagination.total} total
            </span>
          </h1>
          <p className="text-gray-500 mt-1">Manage and track all customer orders</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchOrders()}
            className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2 text-sm font-medium"
          >
            <ArrowPathIcon className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100">
          <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
          <p className="text-sm text-gray-500">Total Orders</p>
        </div>
        {statusOptions.map((status) => (
          <div key={status} className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100">
            <p className={`text-2xl font-bold ${getStatusColor(status).split(' ')[0].replace('bg-', 'text-')}`}>
              {getStatusCount(status)}
            </p>
            <p className="text-sm text-gray-500 capitalize">{status}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
        <div className="flex flex-col lg:flex-row gap-4">
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by order number or customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gold-400 focus:border-transparent outline-none transition-shadow"
              />
            </div>
          </form>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-gray-500 flex items-center gap-1 mr-2">
              <FunnelIcon className="w-4 h-4" />
              Filter:
            </span>
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                statusFilter === 'all'
                  ? 'bg-gold-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            {statusOptions.map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all ${
                  statusFilter === status
                    ? 'bg-gold-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {status}
              </button>
            ))}
            {searchTerm && (
              <button
                onClick={handleClearSearch}
                className="px-3 py-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Orders Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100">
          <div className="text-7xl mb-6">📋</div>
          <h3 className="text-2xl font-bold mb-3">No orders found</h3>
          <p className="text-gray-500">
            {searchTerm ? 'Try adjusting your search' : 'Orders will appear here once customers place them'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {orders.map((order, index) => {
              const orderKey = order.id || order._id || `order-${index}`;

              return (
                <motion.div
                  key={orderKey}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
                >
                  {/* Order Header */}
                  <div className="p-5 border-b border-gray-100 bg-gray-50/50">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gold-100 flex items-center justify-center">
                          <DocumentTextIcon className="w-5 h-5 text-gold-600" />
                        </div>
                        <div>
                          <div className="flex items-center gap-3 flex-wrap">
                            <p className="font-semibold text-gray-900">
                              #{order.order_number || 'N/A'}
                            </p>
                            {getStatusBadge(order.status)}
                            <PaymentStatusBadge status={order.payment_status} size="sm" />
                          </div>
                          <p className="text-xs text-gray-400 mt-0.5">
                            ID: {orderKey.slice(0, 12)}...
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm text-gray-500">Total Amount</p>
                          <p className="text-xl font-bold text-gold-600">
                            ₹{Number(order.total_price || 0).toFixed(2)}
                          </p>
                        </div>
                        <button
                          onClick={() => handleOpenStatusModalDirect(order)}
                          className="px-4 py-2 bg-gold-50 text-gold-600 rounded-xl hover:bg-gold-100 transition-colors text-sm font-medium flex items-center gap-1.5"
                        >
                          <ArrowPathIcon className="w-4 h-4" />
                          Update Status
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Order Body */}
                  <div className="p-5">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                          <UserIcon className="w-4 h-4 text-blue-500" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {order.user_name || 'Guest Customer'}
                          </p>
                          <p className="text-sm text-gray-500">{order.user_email || 'No email'}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-full bg-purple-50 flex items-center justify-center flex-shrink-0">
                          <CalendarIcon className="w-4 h-4 text-purple-500" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Order Date</p>
                          <p className="text-sm text-gray-500">{formatDate(order.created_at)}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
                          <ShoppingBagIcon className="w-4 h-4 text-green-500" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Items</p>
                          <div className="flex items-center gap-2">
                            <div className="flex -space-x-1.5">
                              {order.items?.slice(0, 3).map((item, i) => (
                                <img
                                  key={i}
                                  src={item.image || 'https://via.placeholder.com/30'}
                                  alt={item.name}
                                  className="w-7 h-7 rounded-full border-2 border-white object-cover"
                                />
                              ))}
                            </div>
                            <span className="text-sm text-gray-500">
                              {order.items?.length || 0} item{order.items?.length !== 1 ? 's' : ''}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex flex-wrap gap-2">
                        {order.items?.slice(0, 4).map((item, i) => (
                          <span key={i} className="text-xs bg-gray-100 px-3 py-1.5 rounded-full text-gray-600">
                            {item.name} × {item.quantity}
                          </span>
                        ))}
                        {order.items?.length > 4 && (
                          <span className="text-xs bg-gray-100 px-3 py-1.5 rounded-full text-gray-400">
                            +{order.items.length - 4} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Order Footer */}
                  <div className="px-5 py-3 bg-gray-50/50 border-t border-gray-100 flex justify-between items-center flex-wrap gap-3">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <CurrencyRupeeIcon className="w-4 h-4" />
                      <span>
                        Items: ₹{Number(order.items_price || 0).toFixed(2)} •
                        Tax: ₹{Number(order.tax_price || 0).toFixed(2)} •
                        Shipping: {order.shipping_price === 0 ? 'Free' : `₹${Number(order.shipping_price || 0).toFixed(2)}`}
                      </span>
                    </div>
                    <button
                      onClick={() => handleViewOrder(order)}
                      className="text-sm font-medium text-gold-600 hover:text-gold-700 flex items-center gap-1 transition-colors"
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

      {/* Pagination */}
      {!loading && orders.length > 0 && pagination.pages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 p-4 bg-white rounded-2xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">
            Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} orders
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
              disabled={pagination.page === 1}
              className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeftIcon className="w-5 h-5" />
            </button>
            <span className="px-4 py-2 text-sm font-medium">
              Page {pagination.page} of {pagination.pages}
            </span>
            <button
              onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
              disabled={pagination.page === pagination.pages}
              className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRightIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* ==========================================
          VIEW ORDER MODAL
      ========================================== */}
      <AnimatePresence>
        {showViewModal && selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowViewModal(false)}
            />

            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', duration: 0.4 }}
              className="relative bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[92vh] overflow-hidden"
            >
              <button
                onClick={() => setShowViewModal(false)}
                className="absolute top-4 right-4 z-10 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-colors"
              >
                <XMarkIcon className="w-5 h-5 text-gray-700" />
              </button>

              <div className="overflow-y-auto max-h-[92vh]">
                {/* Header Banner */}
                <div className={`p-6 border-b-4 ${getStatusColor(selectedOrder.status)}`}>
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${getStatusColor(selectedOrder.status)}`}>
                        {getStatusIcon(selectedOrder.status)}
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">
                          Order #{selectedOrder.order_number || 'N/A'}
                        </h2>
                        <p className="text-sm text-gray-600 mt-0.5">
                          {getStatusMessage(selectedOrder.status)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Total Amount</p>
                      <p className="text-3xl font-bold text-gold-600">
                        {formatPrice(selectedOrder.total_price)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6">
                  {/* Info Cards Row */}
                  <div className="grid md:grid-cols-3 gap-4">
                    {/* Customer */}
                    <div className="bg-gray-50 rounded-2xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <UserIcon className="w-4 h-4 text-blue-500" />
                        <h3 className="font-semibold text-gray-900 text-sm">Customer</h3>
                      </div>
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {selectedOrder.user_name || 'Guest Customer'}
                      </p>
                      <p className="text-xs text-gray-500 truncate mt-0.5">
                        {selectedOrder.user_email || 'No email'}
                      </p>
                    </div>

                    {/* Payment — UPI-AWARE */}
                    <div className="bg-gray-50 rounded-2xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <CreditCardIcon className="w-4 h-4 text-purple-500" />
                        <h3 className="font-semibold text-gray-900 text-sm">Payment</h3>
                      </div>
                      <p className="text-sm font-medium text-gray-900">
                        {selectedOrder.payment_method === 'cash_on_delivery'
                          ? 'Cash on Delivery'
                          : selectedOrder.payment_method === 'upi'
                          ? 'UPI Payment'
                          : selectedOrder.payment_method || 'N/A'}
                      </p>
                      <p
                        className={`text-xs font-medium mt-0.5 ${
                          selectedOrder.payment_status === 'verified'
                            ? 'text-green-600'
                            : selectedOrder.payment_status === 'rejected'
                            ? 'text-red-600'
                            : selectedOrder.payment_status === 'verification_pending'
                            ? 'text-blue-600'
                            : 'text-amber-600'
                        }`}
                      >
                        {selectedOrder.payment_status === 'verified'
                          ? '✓ Verified'
                          : selectedOrder.payment_status === 'rejected'
                          ? '✗ Rejected'
                          : selectedOrder.payment_status === 'verification_pending'
                          ? '⏳ Verifying'
                          : 'Pending'}
                      </p>
                      {selectedOrder.upi_reference && (
                        <p className="text-[10px] text-gray-500 mt-1 font-mono truncate">
                          Ref: {selectedOrder.upi_reference}
                        </p>
                      )}
                    </div>

                    {/* Order Date */}
                    <div className="bg-gray-50 rounded-2xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <CalendarIcon className="w-4 h-4 text-green-500" />
                        <h3 className="font-semibold text-gray-900 text-sm">Order Date</h3>
                      </div>
                      <p className="text-sm font-medium text-gray-900">
                        {formatDate(selectedOrder.created_at)}
                      </p>
                      {selectedOrder.paid_at && (
                        <p className="text-xs text-gray-500 mt-0.5">
                          Paid: {formatDate(selectedOrder.paid_at)}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Shipping Address */}
                  {selectedOrder.shipping_address && (
                    <div className="bg-gray-50 rounded-2xl p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <MapPinIcon className="w-5 h-5 text-gold-500" />
                        <h3 className="font-semibold text-gray-900">Shipping Address</h3>
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

                  {/* Order Items */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <ShoppingBagIcon className="w-5 h-5 text-gold-500" />
                      Order Items ({selectedOrder.items?.length || 0})
                    </h3>
                    <div className="space-y-3">
                      {selectedOrder.items?.map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                        >
                          <img
                            src={item.image || 'https://via.placeholder.com/60'}
                            alt={item.name}
                            className="w-14 h-14 object-cover rounded-lg border border-gray-200"
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/60';
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 text-sm truncate">
                              {item.name}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {formatPrice(item.price)} × {item.quantity}
                            </p>
                          </div>
                          <p className="font-bold text-gray-900 text-sm">
                            {formatPrice(item.price * item.quantity)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Price Summary */}
                  <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-100 rounded-2xl p-5">
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <CurrencyRupeeIcon className="w-5 h-5 text-gold-600" />
                      Price Summary
                    </h3>
                    <div className="space-y-2.5">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Items Total</span>
                        <span className="font-medium text-gray-900">
                          {formatPrice(selectedOrder.items_price)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Tax (10%)</span>
                        <span className="font-medium text-gray-900">
                          {formatPrice(selectedOrder.tax_price)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Shipping</span>
                        <span className="font-medium text-gray-900">
                          {selectedOrder.shipping_price === 0
                            ? 'Free'
                            : formatPrice(selectedOrder.shipping_price)}
                        </span>
                      </div>
                      <div className="border-t border-amber-200 pt-2.5 mt-2.5 flex justify-between">
                        <span className="font-bold text-gray-900">Total</span>
                        <span className="font-bold text-gold-600 text-lg">
                          {formatPrice(selectedOrder.total_price)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="bg-gray-50 rounded-2xl p-5">
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <ClockIcon className="w-5 h-5 text-gold-500" />
                      Order Timeline
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-gold-100 flex items-center justify-center flex-shrink-0">
                          <DocumentTextIcon className="w-4 h-4 text-gold-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">Order Placed</p>
                          <p className="text-xs text-gray-500">
                            {formatDate(selectedOrder.created_at)}
                          </p>
                        </div>
                      </div>

                      {selectedOrder.paid_at && (
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                            <CheckCircleIcon className="w-4 h-4 text-green-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">
                              Payment Received
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatDate(selectedOrder.paid_at)}
                            </p>
                          </div>
                        </div>
                      )}

                      {selectedOrder.delivered_at && (
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                            <TruckIcon className="w-4 h-4 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">Delivered</p>
                            <p className="text-xs text-gray-500">
                              {formatDate(selectedOrder.delivered_at)}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Status Badges */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
                      Current Status:
                    </span>
                    {getStatusBadge(selectedOrder.status)}
                    <PaymentStatusBadge status={selectedOrder.payment_status} />
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="sticky bottom-0 bg-white border-t border-gray-100 p-5 flex flex-wrap gap-3 justify-end">
                  <button
                    onClick={() => handleOpenStatusModalFromView(selectedOrder)}
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-gold-500 to-yellow-500 text-white rounded-xl hover:from-gold-600 hover:to-yellow-600 transition-all font-medium shadow-md hover:shadow-lg"
                  >
                    <ArrowPathIcon className="w-4 h-4" />
                    Update Status
                  </button>
                  <button
                    onClick={() => setShowViewModal(false)}
                    className="px-5 py-3 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-medium"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ==========================================
          STATUS UPDATE MODAL
      ========================================== */}
      <AnimatePresence>
        {showStatusModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
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
                <div className="w-16 h-16 rounded-2xl bg-gold-100 flex items-center justify-center mx-auto mb-4">
                  <ArrowPathIcon className="w-8 h-8 text-gold-600" />
                </div>
                <h3 className="text-xl font-bold">Update Order Status</h3>
                <p className="text-gray-500 text-sm mt-1">
                  Order #{selectedOrder?.order_number} • {selectedOrder?.user_name}
                </p>
              </div>

              <div className="space-y-2">
                {statusOptions.map((status) => (
                  <label
                    key={status}
                    className={`flex items-center gap-3 p-3 border-2 rounded-xl cursor-pointer transition-all ${
                      newStatus === status
                        ? 'border-gold-500 bg-gold-50 shadow-md'
                        : 'border-gray-200 hover:border-gold-300 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      value={status}
                      checked={newStatus === status}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="w-4 h-4 text-gold-500 focus:ring-gold-400"
                    />
                    <span
                      className={`capitalize font-medium ${
                        newStatus === status ? 'text-gold-700' : 'text-gray-700'
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
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleStatusUpdate}
                  disabled={newStatus === selectedOrder?.status}
                  className="flex-1 px-4 py-3 bg-gold-500 text-white rounded-xl hover:bg-gold-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Update Status
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