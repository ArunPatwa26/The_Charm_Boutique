import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

import {
  ShoppingBagIcon,
  UsersIcon,
  CurrencyRupeeIcon,
  TagIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ClockIcon,
  CheckCircleIcon,
  TruckIcon,
  XCircleIcon,
  SparklesIcon,
  ChartBarIcon,
  CubeIcon,
  UserGroupIcon,
  DocumentTextIcon,
  EyeIcon,
  PlusIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';

import { getDashboardStats } from '../../services/adminService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await getDashboardStats();
      if (response?.success) {
        setStats(response.stats || {});
        setRecentOrders(response.recent_orders || []);
      } else {
        toast.error(response?.message || 'Failed to load dashboard data');
      }
    } catch (error) {
      console.error('Dashboard error:', error);
      toast.error(error?.response?.data?.detail || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const orderStatusColors = {
    pending: 'bg-amber-100 text-amber-700',
    processing: 'bg-blue-100 text-blue-700',
    shipped: 'bg-purple-100 text-purple-700',
    delivered: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
  };

  const orderStatusIcons = {
    pending: ClockIcon,
    processing: SparklesIcon,
    shipped: TruckIcon,
    delivered: CheckCircleIcon,
    cancelled: XCircleIcon,
  };

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
      trend: 'up',
    },
    {
      title: 'Orders',
      value: stats?.orders?.total || 0,
      icon: ShoppingBagIcon,
      gradient: 'from-blue-500 to-cyan-500',
      change: '+8.2%',
      trend: 'up',
    },
    {
      title: 'Users',
      value: stats?.users || 0,
      icon: UsersIcon,
      gradient: 'from-purple-500 to-pink-500',
      change: '+5.7%',
      trend: 'up',
    },
    {
      title: 'Products',
      value: stats?.products || 0,
      icon: TagIcon,
      gradient: 'from-emerald-500 to-teal-500',
      change: '+3.1%',
      trend: 'up',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* =========================
          HEADER
      ========================== */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500 via-yellow-500 to-amber-600 p-8 mb-8">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
                <SparklesIcon className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white">Dashboard</h1>
                <p className="text-white/80 text-sm mt-0.5">Manage your jewellery store</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-4 py-2 bg-white/20 backdrop-blur rounded-xl text-sm text-white font-medium flex items-center gap-2">
              <ClockIcon className="w-4 h-4" />
              {new Date().toLocaleDateString('en-IN', { 
                weekday: 'short',
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              })}
            </div>
            <button
              onClick={fetchDashboardData}
              className="px-4 py-2 bg-white/20 backdrop-blur hover:bg-white/30 rounded-xl transition-all flex items-center gap-2 text-white font-medium text-sm"
            >
              <ArrowPathIcon className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* =========================
          STATS CARDS
      ========================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              className="group bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all hover:-translate-y-1"
            >
              <div className="flex items-start justify-between">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-md`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className={`flex items-center gap-1 text-sm font-medium px-2 py-1 rounded-lg ${
                  stat.trend === 'up' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                }`}>
                  {stat.trend === 'up' ? (
                    <ArrowTrendingUpIcon className="w-3 h-3" />
                  ) : (
                    <ArrowTrendingDownIcon className="w-3 h-3" />
                  )}
                  {stat.change}
                </div>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-500 mt-0.5">{stat.title}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* =========================
          TWO COLUMN LAYOUT
      ========================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

        {/* =========================
            ORDER STATUS - LEFT
        ========================== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <ChartBarIcon className="w-5 h-5 text-amber-500" />
                Order Status
              </h2>
              <p className="text-sm text-gray-400 mt-0.5">Real-time order distribution</p>
            </div>
            <Link
              to="/admin/orders"
              className="text-sm text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1"
            >
              View All
              <EyeIcon className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {stats?.orders && Object.entries(stats.orders).map(([status, count]) => {
              if (status === 'total') return null;
              const StatusIcon = orderStatusIcons[status] || DocumentTextIcon;
              const statusColor = orderStatusColors[status] || 'bg-gray-100 text-gray-700';
              
              return (
                <div
                  key={status}
                  className="p-4 bg-gray-50/80 rounded-xl text-center hover:bg-gray-100 transition-all"
                >
                  <div className={`inline-flex p-2 rounded-lg mb-2 ${statusColor}`}>
                    <StatusIcon className="w-4 h-4" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{count}</p>
                  <p className="text-xs text-gray-500 capitalize mt-0.5">{status}</p>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* =========================
            QUICK ACTIONS - RIGHT
        ========================== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
        >
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-5">
            <SparklesIcon className="w-5 h-5 text-amber-500" />
            Quick Actions
          </h2>

          <div className="space-y-2.5">
            <Link
              to="/admin/products"
              className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 rounded-xl hover:from-amber-100 hover:to-orange-100 transition-all group"
            >
              <span className="font-medium flex items-center gap-2.5 text-sm">
                <CubeIcon className="w-4 h-4" />
                Products
              </span>
              <PlusIcon className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>

            <Link
              to="/admin/orders"
              className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 rounded-xl hover:from-blue-100 hover:to-indigo-100 transition-all group"
            >
              <span className="font-medium flex items-center gap-2.5 text-sm">
                <ShoppingBagIcon className="w-4 h-4" />
                Orders
              </span>
              <EyeIcon className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>

            <Link
              to="/admin/categories"
              className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 rounded-xl hover:from-purple-100 hover:to-pink-100 transition-all group"
            >
              <span className="font-medium flex items-center gap-2.5 text-sm">
                <TagIcon className="w-4 h-4" />
                Categories
              </span>
              <PlusIcon className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>

            <button
              type="button"
              onClick={() => toast.success('Analytics coming soon!')}
              className="flex items-center justify-between w-full px-4 py-3 bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 rounded-xl hover:from-emerald-100 hover:to-green-100 transition-all group"
            >
              <span className="font-medium flex items-center gap-2.5 text-sm">
                <UserGroupIcon className="w-4 h-4" />
                Analytics
              </span>
              <ChartBarIcon className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          </div>
        </motion.div>
      </div>

      {/* =========================
          RECENT ORDERS TABLE
      ========================== */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
      >
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <ClockIcon className="w-5 h-5 text-amber-500" />
                Recent Orders
              </h2>
              <p className="text-sm text-gray-400 mt-0.5">Latest customer orders</p>
            </div>
            <Link
              to="/admin/orders"
              className="text-sm font-medium text-amber-600 hover:text-amber-700 flex items-center gap-1"
            >
              View All
              <EyeIcon className="w-4 h-4" />
            </Link>
          </div>
        </div>

        <div className="overflow-x-auto">
          {recentOrders.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingBagIcon className="w-8 h-8 text-gray-300" />
              </div>
              <p className="font-medium text-gray-600">No orders yet</p>
              <p className="text-sm text-gray-400 mt-1">Orders will appear once customers place them.</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100">
                  <th className="text-left py-3.5 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Order</th>
                  <th className="text-left py-3.5 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="text-left py-3.5 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="text-left py-3.5 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-left py-3.5 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order, index) => {
                  const status = order?.status?.toLowerCase() || 'pending';
                  const statusColor = orderStatusColors[status] || 'bg-gray-100 text-gray-700';
                  const StatusIcon = orderStatusIcons[status] || DocumentTextIcon;

                  return (
                    <motion.tr
                      key={order?.id || order?._id || index}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.04 }}
                      className="border-b border-gray-50 hover:bg-amber-50/20 transition-colors"
                    >
                      <td className="py-3.5 px-6">
                        <span className="font-semibold text-gray-900 text-sm">
                          #{order?.order_number || order?.id?.slice(0, 8) || '-'}
                        </span>
                      </td>
                      <td className="py-3.5 px-6">
                        <p className="text-sm font-medium text-gray-700">
                          {order?.user_name || order?.customer_name || 'Guest'}
                        </p>
                        <p className="text-xs text-gray-400">{order?.user_email || ''}</p>
                      </td>
                      <td className="py-3.5 px-6">
                        <p className="text-sm font-bold text-gray-900">
                          ₹{Number(order?.total_price || order?.total || 0).toFixed(2)}
                        </p>
                      </td>
                      <td className="py-3.5 px-6">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize flex items-center gap-1.5 w-fit ${statusColor}`}>
                          <StatusIcon className="w-3 h-3" />
                          {status}
                        </span>
                      </td>
                      <td className="py-3.5 px-6">
                        <span className="text-sm text-gray-500">
                          {order?.created_at ? new Date(order.created_at).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          }) : '-'}
                        </span>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default AdminDashboard;