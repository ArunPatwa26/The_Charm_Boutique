import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import logo from '../../assets/logo.png';

import {
  ShoppingBagIcon,
  Bars3Icon,
  XMarkIcon,
  HeartIcon,
  UserIcon,
  MagnifyingGlassIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  ClipboardDocumentListIcon,
  ArrowRightOnRectangleIcon,
  ShieldCheckIcon,
  HomeIcon,
} from '@heroicons/react/24/outline';

import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { getWishlist } from '../../services/wishlistService';

// ==========================================
// AVATAR URL NORMALIZER
// ==========================================
const normalizeAvatar = (url) => {
  if (!url) return null;

  // Google avatars — force a valid size param + strip any bad suffix
  if (url.includes('googleusercontent.com')) {
    const base = url.split('=')[0];
    return `${base}=s200-c`;
  }

  // Cloudinary — auto format, quality, size
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
    'User';

  const initial = name.charAt(0).toUpperCase();

  // Reset error state when the source URL changes
  useEffect(() => {
    setError(false);
  }, [src]);

  const sizeClass =
    size === 'lg'
      ? 'w-11 h-11 text-base'
      : size === 'md'
      ? 'w-9 h-9 text-sm'
      : 'w-7 h-7 text-[11px]';

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
// MAIN NAVBAR
// ==========================================
const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [wishlistCount, setWishlistCount] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const searchInputRef = useRef(null);
  const userMenuRef = useRef(null);

  const { isAuthenticated, user, logout } = useAuth();
  const { total_items = 0 } = useCart();

  // ==========================================
  // USER DATA
  // ==========================================
  const userName =
    user?.name ||
    user?.full_name ||
    user?.username ||
    user?.given_name ||
    'User';

  const userEmail = user?.email || '';

  const isAdmin =
    user?.role === 'admin' ||
    user?.is_admin === true ||
    user?.isAdmin === true;

  // ==========================================
  // WISHLIST COUNT
  // ==========================================
  useEffect(() => {
    const load = async () => {
      if (!isAuthenticated) {
        setWishlistCount(0);
        return;
      }
      try {
        const res = await getWishlist();
        if (res.success) setWishlistCount(res.wishlist?.length || 0);
      } catch {
        setWishlistCount(0);
      }
    };
    load();
  }, [isAuthenticated]);

  // ==========================================
  // SCROLL DETECTION
  // ==========================================
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // ==========================================
  // CLOSE MENU ON ROUTE CHANGE
  // ==========================================
  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
    setSearchTerm('');
    setUserMenuOpen(false);
  }, [location.pathname]);

  // ==========================================
  // BODY SCROLL LOCK
  // ==========================================
  useEffect(() => {
    document.body.style.overflow =
      menuOpen || userMenuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen, userMenuOpen]);

  // ==========================================
  // FOCUS SEARCH
  // ==========================================
  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [searchOpen]);

  // ==========================================
  // CLICK OUTSIDE USER MENU
  // ==========================================
  useEffect(() => {
    const handleClick = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // ==========================================
  // HANDLERS
  // ==========================================
  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    navigate(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
    setSearchTerm('');
    setSearchOpen(false);
  };

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    setMenuOpen(false);
    navigate('/');
  };

  const navLinks = [
    { name: 'Home', href: '/', icon: HomeIcon },
    { name: 'Shop', href: '/products', icon: ShoppingBagIcon },
    { name: 'Categories', href: '/categories', icon: null },
    { name: 'New In', href: '/products?sort_by=newest', icon: null },
    { name: 'About', href: '/about', icon: null },
  ];

  const isActive = (href) => {
    const path = href.split('?')[0];
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* ==========================================
          ANNOUNCEMENT STRIP
      ========================================== */}
      <div className="hidden md:block bg-ink-800 text-white">
        <div className="container-editorial">
          <div className="py-2 text-center text-[11px] tracking-wider uppercase">
            Free shipping on orders above ₹1000 · New arrivals every Friday
          </div>
        </div>
      </div>

      {/* ==========================================
          NAVBAR
      ========================================== */}
      <nav
        className={`sticky top-0 left-0 right-0 z-40 transition-all duration-300 ${
          isScrolled
            ? 'bg-cream-100 border-b border-line'
            : 'bg-cream-100 border-b border-transparent'
        }`}
      >
        <div className="container-editorial">
          <div className="h-14 md:h-16 flex items-center justify-between gap-4">
            {/* LEFT — Hamburger + Logo */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => setMenuOpen(true)}
                className="lg:hidden p-2 -ml-2 hover:bg-cream-200 rounded transition-colors"
                aria-label="Open menu"
              >
                <Bars3Icon className="w-5 h-5 text-ink-800" />
              </button>

              <Link to="/" className="flex items-center gap-2.5">
                <img
                  src={logo}
                  alt="The Charm Boutique"
                  className="w-9 h-9 md:w-10 md:h-10 rounded-full object-contain"
                />
                <div className="hidden sm:block">
                  <h1 className="font-serif text-base md:text-lg font-bold text-ink-800 leading-none tracking-tight">
                    The Charm
                  </h1>
                  <p className="text-[9px] tracking-[0.28em] uppercase text-ink-500 font-medium mt-0.5">
                    Boutique
                  </p>
                </div>
              </Link>
            </div>

            {/* CENTER — Desktop nav links */}
            <div className="hidden lg:flex items-center gap-7 absolute left-1/2 -translate-x-1/2">
              {navLinks.map((link) => {
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.name}
                    to={link.href}
                    className={`relative text-sm font-medium transition-colors duration-200 ${
                      active
                        ? 'text-burgundy-500'
                        : 'text-ink-700 hover:text-burgundy-500'
                    }`}
                  >
                    {link.name}
                    {active && (
                      <span className="absolute -bottom-1.5 left-0 right-0 h-px bg-burgundy-500" />
                    )}
                  </Link>
                );
              })}
            </div>

            {/* RIGHT — Actions */}
            <div className="flex items-center gap-0.5 flex-shrink-0">
              {/* Search */}
              <button
                onClick={() => setSearchOpen((prev) => !prev)}
                className="p-2 hover:bg-cream-200 rounded transition-colors"
                aria-label="Search"
              >
                <MagnifyingGlassIcon className="w-[18px] h-[18px] text-ink-800" />
              </button>

              {/* Wishlist */}
              <Link
                to="/wishlist"
                className="hidden sm:flex relative p-2 hover:bg-cream-200 rounded transition-colors"
                aria-label="Wishlist"
              >
                {wishlistCount > 0 ? (
                  <HeartSolidIcon className="w-[18px] h-[18px] text-burgundy-500" />
                ) : (
                  <HeartIcon className="w-[18px] h-[18px] text-ink-800" />
                )}
                {wishlistCount > 0 && (
                  <span className="absolute top-1 right-1 min-w-[14px] h-[14px] px-1 rounded-full bg-burgundy-500 text-white text-[9px] font-bold flex items-center justify-center">
                    {wishlistCount > 9 ? '9+' : wishlistCount}
                  </span>
                )}
              </Link>

              {/* Cart */}
              <Link
                to="/cart"
                className="relative p-2 hover:bg-cream-200 rounded transition-colors"
                aria-label="Cart"
              >
                <ShoppingBagIcon className="w-[18px] h-[18px] text-ink-800" />
                {Number(total_items) > 0 && (
                  <span className="absolute top-1 right-1 min-w-[14px] h-[14px] px-1 rounded-full bg-ink-800 text-white text-[9px] font-bold flex items-center justify-center">
                    {total_items > 9 ? '9+' : total_items}
                  </span>
                )}
              </Link>

              {/* ==========================================
                  USER — Logged in: dropdown
                  Logged out: Sign In button
              ========================================== */}
              {isAuthenticated ? (
                <div ref={userMenuRef} className="relative">
                  <button
                    onClick={() => setUserMenuOpen((p) => !p)}
                    className="flex items-center gap-2 pl-1 pr-2 py-1 hover:bg-cream-200 rounded transition-colors"
                    aria-label="Account menu"
                  >
                    {/* ✅ FIXED AVATAR */}
                    <UserAvatar user={user} size="sm" />
                    <ChevronDownIcon
                      className={`hidden md:block w-3.5 h-3.5 text-ink-500 transition-transform ${
                        userMenuOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {/* Dropdown */}
                  <AnimatePresence>
                    {userMenuOpen && (
                      <>
                        {/* Backdrop for mobile */}
                        <div
                          className="fixed inset-0 z-40 lg:hidden"
                          onClick={() => setUserMenuOpen(false)}
                        />
                        <motion.div
                          initial={{ opacity: 0, y: -6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -6 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-0 top-full mt-2 w-72 bg-white border border-line rounded-lg shadow-xl overflow-hidden z-50"
                        >
                          {/* Header — user info */}
                          <div className="p-4 bg-cream-100 border-b border-line">
                            <div className="flex items-center gap-3">
                              {/* ✅ FIXED AVATAR (large) */}
                              <UserAvatar user={user} size="lg" />
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold text-ink-800 truncate">
                                  {userName}
                                </p>
                                <p className="text-xs text-ink-500 truncate">
                                  {userEmail}
                                </p>
                                {isAdmin && (
                                  <span className="inline-flex items-center gap-1 mt-1 text-[10px] uppercase tracking-wider font-semibold text-burgundy-500">
                                    <ShieldCheckIcon className="w-3 h-3" />
                                    Admin
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Menu items */}
                          <div className="p-1.5">
                            <MenuItem
                              to="/orders"
                              icon={<ClipboardDocumentListIcon className="w-4 h-4" />}
                              label="My Orders"
                              onClick={() => setUserMenuOpen(false)}
                            />
                            <MenuItem
                              to="/wishlist"
                              icon={<HeartIcon className="w-4 h-4" />}
                              label="Wishlist"
                              count={wishlistCount > 0 ? wishlistCount : null}
                              onClick={() => setUserMenuOpen(false)}
                            />
                            <MenuItem
                              to="/cart"
                              icon={<ShoppingBagIcon className="w-4 h-4" />}
                              label="My Cart"
                              count={total_items > 0 ? total_items : null}
                              onClick={() => setUserMenuOpen(false)}
                            />

                            {isAdmin && (
                              <MenuItem
                                to="/admin"
                                icon={<ShieldCheckIcon className="w-4 h-4" />}
                                label="Admin Panel"
                                highlight
                                onClick={() => setUserMenuOpen(false)}
                              />
                            )}

                            <div className="my-1.5 border-t border-line" />

                            <button
                              onClick={handleLogout}
                              className="w-full flex items-center gap-3 px-3 py-2.5 rounded text-sm text-burgundy-500 hover:bg-burgundy-50 transition-colors font-medium"
                            >
                              <ArrowRightOnRectangleIcon className="w-4 h-4" />
                              Logout
                            </button>
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="hidden md:inline-flex items-center gap-2 ml-1 px-4 py-2 bg-ink-800 text-cream-100 rounded text-[11px] uppercase tracking-wider font-semibold hover:bg-burgundy-500 transition-colors"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* ==========================================
            SEARCH BAR (expands below navbar)
        ========================================== */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden border-t border-line bg-cream-100"
            >
              <div className="container-editorial py-4">
                <form
                  onSubmit={handleSearch}
                  className="max-w-2xl mx-auto flex items-center gap-3"
                >
                  <MagnifyingGlassIcon className="w-5 h-5 text-ink-400 flex-shrink-0" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search for jewellery, categories..."
                    className="flex-1 bg-transparent border-none outline-none text-base text-ink-800 placeholder-ink-400"
                  />
                  <button
                    type="button"
                    onClick={() => setSearchOpen(false)}
                    className="p-1.5 hover:bg-cream-200 rounded transition-colors"
                    aria-label="Close search"
                  >
                    <XMarkIcon className="w-4 h-4 text-ink-500" />
                  </button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ==========================================
          MOBILE FULL-SCREEN MENU
      ========================================== */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-cream-100 lg:hidden flex flex-col"
          >
            {/* Header */}
            <div className="border-b border-line">
              <div className="container-editorial py-3 flex items-center justify-between">
                <Link
                  to="/"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2.5"
                >
                  <img
                    src={logo}
                    alt="The Charm Boutique"
                    className="w-9 h-9 rounded-full object-contain"
                  />
                  <div>
                    <p className="font-serif text-sm font-bold text-ink-800 leading-none">
                      The Charm
                    </p>
                    <p className="text-[9px] tracking-[0.24em] uppercase text-ink-500 font-medium mt-0.5">
                      Boutique
                    </p>
                  </div>
                </Link>

                <button
                  onClick={() => setMenuOpen(false)}
                  className="p-2 -mr-2 hover:bg-cream-200 rounded transition-colors"
                  aria-label="Close menu"
                >
                  <XMarkIcon className="w-5 h-5 text-ink-800" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto">
              <nav className="container-editorial py-6">
                {/* Main nav */}
                <ul className="space-y-1">
                  {navLinks.map((link) => (
                    <li key={link.name}>
                      <Link
                        to={link.href}
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center justify-between py-4 border-b border-line group"
                      >
                        <span
                          className={`font-serif text-2xl transition-colors ${
                            isActive(link.href)
                              ? 'text-burgundy-500'
                              : 'text-ink-800 group-hover:text-burgundy-500'
                          }`}
                        >
                          {link.name}
                        </span>
                        <ChevronRightIcon
                          className={`w-5 h-5 transition-all ${
                            isActive(link.href)
                              ? 'text-burgundy-500'
                              : 'text-ink-400 group-hover:text-burgundy-500 group-hover:translate-x-1'
                          }`}
                        />
                      </Link>
                    </li>
                  ))}
                </ul>

                {/* Account section — user info when logged in */}
                {isAuthenticated && (
                  <div className="mt-10">
                    <p className="text-[11px] uppercase tracking-kicker font-semibold text-ink-500 mb-3">
                      My Account
                    </p>

                    {/* User card */}
                    <div className="flex items-center gap-3 p-3 mb-3 bg-white border border-line rounded">
                      {/* ✅ FIXED AVATAR (large) */}
                      <UserAvatar user={user} size="lg" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-ink-800 truncate">
                          {userName}
                        </p>
                        <p className="text-xs text-ink-500 truncate">
                          {userEmail}
                        </p>
                      </div>
                    </div>

                    {/* Account links */}
                    <ul className="space-y-1">
                      <li>
                        <Link
                          to="/orders"
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-3 py-3 text-sm font-medium text-ink-700 hover:text-burgundy-500 transition-colors"
                        >
                          <ClipboardDocumentListIcon className="w-4 h-4" />
                          My Orders
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/wishlist"
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-3 py-3 text-sm font-medium text-ink-700 hover:text-burgundy-500 transition-colors"
                        >
                          <HeartIcon className="w-4 h-4" />
                          Wishlist
                          {wishlistCount > 0 && (
                            <span className="ml-auto text-xs text-ink-500">
                              {wishlistCount}
                            </span>
                          )}
                        </Link>
                      </li>
                      {isAdmin && (
                        <li>
                          <Link
                            to="/admin"
                            onClick={() => setMenuOpen(false)}
                            className="flex items-center gap-3 py-3 text-sm font-medium text-burgundy-500 hover:text-burgundy-600 transition-colors"
                          >
                            <ShieldCheckIcon className="w-4 h-4" />
                            Admin Panel
                          </Link>
                        </li>
                      )}
                    </ul>

                    {/* Logout */}
                    <button
                      onClick={handleLogout}
                      className="w-full mt-3 flex items-center justify-center gap-2 py-3 border border-line rounded text-[11px] uppercase tracking-wider font-semibold text-burgundy-500 hover:bg-burgundy-50 transition-colors"
                    >
                      <ArrowRightOnRectangleIcon className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                )}

                {/* Sign in (if not logged in) */}
                {!isAuthenticated && (
                  <div className="mt-10">
                    <Link
                      to="/login"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center justify-center gap-2 py-3.5 bg-ink-800 text-cream-100 rounded text-[11px] uppercase tracking-wider font-semibold hover:bg-burgundy-500 transition-colors"
                    >
                      <UserIcon className="w-4 h-4" />
                      Sign In
                    </Link>
                  </div>
                )}
              </nav>
            </div>

            {/* Footer */}
            <div className="border-t border-line">
              <div className="container-editorial py-4 flex items-center justify-between text-xs text-ink-500">
                <span>© {new Date().getFullYear()} The Charm Boutique</span>
                <a
                  href="https://www.instagram.com/_the.charm.boutique_/?hl=en"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-burgundy-500 transition-colors"
                >
                  Instagram →
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// ==========================================
// MENU ITEM (user dropdown)
// ==========================================
const MenuItem = ({ to, icon, label, count, highlight, onClick }) => (
  <Link
    to={to}
    onClick={onClick}
    className={`flex items-center gap-3 px-3 py-2.5 rounded text-sm transition-colors ${
      highlight
        ? 'text-burgundy-500 hover:bg-burgundy-50 font-medium'
        : 'text-ink-700 hover:bg-cream-100'
    }`}
  >
    {icon}
    <span className="flex-1">{label}</span>
    {count !== null && count !== undefined && (
      <span className="text-xs text-ink-500">{count}</span>
    )}
  </Link>
);

export default Navbar;