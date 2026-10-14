import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ArrowPathIcon,
  UserIcon,
  ArrowRightIcon,
  InformationCircleIcon,
  PhotoIcon,
  ExclamationTriangleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import { adminGetPendingPayments } from '../../services/orderService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const TABS = [
  {
    key: 'verification_pending',
    label: 'Pending',
    icon: ClockIcon,
  },
  {
    key: 'verified',
    label: 'Verified',
    icon: CheckCircleIcon,
  },
  {
    key: 'rejected',
    label: 'Rejected',
    icon: XCircleIcon,
  },
];

const EMPTY_PAGINATION = {
  page: 1,
  pages: 1,
  total: 0,
};

const STATUS_STYLES = {
  verification_pending: 'bg-blue-50 text-blue-700 ring-blue-600/20',
  verified: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  rejected: 'bg-red-50 text-red-700 ring-red-600/20',
};

const STATUS_LABELS = {
  verification_pending: 'Pending',
  verified: 'Verified',
  rejected: 'Rejected',
};

const formatDate = (value) => {
  if (!value) return 'Date unavailable';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Date unavailable';
  }

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

  if (!Number.isFinite(amount)) return '₹0.00';

  return amount.toLocaleString('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const StatusBadge = ({ status }) => {
  const style =
    STATUS_STYLES[status] || 'bg-gray-100 text-gray-700 ring-gray-500/20';

  const label = STATUS_LABELS[status] || 'Unknown';

  return (
    <span
      className={`inline-flex max-w-full items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${style}`}
    >
      <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
};

const PaymentImage = ({ src }) => {
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [src]);

  if (!src || imageError) {
    return (
      <div className="flex h-full min-h-48 flex-col items-center justify-center gap-2 bg-gray-50 text-gray-400">
        <PhotoIcon className="h-12 w-12" />
        <span className="text-sm font-medium">
          Payment screenshot unavailable
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt="Customer payment proof"
      loading="lazy"
      onError={() => setImageError(true)}
      className="h-full w-full object-contain p-2 transition-transform duration-300 group-hover:scale-[1.02]"
    />
  );
};

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
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

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
          toast.error('Unable to load payment records');
        }
      } catch (err) {
        console.error('Failed to load admin payments:', err);

        setError(true);
        toast.error('Failed to load payments. Please try again.');
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

  const openOrders = () => {
    navigate('/admin/orders');
  };

  const isEmpty = !loading && !error && proofs.length === 0;

  return (
    <main className="mx-auto w-full max-w-[1600px] min-w-0 px-3 pb-8 sm:px-5 sm:pb-10 md:px-7 lg:px-8">
      {/* Header */}
      <header className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="mb-2 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-amber-700">
              Administration
            </span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl lg:text-4xl">
            Payment Queue
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500 sm:text-base">
            Review customer payment screenshots and track verification status.
          </p>
        </div>

        <button
          type="button"
          onClick={() => fetchProofs(pagination.page, true)}
          disabled={refreshing || loading}
          aria-label="Refresh payment records"
          className="inline-flex min-h-11 w-full shrink-0 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:border-amber-300 hover:bg-amber-50 hover:text-amber-800 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          <ArrowPathIcon
            className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`}
          />
          Refresh payments
        </button>
      </header>

      {/* Information banner */}
      <section className="mb-6 rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50 p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100">
            <InformationCircleIcon className="h-5 w-5 text-amber-700" />
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-bold text-gray-900">
              Payment verification
            </h2>

            <p className="mt-1 text-sm leading-6 text-gray-600">
              Open the Orders page to review payment details and verify or
              reject a customer's payment proof.
            </p>

            <Link
              to="/admin/orders"
              className="mt-3 inline-flex min-h-10 items-center gap-1.5 rounded-lg text-sm font-bold text-amber-800 transition hover:text-amber-950 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
            >
              Go to Orders
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Summary */}
      <section className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
          <p className="text-sm font-medium text-gray-500">
            {STATUS_LABELS[activeTab]} records
          </p>

          <div className="mt-2 flex items-end justify-between gap-2">
            <p className="text-2xl font-bold text-gray-900 sm:text-3xl">
              {loading ? '—' : pagination.total ?? proofs.length}
            </p>

            <span className="text-xs text-gray-400">Total records</span>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
          <p className="text-sm font-medium text-gray-500">
            Current page
          </p>

          <p className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl">
            {pagination.page}
            <span className="ml-1 text-base font-medium text-gray-400">
              / {pagination.pages}
            </span>
          </p>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
          <p className="text-sm font-medium text-gray-500">
            Records per page
          </p>

          <p className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl">
            20
          </p>
        </div>
      </section>

      {/* Tabs */}
      <section className="mb-6">
        <div
          role="tablist"
          aria-label="Filter payments by status"
          className="grid grid-cols-3 gap-1 rounded-2xl border border-gray-200 bg-gray-100/80 p-1 sm:inline-flex sm:gap-2 sm:p-1.5"
        >
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;

            return (
              <button
                key={tab.key}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => changeTab(tab.key)}
                className={`flex min-h-11 min-w-0 items-center justify-center gap-1.5 rounded-xl px-2 py-2.5 text-xs font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-1 sm:gap-2 sm:px-5 sm:text-sm ${
                  isActive
                    ? 'bg-white text-amber-700 shadow-sm ring-1 ring-gray-200'
                    : 'text-gray-600 hover:bg-white/70 hover:text-gray-900'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0 sm:h-5 sm:w-5" />
                <span className="truncate">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Loading state */}
      {loading && (
        <div className="flex min-h-64 items-center justify-center rounded-2xl border border-gray-100 bg-white px-4 py-16">
          <div className="flex flex-col items-center gap-4">
            <LoadingSpinner />
            <p className="text-sm text-gray-500">
              Loading payment records...
            </p>
          </div>
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <div className="rounded-2xl border border-red-100 bg-white px-5 py-12 text-center sm:px-8">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
            <ExclamationTriangleIcon className="h-7 w-7 text-red-500" />
          </div>

          <h2 className="mt-4 text-lg font-bold text-gray-900">
            Couldn't load payments
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
            There was a problem retrieving payment records. Check your
            connection and try again.
          </p>

          <button
            type="button"
            onClick={() => fetchProofs(pagination.page)}
            className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            <ArrowPathIcon className="h-4 w-4" />
            Try again
          </button>
        </div>
      )}

      {/* Empty state */}
      {isEmpty && (
        <div className="rounded-2xl border border-gray-100 bg-white px-5 py-14 text-center shadow-sm sm:px-8 sm:py-20">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50">
            <CheckCircleIcon className="h-9 w-9 text-emerald-600" />
          </div>

          <h2 className="mt-5 text-lg font-bold text-gray-900 sm:text-xl">
            All caught up!
          </h2>

          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-gray-500">
            There are no {STATUS_LABELS[activeTab]?.toLowerCase() || ''}{' '}
            payments on this page.
          </p>

          {activeTab !== 'verification_pending' && (
            <button
              type="button"
              onClick={() => changeTab('verification_pending')}
              className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl bg-amber-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
            >
              View pending payments
            </button>
          )}
        </div>
      )}

      {/* Payment cards */}
      {!loading && !error && proofs.length > 0 && (
        <section
          aria-label="Payment records"
          className="grid grid-cols-1 items-stretch gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3 2xl:grid-cols-4"
        >
          {proofs.map((proof, index) => (
            <motion.article
              key={proof.id || proof.order_number || index}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.25,
                delay: Math.min(index * 0.04, 0.2),
              }}
              className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-amber-200 hover:shadow-lg"
            >
              {/* Screenshot */}
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-50">
                <PaymentImage src={proof.screenshot_url} />

                <div className="absolute left-3 top-3 max-w-[calc(100%-24px)]">
                  <StatusBadge status={proof.status} />
                </div>
              </div>

              {/* Details */}
              <div className="flex flex-1 flex-col p-4 sm:p-5">
                <div className="flex min-w-0 items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-gray-400">
                      Order number
                    </p>

                    <p
                      className="mt-1 truncate text-sm font-bold text-gray-900"
                      title={proof.order_number || 'N/A'}
                    >
                      #{proof.order_number || 'N/A'}
                    </p>
                  </div>

                  <div className="min-w-0 shrink-0 text-right">
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-gray-400">
                      Amount
                    </p>

                    <p className="mt-1 break-words text-base font-bold text-amber-700 sm:text-lg">
                      {formatAmount(proof.total_price)}
                    </p>
                  </div>
                </div>

                <div className="my-4 h-px bg-gray-100" />

                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-100">
                    <UserIcon className="h-4 w-4 text-gray-500" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                      Customer
                    </p>

                    <p
                      className="mt-0.5 truncate text-sm font-semibold text-gray-800"
                      title={proof.user_name || 'Unknown'}
                    >
                      {proof.user_name || 'Unknown'}
                    </p>
                  </div>
                </div>

                <div className="mt-3 flex items-start justify-between gap-2 text-xs text-gray-500">
                  <span className="shrink-0 font-medium">Submitted</span>
                  <span className="min-w-0 text-right">
                    {formatDate(proof.created_at)}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={openOrders}
                  className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:from-amber-600 hover:to-yellow-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 active:scale-[0.99]"
                >
                  Review in Orders
                  <ArrowRightIcon className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5" />
                </button>
              </div>
            </motion.article>
          ))}
        </section>
      )}

      {/* Pagination */}
      {!loading && !error && proofs.length > 0 && pagination.pages > 1 && (
        <nav
          aria-label="Payment pagination"
          className="mt-8 flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:px-5"
        >
          <p className="text-center text-sm text-gray-500 sm:text-left">
            Page{' '}
            <span className="font-bold text-gray-900">
              {pagination.page}
            </span>{' '}
            of{' '}
            <span className="font-bold text-gray-900">
              {pagination.pages}
            </span>
            {pagination.total != null && (
              <span className="ml-1">
                · {pagination.total} records
              </span>
            )}
          </p>

          <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
            <button
              type="button"
              onClick={() => changePage(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeftIcon className="h-4 w-4" />
              Previous
            </button>

            <button
              type="button"
              onClick={() => changePage(pagination.page + 1)}
              disabled={pagination.page >= pagination.pages}
              className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
              <ChevronRightIcon className="h-4 w-4" />
            </button>
          </div>
        </nav>
      )}
    </main>
  );
};

export default AdminPaymentsPage;
