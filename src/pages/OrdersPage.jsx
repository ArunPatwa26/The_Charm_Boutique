import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ClockIcon,
  CheckCircleIcon,
  TruckIcon,
  EyeIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon,
  FunnelIcon,
  ShoppingBagIcon,
  CubeIcon,
  QrCodeIcon,
  ArrowTopRightOnSquareIcon,
} from '@heroicons/react/24/outline';
import { getOrders } from '../services/orderService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import PaymentStatusBadge from '../components/common/PaymentStatusBadge';
import toast from 'react-hot-toast';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchOrders();
  }, [pagination.page, statusFilter]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await getOrders(pagination.page, pagination.limit);
      if (response.success) {
        setOrders(response.orders || []);
        setPagination((prev) => ({
          ...prev,
          ...(response.pagination || {}),
        }));
      }
    } catch (error) {
      console.error('Fetch Orders Error:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-700',
      processing: 'bg-blue-100 text-blue-700',
      shipped: 'bg-purple-100 text-purple-700',
      delivered: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: ClockIcon,
      processing: CubeIcon,
      shipped: TruckIcon,
      delivered: CheckCircleIcon,
      cancelled: XMarkIcon,
    };
    const Icon = icons[status] || ShoppingBagIcon;
    return <Icon className="w-4 h-4" />;
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // ============================================================
  // Payment CTA logic — shows "Pay Now" if UPI pending
  // ============================================================
  const needsPayment = (order) => {
    return (
      order.payment_method === 'upi' &&
      (order.payment_status === 'pending' ||
        order.payment_status === 'rejected')
    );
  };

  const isVerifying = (order) => {
    return (
      order.payment_method === 'upi' &&
      order.payment_status === 'verification_pending'
    );
  };

  const filteredOrders = orders.filter(
    (order) => statusFilter === 'all' || order.status === statusFilter
  );

  if (loading && pagination.page === 1) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-custom max-w-5xl px-4 mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold">My Orders</h1>
              <p className="text-gray-600 mt-1">Track and manage your orders</p>
            </div>
            <Link to="/products" className="btn-secondary inline-flex items-center gap-2">
              Continue Shopping
            </Link>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-2xl shadow-sm p-4 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <FunnelIcon className="w-5 h-5 text-gray-500" />
              <h2 className="font-semibold text-gray-700">Filter Orders</h2>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => {
                  setStatusFilter('all');
                  setPagination((prev) => ({ ...prev, page: 1 }));
                }}
                className={`px-4 py-2 rounded-full transition-all duration-300 ${
                  statusFilter === 'all'
                    ? 'bg-yellow-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                All Orders
              </button>
              {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => (
                <button
                  key={status}
                  onClick={() => {
                    setStatusFilter(status);
                    setPagination((prev) => ({ ...prev, page: 1 }));
                  }}
                  className={`px-4 py-2 rounded-full transition-all duration-300 capitalize ${
                    statusFilter === status
                      ? 'bg-yellow-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Orders List */}
          {filteredOrders.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingBagIcon className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">No orders yet</h3>
              <p className="text-gray-500 mb-6">
                {statusFilter === 'all'
                  ? "You haven't placed any orders yet. Start shopping!"
                  : `No ${statusFilter} orders found.`}
              </p>
              <Link to="/products" className="btn-primary inline-flex items-center gap-2">
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order, index) => {
                const orderKey = order.id || order._id;
                const payPending = needsPayment(order);
                const verifying = isVerifying(order);

                return (
                  <motion.div
                    key={orderKey}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
                  >
                    <div className="p-6">
                      {/* Order Header */}
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <p className="text-sm text-gray-500">
                            Order #{order.order_number || order.id}
                          </p>
                          <p className="text-sm text-gray-500">{formatDate(order.created_at)}</p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${getStatusColor(
                              order.status
                            )}`}
                          >
                            {getStatusIcon(order.status)}
                            <span className="capitalize">{order.status}</span>
                          </span>
                          {/* Payment status badge */}
                          <PaymentStatusBadge status={order.payment_status} size="sm" />
                          <span className="text-lg font-bold text-yellow-600">
                            ₹{Number(order.total_price || 0).toFixed(2)}
                          </span>
                        </div>
                      </div>

                      {/* Payment alert strip */}
                      {payPending && (
                        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-xl flex items-start gap-3">
                          <QrCodeIcon className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                          <div className="flex-1 text-sm">
                            <p className="font-semibold text-yellow-800">
                              {order.payment_status === 'rejected'
                                ? 'Payment was rejected — please pay again'
                                : 'Payment pending'}
                            </p>
                            <p className="text-yellow-700 text-xs mt-0.5">
                              Complete your UPI payment to confirm this order.
                            </p>
                          </div>
                          <Link
                            to={`/payment/upi/${orderKey}`}
                            className="flex-shrink-0 inline-flex items-center gap-1 px-3 py-1.5 bg-yellow-500 hover:bg-yellow-600 text-white text-xs font-semibold rounded-lg transition-colors"
                          >
                            Pay Now
                            <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      )}

                      {verifying && (
                        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-3">
                          <ClockIcon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5 animate-pulse" />
                          <div className="flex-1 text-sm">
                            <p className="font-semibold text-blue-800">
                              Payment under verification
                            </p>
                            <p className="text-blue-700 text-xs mt-0.5">
                              We'll confirm your order within 24 hours.
                            </p>
                          </div>
                          <Link
                            to={`/payment/status/${orderKey}`}
                            className="flex-shrink-0 text-xs font-semibold text-blue-700 hover:text-blue-800 px-3 py-1.5"
                          >
                            View Status →
                          </Link>
                        </div>
                      )}

                      {/* Order Items */}
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex flex-wrap gap-4">
                          {(order.items || []).slice(0, 3).map((item, itemIndex) => (
                            <div
                              key={item.product || item.product_id || itemIndex}
                              className="flex items-center gap-3"
                            >
                              {item.image ? (
                                <img
                                  src={item.image}
                                  alt={item.name || 'Product'}
                                  className="w-12 h-12 object-cover rounded-lg"
                                />
                              ) : (
                                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                                  <ShoppingBagIcon className="w-6 h-6 text-gray-400" />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate max-w-[150px]">
                                  {item.name || 'Product'}
                                </p>
                                <p className="text-xs text-gray-500">x{item.quantity || 1}</p>
                              </div>
                            </div>
                          ))}
                          {(order.items || []).length > 3 && (
                            <div className="flex items-center text-sm text-gray-500">
                              +{order.items.length - 3} more items
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Order Actions */}
                      <div className="mt-4 pt-4 border-t border-gray-200 flex flex-wrap gap-3">
                        <Link
                          to={`/orders/${orderKey}`}
                          className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                        >
                          <EyeIcon className="w-4 h-4" />
                          View Details
                        </Link>
                        {order.status === 'delivered' && (
                          <button className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                            Write a Review
                          </button>
                        )}
                        {order.status === 'pending' && !payPending && (
                          <button className="inline-flex items-center gap-2 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm">
                            Cancel Order
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="flex justify-center mt-8">
                  <nav className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        setPagination((prev) => ({
                          ...prev,
                          page: prev.page - 1,
                        }))
                      }
                      disabled={pagination.page === 1}
                      className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeftIcon className="w-5 h-5" />
                    </button>
                    <span className="px-4 py-2 text-sm font-medium">
                      Page {pagination.page} of {pagination.pages}
                    </span>
                    <button
                      onClick={() =>
                        setPagination((prev) => ({
                          ...prev,
                          page: prev.page + 1,
                        }))
                      }
                      disabled={pagination.page === pagination.pages}
                      className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronRightIcon className="w-5 h-5" />
                    </button>
                  </nav>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default OrdersPage;