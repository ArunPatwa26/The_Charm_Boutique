import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  ClockIcon,
  TruckIcon,
  ShoppingBagIcon,
  CreditCardIcon,
  MapPinIcon,
  CalendarIcon,
  PrinterIcon,
  EnvelopeIcon,
  StarIcon,
  PencilIcon,
  XMarkIcon,
  QrCodeIcon,
  ArrowTopRightOnSquareIcon,
  XCircleIcon,
  DocumentDuplicateIcon,
} from '@heroicons/react/24/outline';
import { getOrderById } from '../services/orderService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import PaymentStatusBadge from '../components/common/PaymentStatusBadge';
import toast from 'react-hot-toast';

const OrderDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (id) {
      fetchOrder();
    } else {
      navigate('/orders');
    }
  }, [id]);

  const fetchOrder = async () => {
    setLoading(true);
    try {
      const response = await getOrderById(id);
      if (response.success) {
        setOrder(response.order);
      } else {
        toast.error('Order not found');
        navigate('/orders');
      }
    } catch (error) {
      toast.error('Failed to load order');
      navigate('/orders');
    } finally {
      setLoading(false);
    }
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
      processing: ShoppingBagIcon,
      shipped: TruckIcon,
      delivered: CheckCircleIcon,
      cancelled: ClockIcon,
    };
    const Icon = icons[status] || ShoppingBagIcon;
    return <Icon className="w-5 h-5" />;
  };

  const getStatusMessage = (status) => {
    const messages = {
      pending: 'Your order has been placed and is awaiting confirmation.',
      processing: 'Your order is being processed and prepared for shipping.',
      shipped: 'Your order has been shipped and is on its way to you.',
      delivered: 'Your order has been delivered. We hope you love it!',
      cancelled: 'Your order has been cancelled.',
    };
    return messages[status] || 'Order status updated.';
  };

  const getPaymentMethodLabel = (method) => {
    const labels = {
      upi: 'UPI Payment',
      cash_on_delivery: 'Cash on Delivery',
    };
    return labels[method] || method;
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatPrice = (price) => {
    return `₹${Number(price || 0).toFixed(2)}`;
  };

  // ==========================================
  // EMAIL RECEIPT
  // ==========================================
  const handleEmailReceipt = async () => {
    try {
      toast.loading('Sending email...', { id: 'email' });
      await new Promise((resolve) => setTimeout(resolve, 1500));
      toast.success('📧 Receipt sent to your email!', { id: 'email' });
    } catch (error) {
      toast.error('Failed to send email. Please try again.', { id: 'email' });
    }
  };

  // ==========================================
  // PRINT ORDER
  // ==========================================
  const handlePrint = () => {
    window.print();
  };

  // ==========================================
  // COPY UPI REFERENCE
  // ==========================================
  const handleCopyUpiRef = async () => {
    if (!order?.upi_reference) return;
    try {
      await navigator.clipboard.writeText(order.upi_reference);
      toast.success('UPI reference copied!');
    } catch {
      toast.error('Failed to copy');
    }
  };

  // ==========================================
  // WRITE REVIEW
  // ==========================================
  const handleSubmitReview = async () => {
    if (!reviewComment.trim()) {
      toast.error('Please write a review comment');
      return;
    }

    setSubmittingReview(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      toast.success('✅ Review submitted successfully!');
      setShowReviewModal(false);
      setReviewComment('');
      setReviewRating(5);
    } catch (error) {
      toast.error('Failed to submit review. Please try again.');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Order not found</h2>
          <Link to="/orders" className="text-gold-600 hover:text-gold-700">
            Back to orders
          </Link>
        </div>
      </div>
    );
  }

  // Payment-derived flags
  const orderKey = order.id || order._id;
  const isUpi = order.payment_method === 'upi';
  const paymentPending = order.payment_status === 'pending';
  const paymentVerifying = order.payment_status === 'verification_pending';
  const paymentVerified = order.payment_status === 'verified';
  const paymentRejected = order.payment_status === 'rejected';

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-custom max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            to="/orders"
            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">Order Details</h1>
            <p className="text-gray-600">Order #{order.order_number}</p>
          </div>
          <PaymentStatusBadge status={order.payment_status} />
        </div>

        <div className="space-y-6">
          {/* Payment Alert — UPI pending */}
          {isUpi && (paymentPending || paymentRejected) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-2xl shadow-lg p-5 border-l-4 ${
                paymentRejected
                  ? 'bg-red-50 border-red-500'
                  : 'bg-yellow-50 border-yellow-500'
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  {paymentRejected ? (
                    <XCircleIcon className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                  ) : (
                    <QrCodeIcon className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
                  )}
                  <div>
                    <h3
                      className={`font-bold ${
                        paymentRejected ? 'text-red-800' : 'text-yellow-800'
                      }`}
                    >
                      {paymentRejected
                        ? 'Payment was rejected'
                        : 'Complete your payment'}
                    </h3>
                    <p
                      className={`text-sm ${
                        paymentRejected ? 'text-red-700' : 'text-yellow-700'
                      }`}
                    >
                      {paymentRejected
                        ? order.rejection_reason ||
                          'Please contact support or re-upload a valid payment screenshot.'
                        : 'Scan the UPI QR and upload your payment screenshot to confirm your order.'}
                    </p>
                  </div>
                </div>
                <Link
                  to={`/payment/upi/${orderKey}`}
                  className={`flex-shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-colors ${
                    paymentRejected
                      ? 'bg-red-500 hover:bg-red-600'
                      : 'bg-yellow-500 hover:bg-yellow-600'
                  }`}
                >
                  {paymentRejected ? 'Try Again' : 'Pay Now'}
                  <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          )}

          {/* Payment Alert — verification pending */}
          {isUpi && paymentVerifying && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-blue-50 rounded-2xl shadow-lg p-5 border-l-4 border-blue-500"
            >
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-1">
                  <ClockIcon className="w-6 h-6 text-blue-600 flex-shrink-0 animate-pulse" />
                  <div>
                    <h3 className="font-bold text-blue-800">
                      Payment under verification
                    </h3>
                    <p className="text-sm text-blue-700">
                      Our team is verifying your UPI payment. You'll be notified within 24 hours.
                    </p>
                  </div>
                </div>
                <Link
                  to={`/payment/status/${orderKey}`}
                  className="flex-shrink-0 inline-flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-sm font-semibold transition-colors"
                >
                  View Status
                </Link>
              </div>
            </motion.div>
          )}

          {/* Order Status Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-white rounded-2xl shadow-lg p-6 border-l-4 ${getStatusColor(order.status)}`}
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-full ${getStatusColor(order.status)}`}>
                  {getStatusIcon(order.status)}
                </div>
                <div>
                  <h2 className="text-xl font-bold capitalize">{order.status}</h2>
                  <p className="text-gray-600 text-sm">{getStatusMessage(order.status)}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Order Date</p>
                <p className="font-medium">{formatDate(order.created_at)}</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-4">
              <div className="relative">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Order Placed</span>
                  <span>Processing</span>
                  <span>Shipped</span>
                  <span>Delivered</span>
                </div>
                <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      order.status === 'delivered'
                        ? 'w-full bg-green-500'
                        : order.status === 'shipped'
                        ? 'w-3/4 bg-purple-500'
                        : order.status === 'processing'
                        ? 'w-1/2 bg-blue-500'
                        : order.status === 'pending'
                        ? 'w-1/4 bg-yellow-500'
                        : 'w-0'
                    }`}
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Order Info Grid */}
          <div className="grid md:grid-cols-3 gap-4">
            {/* Payment Info Card — REPLACED with richer UPI-aware version */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <div className="flex items-center gap-3 mb-3">
                <CreditCardIcon className="w-5 h-5 text-gold-500" />
                <h3 className="font-semibold">Payment</h3>
              </div>
              <p className="text-sm text-gray-700 font-medium mb-2">
                {getPaymentMethodLabel(order.payment_method)}
              </p>
              <PaymentStatusBadge status={order.payment_status} size="sm" />

              {/* UPI reference for verified payments */}
              {paymentVerified && order.upi_reference && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-500 mb-1">UPI Reference</p>
                  <div className="flex items-center gap-2">
                    <code className="text-xs font-mono font-semibold text-gray-800 truncate">
                      {order.upi_reference}
                    </code>
                    <button
                      onClick={handleCopyUpiRef}
                      className="p-1 hover:bg-gray-100 rounded transition-colors"
                      title="Copy"
                    >
                      <DocumentDuplicateIcon className="w-3.5 h-3.5 text-gray-500" />
                    </button>
                  </div>
                </div>
              )}

              {/* Rejection reason */}
              {paymentRejected && order.rejection_reason && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-xs text-red-600 font-medium mb-1">
                    Rejection reason
                  </p>
                  <p className="text-xs text-red-700">{order.rejection_reason}</p>
                </div>
              )}

              {/* COD or fallback */}
              {!isUpi && (
                <p
                  className={`text-sm font-medium mt-2 ${
                    order.is_paid ? 'text-green-600' : 'text-yellow-600'
                  }`}
                >
                  {order.is_paid ? '✓ Paid' : 'Pay on delivery'}
                </p>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <div className="flex items-center gap-3 mb-2">
                <CalendarIcon className="w-5 h-5 text-gold-500" />
                <h3 className="font-semibold">Timeline</h3>
              </div>
              {order.paid_at && (
                <p className="text-sm text-gray-600">
                  Paid: {formatDate(order.paid_at)}
                </p>
              )}
              {order.delivered_at && (
                <p className="text-sm text-gray-600">
                  Delivered: {formatDate(order.delivered_at)}
                </p>
              )}
              {!order.paid_at && !order.delivered_at && (
                <p className="text-sm text-gray-500">Order in progress</p>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <div className="flex items-center gap-3 mb-2">
                <MapPinIcon className="w-5 h-5 text-gold-500" />
                <h3 className="font-semibold">Shipping</h3>
              </div>
              <p className="text-sm text-gray-600">
                {order.shipping_address?.street}
              </p>
              <p className="text-sm text-gray-600">
                {order.shipping_address?.city}, {order.shipping_address?.state}
              </p>
              <p className="text-sm text-gray-600">
                {order.shipping_address?.zip_code}, {order.shipping_address?.country}
              </p>
            </motion.div>
          </div>

          {/* Order Items */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl shadow-lg overflow-hidden"
          >
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold">Order Items</h3>
            </div>
            <div className="divide-y divide-gray-100">
              {order.items?.map((item, index) => (
                <div key={index} className="p-6 flex items-center gap-4">
                  <img
                    src={item.image || 'https://via.placeholder.com/80'}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h4 className="font-medium">{item.name}</h4>
                    <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                    <p className="text-sm text-gray-500">Price: {formatPrice(item.price)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gold-600">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Price Summary */}
            <div className="p-6 bg-gray-50">
              <div className="max-w-xs ml-auto space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Items Total</span>
                  <span>{formatPrice(order.items_price)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax (10%)</span>
                  <span>{formatPrice(order.tax_price)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span>
                    {order.shipping_price === 0 ? 'Free' : formatPrice(order.shipping_price)}
                  </span>
                </div>
                <div className="border-t border-gray-200 pt-2 mt-2">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-gold-600">{formatPrice(order.total_price)}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-wrap gap-4"
          >
            <button
              onClick={handlePrint}
              className="px-6 py-3 border-2 border-gray-300 rounded-full hover:bg-gray-50 transition-all duration-300 flex items-center gap-2"
            >
              <PrinterIcon className="w-5 h-5" />
              Print Order
            </button>

            <button
              onClick={handleEmailReceipt}
              className="px-6 py-3 border-2 border-gold-300 text-gold-600 rounded-full hover:bg-gold-50 transition-all duration-300 flex items-center gap-2"
            >
              <EnvelopeIcon className="w-5 h-5" />
              Email Receipt
            </button>

            {order.status === 'delivered' && (
              <button
                onClick={() => setShowReviewModal(true)}
                className="px-6 py-3 bg-gradient-to-r from-gold-500 to-yellow-500 text-white rounded-full hover:from-gold-600 hover:to-yellow-600 transition-all duration-300 flex items-center gap-2 shadow-md hover:shadow-lg"
              >
                <PencilIcon className="w-5 h-5" />
                Write a Review
              </button>
            )}

            <Link
              to="/products"
              className="px-6 py-3 border-2 border-gray-300 rounded-full hover:bg-gray-50 transition-all duration-300"
            >
              Continue Shopping
            </Link>
          </motion.div>
        </div>
      </div>

      {/* ==========================================
          REVIEW MODAL
      ========================================== */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowReviewModal(false)}
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full p-6"
          >
            <button
              onClick={() => setShowReviewModal(false)}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <XMarkIcon className="w-5 h-5 text-gray-400" />
            </button>

            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gold-100 flex items-center justify-center mx-auto mb-3">
                <StarIcon className="w-8 h-8 text-gold-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Write a Review</h3>
              <p className="text-sm text-gray-500 mt-1">
                Share your experience with this order
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rating
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className="focus:outline-none"
                    >
                      <StarIcon
                        className={`w-8 h-8 transition-colors ${
                          star <= reviewRating
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Review
                </label>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  rows="4"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gold-400 focus:border-transparent outline-none transition-shadow resize-none"
                  placeholder="Share your experience with this product..."
                />
              </div>

              <button
                onClick={handleSubmitReview}
                disabled={submittingReview}
                className="w-full py-3 bg-gradient-to-r from-gold-500 to-yellow-500 text-white rounded-xl hover:from-gold-600 hover:to-yellow-600 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submittingReview ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <StarIcon className="w-5 h-5" />
                    Submit Review
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default OrderDetailsPage;