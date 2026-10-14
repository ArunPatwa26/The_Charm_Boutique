import { useState, useEffect } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HomeIcon,
  ShoppingBagIcon,
  TagIcon,
  UsersIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ArrowLeftOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  SparklesIcon,
  CurrencyRupeeIcon,
} from '@heroicons/react/24/outline';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: HomeIcon },
    { name: 'Orders', href: '/admin/orders', icon: ShoppingBagIcon },
    { name: 'Payments', href: '/admin/payments', icon: CurrencyRupeeIcon },
    { name: 'Products', href: '/admin/products', icon: TagIcon },
    { name: 'Categories', href: '/admin/categories', icon: UsersIcon },
    { name: 'Analytics', href: '/admin/analytics', icon: ChartBarIcon },
    { name: 'Settings', href: '/admin/settings', icon: Cog6ToothIcon },
  ];

  const isActive = (path) => {
    if (path === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(path);
  };

  // ==========================================
  // CLOSE SIDEBAR ON ROUTE CHANGE
  // ==========================================
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // ==========================================
  // LOCK SCROLL WHEN MOBILE SIDEBAR IS OPEN
  // ==========================================
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [sidebarOpen]);

  const currentPage =
    navigation.find((item) => isActive(item.href))?.name || 'Admin';

  return (
    <div className="min-h-screen bg-gray-100">
      {/* ==========================================
          MOBILE TOPBAR
      ========================================== */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-white/95 backdrop-blur border-b border-gray-100 h-14 flex items-center px-4">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 -ml-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Open menu"
        >
          <Bars3Icon className="w-6 h-6 text-gray-700" />
        </button>

        <div className="flex items-center gap-2 ml-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center flex-shrink-0">
            <SparklesIcon className="w-4 h-4 text-white" />
          </div>
          <div className="min-w-0">
            <p className="font-bold text-sm leading-tight truncate">
              {currentPage}
            </p>
            <p className="text-[10px] text-gray-500 leading-tight">
              Admin Panel
            </p>
          </div>
        </div>
      </header>

      {/* ==========================================
          BACKDROP
      ========================================== */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* ==========================================
          SIDEBAR
      ========================================== */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-72 lg:w-64 bg-white shadow-xl flex flex-col
          transform transition-transform duration-300 ease-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo / Close on mobile */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
          <Link to="/admin" className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center shadow-md flex-shrink-0">
              <SparklesIcon className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-base font-serif font-bold text-gray-900 leading-tight truncate">
                The Charm
              </h1>
              <p className="text-[10px] text-amber-600 font-semibold tracking-[0.2em] uppercase">
                Admin
              </p>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close menu"
          >
            <XMarkIcon className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {navigation.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`
                  relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-200
                  ${
                    active
                      ? 'bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-700 font-semibold shadow-sm'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }
                `}
              >
                <item.icon
                  className={`w-5 h-5 flex-shrink-0 ${
                    active ? 'text-amber-600' : ''
                  }`}
                />
                <span className="text-sm">{item.name}</span>
                {active && (
                  <motion.div
                    layoutId="adminActiveIndicator"
                    className="ml-auto w-1.5 h-6 bg-amber-500 rounded-full"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-gray-100 flex-shrink-0">
          <Link
            to="/"
            className="flex items-center gap-3 px-3.5 py-2.5 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-xl transition-colors text-sm"
          >
            <ArrowLeftOnRectangleIcon className="w-5 h-5" />
            Back to Shop
          </Link>
        </div>
      </aside>

      {/* ==========================================
          MAIN CONTENT
      ========================================== */}
      <main className="lg:pl-64 pt-14 lg:pt-0 min-h-screen">
        <div className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;