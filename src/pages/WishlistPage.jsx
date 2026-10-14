import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HeartIcon,
  ShoppingBagIcon,
  XMarkIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

import {
  getWishlist,
  removeFromWishlistAPI,
  clearWishlistAPI,
} from '../services/wishlistService';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const WishlistPage = () => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { addToCart } = useCart();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState(null);

  // ==========================================
  // FETCH WISHLIST
  // ==========================================
  useEffect(() => {
    const fetchWishlist = async () => {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }
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
    fetchWishlist();
  }, [isAuthenticated]);

  // ==========================================
  // REMOVE ITEM
  // ==========================================
  const removeFromWishlist = async (productId) => {
    setRemovingId(productId);
    try {
      const response = await removeFromWishlistAPI(productId);
      if (response.success) {
        setWishlist((prev) => prev.filter((item) => item.id !== productId));
      }
    } catch (error) {
      toast.error(error?.message || 'Failed to remove');
    } finally {
      setRemovingId(null);
    }
  };

  // ==========================================
  // CLEAR ALL
  // ==========================================
  const clearWishlist = async () => {
    if (
      !window.confirm('Remove all items from your wishlist?')
    )
      return;
    try {
      const response = await clearWishlistAPI();
      if (response.success) {
        setWishlist([]);
        toast.success('Wishlist cleared');
      }
    } catch {
      toast.error('Failed to clear wishlist');
    }
  };

  // ==========================================
  // MOVE TO CART
  // ==========================================
  const handleAddToCart = async (product) => {
    await addToCart(product.id, 1);
  };

  const getPrice = (product) =>
    product.discount_price || product.price || 0;

  const getDiscount = (product) => {
    if (!product.discount_price || !product.price) return 0;
    return Math.round(
      ((product.price - product.discount_price) / product.price) * 100
    );
  };

  // ==========================================
  // LOADING
  // ==========================================
  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream-100">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // ==========================================
  // NOT AUTHENTICATED
  // ==========================================
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-cream-100 flex items-center justify-center px-4 py-16">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center rounded-full bg-cream-200">
            <UserCircleIcon className="w-8 h-8 text-ink-500" />
          </div>
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-ink-800 mb-3">
            Sign in to view your wishlist.
          </h1>
          <p className="text-sm text-ink-500 mb-8">
            Save your favourite pieces and access them from any device.
          </p>
          <Link to="/login" className="btn-solid">
            <UserCircleIcon className="w-4 h-4" />
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  // ==========================================
  // EMPTY WISHLIST
  // ==========================================
  if (wishlist.length === 0) {
    return (
      <div className="min-h-screen bg-cream-100 flex items-center justify-center px-4 py-16">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center rounded-full bg-cream-200">
            <HeartSolidIcon className="w-8 h-8 text-ink-500" />
          </div>
          <p className="kicker mb-3">Your Collection</p>
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-ink-800 mb-3">
            Your wishlist is empty.
          </h1>
          <p className="text-sm text-ink-500 mb-8">
            Save your favourite pieces here and come back whenever you're ready.
          </p>
          <Link to="/products" className="btn-solid">
            Explore Jewellery
            <ArrowRightIcon className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    );
  }

  // ==========================================
  // MAIN WISHLIST VIEW
  // ==========================================
  return (
    <div className="min-h-screen bg-cream-100 pb-16">
      {/* ==========================================
          HEADER
      ========================================== */}
      <section className="border-b border-line bg-cream-100">
        <div className="container-editorial py-8 md:py-12">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <p className="kicker mb-3">My Collection</p>
              <h1 className="section-heading">
                Your <span className="italic">wishlist.</span>
              </h1>
              <p className="text-xs md:text-sm text-ink-500 mt-3">
                {wishlist.length}{' '}
                {wishlist.length === 1 ? 'piece' : 'pieces'} saved
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                to="/products"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-line rounded text-[11px] uppercase tracking-wider font-medium text-ink-700 hover:border-ink-800 transition-colors"
              >
                <ArrowLeftIcon className="w-3.5 h-3.5" />
                Continue Shopping
              </Link>
              <button
                onClick={clearWishlist}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-line rounded text-[11px] uppercase tracking-wider font-medium text-ink-500 hover:border-burgundy-500 hover:text-burgundy-500 transition-colors"
              >
                <XMarkIcon className="w-3.5 h-3.5" />
                Clear All
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================
          PRODUCTS GRID
      ========================================== */}
      <section className="container-editorial py-8 md:py-10">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
          <AnimatePresence initial={false}>
            {wishlist.map((product, index) => {
              const discount = getDiscount(product);
              const price = getPrice(product);
              const isRemoving = removingId === product.id;

              return (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: Math.min(index * 0.03, 0.3) }}
                  className="group relative"
                >
                  {/* Image */}
                  <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-cream-200 mb-3">
                    <Link to={`/products/${product.id}`} className="block h-full">
                      <img
                        src={
                          product.main_image ||
                          product.images?.[0] ||
                          'https://via.placeholder.com/400'
                        }
                        alt={product.name}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    </Link>

                    {/* Discount badge */}
                    {discount > 0 && (
                      <span className="absolute top-3 left-3 bg-ink-800 text-cream-100 text-[10px] font-semibold tracking-wide px-2 py-1 rounded-sm">
                        {discount}% OFF
                      </span>
                    )}

                    {/* Remove button */}
                    <button
                      onClick={() => removeFromWishlist(product.id)}
                      disabled={isRemoving}
                      className="absolute top-3 right-3 w-8 h-8 rounded-full bg-cream-100/90 backdrop-blur-sm flex items-center justify-center hover:bg-cream-100 transition-colors disabled:opacity-50"
                      aria-label="Remove from wishlist"
                    >
                      {isRemoving ? (
                        <span className="w-3.5 h-3.5 border-2 border-burgundy-500 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <HeartSolidIcon className="w-4 h-4 text-burgundy-500" />
                      )}
                    </button>
                  </div>

                  {/* Info */}
                  <div>
                    <Link to={`/products/${product.id}`}>
                      <h3 className="text-sm md:text-[15px] font-medium text-ink-800 leading-snug line-clamp-1 group-hover:text-burgundy-500 transition-colors">
                        {product.name}
                      </h3>
                    </Link>

                    {/* Price */}
                    <div className="mt-1.5 flex items-baseline gap-2 flex-wrap">
                      {product.discount_price ? (
                        <>
                          <span className="text-sm md:text-[15px] font-semibold text-burgundy-500">
                            ₹{Number(product.discount_price).toLocaleString('en-IN')}
                          </span>
                          <span className="text-xs text-ink-400 line-through">
                            ₹{Number(product.price).toLocaleString('en-IN')}
                          </span>
                        </>
                      ) : (
                        <span className="text-sm md:text-[15px] font-semibold text-ink-800">
                          ₹{Number(product.price).toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>

                    {/* Move to cart — desktop: hover reveals button */}
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="mt-3 w-full hidden md:flex items-center justify-center gap-1.5 py-2.5 bg-ink-800 text-cream-100 rounded text-[10px] uppercase tracking-wider font-semibold hover:bg-burgundy-500 transition-colors"
                    >
                      <ShoppingBagIcon className="w-3.5 h-3.5" />
                      Add to Cart
                    </button>

                    {/* Mobile: compact link button */}
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="mt-3 w-full md:hidden py-2 border border-ink-800 text-ink-800 rounded text-[10px] uppercase tracking-wider font-semibold hover:bg-ink-800 hover:text-cream-100 transition-colors"
                    >
                      Add to Cart
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* ==========================================
            BOTTOM CTA
        ========================================== */}
        <div className="mt-16 pt-10 border-t border-line text-center">
          <p className="kicker mb-4">Discover More</p>
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-ink-800 mb-4">
            Continue <span className="italic">shopping.</span>
          </h2>
          <p className="text-sm text-ink-600 mb-8 max-w-md mx-auto">
            Explore our full collection to find more pieces you'll love.
          </p>
          <Link to="/products" className="btn-solid inline-flex items-center gap-2">
            Shop Collection
            <ArrowRightIcon className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default WishlistPage;