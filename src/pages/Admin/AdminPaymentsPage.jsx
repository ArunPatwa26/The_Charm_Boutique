import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ArrowPathIcon,
  UserIcon,
  ArrowUpRightIcon,
  PhotoIcon,
  ExclamationTriangleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';

import { adminGetPendingPayments } from '../../services/orderService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

// ==========================================
// CONFIG
// ==========================================
const TABS = [
  { key: 'verification_pending', label: 'Pending', dot: 'bg-blue-500' },
  { key: 'verified', label: 'Verified', dot: 'bg-green-600' },
  { key: 'rejected', label: 'Rejected', dot: 'bg-red-500' },
];

const EMPTY_PAGINATION = { page: 1, pages: 1, total: 0 };

const STATUS_META = {
  verification_pending: {
    label: 'Pending',
    dot: 'bg-blue-500',
    text: 'text-blue-700',
  },
  verified: {
    label: 'Verified',
    dot: 'bg-green-600',
    text: 'text-green-700',
  },
  rejected: {
    label: 'Rejected',
    dot: 'bg-red-500',
    text: 'text-red-600',
  },
};

// ==========================================
// HELPERS
// ==========================================
const formatDate = (value) => {
  if (!value) return 'Date unavailable';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Date unavailable';
  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatAmount = (value) => {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return '₹0';
  return `₹${amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
};

// ==========================================
// STATUS BADGE
// ==========================================
const StatusBadge = ({ status }) => {
  const meta = STATUS_META[status] || {
    label: 'Unknown',
    dot: 'bg-ink-400',
    text: 'text-ink-600',
  };
  return (
    <span className="inline-flex items-center gap-1.5 bg-white/95 backdrop-blur-sm border border-line px-2.5 py-1 rounded text-[10px] uppercase tracking-wider font-semibold shadow-sm">
      <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
      <span className={meta.text}>{meta.label}</span>
    </span>
  );
};

// ==========================================
// PAYMENT IMAGE
// ==========================================
const PaymentImage = ({ src }) => {
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [src]);

  if (!src || imageError) {
    return (
      <div className="flex h-full min-h-48 flex-col items-center justify-center gap-2 bg-cream-100 text-ink-400">
        <PhotoIcon className="h-10 w-10" />
        <span className="text-xs uppercase tracking-wider font-medium">
          Screenshot unavailable
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt="Payment proof"
      loading="lazy"
      onError={() => setImageError(true)}
      className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-[1.02]"
    />
  );
};

// ==========================================
// MAIN
// ==========================================
const AdminPaymentsPage = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('verification_pending');
  const [proofs, setProofs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);
  const [pagination, setPagination] = useState(EMPTY_PAGINATION);

  const fetchProofs = useCallback(
    async (page = 1, showRefresh = false) => {
      if (showRefresh) setRefreshing(true);
      else setLoading(true);

      setError(false);

      try {
        const response = await adminGetPendingPayments({
          page,
          limit: 20,
          status_filter: activeTab,
        });

        if (response?.success) {
          setProofs(response.proofs || []);
          setPagination(
            response.pagination || {
              page,
              pages: 1,
              total: (response.proofs || []).length,
            }
          );
        } else {
          setProofs([]);
          setPagination(EMPTY_PAGINATION);
          setError(true);
        }
      } catch (err) {
        console.error('Failed to load payments:', err);
        setError(true);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [activeTab]
  );

  useEffect(() => {
    fetchProofs(1);
  }, [fetchProofs]);

  const changeTab = (tab) => {
    if (tab === activeTab) return;
    setActiveTab(tab);
    setPagination(EMPTY_PAGINATION);
  };

  const changePage = (page) => {
    if (page < 1 || page > pagination.pages) return;
    fetchProofs(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isEmpty = !loading && !error && proofs.length === 0;

  return (
    <div className="max-w-7xl mx-auto pb-8 space-y-6">
      {/* ==========================================
          HEADER
      ========================================== */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-kicker font-semibold text-ink-500 mb-2">
            Review
          </p>
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-ink-800">
            Payment Queue
          </h1>
          <p className="text-xs md:text-sm text-ink-500 mt-1.5">
            Track UPI payment proofs and verification status
          </p>
        </div>

        <button
          type="button"
          onClick={() => fetchProofs(pagination.page, true)}
          disabled={refreshing || loading}
          className="self-start sm:self-auto inline-flex items-center gap-2 px-3.5 py-2 border border-line rounded text-[11px] uppercase tracking-wider font-medium text-ink-700 hover:border-ink-800 transition-colors disabled:opacity-50"
        >
          <ArrowPathIcon
            className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`}
          />
          Refresh
        </button>
      </div>

      {/* ==========================================
          INFO BANNER
      ========================================== */}
      <div className="flex items-start gap-3 p-4 border border-line rounded-lg bg-cream-100">
        <div className="w-7 h-7 rounded-full bg-ink-800 flex items-center justify-center flex-shrink-0">
          <span className="text-cream-100 text-xs font-bold">i</span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs text-ink-600 leading-relaxed">
            <strong className="text-ink-800">
              Verify payments in the Orders page.
            </strong>{' '}
            Open an order to review the screenshot and approve or reject the
            payment proof.
          </p>
          <Link
            to="/admin/orders"
            className="mt-2 inline-flex items-center gap-1 text-[11px] uppercase tracking-wider font-semibold text-burgundy-500 hover:text-burgundy-600 transition-colors"
          >
            Go to Orders
            <ArrowUpRightIcon className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* ==========================================
          TABS
      ========================================== */}
      <div className="flex flex-wrap items-center gap-1.5">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => changeTab(tab.key)}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded text-[11px] uppercase tracking-wider font-semibold transition-colors border ${
                isActive
                  ? 'bg-ink-800 text-cream-100 border-ink-800'
                  : 'bg-transparent text-ink-600 border-line hover:border-ink-800 hover:text-ink-800'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isActive ? 'bg-cream-100' : tab.dot
                }`}
              />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ==========================================
          SUMMARY STRIP
      ========================================== */}
      {!loading && !error && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <div className="bg-white border border-line rounded-lg p-3.5">
            <p className="text-[10px] uppercase tracking-wider text-ink-500 font-medium mb-1">
              Records
            </p>
            <p className="font-serif text-xl font-bold text-ink-800">
              {pagination.total ?? proofs.length}
            </p>
          </div>
          <div className="bg-white border border-line rounded-lg p-3.5">
            <p className="text-[10px] uppercase tracking-wider text-ink-500 font-medium mb-1">
              Page
            </p>
            <p className="font-serif text-xl font-bold text-ink-800">
              {pagination.page}
              <span className="text-sm font-medium text-ink-400 ml-1">
                / {pagination.pages}
              </span>
            </p>
          </div>
          <div className="bg-white border border-line rounded-lg p-3.5 col-span-2 md:col-span-1">
            <p className="text-[10px] uppercase tracking-wider text-ink-500 font-medium mb-1">
              Filter
            </p>
            <p className="text-sm font-medium text-ink-800 capitalize">
              {STATUS_META[activeTab]?.label || 'All'}
            </p>
          </div>
        </div>
      )}

      {/* ==========================================
          LOADING
      ========================================== */}
      {loading && (
        <div className="flex flex-col items-center justify-center gap-3 py-20 bg-white border border-line rounded-lg">
          <LoadingSpinner />
          <p className="text-sm text-ink-500">Loading payment records…</p>
        </div>
      )}

      {/* ==========================================
          ERROR
      ========================================== */}
      {!loading && error && (
        <div className="text-center py-16 bg-white border border-line rounded-lg px-6">
          <ExclamationTriangleIcon className="w-10 h-10 text-red-500 mx-auto mb-4" />
          <h3 className="font-serif text-lg font-bold text-ink-800 mb-1">
            Couldn't load payments
          </h3>
          <p className="text-sm text-ink-500 mb-6 max-w-md mx-auto">
            There was a problem retrieving payment records.
          </p>
          <button
            type="button"
            onClick={() => fetchProofs(pagination.page)}
            className="btn-outline text-xs"
          >
            <ArrowPathIcon className="w-3.5 h-3.5" />
            Try again
          </button>
        </div>
      )}

      {/* ==========================================
          EMPTY
      ========================================== */}
      {isEmpty && (
        <div className="text-center py-16 bg-white border border-line rounded-lg px-6">
          <CheckCircleIcon className="w-10 h-10 text-green-600 mx-auto mb-4" />
          <h3 className="font-serif text-lg font-bold text-ink-800 mb-1">
            All caught up
          </h3>
          <p className="text-sm text-ink-500 mb-6 max-w-md mx-auto">
            No {STATUS_META[activeTab]?.label?.toLowerCase() || ''} payments on
            this page.
          </p>
          {activeTab !== 'verification_pending' && (
            <button
              type="button"
              onClick={() => changeTab('verification_pending')}
              className="btn-solid text-xs"
            >
              View pending
            </button>
          )}
        </div>
      )}

      {/* ==========================================
          GRID
      ========================================== */}
      {!loading && !error && proofs.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
          <AnimatePresence initial={false}>
            {proofs.map((proof, index) => (
              <motion.article
                key={proof.id || proof.order_number || index}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{
                  duration: 0.25,
                  delay: Math.min(index * 0.04, 0.2),
                }}
                className="group bg-white border border-line rounded-lg overflow-hidden flex flex-col"
              >
                {/* Screenshot */}
                <div className="relative aspect-[4/3] overflow-hidden bg-cream-100">
                  <PaymentImage src={proof.screenshot_url} />
                  <div className="absolute top-3 left-3">
                    <StatusBadge status={proof.status} />
                  </div>
                </div>

                {/* Body */}
                <div className="p-4 flex-1 flex flex-col">
                  {/* Order + Amount */}
                  <div className="flex items-start justify-between gap-3 mb-4 pb-4 border-b border-line">
                    <div className="min-w-0">
                      <p className="text-[10px] uppercase tracking-wider text-ink-500 font-medium">
                        Order
                      </p>
                      <p
                        className="text-sm font-medium text-ink-800 truncate mt-0.5"
                        title={proof.order_number || 'N/A'}
                      >
                        #{proof.order_number || 'N/A'}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-[10px] uppercase tracking-wider text-ink-500 font-medium">
                        Amount
                      </p>
                      <p className="font-serif text-base font-bold text-ink-800 mt-0.5">
                        {formatAmount(proof.total_price)}
                      </p>
                    </div>
                  </div>

                  {/* Customer */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-cream-100 flex items-center justify-center flex-shrink-0">
                      <UserIcon className="w-3.5 h-3.5 text-ink-500" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] uppercase tracking-wider text-ink-500 font-medium">
                        Customer
                      </p>
                      <p
                        className="text-xs font-medium text-ink-800 truncate mt-0.5"
                        title={proof.user_name || 'Unknown'}
                      >
                        {proof.user_name || 'Unknown'}
                      </p>
                    </div>
                  </div>

                  {/* Timestamp */}
                  <div className="flex items-start justify-between gap-2 text-xs mb-4">
                    <span className="text-[10px] uppercase tracking-wider text-ink-500 font-medium">
                      Submitted
                    </span>
                    <span className="text-[10px] text-ink-600 text-right">
                      {formatDate(proof.created_at)}
                    </span>
                  </div>

                  {/* Action */}
                  <button
                    type="button"
                    onClick={() => navigate('/admin/orders')}
                    className="mt-auto w-full inline-flex items-center justify-center gap-1.5 py-2.5 bg-ink-800 hover:bg-burgundy-500 text-cream-100 rounded text-[11px] uppercase tracking-wider font-semibold transition-colors"
                  >
                    Review in Orders
                    <ArrowUpRightIcon className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </button>
                </div>
              </motion.article>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* ==========================================
          PAGINATION
      ========================================== */}
      {!loading && !error && proofs.length > 0 && pagination.pages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-line">
          <p className="text-xs text-ink-500 order-2 sm:order-1">
            Page {pagination.page} of {pagination.pages}
            {pagination.total != null && ` · ${pagination.total} records`}
          </p>

          <nav className="flex items-center gap-1 order-1 sm:order-2">
            <button
              type="button"
              onClick={() => changePage(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="px-3 py-1.5 text-[11px] uppercase tracking-wider font-medium border border-line rounded hover:border-ink-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              Prev
            </button>
            <span className="px-3 text-xs text-ink-600 font-medium">
              {pagination.page} / {pagination.pages}
            </span>
            <button
              type="button"
              onClick={() => changePage(pagination.page + 1)}
              disabled={pagination.page >= pagination.pages}
              className="px-3 py-1.5 text-[11px] uppercase tracking-wider font-medium border border-line rounded hover:border-ink-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </nav>
        </div>
      )}
    </div>
  );
};

export default AdminPaymentsPage;