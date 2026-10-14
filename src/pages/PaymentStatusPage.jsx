import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  ArrowLeftIcon,
  ArrowUpRightIcon,
  DocumentTextIcon,
  DocumentDuplicateIcon,
  EnvelopeIcon,
  HomeIcon,
} from '@heroicons/react/24/outline';

import { getPaymentProof } from '../services/orderService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

// ==========================================
// STATUS CONFIG
// ==========================================
const STATUS_CONFIG = {
  pending: {
    label: 'Awaiting Payment',
    description:
      'Your order is created. Please complete the UPI payment to confirm.',
    dot: 'bg-burgundy-500',
    labelColor: 'text-burgundy-500',
  },
  verification_pending: {
    label: 'Verifying Payment',
    description:
      "We've received your payment proof. Our team will verify it within 24 hours.",
    dot: 'bg-blue-500',
    labelColor: 'text-blue-600',
  },
  verified: {
    label: 'Payment Verified',
    description:
      "Your payment is verified and your order is confirmed. We'll ship soon!",
    dot: 'bg-green-600',
    labelColor: 'text-green-700',
  },
  rejected: {
    label: 'Payment Rejected',
    description:
      "We couldn't verify your payment. Please check the reason and try again.",
    dot: 'bg-red-500',
    labelColor: 'text-red-600',
  },
};

// ==========================================
// TIMELINE CONFIG
// ==========================================
const buildTimeline = (status, hasProof) => [
  { key: 'placed', label: 'Placed', done: true, active: false },
  {
    key: 'submitted',
    label: 'Submitted',
    done:
      status === 'verification_pending' ||
      status === 'verified' ||
      status === 'rejected' ||
      hasProof,
    active: status === 'verification_pending',
    isError: false,
  },
  {
    key: 'verified',
    label: status === 'rejected' ? 'Rejected' : 'Verified',
    done: status === 'verified' || status === 'rejected',
    active: false,
    isError: status === 'rejected',
  },
];

const PaymentStatusPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // ==========================================
  // FETCH STATUS
  // ==========================================
  const fetchStatus = useCallback(
    async (showSpinner = false) => {
      if (showSpinner) setRefreshing(true);
      try {
        const response = await getPaymentProof(orderId);
        if (response.success) {
          setData(response);
          if (response.payment_status === 'verified') {
            toast.success('Payment verified');
          } else if (response.payment_status === 'rejected') {
            toast.error('Payment was rejected');
          }
        }
      } catch (err) {
        console.error('Failed to load status:', err);
        toast.error('Failed to load payment status');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [orderId]
  );

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  // ==========================================
  // POLL WHILE VERIFYING
  // ==========================================
  useEffect(() => {
    if (!data) return;
    const status = data.payment_status;
    const shouldPoll =
      status === 'verification_pending' || status === 'pending';
    if (!shouldPoll) return;

    const interval = setInterval(() => fetchStatus(), 30000);
    return () => clearInterval(interval);
  }, [data, fetchStatus]);

  const handleCopyRef = async () => {
    if (!data?.upi_reference) return;
    try {
      await navigator.clipboard.writeText(data.upi_reference);
      toast.success('Reference copied');
    } catch {
      toast.error('Failed to copy');
    }
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

  // ==========================================
  // NOT FOUND
  // ==========================================
  if (!data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-cream-100 px-4">
        <XCircleIcon className="w-14 h-14 text-ink-300 mb-5" />
        <h2 className="font-serif text-2xl font-bold text-ink-800 mb-2">
          Status not found
        </h2>
        <p className="text-sm text-ink-500 mb-6 text-center max-w-sm">
          We couldn't find the payment status for this order.
        </p>
        <Link to="/orders" className="btn-outline text-xs">
          <ArrowLeftIcon className="w-3.5 h-3.5" />
          Back to Orders
        </Link>
      </div>
    );
  }

  const status = data.payment_status || 'pending';
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const proof = data.proof;
  const steps = buildTimeline(status, !!proof);
  const amount = Number(data.total_price || 0);

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
            <div className="min-w-0">
              <p className="kicker mb-3">Payment Status</p>
              <h1 className="font-serif text-2xl md:text-3xl font-bold text-ink-800 truncate">
                Order #{data.order_number || 'N/A'}
              </h1>
            </div>

            <button
              onClick={() => fetchStatus(true)}
              disabled={refreshing}
              className="inline-flex items-center gap-2 px-3.5 py-2 border border-line rounded text-[11px] uppercase tracking-wider font-medium text-ink-700 hover:border-ink-800 transition-colors disabled:opacity-50 self-start sm:self-auto"
            >
              <ArrowPathIcon
                className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`}
              />
              Refresh
            </button>
          </div>
        </div>
      </section>

      {/* ==========================================
          MAIN
      ========================================== */}
      <section className="container-editorial py-8 md:py-10 max-w-3xl">
        {/* ---------- STATUS CARD ---------- */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-line rounded-lg p-6 md:p-8 mb-5"
        >
          <div className="flex items-start gap-4">
            <span
              className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${config.dot} ${
                status === 'verification_pending' ? 'animate-pulse' : ''
              }`}
            />
            <div className="flex-1 min-w-0">
              <p
                className={`text-[11px] uppercase tracking-kicker font-semibold mb-2 ${config.labelColor}`}
              >
                {config.label}
              </p>
              <p className="text-sm md:text-base text-ink-600 leading-relaxed">
                {config.description}
              </p>

              {/* Amount */}
              {data.total_price !== undefined && (
                <div className="mt-5 pt-5 border-t border-line flex items-baseline justify-between gap-4">
                  <span className="text-[11px] uppercase tracking-wider font-medium text-ink-500">
                    Amount
                  </span>
                  <span className="font-serif text-2xl font-bold text-ink-800">
                    ₹{amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </span>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* ---------- TIMELINE ---------- */}
        <div className="bg-white border border-line rounded-lg p-5 md:p-6 mb-5">
          <p className="text-[11px] uppercase tracking-kicker font-semibold text-ink-500 mb-5">
            Progress
          </p>

          <div className="flex items-center">
            {steps.map((step, idx) => {
              const isLast = idx === steps.length - 1;
              const nextActive =
                idx + 1 < steps.length &&
                (steps[idx + 1].done || steps[idx + 1].active);

              return (
                <div key={step.key} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold transition-all flex-shrink-0 ${
                        step.done
                          ? step.isError
                            ? 'bg-red-500 text-white'
                            : 'bg-ink-800 text-cream-100'
                          : step.active
                          ? 'bg-burgundy-500 text-white'
                          : 'bg-cream-200 text-ink-400'
                      }`}
                    >
                      {step.done ? (
                        step.isError ? (
                          <XCircleIcon className="w-3.5 h-3.5" />
                        ) : (
                          <CheckCircleIcon className="w-3.5 h-3.5" />
                        )
                      ) : (
                        <span>{idx + 1}</span>
                      )}
                    </div>
                    <p
                      className={`mt-2 text-[10px] uppercase tracking-wider font-medium text-center whitespace-nowrap ${
                        step.done || step.active
                          ? 'text-ink-800'
                          : 'text-ink-400'
                      }`}
                    >
                      {step.label}
                    </p>
                  </div>
                  {!isLast && (
                    <div
                      className={`flex-1 h-px mx-2 md:mx-4 ${
                        nextActive ? 'bg-ink-800' : 'bg-line'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ---------- REJECTION REASON ---------- */}
        <AnimatePresence>
          {status === 'rejected' && data.rejection_reason && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-red-50/60 border border-red-200 rounded-lg p-5 mb-5"
            >
              <div className="flex items-start gap-3">
                <XCircleIcon className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-[11px] uppercase tracking-wider font-semibold text-red-600 mb-2">
                    Rejection Reason
                  </p>
                  <p className="text-sm text-ink-700 leading-relaxed">
                    {data.rejection_reason}
                  </p>
                  <p className="text-xs text-ink-500 mt-3">
                    If you believe this is a mistake, contact us with a valid
                    payment proof.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ---------- UPI REFERENCE ---------- */}
        <AnimatePresence>
          {status === 'verified' && data.upi_reference && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-white border border-line rounded-lg p-5 md:p-6 mb-5"
            >
              <p className="text-[11px] uppercase tracking-kicker font-semibold text-ink-500 mb-4">
                Payment Details
              </p>

              <div className="space-y-3">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-xs text-ink-500">UPI Reference</span>
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-mono text-sm font-medium text-ink-800 truncate">
                      {data.upi_reference}
                    </span>
                    <button
                      onClick={handleCopyRef}
                      className="p-1 hover:bg-cream-100 rounded transition-colors flex-shrink-0"
                      aria-label="Copy reference"
                    >
                      <DocumentDuplicateIcon className="w-3.5 h-3.5 text-ink-500" />
                    </button>
                  </div>
                </div>

                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-xs text-ink-500">Amount</span>
                  <span className="font-medium text-ink-800 text-sm">
                    ₹{amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </span>
                </div>

                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-xs text-ink-500">Status</span>
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-green-700">
                    <CheckCircleIcon className="w-3.5 h-3.5" />
                    Verified
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ---------- SUBMITTED SCREENSHOT ---------- */}
        {proof && proof.screenshot_url && (
          <div className="bg-white border border-line rounded-lg p-5 md:p-6 mb-5">
            <p className="text-[11px] uppercase tracking-kicker font-semibold text-ink-500 mb-4">
              Submitted Screenshot
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href={proof.screenshot_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0 w-full sm:w-24 h-40 sm:h-24 rounded overflow-hidden border border-line bg-cream-100 group relative"
                aria-label="Open screenshot in new tab"
              >
                <img
                  src={proof.screenshot_url}
                  alt="Payment proof"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-ink-800/0 group-hover:bg-ink-800/30 flex items-center justify-center transition-colors">
                  <ArrowUpRightIcon className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </a>

              <div className="flex-1 text-sm space-y-3">
                {proof.customer_note && (
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-ink-500 mb-0.5">
                      Your Note
                    </p>
                    <p className="text-ink-700 text-xs leading-relaxed">
                      {proof.customer_note}
                    </p>
                  </div>
                )}

                <div>
                  <p className="text-[10px] uppercase tracking-wider text-ink-500 mb-0.5">
                    Submitted
                  </p>
                  <p className="text-ink-700 text-xs">
                    {proof.created_at
                      ? new Date(proof.created_at).toLocaleString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ---------- ACTIONS ---------- */}
        <div className="bg-white border border-line rounded-lg p-5 md:p-6">
          <p className="text-[11px] uppercase tracking-kicker font-semibold text-ink-500 mb-4">
            Actions
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {(status === 'pending' || status === 'verification_pending') && (
              <Link to={`/payment/upi/${orderId}`} className="btn-solid py-3">
                <DocumentTextIcon className="w-4 h-4" />
                {status === 'pending' ? 'Make Payment' : 'Update Proof'}
              </Link>
            )}

            {status === 'rejected' && (
              <Link to={`/payment/upi/${orderId}`} className="btn-solid py-3">
                <DocumentTextIcon className="w-4 h-4" />
                Try Again
              </Link>
            )}

            {status === 'verified' && (
              <Link to={`/orders/${orderId}`} className="btn-solid py-3">
                <HomeIcon className="w-4 h-4" />
                View Order
              </Link>
            )}

            <Link to="/orders" className="btn-outline py-3">
              <ArrowLeftIcon className="w-3.5 h-3.5" />
              My Orders
            </Link>

            {status === 'rejected' && (
              <a
                href="mailto:thecharmboutique@gmail.com"
                className="sm:col-span-2 inline-flex items-center justify-center gap-2 py-3 border border-line rounded text-[11px] uppercase tracking-wider font-semibold text-ink-700 hover:border-ink-800 transition-colors"
              >
                <EnvelopeIcon className="w-3.5 h-3.5" />
                Contact Support
              </a>
            )}
          </div>
        </div>

        {/* ---------- POLLING HINT ---------- */}
        {status === 'verification_pending' && (
          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-ink-500">
            <ArrowPathIcon className="w-3 h-3 animate-spin" />
            Auto-refreshing every 30 seconds
          </div>
        )}
      </section>
    </div>
  );
};

export default PaymentStatusPage;