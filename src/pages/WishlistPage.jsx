import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HeartIcon,
  ShoppingBagIcon,
  TrashIcon,
  ArrowLeftIcon,
  SparklesIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { getWishlist, removeFromWishlistAPI, clearWishlistAPI } from '../services/wishlistService';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const WishlistPage = () => {
  const { isAuthenticated, user, loading: authLoading } = useAuth();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      fetchWishlist();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const fetchWishlist = async () => {
    setLoading(true);
    try {
      const response = await getWishlist();
      if (response.success) {
        setWishlist(response.wishlist || []);
      }
    } catch (error) {
      console.error('Failed to fetch wishlist:', error);
      toast.error('Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      const response = await removeFromWishlistAPI(productId);
      if (response.success) {
        toast.success('Removed from wishlist');
        setWishlist(wishlist.filter(item => item.id !== productId));
      }
    } catch (error) {
      toast.error(error?.message || 'Failed to remove from wishlist');
    }
  };

  const clearWishlist = async () => {
    if (!window.confirm('Are you sure you want to clear your wishlist?')) return;
    
    try {
      const response = await clearWishlistAPI();
      if (response.success) {
        setWishlist([]);
        toast.success('Wishlist cleared');
      }
    } catch (error) {
      toast.error('Failed to clear wishlist');
    }
  };

  const getPrice = (product) => {
    return product.discount_price || product.price || 0;
  };

  const getDiscount = (product) => {
    if (!product.discount_price || !product.price) return 0;
    return Math.round(((product.price - product.discount_price) / product.price) * 100);
  };

  // Show loading while checking auth
  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Not authenticated - show login prompt
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white via-[#fffdf8] to-gray-50 pt-28 pb-20">
        <div className="container-custom px-4">
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-xl mx-auto text-center py-20"
          >
            <div className="relative mx-auto mb-8 w-28 h-28">
              <div className="absolute inset-0 rounded-full bg-yellow-100 blur-xl opacity-60" />
              <div className="relative w-28 h-28 rounded-full bg-white border border-yellow-100 shadow-xl flex items-center justify-center">
                <UserCircleIcon className="w-16 h-16 text-yellow-500" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Sign in to View Wishlist
            </h1>
            <p className="text-gray-500 leading-relaxed mb-8">
              Login to save your favourite jewellery pieces and access them from any device.
            </p>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-yellow-500 to-yellow-600 text-white font-semibold hover:from-yellow-600 hover:to-yellow-700 transition-all shadow-lg"
            >
              <UserCircleIcon className="w-5 h-5" />
              Sign In
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  // Empty wishlist
  if (wishlist.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white via-[#fffdf8] to-gray-50 pt-28 pb-20">
        <div className="container-custom px-4">
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-xl mx-auto text-center py-20"
          >
            <div className="relative mx-auto mb-8 w-28 h-28">
              <div className="absolute inset-0 rounded-full bg-yellow-100 blur-xl opacity-60" />
              <div className="relative w-28 h-28 rounded-full bg-white border border-yellow-100 shadow-xl flex items-center justify-center">
                <HeartSolidIcon className="w-14 h-14 text-yellow-500" />
              </div>
            </div>
            <p className="text-sm uppercase tracking-[0.25em] text-yellow-600 font-semibold mb-3">
              Your Collection
            </p>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-5">
              Your Wishlist is Empty
            </h1>
            <p className="text-gray-500 leading-relaxed mb-8">
              Save your favourite jewellery pieces here and come back whenever you're ready.
            </p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-gray-900 text-white font-semibold hover:bg-yellow-600 transition-all duration-300 shadow-lg"
            >
              <SparklesIcon className="w-5 h-5" />
              Explore Jewellery
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  // Main wishlist view
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-[#fffdf8] to-gray-50 pt-28 pb-20">
      <div className="container-custom px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-10"
        >
          <div>
            <div className="flex items-center gap-2 mb-3">
              <HeartSolidIcon className="w-5 h-5 text-yellow-500" />
              <span className="text-sm uppercase tracking-[0.2em] text-yellow-600 font-semibold">
                My Collection
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
              Wishlist
            </h1>
            <p className="text-gray-500 mt-2">
              {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'} saved
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-gray-200 bg-white hover:border-yellow-400 hover:text-yellow-600 transition-all"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              Continue Shopping
            </Link>
            {wishlist.length > 0 && (
              <button
                onClick={clearWishlist}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-red-50 text-red-500 hover:bg-red-100 transition-all"
              >
                <TrashIcon className="w-4 h-4" />
                Clear
              </button>
            )}
          </div>
        </motion.div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence>
            {wishlist.map((product, index) => {
              const discount = getDiscount(product);
              const price = getPrice(product);

              return (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                  className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300"
                >
                  {/* Image */}
                  <div className="relative aspect-square bg-gray-100 overflow-hidden">
                    <Link to={`/products/${product.id}`}>
                      <img
                        src={product.main_image || product.images?.[0] || 'https://via.placeholder.com/400'}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    </Link>

                    {discount > 0 && (
                      <span className="absolute top-4 left-4 bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full">
                        -{discount}%
                      </span>
                    )}

                    <button
                      onClick={() => removeFromWishlist(product.id)}
                      className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 backdrop-blur flex items-center justify-center text-red-500 shadow-md hover:bg-red-500 hover:text-white transition-all"
                      title="Remove from wishlist"
                    >
                      <HeartSolidIcon className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Info */}
                  <div className="p-5">
                    <p className="text-xs uppercase tracking-wider text-yellow-600 font-semibold mb-2">
                      {product.category_name || 'Jewellery'}
                    </p>
                    <Link to={`/products/${product.id}`} className="block">
                      <h2 className="font-semibold text-gray-900 text-lg truncate hover:text-yellow-600 transition-colors">
                        {product.name}
                      </h2>
                    </Link>
                    <div className="flex items-center gap-2 mt-3">
                      <span className="text-xl font-bold text-gray-900">
                        ₹{price}
                      </span>
                      {product.discount_price && (
                        <span className="text-sm text-gray-400 line-through">
                          ₹{product.price}
                        </span>
                      )}
                    </div>
                    <Link
                      to={`/products/${product.id}`}
                      className="mt-5 w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gray-900 text-white font-medium hover:bg-yellow-600 transition-all"
                    >
                      <ShoppingBagIcon className="w-5 h-5" />
                      View Product
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default WishlistPage;