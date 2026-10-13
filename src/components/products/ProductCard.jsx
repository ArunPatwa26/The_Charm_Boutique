import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HeartIcon, ShoppingBagIcon, StarIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { useState, useEffect } from 'react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { getWishlist, addToWishlistAPI, removeFromWishlistAPI } from '../../services/wishlistService';
import toast from 'react-hot-toast';

const ProductCard = ({ product }) => {
  const { isAuthenticated } = useAuth();
  const [isWishlist, setIsWishlist] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [loading, setLoading] = useState(false);
  const { addToCart } = useCart();

  const discountPercentage = product.discount_price
    ? Math.round(((product.price - product.discount_price) / product.price) * 100)
    : 0;

  // ==========================================
  // TRUNCATE HELPERS
  // ==========================================
  const truncateText = (text, maxLength) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '…';
  };

  // Product name: 50 chars max
  const displayName = truncateText(product.name, 50);

  // Description: 90 chars max
  const displayDescription = truncateText(product.description, 90);

  useEffect(() => {
    if (!product || !isAuthenticated) return;
    checkWishlistStatus();
  }, [product, isAuthenticated]);

  const checkWishlistStatus = async () => {
    try {
      const response = await getWishlist();
      if (response.success) {
        const exists = response.wishlist?.some((item) => item.id === product.id);
        setIsWishlist(!!exists);
      }
    } catch (error) {
      console.error('Failed to check wishlist:', error);
    }
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product.id, 1);
  };

  const handleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error('Please login to add items to wishlist');
      return;
    }

    setLoading(true);
    try {
      if (isWishlist) {
        await removeFromWishlistAPI(product.id);
        setIsWishlist(false);
        toast.success('Removed from wishlist');
      } else {
        await addToWishlistAPI(product.id);
        setIsWishlist(true);
        toast.success('Added to wishlist');
      }
    } catch (error) {
      toast.error(error?.message || 'Failed to update wishlist');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="card group relative bg-white rounded-xl md:rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow flex flex-col h-full"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
    >
      <Link to={`/products/${product.id}`} className="flex flex-col h-full">
        {/* ==========================================
            IMAGE CONTAINER
        ========================================== */}
        <div className="relative overflow-hidden aspect-square bg-gray-50">
          <img
            src={
              product.main_image ||
              product.images?.[0] ||
              'https://via.placeholder.com/400'
            }
            alt={product.name}
            className={`w-full h-full object-cover transition-transform duration-700 ${
              isHovered ? 'scale-110' : 'scale-100'
            }`}
            loading="lazy"
          />

          {/* Discount Badge */}
          {discountPercentage > 0 && (
            <div className="absolute top-2 md:top-3 left-2 md:left-3 bg-red-500 text-white px-2 md:px-2.5 py-0.5 md:py-1 rounded-full text-[10px] md:text-xs font-bold shadow-md">
              -{discountPercentage}%
            </div>
          )}

          {/* Out of Stock Overlay */}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="bg-white text-gray-900 px-3 py-1.5 rounded-full text-xs md:text-sm font-bold shadow-lg">
                Out of Stock
              </span>
            </div>
          )}

          {/* Wishlist Button */}
          <button
            onClick={handleWishlist}
            disabled={loading}
            className="absolute top-2 md:top-3 right-2 md:right-3 bg-white/90 backdrop-blur-sm p-1.5 md:p-2 rounded-full shadow-md hover:shadow-lg transition-all disabled:opacity-50 hover:scale-110"
            aria-label="Add to wishlist"
          >
            {isWishlist ? (
              <HeartSolidIcon className="w-3.5 h-3.5 md:w-4 md:h-4 text-red-500" />
            ) : (
              <HeartIcon className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-600" />
            )}
          </button>

          {/* Quick Add - Desktop only */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 20 }}
            transition={{ duration: 0.3 }}
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="hidden md:flex absolute bottom-3 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-sm px-5 py-2 rounded-full shadow-lg hover:shadow-xl font-semibold text-amber-600 hover:text-amber-700 transition-all duration-300 items-center gap-2 text-xs disabled:opacity-50"
          >
            <ShoppingBagIcon className="w-3.5 h-3.5" />
            Quick Add
          </motion.button>
        </div>

        {/* ==========================================
            PRODUCT INFO
        ========================================== */}
        <div className="p-3 md:p-4 flex flex-col flex-1">

          {/* Category + Rating */}
          <div className="flex items-center justify-between mb-1.5 md:mb-2">
            <p className="text-[10px] md:text-xs text-amber-600 font-semibold uppercase tracking-wide truncate">
              {product.category_name || 'Jewellery'}
            </p>
            <div className="flex items-center gap-0.5 md:gap-1 flex-shrink-0">
              <StarIcon className="w-3 h-3 md:w-3.5 md:h-3.5 text-yellow-400 fill-yellow-400" />
              <span className="text-[10px] md:text-xs font-medium text-gray-600">
                {(product.average_rating || 4.5).toFixed(1)}
              </span>
            </div>
          </div>

          {/* ==========================================
              PRODUCT NAME — Truncated to 50 chars
          ========================================== */}
          <h3
            className="font-semibold text-xs md:text-sm text-gray-900 mb-1.5 md:mb-2 hover:text-amber-600 transition-colors leading-snug"
            title={product.name}
          >
            {displayName}
          </h3>

          {/* ==========================================
              DESCRIPTION — Truncated to 90 chars
          ========================================== */}
          <p
            className="text-[11px] md:text-xs text-gray-500 leading-relaxed mb-2 md:mb-3 min-h-[2.5rem] md:min-h-[2.5rem]"
            title={product.description}
          >
            {displayDescription || 'No description available'}
          </p>

          {/* ==========================================
              PRICE
          ========================================== */}
          <div className="mt-auto">
            <div className="flex items-baseline gap-2 flex-wrap">
              {product.discount_price ? (
                <>
                  <span className="text-sm md:text-lg font-bold text-amber-600">
                    ₹{Number(product.discount_price).toFixed(2)}
                  </span>
                  <span className="text-[10px] md:text-xs text-gray-400 line-through">
                    ₹{Number(product.price).toFixed(2)}
                  </span>
                </>
              ) : (
                <span className="text-sm md:text-lg font-bold text-amber-600">
                  ₹{Number(product.price).toFixed(2)}
                </span>
              )}
            </div>

            {/* Material + Gemstone tags — Desktop only */}
            <div className="hidden md:flex flex-wrap gap-1.5 mt-2.5">
              {product.material && (
                <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded-full text-gray-600">
                  {product.material}
                </span>
              )}
              {product.gemstone && (
                <span className="text-[10px] bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full">
                  {product.gemstone}
                </span>
              )}
            </div>

            {/* Mobile-only Add to Cart */}
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="md:hidden w-full mt-2.5 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1.5 active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShoppingBagIcon className="w-3.5 h-3.5" />
              {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;