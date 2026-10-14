import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ClockIcon,
  CheckCircleIcon,
  TruckIcon,
  EyeIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon,
  ShoppingBagIcon,
  CubeIcon,
  QrCodeIcon,
  ArrowUpRightIcon,
} from '@heroicons/react/24/outline';

import { getOrders } from '../services/orderService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import PaymentStatusBadge from '../components/common/PaymentStatusBadge';
import toast from 'react-hot-toast';

// ==========================================
// STATUS CONFIG
// ==========================================
const STATUS_META = {
  pending: {
    label: 'Pending',
    dot: 'bg-ink-400',
    text: 'text-ink-600',
  },
  processing: {
    label: 'Processing',
    dot: 'bg-blue-500',
    text: 'text-blue-700',
  },
  shipped: {
    label: 'Shipped',
    dot: 'bg-purple-500',
    text: 'text-purple-700',
  },
  delivered: {
    label: 'Delivered',
    dot: 'bg-green-600',
    text: 'text-green-700',
  },
  cancelled: {
    label: 'Cancelled',
    dot: 'bg-red-500',
    text: 'text-red-700',
  },
};

const STATUS_FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'processing', label: 'Processing' },
  { key: 'shipped', label: 'Shipped' },
  { key: 'delivered', label: 'Delivered' },
  { key: 'cancelled', label: 'Cancelled' },
];

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
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, statusFilter]);

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const needsPayment = (order) =>
    order.payment_method === 'upi' &&
    (order.payment_status === 'pending' ||
      order.payment_status === 'rejected');

  const isVerifying = (order) =>
    order.payment_method === 'upi' &&
    order.payment_status === 'verification_pending';

  const filteredOrders = orders.filter(
    (order) => statusFilter === 'all' || order.status === statusFilter
  );

  // ==========================================
  // LOADING
  // ==========================================
  if (loading && pagination.page === 1) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream-100">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-100 pb-16">
      {/* ==========================================
          PAGE HEADER
      ========================================== */}
      <section className="border-b border-line bg-cream-100">
        <div className="container-editorial py-8 md:py-12">
          <p className="kicker mb-3">My Account</p>
          <h1 className="section-heading">
            Your <span className="italic">orders.</span>
          </h1>
          <p className="mt-3 text-sm md:text-base text-ink-600 max-w-xl">
            Track and manage every order in one place.
          </p>
        </div>
      </section>

      {/* ==========================================
          FILTERS — horizontal scroll on mobile
      ========================================== */}
      <div className="sticky top-14 md:top-16 z-30 border-b border-line bg-cream-100">
        <div className="container-editorial">
          <div className="py-3 -mx-5 md:mx-0 px-5 md:px-0 overflow-x-auto scrollbar-hide">
            <div className="flex items-center gap-2 min-w-max md:min-w-0 md:flex-wrap">
              {STATUS_FILTERS.map((f) => {
                const active = statusFilter === f.key;
                return (
                  <button
                    key={f.key}
                    onClick={() => {
                      setStatusFilter(f.key);
                      setPagination((prev) => ({ ...prev, page: 1 }));
                    }}
                    className={`px-3.5 py-2 rounded text-[11px] uppercase tracking-wider font-medium transition-colors whitespace-nowrap border ${
                      active
                        ? 'bg-ink-800 text-cream-100 border-ink-800'
                        : 'bg-transparent text-ink-600 border-line hover:border-ink-800 hover:text-ink-800'
                    }`}
                  >
                    {f.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ==========================================
          ORDERS LIST
      ========================================== */}
      <section className="container-editorial py-8 md:py-10">
        {filteredOrders.length === 0 ? (
          /* ---------- EMPTY STATE ---------- */
          <div className="text-center py-20 max-w-md mx-auto">
            <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center rounded-full bg-cream-200">
              <ShoppingBagIcon className="w-10 h-10 text-ink-400" />
            </div>
            <h2 className="font-serif text-2xl font-bold text-ink-800 mb-3">
              {statusFilter === 'all'
                ? 'No orders yet.'
                : `No ${statusFilter} orders.`}
            </h2>
            <p className="text-sm text-ink-500 mb-8">
              {statusFilter === 'all'
                ? 'Start exploring our collection and place your first order.'
                : 'Try a different filter to see your orders.'}
            </p>
            <Link to="/products" className="btn-solid">
              Shop Collection
            </Link>
          </div>
        ) : (
          <>
            {/* ---------- DESKTOP: Clean rows ---------- */}
            <div className="hidden md:block border border-line rounded-lg overflow-hidden bg-white">
              {/* Table header */}
              <div className="grid grid-cols-12 gap-4 px-5 py-3 bg-cream-100 border-b border-line text-[10px] uppercase tracking-wider font-semibold text-ink-500">
                <div className="col-span-3">Order</div>
                <div className="col-span-3">Date & Items</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-2">Payment</div>
                <div className="col-span-2 text-right">Total</div>
              </div>

              <AnimatePresence initial={false}>
                {filteredOrders.map((order, index) => {
                  const orderKey = order.id || order._id;
                  const meta = STATUS_META[order.status] || STATUS_META.pending;
                  const payPending = needsPayment(order);
                  const verifying = isVerifying(order);

                  return (
                    <motion.div
                      key={orderKey}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: Math.min(index * 0.04, 0.3) }}
                      className={`grid grid-cols-12 gap-4 px-5 py-4 items-center border-b border-line last:border-b-0 hover:bg-cream-50 transition-colors ${
                        payPending ? 'bg-burgundy-50/30' : ''
                      }`}
                    >
                      {/* Order */}
                      <div className="col-span-3">
                        <Link
                          to={`/orders/${orderKey}`}
                          className="font-medium text-ink-800 hover:text-burgundy-500 transition-colors text-sm"
                        >
                          #{order.order_number || 'N/A'}
                        </Link>
                        <p className="text-[10px] text-ink-400 mt-0.5 font-mono">
                          {(orderKey || '').slice(0, 8)}
                        </p>
                      </div>

                      {/* Date & Items */}
                      <div className="col-span-3">
                        <p className="text-xs text-ink-700">
                          {formatDate(order.created_at)}
                        </p>
                        <p className="text-[11px] text-ink-400 mt-0.5">
                          {order.items?.length || 0} item
                          {order.items?.length !== 1 ? 's' : ''}
                        </p>
                      </div>

                      {/* Status */}
                      <div className="col-span-2">
                        <span className="inline-flex items-center gap-1.5 text-xs">
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${meta.dot}`}
                          />
                          <span className={`font-medium ${meta.text}`}>
                            {meta.label}
                          </span>
                        </span>
                      </div>

                      {/* Payment */}
                      <div className="col-span-2">
                        <PaymentStatusBadge
                          status={order.payment_status}
                          size="sm"
                        />
                      </div>

                      {/* Total */}
                      <div className="col-span-2 text-right">
                        <span className="font-medium text-ink-800 text-sm">
                          ₹
                          {Number(order.total_price || 0).toLocaleString(
                            'en-IN'
                          )}
                        </span>
                        <Link
                          to={`/orders/${orderKey}`}
                          className="block mt-1 text-[10px] uppercase tracking-wider font-medium text-ink-500 hover:text-burgundy-500 transition-colors"
                        >
                          View →
                        </Link>
                      </div>

                      {/* Payment CTA row if needed */}
                      {(payPending || verifying) && (
                        <div className="col-span-12 pt-3 mt-3 border-t border-line">
                          {payPending ? (
                            <div className="flex items-center justify-between gap-4 flex-wrap">
                              <div className="flex items-start gap-2.5">
                                <QrCodeIcon className="w-4 h-4 text-burgundy-500 flex-shrink-0 mt-0.5" />
                                <div>
                                  <p className="text-xs font-medium text-ink-800">
                                    {order.payment_status === 'rejected'
                                      ? 'Payment was rejected'
                                      : 'Payment pending'}
                                  </p>
                                  <p className="text-[11px] text-ink-500 mt-0.5">
                                    Complete UPI payment to confirm this order
                                  </p>
                                </div>
                              </div>
                              <Link
                                to={`/payment/upi/${orderKey}`}
                                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-ink-800 text-cream-100 text-[11px] uppercase tracking-wider font-semibold rounded hover:bg-burgundy-500 transition-colors"
                              >
                                Pay Now
                                <ArrowUpRightIcon className="w-3 h-3" />
                              </Link>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between gap-4 flex-wrap">
                              <div className="flex items-start gap-2.5">
                                <ClockIcon className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5 animate-pulse" />
                                <div>
                                  <p className="text-xs font-medium text-ink-800">
                                    Verifying payment
                                  </p>
                                  <p className="text-[11px] text-ink-500 mt-0.5">
                                    We'll confirm within 24 hours
                                  </p>
                                </div>
                              </div>
                              <Link
                                to={`/payment/status/${orderKey}`}
                                className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-ink-800 text-ink-800 text-[11px] uppercase tracking-wider font-semibold rounded hover:bg-ink-800 hover:text-cream-100 transition-colors"
                              >
                                View Status
                              </Link>
                            </div>
                          )}
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* ---------- MOBILE: card list ---------- */}
            <div className="md:hidden space-y-4">
              <AnimatePresence initial={false}>
                {filteredOrders.map((order, index) => {
                  const orderKey = order.id || order._id;
                  const meta = STATUS_META[order.status] || STATUS_META.pending;
                  const payPending = needsPayment(order);
                  const verifying = isVerifying(order);

                  return (
                    <motion.div
                      key={orderKey}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(index * 0.04, 0.3) }}
                      className={`bg-white rounded-lg border overflow-hidden ${
                        payPending
                          ? 'border-burgundy-200'
                          : 'border-line'
                      }`}
                    >
                      {/* Header */}
                      <div className="flex items-center justify-between p-4 pb-3 border-b border-line">
                        <div className="min-w-0">
                          <Link
                            to={`/orders/${orderKey}`}
                            className="font-medium text-ink-800 text-sm hover:text-burgundy-500 transition-colors"
                          >
                            #{order.order_number || 'N/A'}
                          </Link>
                          <p className="text-[11px] text-ink-400 mt-0.5">
                            {formatDate(order.created_at)}
                          </p>
                        </div>
                        <span className="inline-flex items-center gap-1.5 text-xs flex-shrink-0">
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${meta.dot}`}
                          />
                          <span className={`font-medium ${meta.text}`}>
                            {meta.label}
                          </span>
                        </span>
                      </div>

                      {/* Items preview */}
                      <div className="p-4 flex items-center gap-3 border-b border-line">
                        <div className="flex -space-x-3 flex-shrink-0">
                          {(order.items || []).slice(0, 3).map((item, i) => (
                            <div
                              key={i}
                              className="w-10 h-10 rounded-full border-2 border-white bg-cream-200 overflow-hidden"
                            >
                              {item.image ? (
                                <img
                                  src={item.image}
                                  alt=""
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <ShoppingBagIcon className="w-4 h-4 text-ink-400" />
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-ink-700 truncate">
                            {order.items?.[0]?.name || 'Product'}
                            {(order.items?.length || 0) > 1 &&
                              ` + ${order.items.length - 1} more`}
                          </p>
                        </div>
                        <span className="text-sm font-medium text-ink-800 flex-shrink-0">
                          ₹
                          {Number(order.total_price || 0).toLocaleString(
                            'en-IN'
                          )}
                        </span>
                      </div>

                      {/* Payment row */}
                      <div className="px-4 py-3 border-b border-line flex items-center justify-between">
                        <span className="text-[11px] uppercase tracking-wider font-medium text-ink-500">
                          Payment
                        </span>
                        <PaymentStatusBadge
                          status={order.payment_status}
                          size="sm"
                        />
                      </div>

                      {/* Payment action */}
                      {payPending && (
                        <div className="p-4 bg-burgundy-50/40 border-b border-burgundy-100">
                          <div className="flex items-start gap-2.5 mb-3">
                            <QrCodeIcon className="w-4 h-4 text-burgundy-500 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="text-xs font-medium text-ink-800">
                                {order.payment_status === 'rejected'
                                  ? 'Payment was rejected'
                                  : 'Payment pending'}
                              </p>
                              <p className="text-[11px] text-ink-500 mt-0.5">
                                Complete UPI payment to confirm order
                              </p>
                            </div>
                          </div>
                          <Link
                            to={`/payment/upi/${orderKey}`}
                            className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 bg-ink-800 text-cream-100 text-[11px] uppercase tracking-wider font-semibold rounded hover:bg-burgundy-500 transition-colors"
                          >
                            Pay Now
                            <ArrowUpRightIcon className="w-3 h-3" />
                          </Link>
                        </div>
                      )}

                      {verifying && (
                        <div className="p-4 bg-blue-50/60 border-b border-blue-100">
                          <div className="flex items-start gap-2.5 mb-3">
                            <ClockIcon className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5 animate-pulse" />
                            <div>
                              <p className="text-xs font-medium text-ink-800">
                                Verifying payment
                              </p>
                              <p className="text-[11px] text-ink-500 mt-0.5">
                                We'll confirm within 24 hours
                              </p>
                            </div>
                          </div>
                          <Link
                            to={`/payment/status/${orderKey}`}
                            className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 border border-ink-800 text-ink-800 text-[11px] uppercase tracking-wider font-semibold rounded hover:bg-ink-800 hover:text-cream-100 transition-colors"
                          >
                            View Status
                          </Link>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="p-4 flex items-center justify-between">
                        <Link
                          to={`/orders/${orderKey}`}
                          className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-700 hover:text-burgundy-500 transition-colors"
                        >
                          <EyeIcon className="w-3.5 h-3.5" />
                          View Details
                        </Link>
                        {order.status === 'delivered' && (
                          <button className="text-xs font-medium text-ink-700 hover:text-burgundy-500 transition-colors">
                            Write Review →
                          </button>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* ==========================================
                PAGINATION
            ========================================== */}
            {pagination.pages > 1 && (
              <div className="mt-10 pt-6 border-t border-line flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-xs text-ink-500 order-2 sm:order-1">
                  Page {pagination.page} of {pagination.pages}
                </p>
                <nav className="flex items-center gap-1 order-1 sm:order-2">
                  <button
                    onClick={() =>
                      setPagination((prev) => ({
                        ...prev,
                        page: prev.page - 1,
                      }))
                    }
                    disabled={pagination.page === 1}
                    className="px-3 py-1.5 text-xs uppercase tracking-wider font-medium border border-line rounded hover:border-ink-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    Prev
                  </button>
                  <span className="px-4 text-xs font-medium text-ink-600">
                    {pagination.page} / {pagination.pages}
                  </span>
                  <button
                    onClick={() =>
                      setPagination((prev) => ({
                        ...prev,
                        page: prev.page + 1,
                      }))
                    }
                    disabled={pagination.page === pagination.pages}
                    className="px-3 py-1.5 text-xs uppercase tracking-wider font-medium border border-line rounded hover:border-ink-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </nav>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
};

export default OrdersPage;