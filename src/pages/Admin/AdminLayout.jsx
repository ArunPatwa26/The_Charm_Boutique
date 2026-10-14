import { useState, useEffect } from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HomeIcon,
  ShoppingBagIcon,
  TagIcon,
  Squares2X2Icon,
  ChartBarIcon,
  Cog6ToothIcon,
  ArrowLeftOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  CurrencyRupeeIcon,
  ArrowUpRightIcon,
} from '@heroicons/react/24/outline';

import { useAuth } from '../../context/AuthContext';

// ==========================================
// AVATAR URL NORMALIZER
// ==========================================
const normalizeAvatar = (url) => {
  if (!url) return null;

  // Google avatars — force valid size, strip bad suffix
  if (url.includes('googleusercontent.com')) {
    const base = url.split('=')[0];
    return `${base}=s200-c`;
  }

  // Cloudinary — auto optimize
  if (url.includes('res.cloudinary.com')) {
    return url.replace(
      '/upload/',
      '/upload/f_auto,q_auto,w_200,h_200,c_fill/'
    );
  }

  return url;
};

// ==========================================
// USER AVATAR COMPONENT
// ==========================================
const UserAvatar = ({ user, size = 'sm' }) => {
  const [error, setError] = useState(false);

  const rawSrc =
    user?.avatar ||
    user?.profile_image ||
    user?.avatar_url ||
    user?.profile_pic ||
    user?.image ||
    null;

  const src = normalizeAvatar(rawSrc);

  const name =
    user?.name ||
    user?.full_name ||
    user?.username ||
    user?.given_name ||
    'Admin';

  const initial = name.charAt(0).toUpperCase();

  // Reset error when src changes
  useEffect(() => {
    setError(false);
  }, [src]);

  const sizeClass =
    size === 'lg'
      ? 'w-9 h-9 text-xs'
      : size === 'md'
      ? 'w-8 h-8 text-[11px]'
      : 'w-7 h-7 text-[10px]';

  if (src && !error) {
    return (
      <img
        src={src}
        alt={name}
        referrerPolicy="no-referrer"
        crossOrigin="anonymous"
        loading="lazy"
        onError={() => setError(true)}
        className={`${sizeClass} rounded-full object-cover flex-shrink-0 bg-cream-200`}
      />
    );
  }

  return (
    <span
      className={`${sizeClass} rounded-full bg-ink-800 text-cream-100 flex items-center justify-center font-bold flex-shrink-0`}
    >
      {initial}
    </span>
  );
};

// ==========================================
// MAIN ADMIN LAYOUT
// ==========================================
const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: HomeIcon },
    { name: 'Orders', href: '/admin/orders', icon: ShoppingBagIcon },
    { name: 'Payments', href: '/admin/payments', icon: CurrencyRupeeIcon },
    { name: 'Products', href: '/admin/products', icon: TagIcon },
    { name: 'Categories', href: '/admin/categories', icon: Squares2X2Icon },
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
  // LOCK SCROLL ON MOBILE SIDEBAR
  // ==========================================
  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [sidebarOpen]);

  const currentPage =
    navigation.find((item) => isActive(item.href))?.name || 'Admin';

  const userName =
    user?.name ||
    user?.full_name ||
    user?.username ||
    user?.given_name ||
    'Admin';

  const userEmail = user?.email || '';

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-cream-100">
      {/* ==========================================
          MOBILE TOPBAR
      ========================================== */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-cream-100/95 backdrop-blur border-b border-line h-14 flex items-center px-4">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 -ml-2 hover:bg-cream-200 rounded transition-colors"
          aria-label="Open menu"
        >
          <Bars3Icon className="w-5 h-5 text-ink-800" />
        </button>

        <div className="ml-3 min-w-0">
          <p className="text-[10px] uppercase tracking-kicker font-semibold text-ink-500 leading-none mb-1">
            Admin
          </p>
          <p className="font-serif text-sm font-bold text-ink-800 leading-none truncate">
            {currentPage}
          </p>
        </div>

        {/* ✅ FIXED — User chip with real avatar */}
        <div className="ml-auto flex items-center gap-2">
          <UserAvatar user={user} size="sm" />
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
            className="fixed inset-0 z-40 bg-ink-950/50 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* ==========================================
          SIDEBAR
      ========================================== */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-72 lg:w-64 bg-white border-r border-line flex flex-col
          transform transition-transform duration-300 ease-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo + Close */}
        <div className="p-5 border-b border-line flex items-center justify-between flex-shrink-0">
          <Link to="/admin" className="flex items-center gap-2.5 min-w-0">
            <span className="w-9 h-9 rounded-lg bg-ink-800 flex items-center justify-center flex-shrink-0">
              <span className="font-serif text-cream-100 text-sm font-bold">
                C
              </span>
            </span>
            <div className="min-w-0">
              <p className="font-serif text-sm font-bold text-ink-800 leading-none truncate">
                The Charm
              </p>
              <p className="text-[9px] uppercase tracking-[0.2em] font-semibold text-ink-500 mt-1">
                Admin
              </p>
            </div>
          </Link>

          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 hover:bg-cream-100 rounded transition-colors"
            aria-label="Close menu"
          >
            <XMarkIcon className="w-4 h-4 text-ink-500" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          {navigation.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`
                  relative flex items-center gap-3 px-3 py-2.5 rounded text-sm transition-colors
                  ${
                    active
                      ? 'bg-cream-100 text-burgundy-500 font-medium'
                      : 'text-ink-600 hover:bg-cream-100 hover:text-ink-800'
                  }
                `}
              >
                <item.icon
                  className={`w-[18px] h-[18px] flex-shrink-0 ${
                    active ? 'text-burgundy-500' : 'text-ink-500'
                  }`}
                />
                <span>{item.name}</span>
                {active && (
                  <span className="ml-auto w-1 h-4 rounded-full bg-burgundy-500" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* ✅ FIXED — User card with real avatar */}
        <div className="px-3 pb-2">
          <div className="flex items-center gap-3 p-3 bg-cream-100 border border-line rounded">
            <UserAvatar user={user} size="lg" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-ink-800 truncate leading-tight">
                {userName}
              </p>
              <p className="text-[10px] text-ink-500 truncate mt-0.5">
                {userEmail}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-line flex-shrink-0 space-y-0.5">
          <Link
            to="/"
            className="flex items-center gap-3 px-3 py-2.5 text-sm text-ink-600 hover:bg-cream-100 hover:text-ink-800 rounded transition-colors"
          >
            <ArrowUpRightIcon className="w-[18px] h-[18px] text-ink-500" />
            Back to Shop
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-burgundy-500 hover:bg-burgundy-50 rounded transition-colors font-medium"
          >
            <ArrowLeftOnRectangleIcon className="w-[18px] h-[18px]" />
            Logout
          </button>
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