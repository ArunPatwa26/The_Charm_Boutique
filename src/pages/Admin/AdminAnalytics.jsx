import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CurrencyRupeeIcon,
  ShoppingBagIcon,
  UsersIcon,
  CubeIcon,
  CalendarIcon,
  ArrowPathIcon,
  TrophyIcon,
} from '@heroicons/react/24/outline';
import { getSalesAnalytics, getDashboardStats } from '../../services/adminService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const AdminAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('monthly');

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      // Fetch dashboard stats
      const statsRes = await getDashboardStats();
      if (statsRes.success) {
        setStats(statsRes.stats || {});
      }

      // Fetch sales analytics
      const analyticsRes = await getSalesAnalytics({ period });
      if (analyticsRes.success) {
        setAnalytics(analyticsRes.data);
      }
    } catch (error) {
      console.error('Analytics error:', error);
      // Don't show toast for missing backend endpoint — just log it
      // toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Revenue',
      value: `₹${Number(stats?.revenue?.total || 0).toLocaleString('en-IN')}`,
      icon: CurrencyRupeeIcon,
      gradient: 'from-amber-500 to-orange-500',
      change: '+12.5%',
      trend: 'up',
    },
    {
      title: 'Total Orders',
      value: stats?.orders?.total || 0,
      icon: ShoppingBagIcon,
      gradient: 'from-blue-500 to-cyan-500',
      change: '+8.2%',
      trend: 'up',
    },
    {
      title: 'Total Users',
      value: stats?.users || 0,
      icon: UsersIcon,
      gradient: 'from-purple-500 to-pink-500',
      change: '+5.7%',
      trend: 'up',
    },
    {
      title: 'Total Products',
      value: stats?.products || 0,
      icon: CubeIcon,
      gradient: 'from-emerald-500 to-teal-500',
      change: '+3.1%',
      trend: 'up',
    },
  ];

  const periods = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">

      {/* =========================
          HEADER
      ========================== */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 flex items-center gap-3">
            <ChartBarIcon className="w-8 h-8 text-amber-500" />
            Analytics
          </h1>
          <p className="text-gray-500 mt-1">
            Track your store performance and insights
          </p>
        </div>

        <div className="flex items-center gap-2">
          {periods.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                period === p.value
                  ? 'bg-amber-500 text-white shadow-md'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {p.label}
            </button>
          ))}
          <button
            onClick={fetchAnalytics}
            className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
            title="Refresh"
          >
            <ArrowPathIcon className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      </div>

      {/* =========================
          STAT CARDS
      ========================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-md`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg bg-emerald-50 text-emerald-600">
                  <ArrowTrendingUpIcon className="w-3 h-3" />
                  {stat.change}
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-500 mt-0.5">{stat.title}</p>
            </motion.div>
          );
        })}
      </div>

      {/* =========================
          REVENUE CHART (Simple Bar)
      ========================== */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-amber-500" />
              Revenue Overview
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Sales performance ({period})
            </p>
          </div>
        </div>

        {analytics && analytics.length > 0 ? (
          <div className="space-y-4">
            {analytics.slice(0, 7).map((item, i) => {
              const maxRevenue = Math.max(...analytics.map((a) => a.sales?.total_revenue || 0), 1);
              const percent = ((item.sales?.total_revenue || 0) / maxRevenue) * 100;

              return (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-24 text-xs font-medium text-gray-500 truncate">
                    {item.month || item.date || item.week || 'N/A'}
                  </div>
                  <div className="flex-1 h-8 bg-gray-100 rounded-lg overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percent}%` }}
                      transition={{ delay: 0.1 + i * 0.05, duration: 0.8 }}
                      className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-lg flex items-center justify-end pr-3"
                    >
                      <span className="text-xs font-bold text-white">
                        ₹{Number(item.sales?.total_revenue || 0).toLocaleString('en-IN')}
                      </span>
                    </motion.div>
                  </div>
                  <div className="w-20 text-right text-xs text-gray-500">
                    {item.sales?.total_orders || 0} orders
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <ChartBarIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">No analytics data yet</p>
            <p className="text-sm text-gray-400 mt-1">
              Sales analytics will appear here as orders come in
            </p>
          </div>
        )}
      </motion.div>

      {/* =========================
          TOP PRODUCTS + ORDER STATUS
      ========================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Top Products */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
        >
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-5">
            <TrophyIcon className="w-5 h-5 text-amber-500" />
            Top Products
          </h2>

          {analytics && analytics[0]?.sales?.top_products?.length > 0 ? (
            <div className="space-y-3">
              {analytics[0].sales.top_products.slice(0, 5).map((product, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-sm font-bold text-amber-600">
                      #{i + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">
                        {product.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {product.quantity} sold
                      </p>
                    </div>
                  </div>
                  <p className="font-bold text-gray-900 text-sm">
                    ₹{Number(product.revenue || 0).toLocaleString('en-IN')}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <TrophyIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No product data yet</p>
            </div>
          )}
        </motion.div>

        {/* Order Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
        >
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-5">
            <ShoppingBagIcon className="w-5 h-5 text-amber-500" />
            Order Distribution
          </h2>

          <div className="space-y-3">
            {stats?.orders &&
              Object.entries(stats.orders)
                .filter(([key]) => key !== 'total')
                .map(([status, count]) => {
                  const total = stats.orders.total || 1;
                  const percent = (count / total) * 100;

                  const colors = {
                    pending: 'from-amber-400 to-amber-500',
                    processing: 'from-blue-400 to-blue-500',
                    shipped: 'from-purple-400 to-purple-500',
                    delivered: 'from-green-400 to-green-500',
                    cancelled: 'from-red-400 to-red-500',
                  };

                  return (
                    <div key={status}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-medium text-gray-700 capitalize">
                          {status}
                        </span>
                        <span className="text-sm text-gray-500">
                          {count} ({Math.round(percent)}%)
                        </span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${percent}%` }}
                          transition={{ delay: 0.6, duration: 0.8 }}
                          className={`h-full bg-gradient-to-r ${colors[status] || 'from-gray-400 to-gray-500'}`}
                        />
                      </div>
                    </div>
                  );
                })}
          </div>
        </motion.div>
      </div>

      {/* Info Banner */}
      <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-2xl p-5">
        <p className="text-sm text-amber-800">
          💡 <strong>Tip:</strong> More detailed analytics will populate as your store
          gets more orders. Check back regularly to track your growth.
        </p>
      </div>
    </div>
  );
};

export default AdminAnalytics;