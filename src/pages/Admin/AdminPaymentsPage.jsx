import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  XMarkIcon,
  ArrowPathIcon,
  CurrencyRupeeIcon,
  UserIcon,
  ArrowRightIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';
import { adminGetPendingPayments } from '../../services/orderService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const TABS = [
  { key: 'verification_pending', label: 'Pending', icon: ClockIcon },
  { key: 'verified', label: 'Verified', icon: CheckCircleIcon },
  { key: 'rejected', label: 'Rejected', icon: XCircleIcon },
];

const AdminPaymentsPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('verification_pending');
  const [proofs, setProofs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  const fetchProofs = useCallback(async (page = 1, spinner = false) => {
    if (spinner) setRefreshing(true);
    else setLoading(true);
    try {
      const response = await adminGetPendingPayments({
        page,
        limit: 20,
        status_filter: activeTab,
      });
      if (response.success) {
        setProofs(response.proofs || []);
        setPagination(response.pagination || { page: 1, pages: 1, total: 0 });
      }
    } catch {
      toast.error('Failed to load payments');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchProofs(1);
  }, [fetchProofs]);

  const formatDate = (iso) =>
    iso
      ? new Date(iso).toLocaleString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : 'N/A';

  const statusBadge = (status) => {
    const map = {
      verification_pending: 'bg-blue-100 text-blue-700 border-blue-200',
      verified: 'bg-green-100 text-green-700 border-green-200',
      rejected: 'bg-red-100 text-red-700 border-red-200',
    };
    const label = {
      verification_pending: 'Pending',
      verified: 'Verified',
      rejected: 'Rejected',
    };
    return (
      <span
        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${map[status]}`}
      >
        {label[status]}
      </span>
    );
  };

  return (
    <div className="max-w-7xl mx-auto pb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Payment Queue
          </h1>
          <p className="text-sm md:text-base text-gray-500 mt-1">
            Quick access to pending payments
          </p>
        </div>
        <button
          onClick={() => fetchProofs(pagination.page, true)}
          disabled={refreshing}
          className="p-2.5 bg-white hover:bg-gray-100 rounded-full shadow-sm transition-colors disabled:opacity-50"
        >
          <ArrowPathIcon
            className={`w-5 h-5 text-gray-600 ${refreshing ? 'animate-spin' : ''}`}
          />
        </button>
      </div>

      {/* Info banner */}
      <div className="mb-6 bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-start gap-3">
        <InformationCircleIcon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800">
          <strong>Tip:</strong> You can verify payments directly from the{' '}
          <Link to="/admin/orders" className="underline font-semibold">
            Orders page
          </Link>{' '}
          — open any order with a pending payment to see the screenshot inline.
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-sm p-1.5 mb-6 inline-flex gap-1 flex-wrap">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-20">
          <LoadingSpinner />
        </div>
      ) : proofs.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-16 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircleIcon className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-1">
            All caught up!
          </h3>
          <p className="text-sm text-gray-500">
            No {activeTab.replace('_', ' ')} payments to show.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {proofs.map((proof) => (
            <motion.div
              key={proof.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all flex flex-col"
            >
              <div className="relative bg-gray-100 aspect-[4/3]">
                <img
                  src={proof.screenshot_url}
                  alt="Payment proof"
                  className="w-full h-full object-contain"
                />
                <div className="absolute top-3 left-3">
                  {statusBadge(proof.status)}
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col">
                <div className="flex items-start justify-between mb-3">
                  <div className="min-w-0">
                    <p className="text-[10px] text-gray-500 uppercase tracking-wide font-semibold">
                      Order
                    </p>
                    <p className="font-semibold text-gray-900 text-sm truncate">
                      #{proof.order_number || 'N/A'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-gray-500 uppercase tracking-wide font-semibold">
                      Amount
                    </p>
                    <p className="font-bold text-amber-600 text-base">
                      ₹{Number(proof.total_price || 0).toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-gray-600 mb-3">
                  <UserIcon className="w-3.5 h-3.5 text-gray-400" />
                  <span className="truncate">
                    {proof.user_name || 'Unknown'}
                  </span>
                </div>

                <p className="text-[11px] text-gray-400 mb-3">
                  {formatDate(proof.created_at)}
                </p>

                <button
                  onClick={() => navigate('/admin/orders')}
                  className="mt-auto w-full py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 text-white font-semibold rounded-xl hover:from-amber-600 hover:to-yellow-600 transition-all text-sm flex items-center justify-center gap-1.5 shadow-sm"
                >
                  Verify in Orders
                  <ArrowRightIcon className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <button
            onClick={() => fetchProofs(pagination.page - 1)}
            disabled={pagination.page === 1}
            className="px-4 py-2 bg-white hover:bg-gray-100 rounded-xl text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600 px-4">
            Page {pagination.page} of {pagination.pages}
          </span>
          <button
            onClick={() => fetchProofs(pagination.page + 1)}
            disabled={pagination.page === pagination.pages}
            className="px-4 py-2 bg-white hover:bg-gray-100 rounded-xl text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminPaymentsPage;