import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ShoppingBagIcon,
  UsersIcon,
  CurrencyRupeeIcon,
  TagIcon,
  ArrowTrendingUpIcon,
  ClockIcon,
  CheckCircleIcon,
  TruckIcon,
  XCircleIcon,
  SparklesIcon,
  ChartBarIcon,
  CubeIcon,
  DocumentTextIcon,
  EyeIcon,
  PlusIcon,           // ← unused
  ArrowPathIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';
import { getDashboardStats } from '../../services/adminService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const ORDER_STATUS_META = {
  pending: { bg: 'bg-amber-100', text: 'text-amber-700', Icon: ClockIcon },
  processing: { bg: 'bg-blue-100', text: 'text-blue-700', Icon: SparklesIcon },
  shipped: { bg: 'bg-purple-100', text: 'text-purple-700', Icon: TruckIcon },
  delivered: { bg: 'bg-green-100', text: 'text-green-700', Icon: CheckCircleIcon },
  cancelled: { bg: 'bg-red-100', text: 'text-red-700', Icon: XCircleIcon },
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
      toast.error('Failed to load dashboard data');
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

  const statCards = [
    {
      title: 'Revenue',
      value: `₹${Number(stats?.revenue?.total || 0).toLocaleString('en-IN')}`,
      icon: CurrencyRupeeIcon,
      gradient: 'from-amber-500 to-orange-500',
      change: '+12.5%',
    },
    {
      title: 'Orders',
      value: stats?.orders?.total || 0,
      icon: ShoppingBagIcon,
      gradient: 'from-blue-500 to-cyan-500',
      change: '+8.2%',
    },
    {
      title: 'Users',
      value: stats?.users || 0,
      icon: UsersIcon,
      gradient: 'from-purple-500 to-pink-500',
      change: '+5.7%',
    },
    {
      title: 'Products',
      value: stats?.products || 0,
      icon: TagIcon,
      gradient: 'from-emerald-500 to-teal-500',
      change: '+3.1%',
    },
  ];

  const quickActions = [
    { to: '/admin/products', label: 'Products', icon: CubeIcon, from: 'from-amber-50', to2: 'to-orange-50', text: 'text-amber-700' },
    { to: '/admin/orders', label: 'Orders', icon: ShoppingBagIcon, from: 'from-blue-50', to2: 'to-indigo-50', text: 'text-blue-700' },
    { to: '/admin/payments', label: 'Payments', icon: CurrencyRupeeIcon, from: 'from-emerald-50', to2: 'to-green-50', text: 'text-emerald-700' },
    { to: '/admin/categories', label: 'Categories', icon: TagIcon, from: 'from-purple-50', to2: 'to-pink-50', text: 'text-purple-700' },
  ];

  return (
    <div className="space-y-6 md:space-y-8 pb-8">
      {/* =========================
          HERO HEADER
      ========================== */}
      <div className="relative overflow-hidden rounded-2xl md:rounded-3xl bg-gradient-to-br from-amber-500 via-yellow-500 to-amber-600 p-5 md:p-8">
        <div className="absolute -top-24 -right-24 w-72 md:w-96 h-72 md:h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-72 md:w-96 h-72 md:h-96 bg-white/10 rounded-full blur-3xl" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-white/20 backdrop-blur rounded-xl md:rounded-2xl flex items-center justify-center flex-shrink-0">
              <SparklesIcon className="w-5 h-5 md:w-7 md:h-7 text-white" />
            </div>
            <div>
              <h1 className="text-xl md:text-3xl lg:text-4xl font-bold text-white leading-tight">
                Dashboard
              </h1>
              <p className="text-white/80 text-xs md:text-sm mt-0.5">
                {new Date().toLocaleDateString('en-IN', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                })}
              </p>
            </div>
          </div>

          <button
            onClick={() => fetchDashboardData(true)}
            disabled={refreshing}
            className="self-start sm:self-auto px-4 py-2 bg-white/20 backdrop-blur hover:bg-white/30 rounded-xl transition-all flex items-center gap-2 text-white font-medium text-sm disabled:opacity-50"
          >
            <ArrowPathIcon className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* =========================
          STAT CARDS
      ========================== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.06 }}
              className="group bg-white rounded-2xl p-4 md:p-5 shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-0.5 transition-all"
            >
              <div className="flex items-start justify-between mb-3 md:mb-4">
                <div
                  className={`w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-md`}
                >
                  <Icon className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>
                <div className="hidden sm:flex items-center gap-1 text-[10px] md:text-xs font-semibold px-2 py-1 rounded-lg bg-emerald-50 text-emerald-600">
                  <ArrowTrendingUpIcon className="w-3 h-3" />
                  {stat.change}
                </div>
              </div>
              <p className="text-lg md:text-2xl font-bold text-gray-900 truncate">
                {stat.value}
              </p>
              <p className="text-xs md:text-sm text-gray-500 mt-0.5">
                {stat.title}
              </p>
            </motion.div>
          );
        })}
      </div>

      {/* =========================
          ORDER STATUS + QUICK ACTIONS
      ========================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Order Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6"
        >
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <div>
              <h2 className="text-base md:text-lg font-bold text-gray-900 flex items-center gap-2">
                <ChartBarIcon className="w-5 h-5 text-amber-500" />
                Order Status
              </h2>
              <p className="text-xs md:text-sm text-gray-400 mt-0.5">
                Real-time order distribution
              </p>
            </div>
            <Link
              to="/admin/orders"
              className="text-xs md:text-sm text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1"
            >
              View All
              <EyeIcon className="w-4 h-4" />
            </Link>
          </div>

          {stats?.orders &&
          Object.keys(stats.orders).filter((k) => k !== 'total').length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 md:gap-3">
              {Object.entries(stats.orders).map(([status, count]) => {
                if (status === 'total') return null;
                const meta = ORDER_STATUS_META[status] || {
                  bg: 'bg-gray-100',
                  text: 'text-gray-700',
                  Icon: DocumentTextIcon,
                };
                const Icon = meta.Icon;

                return (
                  <div
                    key={status}
                    className="p-3 md:p-4 bg-gray-50/80 rounded-xl text-center hover:bg-gray-100 transition-all"
                  >
                    <div
                      className={`inline-flex p-1.5 md:p-2 rounded-lg mb-1.5 md:mb-2 ${meta.bg} ${meta.text}`}
                    >
                      <Icon className="w-3.5 h-3.5 md:w-4 md:h-4" />
                    </div>
                    <p className="text-xl md:text-2xl font-bold text-gray-900">
                      {count}
                    </p>
                    <p className="text-[10px] md:text-xs text-gray-500 capitalize mt-0.5">
                      {status}
                    </p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <ShoppingBagIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No orders yet</p>
            </div>
          )}
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6"
        >
          <h2 className="text-base md:text-lg font-bold text-gray-900 flex items-center gap-2 mb-4 md:mb-5">
            <SparklesIcon className="w-5 h-5 text-amber-500" />
            Quick Actions
          </h2>

          <div className="space-y-2">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.to}
                  to={action.to}
                  className={`flex items-center justify-between px-3 md:px-4 py-2.5 md:py-3 bg-gradient-to-r ${action.from} ${action.to2} ${action.text} rounded-xl hover:shadow-sm transition-all group`}
                >
                  <span className="font-medium flex items-center gap-2.5 text-sm">
                    <Icon className="w-4 h-4" />
                    {action.label}
                  </span>
                  <ArrowRightIcon className="w-4 h-4 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                </Link>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* =========================
          RECENT ORDERS
      ========================== */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
      >
        <div className="p-4 md:p-6 border-b border-gray-100 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base md:text-lg font-bold text-gray-900 flex items-center gap-2">
              <ClockIcon className="w-5 h-5 text-amber-500" />
              Recent Orders
            </h2>
            <p className="text-xs md:text-sm text-gray-400 mt-0.5">
              Latest customer orders
            </p>
          </div>
          <Link
            to="/admin/orders"
            className="text-xs md:text-sm font-medium text-amber-600 hover:text-amber-700 flex items-center gap-1 flex-shrink-0"
          >
            View All
            <EyeIcon className="w-4 h-4" />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingBagIcon className="w-8 h-8 text-gray-300" />
            </div>
            <p className="font-medium text-gray-600">No orders yet</p>
            <p className="text-sm text-gray-400 mt-1">
              Orders will appear once customers place them.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop / Tablet table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-100">
                    <th className="text-left py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Order
                    </th>
                    <th className="text-left py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="text-left py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="text-left py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-left py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order, index) => {
                    const status = order?.status?.toLowerCase() || 'pending';
                    const meta = ORDER_STATUS_META[status] || {
                      bg: 'bg-gray-100',
                      text: 'text-gray-700',
                      Icon: DocumentTextIcon,
                    };
                    const Icon = meta.Icon;

                    return (
                      <motion.tr
                        key={order?.id || order?._id || index}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: Math.min(index * 0.03, 0.3) }}
                        className="border-b border-gray-50 hover:bg-amber-50/20 transition-colors"
                      >
                        <td className="py-3 px-6">
                          <span className="font-semibold text-gray-900 text-sm">
                            #{order?.order_number || order?.id?.slice(0, 8) || '-'}
                          </span>
                        </td>
                        <td className="py-3 px-6">
                          <p className="text-sm font-medium text-gray-700 truncate max-w-[180px]">
                            {order?.user_name || 'Guest'}
                          </p>
                          <p className="text-xs text-gray-400 truncate max-w-[180px]">
                            {order?.user_email || ''}
                          </p>
                        </td>
                        <td className="py-3 px-6">
                          <p className="text-sm font-bold text-gray-900">
                            ₹
                            {Number(
                              order?.total_price || order?.total || 0
                            ).toFixed(2)}
                          </p>
                        </td>
                        <td className="py-3 px-6">
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize inline-flex items-center gap-1.5 ${meta.bg} ${meta.text}`}
                          >
                            <Icon className="w-3 h-3" />
                            {status}
                          </span>
                        </td>
                        <td className="py-3 px-6">
                          <span className="text-sm text-gray-500 whitespace-nowrap">
                            {order?.created_at
                              ? new Date(order.created_at).toLocaleDateString(
                                  'en-IN',
                                  {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric',
                                  }
                                )
                              : '-'}
                          </span>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile card view */}
            <div className="md:hidden divide-y divide-gray-100">
              {recentOrders.map((order, index) => {
                const status = order?.status?.toLowerCase() || 'pending';
                const meta = ORDER_STATUS_META[status] || {
                  bg: 'bg-gray-100',
                  text: 'text-gray-700',
                  Icon: DocumentTextIcon,
                };
                const Icon = meta.Icon;

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
                        <p className="font-semibold text-gray-900 text-sm">
                          #{order?.order_number || '-'}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {order?.user_name || 'Guest'}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-medium capitalize inline-flex items-center gap-1 flex-shrink-0 ${meta.bg} ${meta.text}`}
                      >
                        <Icon className="w-3 h-3" />
                        {status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-gray-900">
                        ₹
                        {Number(order?.total_price || order?.total || 0).toFixed(
                          2
                        )}
                      </span>
                      <span className="text-xs text-gray-400">
                        {order?.created_at
                          ? new Date(order.created_at).toLocaleDateString(
                              'en-IN',
                              { day: 'numeric', month: 'short' }
                            )
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