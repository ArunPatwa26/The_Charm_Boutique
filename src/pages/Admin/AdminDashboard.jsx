import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ShoppingBagIcon,
  UsersIcon,
  CurrencyRupeeIcon,
  TagIcon,
  ClockIcon,
  CheckCircleIcon,
  TruckIcon,
  XCircleIcon,
  SparklesIcon,
  CubeIcon,
  ArrowPathIcon,
  ArrowUpRightIcon,
} from '@heroicons/react/24/outline';

import { getDashboardStats } from '../../services/adminService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

// ==========================================
// STATUS META
// ==========================================
const ORDER_STATUS_META = {
  pending: { dot: 'bg-ink-400', text: 'text-ink-600', label: 'Pending' },
  processing: { dot: 'bg-blue-500', text: 'text-blue-700', label: 'Processing' },
  shipped: { dot: 'bg-purple-500', text: 'text-purple-700', label: 'Shipped' },
  delivered: { dot: 'bg-green-600', text: 'text-green-700', label: 'Delivered' },
  cancelled: { dot: 'bg-red-500', text: 'text-red-700', label: 'Cancelled' },
};

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = async (showSpinner = false) => {
    if (showSpinner) setRefreshing(true);
    else setLoading(true);

    try {
      const response = await getDashboardStats();
      if (response?.success) {
        setStats(response.stats || {});
        setRecentOrders(response.recent_orders || []);
      } else {
        toast.error(response?.message || 'Failed to load dashboard');
      }
    } catch (error) {
      console.error('Dashboard error:', error);
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // ==========================================
  // STAT CARDS
  // ==========================================
  const statCards = [
    {
      title: 'Revenue',
      value: `₹${Number(stats?.revenue?.total || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`,
      icon: CurrencyRupeeIcon,
    },
    {
      title: 'Orders',
      value: stats?.orders?.total || 0,
      icon: ShoppingBagIcon,
    },
    {
      title: 'Users',
      value: stats?.users || 0,
      icon: UsersIcon,
    },
    {
      title: 'Products',
      value: stats?.products || 0,
      icon: TagIcon,
    },
  ];

  // ==========================================
  // QUICK ACTIONS
  // ==========================================
  const quickActions = [
    { to: '/admin/products', label: 'Products', icon: CubeIcon },
    { to: '/admin/orders', label: 'Orders', icon: ShoppingBagIcon },
    { to: '/admin/payments', label: 'Payments', icon: CurrencyRupeeIcon },
    { to: '/admin/categories', label: 'Categories', icon: TagIcon },
    { to: '/admin/analytics', label: 'Analytics', icon: SparklesIcon },
  ];

  return (
    <div className="space-y-6 pb-8">
      {/* ==========================================
          PAGE HEADER
      ========================================== */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-kicker font-semibold text-ink-500 mb-2">
            Admin Panel
          </p>
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-ink-800">
            Dashboard
          </h1>
          <p className="text-xs md:text-sm text-ink-500 mt-1.5">
            {new Date().toLocaleDateString('en-IN', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </p>
        </div>

        <button
          onClick={() => fetchDashboardData(true)}
          disabled={refreshing}
          className="self-start md:self-auto inline-flex items-center gap-2 px-3.5 py-2 border border-line rounded text-[11px] uppercase tracking-wider font-medium text-ink-700 hover:border-ink-800 transition-colors disabled:opacity-50"
        >
          <ArrowPathIcon className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* ==========================================
          STAT CARDS
      ========================================== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white border border-line rounded-lg p-4 md:p-5"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-9 h-9 md:w-10 md:h-10 rounded-lg bg-ink-800 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 md:w-5 md:h-5 text-cream-100" />
                </div>
              </div>
              <p className="font-serif text-xl md:text-2xl font-bold text-ink-800 truncate">
                {stat.value}
              </p>
              <p className="text-[10px] md:text-xs uppercase tracking-wider text-ink-500 font-medium mt-1">
                {stat.title}
              </p>
            </motion.div>
          );
        })}
      </div>

      {/* ==========================================
          ORDER STATUS + QUICK ACTIONS
      ========================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-5">
        {/* Order Status */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="lg:col-span-2 bg-white border border-line rounded-lg p-4 md:p-6"
        >
          <div className="flex items-end justify-between mb-5">
            <div>
              <p className="text-[11px] uppercase tracking-kicker font-semibold text-ink-500">
                Order Status
              </p>
              <p className="text-xs text-ink-500 mt-1.5">
                Real-time distribution
              </p>
            </div>
            <Link
              to="/admin/orders"
              className="inline-flex items-center gap-1 text-[11px] uppercase tracking-wider font-medium text-ink-700 hover:text-burgundy-500 transition-colors"
            >
              View all
              <ArrowUpRightIcon className="w-3 h-3" />
            </Link>
          </div>

          {stats?.orders &&
          Object.keys(stats.orders).filter((k) => k !== 'total').length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {Object.entries(stats.orders).map(([status, count]) => {
                if (status === 'total') return null;
                const meta = ORDER_STATUS_META[status] || ORDER_STATUS_META.pending;

                return (
                  <div
                    key={status}
                    className="p-4 bg-cream-100 border border-line rounded-lg"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
                      <span className="text-[10px] uppercase tracking-wider font-semibold text-ink-500">
                        {meta.label}
                      </span>
                    </div>
                    <p className="font-serif text-xl md:text-2xl font-bold text-ink-800">
                      {count}
                    </p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <ShoppingBagIcon className="w-10 h-10 text-ink-300 mx-auto mb-3" />
              <p className="text-sm text-ink-500">No orders yet</p>
            </div>
          )}
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white border border-line rounded-lg p-4 md:p-6"
        >
          <div className="mb-5">
            <p className="text-[11px] uppercase tracking-kicker font-semibold text-ink-500">
              Quick Actions
            </p>
            <p className="text-xs text-ink-500 mt-1.5">
              Jump to any section
            </p>
          </div>

          <div className="space-y-1">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.to}
                  to={action.to}
                  className="flex items-center justify-between px-3 py-2.5 text-sm text-ink-700 hover:bg-cream-100 rounded transition-colors group"
                >
                  <span className="flex items-center gap-3">
                    <Icon className="w-4 h-4 text-ink-500" />
                    {action.label}
                  </span>
                  <ArrowUpRightIcon className="w-3.5 h-3.5 text-ink-400 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                </Link>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* ==========================================
          RECENT ORDERS
      ========================================== */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="bg-white border border-line rounded-lg overflow-hidden"
      >
        <div className="px-4 md:px-6 py-4 border-b border-line flex items-end justify-between gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-kicker font-semibold text-ink-500">
              Recent Orders
            </p>
            <p className="text-xs text-ink-500 mt-1.5">
              Latest customer orders
            </p>
          </div>
          <Link
            to="/admin/orders"
            className="inline-flex items-center gap-1 text-[11px] uppercase tracking-wider font-medium text-ink-700 hover:text-burgundy-500 transition-colors flex-shrink-0"
          >
            View all
            <ArrowUpRightIcon className="w-3 h-3" />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingBagIcon className="w-10 h-10 text-ink-300 mx-auto mb-3" />
            <p className="text-sm font-medium text-ink-600">No orders yet</p>
            <p className="text-xs text-ink-500 mt-1">
              Orders will appear once customers place them.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-line">
                    <th className="text-left py-3 px-6 text-[10px] font-semibold text-ink-500 uppercase tracking-wider">
                      Order
                    </th>
                    <th className="text-left py-3 px-6 text-[10px] font-semibold text-ink-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="text-left py-3 px-6 text-[10px] font-semibold text-ink-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="text-left py-3 px-6 text-[10px] font-semibold text-ink-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-left py-3 px-6 text-[10px] font-semibold text-ink-500 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order, index) => {
                    const status = order?.status?.toLowerCase() || 'pending';
                    const meta = ORDER_STATUS_META[status] || ORDER_STATUS_META.pending;

                    return (
                      <motion.tr
                        key={order?.id || order?._id || index}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: Math.min(index * 0.03, 0.3) }}
                        className="border-b border-line last:border-b-0 hover:bg-cream-100 transition-colors"
                      >
                        <td className="py-3.5 px-6">
                          <span className="font-medium text-ink-800 text-sm">
                            #{order?.order_number || order?.id?.slice(0, 8) || '-'}
                          </span>
                        </td>
                        <td className="py-3.5 px-6">
                          <p className="text-sm font-medium text-ink-800 truncate max-w-[180px]">
                            {order?.user_name || 'Guest'}
                          </p>
                          <p className="text-xs text-ink-500 truncate max-w-[180px] mt-0.5">
                            {order?.user_email || ''}
                          </p>
                        </td>
                        <td className="py-3.5 px-6">
                          <p className="text-sm font-medium text-ink-800">
                            ₹
                            {Number(order?.total_price || order?.total || 0).toLocaleString('en-IN')}
                          </p>
                        </td>
                        <td className="py-3.5 px-6">
                          <span className="inline-flex items-center gap-1.5 text-xs">
                            <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
                            <span className={`font-medium ${meta.text}`}>
                              {meta.label}
                            </span>
                          </span>
                        </td>
                        <td className="py-3.5 px-6">
                          <span className="text-xs text-ink-500 whitespace-nowrap">
                            {order?.created_at
                              ? new Date(order.created_at).toLocaleDateString('en-IN', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                })
                              : '-'}
                          </span>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile list */}
            <div className="md:hidden divide-y divide-line">
              {recentOrders.map((order, index) => {
                const status = order?.status?.toLowerCase() || 'pending';
                const meta = ORDER_STATUS_META[status] || ORDER_STATUS_META.pending;

                return (
                  <motion.div
                    key={order?.id || order?._id || index}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: Math.min(index * 0.03, 0.3) }}
                    className="p-4"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="min-w-0">
                        <p className="font-medium text-ink-800 text-sm">
                          #{order?.order_number || '-'}
                        </p>
                        <p className="text-xs text-ink-500 truncate mt-0.5">
                          {order?.user_name || 'Guest'}
                        </p>
                      </div>
                      <span className="inline-flex items-center gap-1.5 text-xs flex-shrink-0">
                        <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
                        <span className={`font-medium ${meta.text}`}>
                          {meta.label}
                        </span>
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-ink-800">
                        ₹{Number(order?.total_price || order?.total || 0).toLocaleString('en-IN')}
                      </span>
                      <span className="text-xs text-ink-500">
                        {order?.created_at
                          ? new Date(order.created_at).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                            })
                          : '-'}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default AdminDashboard;