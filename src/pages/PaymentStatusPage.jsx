import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  ArrowLeftIcon,
  DocumentTextIcon,
  PhoneIcon,
  HomeIcon,
} from '@heroicons/react/24/outline';
import { getPaymentProof } from '../services/orderService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

// ============================================================
// STATUS CONFIG — maps backend status to display config
// ============================================================
const STATUS_CONFIG = {
  pending: {
    label: 'Awaiting Payment',
    description: 'Please complete your UPI payment and upload the screenshot.',
    color: 'yellow',
    icon: ClockIcon,
    bgClass: 'bg-yellow-50',
    borderClass: 'border-yellow-200',
    textClass: 'text-yellow-800',
    iconBgClass: 'bg-yellow-100',
    iconColorClass: 'text-yellow-600',
  },
  verification_pending: {
    label: 'Verification Pending',
    description: "We've received your payment proof. Our team will verify it within 24 hours.",
    color: 'blue',
    icon: ClockIcon,
    bgClass: 'bg-blue-50',
    borderClass: 'border-blue-200',
    textClass: 'text-blue-800',
    iconBgClass: 'bg-blue-100',
    iconColorClass: 'text-blue-600',
  },
  verified: {
    label: 'Payment Verified',
    description: 'Your payment has been verified and your order is confirmed!',
    color: 'green',
    icon: CheckCircleIcon,
    bgClass: 'bg-green-50',
    borderClass: 'border-green-200',
    textClass: 'text-green-800',
    iconBgClass: 'bg-green-100',
    iconColorClass: 'text-green-600',
  },
  rejected: {
    label: 'Payment Rejected',
    description: 'We could not verify your payment. Please contact support.',
    color: 'red',
    icon: XCircleIcon,
    bgClass: 'bg-red-50',
    borderClass: 'border-red-200',
    textClass: 'text-red-800',
    iconBgClass: 'bg-red-100',
    iconColorClass: 'text-red-600',
  },
};

const PaymentStatusPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // ============================================================
  // Fetch payment proof status
  // ============================================================
  const fetchStatus = useCallback(
    async (showSpinner = false) => {
      if (showSpinner) setRefreshing(true);
      try {
        const response = await getPaymentProof(orderId);
        if (response.success) {
          setData(response);

          // Auto-redirect to orders page if verified
          if (response.payment_status === 'verified') {
            toast.success('Payment verified! 🎉');
          } else if (response.payment_status === 'rejected') {
            toast.error('Payment was rejected');
          }
        }
      } catch (err) {
        console.error('❌ Failed to load status:', err);
        toast.error('Failed to load payment status');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [orderId]
  );

  // Initial fetch
  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  // ============================================================
  // Poll every 30s while verification is pending
  // ============================================================
  useEffect(() => {
    if (!data) return;

    const status = data.payment_status;
    const shouldPoll = status === 'verification_pending' || status === 'pending';

    if (!shouldPoll) return;

    const interval = setInterval(() => {
      fetchStatus();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [data, fetchStatus]);

  // ============================================================
  // Loading state
  // ============================================================
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Payment status not found.</p>
          <Link to="/orders" className="btn-primary">
            Go to My Orders
          </Link>
        </div>
      </div>
    );
  }

  const status = data.payment_status || 'pending';
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const StatusIcon = config.icon;
  const proof = data.proof;

  // ============================================================
  // Timeline step logic
  // ============================================================
  const steps = [
    {
      key: 'placed',
      label: 'Order Placed',
      done: true,
      active: false,
    },
    {
      key: 'submitted',
      label: 'Proof Submitted',
      done: status === 'verification_pending' || status === 'verified' || status === 'rejected' || !!proof,
      active: status === 'verification_pending',
    },
    {
      key: 'verified',
      label: status === 'rejected' ? 'Rejected' : 'Verified',
      done: status === 'verified' || status === 'rejected',
      active: false,
      isError: status === 'rejected',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-custom max-w-3xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate('/orders')}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">Payment Status</h1>
            {data.order_number && (
              <p className="text-sm text-gray-600">Order #{data.order_number}</p>
            )}
          </div>
          <button
            onClick={() => fetchStatus(true)}
            disabled={refreshing}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors disabled:opacity-50"
            title="Refresh"
          >
            <ArrowPathIcon
              className={`w-5 h-5 text-gray-600 ${refreshing ? 'animate-spin' : ''}`}
            />
          </button>
        </div>

        {/* Status Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`${config.bgClass} border-2 ${config.borderClass} rounded-2xl p-6 mb-6`}
        >
          <div className="flex items-start gap-4">
            <div
              className={`w-14 h-14 ${config.iconBgClass} rounded-full flex items-center justify-center flex-shrink-0`}
            >
              <StatusIcon className={`w-7 h-7 ${config.iconColorClass}`} />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className={`text-xl font-bold ${config.textClass} mb-1`}>
                {config.label}
              </h2>
              <p className={`text-sm ${config.textClass} opacity-90`}>
                {config.description}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Timeline */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h3 className="font-semibold text-gray-800 mb-4">Progress</h3>
          <div className="flex items-center justify-between">
            {steps.map((step, idx) => (
              <div key={step.key} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                      step.done
                        ? step.isError
                          ? 'bg-red-500 text-white'
                          : 'bg-green-500 text-white'
                        : step.active
                        ? 'bg-gold-500 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {step.done ? (
                      step.isError ? (
                        <XCircleIcon className="w-5 h-5" />
                      ) : (
                        <CheckCircleIcon className="w-5 h-5" />
                      )
                    ) : (
                      idx + 1
                    )}
                  </div>
                  <span
                    className={`mt-2 text-xs font-medium text-center ${
                      step.done ? 'text-gray-800' : 'text-gray-500'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
                {idx < steps.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 ${
                      steps[idx + 1].done || steps[idx + 1].active
                        ? 'bg-green-500'
                        : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Rejection reason — only if rejected */}
        {status === 'rejected' && data.rejection_reason && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border-2 border-red-200 rounded-2xl p-5 mb-6"
          >
            <div className="flex gap-3">
              <XCircleIcon className="w-6 h-6 text-red-600 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-red-800 mb-1">Rejection Reason</h3>
                <p className="text-sm text-red-700">{data.rejection_reason}</p>
                <p className="text-xs text-red-600 mt-3">
                  If you believe this is an error, contact us with a valid payment proof.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* UPI Reference — only if verified */}
        {status === 'verified' && data.upi_reference && (
          <div className="bg-white rounded-2xl shadow-sm p-5 mb-6">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <CheckCircleIcon className="w-5 h-5 text-green-600" />
              Payment Details
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">UPI Reference</span>
                <span className="font-mono font-semibold">{data.upi_reference}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Amount</span>
                <span className="font-bold">₹{Number(data.total_price || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Status</span>
                <span className="text-green-600 font-semibold">Verified ✓</span>
              </div>
            </div>
          </div>
        )}

        {/* Submitted proof preview */}
        {proof && proof.screenshot_url && (
          <div className="bg-white rounded-2xl shadow-sm p-5 mb-6">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <DocumentTextIcon className="w-5 h-5 text-gray-600" />
              Submitted Screenshot
            </h3>
            <div className="flex gap-4">
              <img
                src={proof.screenshot_url}
                alt="Payment proof"
                className="w-24 h-24 object-cover rounded-xl border-2 border-gray-200"
              />
              <div className="flex-1 text-sm">
                {proof.customer_note && (
                  <p className="text-gray-700 mb-2">
                    <span className="text-gray-500">Your note: </span>
                    {proof.customer_note}
                  </p>
                )}
                <p className="text-xs text-gray-500">
                  Submitted:{' '}
                  {proof.created_at
                    ? new Date(proof.created_at).toLocaleString('en-IN')
                    : 'N/A'}
                </p>
                {proof.status && (
                  <p className="text-xs text-gray-500 mt-1">
                    Proof status:{' '}
                    <span className="font-semibold">{proof.status}</span>
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <h3 className="font-semibold text-gray-800 mb-3">Quick Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Link
              to="/orders"
              className="flex items-center justify-center gap-2 py-3 px-4 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors text-sm"
            >
              <HomeIcon className="w-4 h-4" />
              My Orders
            </Link>

            {(status === 'pending' || status === 'verification_pending') && (
              <Link
                to={`/payment/upi/${orderId}`}
                className="flex items-center justify-center gap-2 py-3 px-4 bg-gold-500 hover:bg-gold-600 text-white rounded-xl font-medium transition-colors text-sm"
              >
                <DocumentTextIcon className="w-4 h-4" />
                {status === 'pending' ? 'Make Payment' : 'Update Proof'}
              </Link>
            )}

            {status === 'rejected' && (
              <a
                href="mailto:support@thecharmboutique.com"
                className="flex items-center justify-center gap-2 py-3 px-4 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-colors text-sm"
              >
                <PhoneIcon className="w-4 h-4" />
                Contact Support
              </a>
            )}

            {(status === 'verified' || status === 'rejected') && (
              <button
                onClick={() => navigate(`/orders`)}
                className="flex items-center justify-center gap-2 py-3 px-4 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors text-sm"
              >
                View Order Details
              </button>
            )}
          </div>
        </div>

        {/* Info footer */}
        {status === 'verification_pending' && (
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              Auto-refreshing every 30 seconds. You can also click the refresh icon above.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentStatusPage;