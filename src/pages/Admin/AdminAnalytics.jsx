import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  ArrowPathIcon,
  CurrencyRupeeIcon,
  ShoppingBagIcon,
  UsersIcon,
  CubeIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  TrophyIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowUpRightIcon,
  ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';

import {
  getSalesAnalytics,
  getDashboardStats,
} from '../../services/adminService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

// ==========================================
// CONFIG
// ==========================================
const PERIODS = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
];

const STATUS_COLORS = {
  pending: '#8B3A3A',
  processing: '#3B82F6',
  shipped: '#8B5CF6',
  delivered: '#10B981',
  cancelled: '#EF4444',
};

// ==========================================
// HELPERS
// ==========================================
const formatINR = (v) =>
  `₹${Number(v || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

const formatShortINR = (v) => {
  const n = Number(v || 0);
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)}Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`;
  return `₹${n.toFixed(0)}`;
};

// ==========================================
// CSV EXPORT
// ==========================================
const csvEscape = (value) => {
  const s = String(value ?? '');
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
};

const downloadCSV = (filename, rows) => {
  const csv = rows.map((row) => row.map(csvEscape).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// ==========================================
// PAYMENT STAT SUBCOMPONENT
// ==========================================
const PaymentStat = ({ icon, label, value, color }) => {
  const colorMap = {
    green: 'text-green-700 bg-green-50',
    blue: 'text-blue-700 bg-blue-50',
    red: 'text-red-600 bg-red-50',
  };

  return (
    <div className="text-center p-3 rounded-lg bg-cream-50 border border-line">
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2 ${
          colorMap[color] || 'text-ink-500 bg-cream-100'
        }`}
      >
        {icon}
      </div>
      <p className="font-serif text-lg font-bold text-ink-800">{value}</p>
      <p className="text-[10px] uppercase tracking-wider text-ink-500 font-medium mt-0.5">
        {label}
      </p>
    </div>
  );
};

// ==========================================
// MAIN
// ==========================================
const AdminAnalytics = () => {
  const [analytics, setAnalytics] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [period, setPeriod] = useState('monthly');
  const [lastUpdated, setLastUpdated] = useState(null);

  const visibilityRef = useRef(true);

  // ==========================================
  // FETCH
  // ==========================================
  const fetchAll = useCallback(
    async (showSpinner = false, silent = false) => {
      if (showSpinner) setRefreshing(true);
      else if (!silent) setLoading(true);

      try {
        const [statsRes, analyticsRes] = await Promise.all([
          getDashboardStats(),
          getSalesAnalytics({ period }),
        ]);
        if (statsRes?.success) setStats(statsRes.stats || {});
        if (analyticsRes?.success) setAnalytics(analyticsRes.data || []);
        setLastUpdated(new Date());
      } catch (err) {
        console.error('Analytics error:', err);
        if (!silent) toast.error('Failed to load analytics');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [period]
  );

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // ==========================================
  // AUTO-REFRESH EVERY 2 MIN WHILE TAB VISIBLE
  // ==========================================
  useEffect(() => {
    const handleVisibility = () => {
      visibilityRef.current = document.visibilityState === 'visible';
    };
    document.addEventListener('visibilitychange', handleVisibility);

    const interval = setInterval(() => {
      if (visibilityRef.current) {
        fetchAll(false, true);
      }
    }, 120000); // 2 minutes

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [fetchAll]);

  // ==========================================
  // DERIVED DATA
  // ==========================================
  const derived = useMemo(() => {
    const flat = (analytics || []).map((item) => ({
      label: item.month || item.date || item.week || '—',
      revenue: Number(item.sales?.total_revenue || 0),
      orders: Number(item.sales?.total_orders || 0),
      topProducts: item.sales?.top_products || [],
    }));

    const totalRevenue = flat.reduce((s, i) => s + i.revenue, 0);
    const totalOrders = flat.reduce((s, i) => s + i.orders, 0);
    const aov = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Trend: last vs previous
    const curr = flat[flat.length - 1]?.revenue || 0;
    const prev = flat[flat.length - 2]?.revenue || 0;
    const revGrowth = prev > 0 ? ((curr - prev) / prev) * 100 : 0;

    const currOrd = flat[flat.length - 1]?.orders || 0;
    const prevOrd = flat[flat.length - 2]?.orders || 0;
    const ordGrowth = prevOrd > 0 ? ((currOrd - prevOrd) / prevOrd) * 100 : 0;

    // Aggregated top products
    const productsMap = {};
    flat.forEach((item) => {
      item.topProducts.forEach((p) => {
        if (!productsMap[p.name]) {
          productsMap[p.name] = { name: p.name, quantity: 0, revenue: 0 };
        }
        productsMap[p.name].quantity += Number(p.quantity || 0);
        productsMap[p.name].revenue += Number(p.revenue || 0);
      });
    });
    const topProducts = Object.values(productsMap)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 6);

    const totalProductRevenue = topProducts.reduce((s, p) => s + p.revenue, 0);

    // Order status — now includes cancelled
    const orderStatus = stats?.orders || {};
    const orderStatusArr = Object.entries(orderStatus)
      .filter(([k]) => k !== 'total')
      .map(([status, count]) => ({ status, count: Number(count || 0) }))
      .filter((item) => item.count > 0);

    const totalStatusCount =
      orderStatusArr.reduce((s, i) => s + i.count, 0) || 1;

    // Payment health
    const payments = stats?.payments || {};
    const paymentHealth = {
      verified: Number(payments.verified || 0),
      pending: Number(payments.pending || 0),
      rejected: Number(payments.rejected || 0),
      verifiedAmount: Number(payments.verified_amount || 0),
    };

    // Low stock
    const lowStock = (stats?.low_stock_products || []).slice(0, 5);

    return {
      flat,
      totalRevenue,
      totalOrders,
      aov,
      revGrowth,
      ordGrowth,
      topProducts,
      totalProductRevenue,
      orderStatusArr,
      totalStatusCount,
      paymentHealth,
      lowStock,
    };
  }, [analytics, stats]);

  // ==========================================
  // EXPORT TO CSV
  // ==========================================
  const handleExport = () => {
    if (derived.flat.length === 0 && derived.topProducts.length === 0) {
      return toast.error('Nothing to export yet');
    }

    const rows = [];

    // Header block
    rows.push(['The Charm Boutique — Analytics Report']);
    rows.push(['Generated', new Date().toLocaleString('en-IN')]);
    rows.push(['Period', period]);
    rows.push([]);

    // Summary
    rows.push(['Summary']);
    rows.push(['Metric', 'Value']);
    rows.push(['Total Revenue', derived.totalRevenue]);
    rows.push(['Total Orders', derived.totalOrders]);
    rows.push(['Avg. Order Value', derived.aov.toFixed(2)]);
    rows.push(['Customers', Number(stats?.users || 0)]);
    rows.push(['Products', Number(stats?.products || 0)]);
    rows.push([]);

    // Payment Health
    rows.push(['Payment Health']);
    rows.push(['Metric', 'Count', 'Amount']);
    rows.push(['Verified', derived.paymentHealth.verified, derived.paymentHealth.verifiedAmount]);
    rows.push(['Pending', derived.paymentHealth.pending, '']);
    rows.push(['Rejected', derived.paymentHealth.rejected, '']);
    rows.push([]);

    // Revenue Trend
    rows.push(['Revenue Trend']);
    rows.push(['Period', 'Revenue', 'Orders']);
    derived.flat.forEach((item) => {
      rows.push([item.label, item.revenue, item.orders]);
    });
    rows.push([]);

    // Top Products
    rows.push(['Top Products']);
    rows.push(['Rank', 'Product', 'Units Sold', 'Revenue', 'Share %']);
    derived.topProducts.forEach((p, i) => {
      const share =
        derived.totalProductRevenue > 0
          ? (p.revenue / derived.totalProductRevenue) * 100
          : 0;
      rows.push([i + 1, p.name, p.quantity, p.revenue, share.toFixed(2)]);
    });
    rows.push([]);

    // Order Status
    rows.push(['Order Status Distribution']);
    rows.push(['Status', 'Count', 'Percent']);
    derived.orderStatusArr.forEach((item) => {
      const pct = ((item.count / derived.totalStatusCount) * 100).toFixed(1);
      rows.push([item.status, item.count, pct]);
    });
    rows.push([]);

    // Low Stock
    rows.push(['Low Stock Products']);
    rows.push(['Product', 'Stock']);
    derived.lowStock.forEach((p) => {
      rows.push([p.name, p.stock]);
    });

    const filename = `charm-boutique-analytics-${period}-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;

    downloadCSV(filename, rows);
    toast.success('Analytics exported');
  };

  // ==========================================
  // LOADING
  // ==========================================
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // ==========================================
  // KPI CARDS
  // ==========================================
  const kpis = [
    {
      label: 'Total Revenue',
      value: formatINR(derived.totalRevenue),
      sub: 'Across selected period',
      icon: CurrencyRupeeIcon,
      growth: derived.revGrowth,
    },
    {
      label: 'Total Orders',
      value: derived.totalOrders,
      sub: `${formatINR(derived.aov)} avg. order value`,
      icon: ShoppingBagIcon,
      growth: derived.ordGrowth,
    },
    {
      label: 'Customers',
      value: Number(stats?.users || 0),
      sub: 'Registered accounts',
      icon: UsersIcon,
      growth: null,
    },
    {
      label: 'Products',
      value: Number(stats?.products || 0),
      sub: 'Active in catalog',
      icon: CubeIcon,
      growth: null,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto pb-8 space-y-6">
      {/* ==========================================
          HEADER
      ========================================== */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-kicker font-semibold text-ink-500 mb-2">
            Insights
          </p>
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-ink-800">
            Analytics
          </h1>
          <p className="text-xs md:text-sm text-ink-500 mt-1.5">
            Track performance, trends, and store health
            {lastUpdated && (
              <span className="text-ink-400">
                {' '}
                · Updated {lastUpdated.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 p-1 bg-white border border-line rounded">
            {PERIODS.map((p) => (
              <button
                key={p.value}
                onClick={() => setPeriod(p.value)}
                className={`px-3 py-1.5 rounded text-[11px] uppercase tracking-wider font-semibold transition-colors ${
                  period === p.value
                    ? 'bg-ink-800 text-cream-100'
                    : 'text-ink-600 hover:bg-cream-100'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <button
            onClick={handleExport}
            className="inline-flex items-center gap-1.5 px-3 py-2 border border-line bg-white rounded text-[11px] uppercase tracking-wider font-semibold text-ink-700 hover:border-ink-800 transition-colors"
            title="Export to CSV"
          >
            <ArrowDownTrayIcon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export</span>
          </button>

          <button
            onClick={() => fetchAll(true)}
            disabled={refreshing}
            className="p-2 border border-line bg-white rounded hover:border-ink-800 transition-colors disabled:opacity-50"
            title="Refresh"
            aria-label="Refresh"
          >
            <ArrowPathIcon
              className={`w-4 h-4 text-ink-700 ${refreshing ? 'animate-spin' : ''}`}
            />
          </button>
        </div>
      </div>

      {/* ==========================================
          KPI CARDS
      ========================================== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {kpis.map((kpi, i) => {
          const Icon = kpi.icon;
          const isPositive = kpi.growth > 0;
          const isNegative = kpi.growth < 0;

          return (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white border border-line rounded-lg p-4 md:p-5"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-9 h-9 md:w-10 md:h-10 rounded-lg bg-ink-800 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 md:w-5 md:h-5 text-cream-100" />
                </div>
                {kpi.growth !== null && (
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded ${
                      isPositive
                        ? 'text-green-700 bg-green-50'
                        : isNegative
                        ? 'text-red-600 bg-red-50'
                        : 'text-ink-500 bg-cream-100'
                    }`}
                  >
                    {isPositive ? (
                      <ArrowTrendingUpIcon className="w-3 h-3" />
                    ) : isNegative ? (
                      <ArrowTrendingDownIcon className="w-3 h-3" />
                    ) : null}
                    {Math.abs(kpi.growth).toFixed(1)}%
                  </span>
                )}
              </div>
              <p className="font-serif text-lg md:text-2xl font-bold text-ink-800 truncate">
                {kpi.value}
              </p>
              <p className="text-[10px] uppercase tracking-wider text-ink-500 font-medium mt-1">
                {kpi.label}
              </p>
              <p className="text-[10px] text-ink-400 mt-1.5 truncate">{kpi.sub}</p>
            </motion.div>
          );
        })}
      </div>

      {/* ==========================================
          REVENUE TREND
      ========================================== */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-line rounded-lg p-4 md:p-6"
      >
        <div className="flex items-end justify-between mb-5">
          <div>
            <p className="text-[11px] uppercase tracking-kicker font-semibold text-ink-500">
              Revenue Trend
            </p>
            <p className="text-xs text-ink-500 mt-1.5">
              Sales performance · {period}
            </p>
          </div>
          {derived.flat.length > 0 && (
            <div className="text-right">
              <p className="font-serif text-lg md:text-xl font-bold text-ink-800">
                {formatINR(derived.totalRevenue)}
              </p>
              <p className="text-[10px] uppercase tracking-wider text-ink-500">
                Total
              </p>
            </div>
          )}
        </div>

        {derived.flat.length > 0 ? (
          <div className="w-full h-64 md:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={derived.flat}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="revGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8B3A3A" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#8B3A3A" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="2 4" stroke="#E8E3DC" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 10, fill: '#9A9A9A' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: '#9A9A9A' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={formatShortINR}
                />
                <Tooltip
                  contentStyle={{
                    background: '#fff',
                    border: '1px solid #E8E3DC',
                    borderRadius: '4px',
                    fontSize: '12px',
                  }}
                  formatter={(value) => [formatINR(value), 'Revenue']}
                  labelStyle={{ color: '#6B6B6B', fontSize: 11 }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#8B3A3A"
                  strokeWidth={2}
                  fill="url(#revGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-sm text-ink-500">No revenue data yet</p>
            <p className="text-xs text-ink-400 mt-1">
              Analytics will populate as orders come in
            </p>
          </div>
        )}
      </motion.div>

      {/* ==========================================
          ORDERS TREND + STATUS
      ========================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-5">
        {/* Orders bar chart */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white border border-line rounded-lg p-4 md:p-6"
        >
          <p className="text-[11px] uppercase tracking-kicker font-semibold text-ink-500 mb-5">
            Orders per Period
          </p>

          {derived.flat.length > 0 ? (
            <div className="w-full h-56 md:h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={derived.flat}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="2 4" stroke="#E8E3DC" vertical={false} />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 10, fill: '#9A9A9A' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: '#9A9A9A' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: '#fff',
                      border: '1px solid #E8E3DC',
                      borderRadius: '4px',
                      fontSize: '12px',
                    }}
                    formatter={(v) => [v, 'Orders']}
                    labelStyle={{ color: '#6B6B6B', fontSize: 11 }}
                  />
                  <Bar dataKey="orders" fill="#8B3A3A" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-sm text-ink-500">No orders yet</p>
            </div>
          )}
        </motion.div>

        {/* Order status donut — includes cancelled */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white border border-line rounded-lg p-4 md:p-6"
        >
          <p className="text-[11px] uppercase tracking-kicker font-semibold text-ink-500 mb-5">
            Order Status
          </p>

          {derived.orderStatusArr.length > 0 ? (
            <div className="space-y-4">
              <div className="w-full h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={derived.orderStatusArr}
                      dataKey="count"
                      nameKey="status"
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={2}
                    >
                      {derived.orderStatusArr.map((entry) => (
                        <Cell
                          key={entry.status}
                          fill={STATUS_COLORS[entry.status] || '#9A9A9A'}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: '#fff',
                        border: '1px solid #E8E3DC',
                        borderRadius: '4px',
                        fontSize: '12px',
                      }}
                      formatter={(v, n) => [`${v} orders`, n]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-2">
                {derived.orderStatusArr.map((item) => {
                  const pct = Math.round(
                    (item.count / derived.totalStatusCount) * 100
                  );
                  return (
                    <div
                      key={item.status}
                      className="flex items-center justify-between text-xs"
                    >
                      <span className="flex items-center gap-2">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{
                            background:
                              STATUS_COLORS[item.status] || '#9A9A9A',
                          }}
                        />
                        <span className="capitalize text-ink-700">
                          {item.status}
                        </span>
                      </span>
                      <span className="text-ink-500">
                        {item.count} · {pct}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-sm text-ink-500">No orders yet</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* ==========================================
          PAYMENT HEALTH + LOW STOCK
      ========================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-5">
        {/* Payment health */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white border border-line rounded-lg p-4 md:p-6"
        >
          <div className="mb-5">
            <p className="text-[11px] uppercase tracking-kicker font-semibold text-ink-500">
              Payment Health
            </p>
            <p className="text-xs text-ink-500 mt-1.5">
              UPI verification pipeline
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-5">
            <PaymentStat
              icon={<CheckCircleIcon className="w-4 h-4" />}
              label="Verified"
              value={derived.paymentHealth.verified}
              color="green"
            />
            <PaymentStat
              icon={<ClockIcon className="w-4 h-4" />}
              label="Pending"
              value={derived.paymentHealth.pending}
              color="blue"
            />
            <PaymentStat
              icon={<XCircleIcon className="w-4 h-4" />}
              label="Rejected"
              value={derived.paymentHealth.rejected}
              color="red"
            />
          </div>

          {/* Verified amount — always shown */}
          <div className="border-t border-line pt-4">
            <div className="flex items-baseline justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-ink-500 font-medium mb-1">
                  Verified amount
                </p>
                <p className="font-serif text-xl font-bold text-ink-800">
                  {formatINR(derived.paymentHealth.verifiedAmount)}
                </p>
              </div>
              {derived.paymentHealth.pending > 0 && (
                <span className="text-[10px] uppercase tracking-wider font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                  {derived.paymentHealth.pending} awaiting
                </span>
              )}
            </div>
          </div>

          <button
            onClick={() => (window.location.href = '/admin/payments')}
            className="mt-5 w-full inline-flex items-center justify-center gap-1.5 py-2.5 border border-line rounded text-[11px] uppercase tracking-wider font-semibold text-ink-800 hover:border-ink-800 transition-colors"
          >
            Review Payments
            <ArrowUpRightIcon className="w-3 h-3" />
          </button>
        </motion.div>

        {/* Low stock */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-white border border-line rounded-lg p-4 md:p-6"
        >
          <div className="mb-5">
            <p className="text-[11px] uppercase tracking-kicker font-semibold text-ink-500">
              Low Stock Alert
            </p>
            <p className="text-xs text-ink-500 mt-1.5">
              Products needing restock
            </p>
          </div>

          {derived.lowStock.length > 0 ? (
            <div className="space-y-2">
              {derived.lowStock.map((product, i) => (
                <div
                  key={product.id || i}
                  className="flex items-center justify-between gap-3 p-2.5 border border-line rounded"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <ExclamationTriangleIcon className="w-4 h-4 text-amber-500 flex-shrink-0" />
                    <p className="text-sm text-ink-800 truncate">
                      {product.name}
                    </p>
                  </div>
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded flex-shrink-0">
                    {product.stock} left
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <CheckCircleIcon className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-sm text-ink-600 font-medium">All stocked up</p>
              <p className="text-xs text-ink-500 mt-1">
                No products running low
              </p>
            </div>
          )}
        </motion.div>
      </div>

      {/* ==========================================
          TOP PRODUCTS
      ========================================== */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white border border-line rounded-lg overflow-hidden"
      >
        <div className="p-4 md:p-6 border-b border-line flex items-end justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-kicker font-semibold text-ink-500">
              Top Products
            </p>
            <p className="text-xs text-ink-500 mt-1.5">
              Best sellers by revenue
            </p>
          </div>
          {derived.topProducts.length > 0 && (
            <TrophyIcon className="w-4 h-4 text-burgundy-500" />
          )}
        </div>

        {derived.topProducts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-line">
                  <th className="text-left py-3 px-4 md:px-6 text-[10px] font-semibold text-ink-500 uppercase tracking-wider">
                    #
                  </th>
                  <th className="text-left py-3 px-4 md:px-6 text-[10px] font-semibold text-ink-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="text-right py-3 px-4 md:px-6 text-[10px] font-semibold text-ink-500 uppercase tracking-wider">
                    Units
                  </th>
                  <th className="text-right py-3 px-4 md:px-6 text-[10px] font-semibold text-ink-500 uppercase tracking-wider">
                    Revenue
                  </th>
                  <th className="text-right py-3 px-4 md:px-6 text-[10px] font-semibold text-ink-500 uppercase tracking-wider hidden md:table-cell">
                    Share
                  </th>
                </tr>
              </thead>
              <tbody>
                {derived.topProducts.map((product, i) => {
                  const share =
                    derived.totalProductRevenue > 0
                      ? (product.revenue / derived.totalProductRevenue) * 100
                      : 0;
                  return (
                    <motion.tr
                      key={product.name}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.04 }}
                      className="border-b border-line last:border-b-0 hover:bg-cream-100 transition-colors"
                    >
                      <td className="py-3.5 px-4 md:px-6">
                        <span className="inline-flex w-6 h-6 items-center justify-center rounded-full bg-cream-100 text-[10px] font-bold text-ink-700">
                          {i + 1}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 md:px-6">
                        <p className="text-sm font-medium text-ink-800 truncate max-w-[200px] md:max-w-xs">
                          {product.name}
                        </p>
                      </td>
                      <td className="py-3.5 px-4 md:px-6 text-right">
                        <span className="text-sm text-ink-700">
                          {product.quantity}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 md:px-6 text-right">
                        <span className="text-sm font-medium text-ink-800">
                          {formatINR(product.revenue)}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 md:px-6 text-right hidden md:table-cell">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-16 h-1.5 rounded-full bg-cream-100 overflow-hidden">
                            <div
                              className="h-full bg-ink-800 rounded-full"
                              style={{ width: `${share}%` }}
                            />
                          </div>
                          <span className="text-xs text-ink-500 w-10 text-right">
                            {share.toFixed(1)}%
                          </span>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16">
            <TrophyIcon className="w-10 h-10 text-ink-300 mx-auto mb-3" />
            <p className="text-sm text-ink-500">No product data yet</p>
            <p className="text-xs text-ink-400 mt-1">
              Top sellers will appear here
            </p>
          </div>
        )}
      </motion.div>

      {/* ==========================================
          TIP
      ========================================== */}
      <div className="flex items-start gap-3 p-4 border border-line rounded-lg bg-cream-100">
        <ExclamationTriangleIcon className="w-4 h-4 text-burgundy-500 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-ink-600 leading-relaxed">
          <strong className="text-ink-800">Tip:</strong> Analytics auto-refresh
          every 2 minutes while this tab is active. Export to CSV to share or
          archive reports — it includes all KPIs, revenue trend, top products,
          payment health, and low stock.
        </p>
      </div>
    </div>
  );
};

export default AdminAnalytics;