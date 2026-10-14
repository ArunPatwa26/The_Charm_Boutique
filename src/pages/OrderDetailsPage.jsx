import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  ClockIcon,
  TruckIcon,
  ShoppingBagIcon,
  CreditCardIcon,
  MapPinIcon,
  PrinterIcon,
  EnvelopeIcon,
  StarIcon,
  XMarkIcon,
  QrCodeIcon,
  ArrowUpRightIcon,
  XCircleIcon,
  DocumentDuplicateIcon,
} from '@heroicons/react/24/outline';

import { getOrderById } from '../services/orderService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import PaymentStatusBadge from '../components/common/PaymentStatusBadge';
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

const STATUS_MESSAGE = {
  pending: 'Order placed. Awaiting confirmation.',
  processing: 'Preparing your order for shipping.',
  shipped: 'On the way to you.',
  delivered: 'Delivered successfully.',
  cancelled: 'Order cancelled.',
};

const TIMELINE_STEPS = [
  { key: 'pending', label: 'Placed' },
  { key: 'processing', label: 'Processing' },
  { key: 'shipped', label: 'Shipped' },
  { key: 'delivered', label: 'Delivered' },
];

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
    const fetchOrder = async () => {
      if (!id) {
        navigate('/orders');
        return;
      }
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
    fetchOrder();
  }, [id, navigate]);

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatPrice = (price) =>
    `₹${Number(price || 0).toLocaleString('en-IN')}`;

  const handlePrint = () => window.print();

  const handleEmailReceipt = async () => {
    toast.loading('Sending receipt…', { id: 'email' });
    setTimeout(() => {
      toast.success('Receipt sent to your email', { id: 'email' });
    }, 1200);
  };

  const handleCopyUpiRef = async () => {
    if (!order?.upi_reference) return;
    try {
      await navigator.clipboard.writeText(order.upi_reference);
      toast.success('UPI reference copied');
    } catch {
      toast.error('Failed to copy');
    }
  };

  const handleSubmitReview = async () => {
    if (!reviewComment.trim()) {
      toast.error('Please write a review');
      return;
    }
    setSubmittingReview(true);
    setTimeout(() => {
      toast.success('Review submitted');
      setShowReviewModal(false);
      setReviewComment('');
      setReviewRating(5);
      setSubmittingReview(false);
    }, 1200);
  };

  // ==========================================
  // LOADING
  // ==========================================
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream-100">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-cream-100 px-4">
        <ShoppingBagIcon className="w-14 h-14 text-ink-300 mb-5" />
        <h2 className="font-serif text-2xl font-bold text-ink-800 mb-2">
          Order not found
        </h2>
        <Link to="/orders" className="btn-outline text-xs mt-4">
          <ArrowLeftIcon className="w-3.5 h-3.5" />
          Back to Orders
        </Link>
      </div>
    );
  }

  const orderKey = order.id || order._id;
  const statusMeta = STATUS_META[order.status] || STATUS_META.pending;
  const statusMessage = STATUS_MESSAGE[order.status] || '';
  const paymentPending = order.payment_status === 'pending';
  const paymentVerifying = order.payment_status === 'verification_pending';
  const paymentVerified = order.payment_status === 'verified';
  const paymentRejected = order.payment_status === 'rejected';
  const isUpi = order.payment_method === 'upi';

  // Timeline progress
  const statusIndex = TIMELINE_STEPS.findIndex((s) => s.key === order.status);

  return (
    <div className="min-h-screen bg-cream-100 pb-16">
      {/* ==========================================
          HEADER
      ========================================== */}
      <section className="border-b border-line bg-cream-100">
        <div className="container-editorial py-6 md:py-8">
          <Link
            to="/orders"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-wider font-medium text-ink-500 hover:text-burgundy-500 transition-colors mb-4"
          >
            <ArrowLeftIcon className="w-3.5 h-3.5" />
            Back to Orders
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <p className="kicker mb-3">Order Detail</p>
              <h1 className="font-serif text-2xl md:text-4xl font-bold text-ink-800">
                #{order.order_number || 'N/A'}
              </h1>
              <p className="text-xs md:text-sm text-ink-500 mt-2">
                Placed on {formatDate(order.created_at)}
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider font-medium">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${statusMeta.dot}`}
                />
                <span className={statusMeta.text}>{statusMeta.label}</span>
              </span>
              <PaymentStatusBadge status={order.payment_status} />
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================
          PAYMENT ALERT — Top action banner
      ========================================== */}
      {isUpi && (paymentPending || paymentRejected) && (
        <section className="border-b border-line">
          <div className="container-editorial py-4">
            <div
              className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-lg border ${
                paymentRejected
                  ? 'bg-red-50/60 border-red-200'
                  : 'bg-burgundy-50/40 border-burgundy-200'
              }`}
            >
              <div className="flex items-start gap-3">
                {paymentRejected ? (
                  <XCircleIcon className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                ) : (
                  <QrCodeIcon className="w-5 h-5 text-burgundy-500 flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="text-sm font-semibold text-ink-800">
                    {paymentRejected
                      ? 'Payment was rejected'
                      : 'Complete your payment'}
                  </p>
                  <p className="text-xs text-ink-600 mt-0.5">
                    {paymentRejected
                      ? order.rejection_reason ||
                        'Please try again with a valid payment screenshot.'
                      : 'Scan the UPI QR and upload your payment screenshot.'}
                  </p>
                </div>
              </div>
              <Link
                to={`/payment/upi/${orderKey}`}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-ink-800 text-cream-100 text-[11px] uppercase tracking-wider font-semibold rounded hover:bg-burgundy-500 transition-colors flex-shrink-0 self-start sm:self-auto"
              >
                {paymentRejected ? 'Try Again' : 'Pay Now'}
                <ArrowUpRightIcon className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {isUpi && paymentVerifying && (
        <section className="border-b border-line">
          <div className="container-editorial py-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-lg bg-blue-50/60 border border-blue-200">
              <div className="flex items-start gap-3">
                <ClockIcon className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5 animate-pulse" />
                <div>
                  <p className="text-sm font-semibold text-ink-800">
                    Verifying your payment
                  </p>
                  <p className="text-xs text-ink-600 mt-0.5">
                    We'll confirm your order within 24 hours.
                  </p>
                </div>
              </div>
              <Link
                to={`/payment/status/${orderKey}`}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 border border-ink-800 text-ink-800 text-[11px] uppercase tracking-wider font-semibold rounded hover:bg-ink-800 hover:text-cream-100 transition-colors flex-shrink-0 self-start sm:self-auto"
              >
                View Status
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ==========================================
          MAIN CONTENT
      ========================================== */}
      <section className="container-editorial py-8 md:py-10 space-y-8">
        {/* ---------- STATUS TIMELINE ---------- */}
        <div className="bg-white border border-line rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-[11px] uppercase tracking-kicker font-semibold text-ink-500 mb-1">
                Order Status
              </p>
              <p className="font-serif text-lg font-bold text-ink-800 capitalize">
                {statusMeta.label}
              </p>
            </div>
            <p className="text-xs text-ink-500 hidden sm:block text-right max-w-xs">
              {statusMessage}
            </p>
          </div>

          {/* Timeline */}
          <div className="flex items-center">
            {TIMELINE_STEPS.map((step, i) => {
              const isDone = i <= statusIndex && statusIndex !== -1;
              const isCurrent = i === statusIndex;
              const isLast = i === TIMELINE_STEPS.length - 1;

              return (
                <div key={step.key} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-shrink-0">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                        isDone
                          ? 'bg-ink-800 text-cream-100'
                          : 'bg-cream-200 text-ink-400'
                      }`}
                    >
                      {isDone && !isCurrent ? (
                        <CheckCircleIcon className="w-3.5 h-3.5" />
                      ) : (
                        <span>{i + 1}</span>
                      )}
                    </div>
                    <p
                      className={`text-[10px] uppercase tracking-wider font-medium mt-2 text-center ${
                        isDone ? 'text-ink-800' : 'text-ink-400'
                      }`}
                    >
                      {step.label}
                    </p>
                  </div>

                  {!isLast && (
                    <div
                      className={`flex-1 h-px mx-2 ${
                        isDone && i < statusIndex
                          ? 'bg-ink-800'
                          : 'bg-line'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ---------- TWO COLUMN — Items + Summary ---------- */}
        <div className="grid lg:grid-cols-12 gap-6 lg:gap-8">
          {/* LEFT — Items (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Items */}
            <div className="bg-white border border-line rounded-lg overflow-hidden">
              <div className="px-5 md:px-6 py-4 border-b border-line flex items-center justify-between">
                <p className="text-[11px] uppercase tracking-kicker font-semibold text-ink-800">
                  Items
                </p>
                <p className="text-xs text-ink-500">
                  {order.items?.length || 0} item
                  {order.items?.length !== 1 ? 's' : ''}
                </p>
              </div>

              <div className="divide-y divide-line">
                {(order.items || []).map((item, index) => (
                  <div
                    key={index}
                    className="px-5 md:px-6 py-4 flex items-center gap-4"
                  >
                    <div className="flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded overflow-hidden bg-cream-200">
                      <img
                        src={
                          item.image ||
                          'https://via.placeholder.com/100'
                        }
                        alt={item.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/100';
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-ink-800 line-clamp-2">
                        {item.name}
                      </p>
                      <p className="text-xs text-ink-500 mt-1">
                        {formatPrice(item.price)} × {item.quantity}
                      </p>
                    </div>
                    <span className="text-sm font-medium text-ink-800 flex-shrink-0">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white border border-line rounded-lg p-5 md:p-6">
              <div className="flex items-start gap-3 mb-4">
                <MapPinIcon className="w-4 h-4 text-ink-800 flex-shrink-0 mt-0.5" />
                <p className="text-[11px] uppercase tracking-kicker font-semibold text-ink-800">
                  Shipping Address
                </p>
              </div>
              <div className="text-sm text-ink-700 leading-relaxed pl-7">
                <p className="font-medium text-ink-800">
                  {order.shipping_address?.street}
                </p>
                <p>
                  {order.shipping_address?.city},{' '}
                  {order.shipping_address?.state}{' '}
                  {order.shipping_address?.zip_code}
                </p>
                <p>{order.shipping_address?.country}</p>
              </div>
            </div>
          </div>

          {/* RIGHT — Summary + Payment (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Payment Info */}
            <div className="bg-white border border-line rounded-lg p-5 md:p-6">
              <div className="flex items-start gap-3 mb-5 pb-5 border-b border-line">
                <CreditCardIcon className="w-4 h-4 text-ink-800 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-[11px] uppercase tracking-kicker font-semibold text-ink-800">
                    Payment
                  </p>
                  <p className="text-sm text-ink-700 mt-1">
                    {isUpi ? 'UPI Payment' : 'Cash on Delivery'}
                  </p>
                </div>
                <PaymentStatusBadge status={order.payment_status} size="sm" />
              </div>

              {/* UPI reference if verified */}
              {paymentVerified && order.upi_reference && (
                <div className="mb-4">
                  <p className="text-[10px] uppercase tracking-wider text-ink-500 mb-1.5">
                    UPI Reference
                  </p>
                  <div className="flex items-center gap-2 p-2.5 bg-cream-100 border border-line rounded">
                    <code className="text-xs font-mono font-medium text-ink-800 truncate flex-1">
                      {order.upi_reference}
                    </code>
                    <button
                      onClick={handleCopyUpiRef}
                      className="p-1 hover:bg-white rounded transition-colors flex-shrink-0"
                      title="Copy"
                    >
                      <DocumentDuplicateIcon className="w-3.5 h-3.5 text-ink-500" />
                    </button>
                  </div>
                </div>
              )}

              {/* Rejection reason */}
              {paymentRejected && order.rejection_reason && (
                <div className="mb-4 p-3 bg-red-50/60 border border-red-200 rounded">
                  <p className="text-[10px] uppercase tracking-wider text-red-600 font-semibold mb-1">
                    Rejection Reason
                  </p>
                  <p className="text-xs text-red-700 leading-relaxed">
                    {order.rejection_reason}
                  </p>
                </div>
              )}

              {/* Payment timeline */}
              <div className="space-y-2 pt-2">
                {order.created_at && (
                  <div className="flex items-start justify-between gap-3 text-xs">
                    <span className="text-ink-500">Order placed</span>
                    <span className="text-ink-800 font-medium text-right">
                      {formatDate(order.created_at)}
                    </span>
                  </div>
                )}
                {order.paid_at && (
                  <div className="flex items-start justify-between gap-3 text-xs">
                    <span className="text-ink-500">Payment received</span>
                    <span className="text-ink-800 font-medium text-right">
                      {formatDate(order.paid_at)}
                    </span>
                  </div>
                )}
                {order.delivered_at && (
                  <div className="flex items-start justify-between gap-3 text-xs">
                    <span className="text-ink-500">Delivered</span>
                    <span className="text-ink-800 font-medium text-right">
                      {formatDate(order.delivered_at)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Price Summary */}
            <div className="bg-white border border-line rounded-lg p-5 md:p-6">
              <p className="text-[11px] uppercase tracking-kicker font-semibold text-ink-800 mb-5 pb-4 border-b border-line">
                Summary
              </p>

              <div className="space-y-3 pb-4 border-b border-line">
                <SummaryRow
                  label="Subtotal"
                  value={formatPrice(order.items_price)}
                />
                <SummaryRow
                  label="Tax (10%)"
                  value={formatPrice(order.tax_price)}
                />
                <SummaryRow
                  label="Shipping"
                  value={
                    order.shipping_price === 0
                      ? 'Free'
                      : formatPrice(order.shipping_price)
                  }
                  isFree={order.shipping_price === 0}
                />
              </div>

              <div className="pt-4 flex justify-between items-baseline">
                <span className="text-[11px] uppercase tracking-kicker font-semibold text-ink-800">
                  Total
                </span>
                <span className="font-serif text-2xl font-bold text-ink-800">
                  {formatPrice(order.total_price)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ---------- ACTIONS ---------- */}
        <div className="pt-6 border-t border-line flex flex-wrap gap-2">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2.5 border border-line rounded text-[11px] uppercase tracking-wider font-semibold text-ink-800 hover:border-ink-800 transition-colors"
          >
            <PrinterIcon className="w-3.5 h-3.5" />
            Print
          </button>

          <button
            onClick={handleEmailReceipt}
            className="inline-flex items-center gap-2 px-4 py-2.5 border border-line rounded text-[11px] uppercase tracking-wider font-semibold text-ink-800 hover:border-ink-800 transition-colors"
          >
            <EnvelopeIcon className="w-3.5 h-3.5" />
            Email Receipt
          </button>

          {order.status === 'delivered' && (
            <button
              onClick={() => setShowReviewModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-ink-800 text-cream-100 rounded text-[11px] uppercase tracking-wider font-semibold hover:bg-burgundy-500 transition-colors"
            >
              <StarIcon className="w-3.5 h-3.5" />
              Write Review
            </button>
          )}

          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-4 py-2.5 border border-line rounded text-[11px] uppercase tracking-wider font-semibold text-ink-800 hover:border-ink-800 transition-colors ml-auto"
          >
            Continue Shopping
          </Link>
        </div>
      </section>

      {/* ==========================================
          REVIEW MODAL
      ========================================== */}
      <AnimatePresence>
        {showReviewModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-ink-900/50 backdrop-blur-sm"
              onClick={() => setShowReviewModal(false)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-white rounded-lg border border-line shadow-2xl w-full max-w-md p-6"
            >
              <button
                onClick={() => setShowReviewModal(false)}
                className="absolute top-4 right-4 p-2 hover:bg-cream-100 rounded-full transition-colors"
                aria-label="Close"
              >
                <XMarkIcon className="w-4 h-4 text-ink-500" />
              </button>

              <p className="kicker mb-3">Feedback</p>
              <h3 className="font-serif text-xl font-bold text-ink-800 mb-5">
                Write a Review
              </h3>

              <div className="space-y-5">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-medium text-ink-500 mb-2.5">
                    Your Rating
                  </label>
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        className="focus:outline-none transition-transform hover:scale-110"
                      >
                        <StarIcon
                          className={`w-8 h-8 transition-colors ${
                            star <= reviewRating
                              ? 'text-ink-800 fill-ink-800'
                              : 'text-ink-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-medium text-ink-500 mb-2.5">
                    Your Review
                  </label>
                  <textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    rows="4"
                    className="input-editorial resize-none"
                    placeholder="Share your experience…"
                  />
                </div>

                <button
                  onClick={handleSubmitReview}
                  disabled={submittingReview}
                  className="btn-solid w-full py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submittingReview ? 'Submitting…' : 'Submit Review'}
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
// SUMMARY ROW
// ==========================================
const SummaryRow = ({ label, value, isFree }) => (
  <div className="flex justify-between text-sm">
    <span className="text-ink-600">{label}</span>
    <span className="font-medium text-ink-800">
      {isFree ? <span className="text-burgundy-500">Free</span> : value}
    </span>
  </div>
);

export default OrderDetailsPage;