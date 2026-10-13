import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import logo from "../../assets/logo.png";

import {
  ShoppingBagIcon,
  Bars3Icon,
  XMarkIcon,
  SparklesIcon,
  HeartIcon,
  UserIcon,
  ChevronDownIcon,
  UserCircleIcon,
  ClipboardDocumentListIcon,
  ArrowRightOnRectangleIcon,
  ShieldCheckIcon,
  HomeIcon,
  TagIcon,
  ComputerDesktopIcon,
  FolderIcon,
  GiftIcon,
} from "@heroicons/react/24/outline";

import { HeartIcon as HeartSolidIcon } from "@heroicons/react/24/solid";

import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { getWishlist } from "../../services/wishlistService";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const userMenuRef = useRef(null);
  const mobileMenuRef = useRef(null);

  // ==========================================
  // STATE
  // ==========================================

  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // ==========================================
  // CONTEXTS
  // ==========================================

  const { isAuthenticated, user, logout } = useAuth();
  const { total_items = 0 } = useCart();

  // ==========================================
  // LOAD WISHLIST COUNT
  // ==========================================

  const loadWishlistCount = async () => {
    if (!isAuthenticated) {
      setWishlistCount(0);
      return;
    }

    try {
      const response = await getWishlist();
      if (response.success) {
        setWishlistCount(response.wishlist?.length || 0);
      }
    } catch (error) {
      console.error("Wishlist count error:", error);
      setWishlistCount(0);
    }
  };

  useEffect(() => {
    loadWishlistCount();
  }, [isAuthenticated]);

  // ==========================================
  // SCROLL HANDLER
  // ==========================================

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // ==========================================
  // CLOSE MENUS ON ROUTE CHANGE
  // ==========================================

  useEffect(() => {
    setIsOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname]);

  // ==========================================
  // CLICK OUTSIDE HANDLER
  // ==========================================

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // ==========================================
  // LOGOUT
  // ==========================================

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    setIsOpen(false);
    navigate("/");
  };

  const closeMobileMenu = () => {
    setIsOpen(false);
  };

  // ==========================================
  // USER DATA
  // ==========================================

  const userName = user?.name || user?.full_name || user?.username || "User";
  const userAvatar =
    user?.avatar || user?.profile_image || user?.profileImage || null;
  const isAdmin =
    user?.role === "admin" || user?.is_admin === true || user?.isAdmin === true;

  // ==========================================
  // NAVIGATION LINKS
  // ==========================================

  const navLinks = [
    { name: "Home", href: "/", icon: HomeIcon },
    { name: "Collections", href: "/products", icon: TagIcon },
    { name: "Categories", href: "/categories", icon: FolderIcon },
    { name: "New Arrivals", href: "/products?sort_by=newest", icon: GiftIcon },
  ];

  const isActive = (href) => {
    if (href === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(href.split("?")[0]);
  };

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <>
      {/* ==========================================
          ANNOUNCEMENT BAR
      ========================================== */}
      <div className="hidden md:block bg-gray-900 text-white text-center text-xs py-2 tracking-wide">
        <span className="inline-flex items-center gap-2">
          <SparklesIcon className="w-3.5 h-3.5 text-amber-400" />
          Free Shipping on orders above ₹1000 · AI-Powered Recommendations
        </span>
      </div>

      <nav
        className={`
          fixed top-0 left-0 right-0 z-50
          transition-all duration-300
          ${
            isScrolled
              ? "bg-white/95 backdrop-blur-xl shadow-md border-b border-gray-100"
              : "bg-white/90 backdrop-blur-md"
          }
        `}
      >
        <div className="container-custom px-4">
          <div className="h-[72px] flex items-center justify-between gap-4">
            {/* ==============================
                LOGO
            ============================== */}
            <Link
              to="/"
              className="flex items-center gap-3 shrink-0 group"
              onClick={closeMobileMenu}
            >
              <div className="relative">
                <img
                  src={logo}
                  alt="The Charm Boutique"
                  className="w-16 h-16 rounded-full object-contain p-1"
                />
              </div>
              <div className="hidden sm:block">
                <h1 className="font-serif text-xl font-bold tracking-tight text-gray-900 leading-none">
                  The Charm
                </h1>
                <p className="text-[9px] tracking-[0.28em] uppercase text-amber-600 font-semibold mt-1">
                  Boutique
                </p>
              </div>
            </Link>

            {/* ==============================
                DESKTOP NAV LINKS (Centered)
            ============================== */}
            <div className="hidden lg:flex items-center gap-0.5 mx-auto">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const active = isActive(link.href);

                return (
                  <Link
                    key={link.name}
                    to={link.href}
                    className={`
                      relative flex items-center gap-2
                      px-4 py-2
                      rounded-full
                      text-sm font-medium
                      transition-all duration-200
                      ${
                        active
                          ? "text-amber-700 bg-amber-50"
                          : "text-gray-700 hover:text-amber-700 hover:bg-amber-50/60"
                      }
                    `}
                  >
                    <Icon
                      className={`w-4 h-4 ${active ? "text-amber-600" : ""}`}
                    />
                    {link.name}

                    {/* AI Badge */}
                    {link.badge && (
                      <span className="text-[9px] font-bold bg-gradient-to-r from-purple-500 to-pink-500 text-white px-1.5 py-0.5 rounded-full">
                        {link.badge}
                      </span>
                    )}

                    {/* Active Underline */}
                    {active && (
                      <motion.span
                        layoutId="navbar-underline"
                        className="absolute bottom-0 left-4 right-4 h-0.5 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full"
                      />
                    )}
                  </Link>
                );
              })}
            </div>

            {/* ==============================
                ACTION BUTTONS
            ============================== */}
            <div className="flex items-center gap-1">
              {/* Wishlist */}
              <Link
                to="/wishlist"
                className="
                  relative hidden sm:flex
                  w-10 h-10 items-center justify-center
                  rounded-full
                  text-gray-600
                  hover:text-amber-600 hover:bg-amber-50
                  transition-all
                "
                title="Wishlist"
              >
                {wishlistCount > 0 ? (
                  <HeartSolidIcon className="w-5 h-5 text-red-500" />
                ) : (
                  <HeartIcon className="w-5 h-5" />
                )}

                {wishlistCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center shadow-md">
                    {wishlistCount > 99 ? "99+" : wishlistCount}
                  </span>
                )}
              </Link>

              {/* Cart */}
              <Link
                to="/cart"
                className="
                  relative
                  w-10 h-10 flex items-center justify-center
                  rounded-full
                  text-gray-600
                  hover:text-amber-600 hover:bg-amber-50
                  transition-all
                "
                title="Shopping Bag"
              >
                <ShoppingBagIcon className="w-5 h-5" />

                {Number(total_items) > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-gray-900 text-white text-[10px] font-bold flex items-center justify-center shadow-md">
                    {total_items > 99 ? "99+" : total_items}
                  </span>
                )}
              </Link>

              {/* Divider */}
              <div className="hidden md:block w-px h-6 bg-gray-200 mx-2" />

              {/* User Menu */}
              {isAuthenticated ? (
                <div ref={userMenuRef} className="relative hidden md:block">
                  <button
                    type="button"
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="
                      flex items-center gap-2
                      pl-1 pr-2.5 py-1
                      rounded-full
                      hover:bg-gray-50
                      transition-all
                      border border-transparent
                      hover:border-gray-200
                    "
                  >
                    {userAvatar ? (
                      <img
                        src={userAvatar}
                        alt={userName}
                        className="w-8 h-8 rounded-full object-cover border-2 border-amber-300"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-50 to-yellow-100 border border-amber-200 flex items-center justify-center">
                        <UserIcon className="w-4 h-4 text-amber-600" />
                      </div>
                    )}

                    <div className="hidden xl:block text-left max-w-[100px]">
                      <p className="text-xs font-semibold text-gray-800 truncate leading-none">
                        {userName}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        {isAdmin ? "Admin" : "Member"}
                      </p>
                    </div>

                    <ChevronDownIcon
                      className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${
                        userMenuOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {/* User Dropdown */}
                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -5 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -5 }}
                        transition={{ duration: 0.15 }}
                        className="
                          absolute right-0 top-14
                          w-64
                          bg-white
                          rounded-2xl
                          shadow-2xl
                          border border-gray-100
                          overflow-hidden
                        "
                      >
                        {/* Header */}
                        <div className="p-4 bg-gradient-to-br from-amber-50 to-yellow-50 border-b border-amber-100">
                          <div className="flex items-center gap-3">
                            {userAvatar ? (
                              <img
                                src={userAvatar}
                                alt={userName}
                                className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-md"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-white border border-amber-200 flex items-center justify-center">
                                <UserIcon className="w-5 h-5 text-amber-600" />
                              </div>
                            )}
                            <div className="min-w-0 flex-1">
                              <p className="font-semibold text-gray-900 text-sm truncate">
                                {userName}
                              </p>
                              <p className="text-xs text-gray-500 truncate">
                                {user?.email}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Menu Items */}
                        <div className="p-1.5">
                         

                          <Link
                            to="/orders"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-700 hover:bg-amber-50 hover:text-amber-700 transition-all"
                          >
                            <ClipboardDocumentListIcon className="w-4 h-4" />
                            My Orders
                          </Link>

                          <Link
                            to="/wishlist"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-700 hover:bg-amber-50 hover:text-amber-700 transition-all"
                          >
                            <HeartIcon className="w-4 h-4" />
                            Wishlist
                          </Link>

                          {isAdmin && (
                            <Link
                              to="/admin"
                              onClick={() => setUserMenuOpen(false)}
                              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-purple-700 hover:bg-purple-50 transition-all font-medium"
                            >
                              <ShieldCheckIcon className="w-4 h-4" />
                              Admin Panel
                            </Link>
                          )}

                          <div className="my-1.5 border-t border-gray-100" />

                          <button
                            type="button"
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-50 transition-all"
                          >
                            <ArrowRightOnRectangleIcon className="w-4 h-4" />
                            Logout
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="
                    hidden md:inline-flex items-center gap-2
                    px-5 py-2
                    rounded-full
                    bg-gradient-to-r from-gray-900 to-gray-800
                    text-white text-sm font-semibold
                    hover:from-amber-500 hover:to-yellow-500
                    transition-all
                    shadow-sm hover:shadow-md
                  "
                >
                  <UserIcon className="w-4 h-4" />
                  Sign In
                </Link>
              )}

              {/* Mobile Menu Button */}
              <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="
                  lg:hidden
                  w-10 h-10
                  rounded-full
                  flex items-center justify-center
                  text-gray-700
                  hover:bg-gray-100
                  transition-all
                "
                aria-label="Toggle menu"
              >
                {isOpen ? (
                  <XMarkIcon className="w-6 h-6" />
                ) : (
                  <Bars3Icon className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* =====================================
            MOBILE MENU
        ====================================== */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              ref={mobileMenuRef}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden bg-white border-t border-gray-100 overflow-hidden shadow-xl"
            >
              <div className="container-custom px-4 py-5">
                {/* Nav Links */}
                <div className="space-y-1">
                  {navLinks.map((link) => {
                    const Icon = link.icon;
                    const active = isActive(link.href);

                    return (
                      <Link
                        key={link.name}
                        to={link.href}
                        onClick={closeMobileMenu}
                        className={`
                          flex items-center gap-3
                          px-4 py-3
                          rounded-xl
                          transition-all
                          ${
                            active
                              ? "bg-amber-50 text-amber-700 font-semibold"
                              : "text-gray-700 hover:bg-amber-50 hover:text-amber-700 font-medium"
                          }
                        `}
                      >
                        <Icon
                          className={`w-5 h-5 ${active ? "text-amber-600" : ""}`}
                        />
                        {link.name}
                        {link.badge && (
                          <span className="ml-auto text-[10px] font-bold bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-0.5 rounded-full">
                            {link.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>

                <div className="my-4 border-t border-gray-100" />

                {/* Secondary Links */}
                <div className="space-y-1">
                  <Link
                    to="/wishlist"
                    onClick={closeMobileMenu}
                    className="flex items-center justify-between px-4 py-3 rounded-xl text-gray-700 hover:bg-amber-50 hover:text-amber-700 font-medium transition-all"
                  >
                    <span className="flex items-center gap-3">
                      <HeartIcon className="w-5 h-5" />
                      Wishlist
                    </span>
                    {wishlistCount > 0 && (
                      <span className="text-xs bg-red-500 text-white px-2.5 py-1 rounded-full font-semibold">
                        {wishlistCount}
                      </span>
                    )}
                  </Link>

                  <Link
                    to="/cart"
                    onClick={closeMobileMenu}
                    className="flex items-center justify-between px-4 py-3 rounded-xl text-gray-700 hover:bg-amber-50 hover:text-amber-700 font-medium transition-all"
                  >
                    <span className="flex items-center gap-3">
                      <ShoppingBagIcon className="w-5 h-5" />
                      Shopping Bag
                    </span>
                    {Number(total_items) > 0 && (
                      <span className="text-xs bg-gray-900 text-white px-2.5 py-1 rounded-full font-semibold">
                        {total_items}
                      </span>
                    )}
                  </Link>
                </div>

                {/* Auth Section */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  {isAuthenticated ? (
                    <>
                      <div className="flex items-center gap-3 px-4 py-3 mb-3 rounded-2xl bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-100">
                        {userAvatar ? (
                          <img
                            src={userAvatar}
                            alt={userName}
                            className="w-11 h-11 rounded-full object-cover border-2 border-white shadow-md"
                          />
                        ) : (
                          <div className="w-11 h-11 rounded-full bg-white border border-amber-200 flex items-center justify-center">
                            <UserIcon className="w-5 h-5 text-amber-600" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-gray-900 text-sm truncate">
                            {userName}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {user?.email}
                          </p>
                        </div>
                      </div>

                    

                      <Link
                        to="/orders"
                        onClick={closeMobileMenu}
                        className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-gray-700 hover:bg-gray-50 transition-all text-sm"
                      >
                        <ClipboardDocumentListIcon className="w-5 h-5 text-gray-400" />
                        My Orders
                      </Link>

                      {isAdmin && (
                        <Link
                          to="/admin"
                          onClick={closeMobileMenu}
                          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-purple-700 hover:bg-purple-50 transition-all text-sm font-medium"
                        >
                          <ShieldCheckIcon className="w-5 h-5" />
                          Admin Panel
                        </Link>
                      )}

                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-red-500 hover:bg-red-50 font-medium transition-all text-sm mt-2"
                      >
                        <ArrowRightOnRectangleIcon className="w-5 h-5" />
                        Logout
                      </button>
                    </>
                  ) : (
                    <Link
                      to="/login"
                      onClick={closeMobileMenu}
                      className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-gradient-to-r from-gray-900 to-gray-800 text-white font-semibold hover:from-amber-500 hover:to-yellow-500 transition-all shadow-md"
                    >
                      <UserIcon className="w-5 h-5" />
                      Sign In
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Spacer */}
      <div className="h-[72px]" />
    </>
  );
};

export default Navbar;