import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HeartIcon,
  ShoppingBagIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import {
  getWishlist,
  addToWishlistAPI,
  removeFromWishlistAPI,
} from '../../services/wishlistService';
import toast from 'react-hot-toast';

const ProductCard = ({ product }) => {
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();

  const [isWishlist, setIsWishlist] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  const isOutOfStock = product?.stock === 0;

  const discountPercentage = product?.discount_price
    ? Math.round(
        ((product.price - product.discount_price) / product.price) * 100
      )
    : 0;

  // ==========================================
  // WISHLIST STATUS
  // ==========================================
  useEffect(() => {
    if (!product || !isAuthenticated) {
      setIsWishlist(false);
      return;
    }
    const check = async () => {
      try {
        const res = await getWishlist();
        if (res.success) {
          const exists = res.wishlist?.some((item) => item.id === product.id);
          setIsWishlist(!!exists);
        }
      } catch {
        // silent
      }
    };
    check();
  }, [product, isAuthenticated]);

  // ==========================================
  // HANDLERS
  // ==========================================
  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
    addToCart(product.id, 1);
  };

  const handleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error('Please log in to add to wishlist');
      return;
    }
    setWishlistLoading(true);
    try {
      if (isWishlist) {
        await removeFromWishlistAPI(product.id);
        setIsWishlist(false);
      } else {
        await addToWishlistAPI(product.id);
        setIsWishlist(true);
      }
    } catch (err) {
      toast.error(err?.message || 'Failed to update wishlist');
    } finally {
      setWishlistLoading(false);
    }
  };

  // ==========================================
  // IMAGE
  // ==========================================
  const imageUrl =
    product?.main_image ||
    product?.images?.[0] ||
    'https://via.placeholder.com/600x800?text=Jewellery';

  return (
    <motion.div
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="group relative"
    >
      <Link to={`/products/${product.id}`} className="block">
        {/* ==========================================
            IMAGE CONTAINER
        ========================================== */}
        <div className="relative aspect-[4/5] overflow-hidden bg-cream-200 rounded-lg">
          <img
            src={imageUrl}
            alt={product.name}
            loading="lazy"
            className={`w-full h-full object-cover transition-transform duration-700 ${
              isHovered ? 'scale-105' : 'scale-100'
            }`}
          />

          {/* Discount badge — top left */}
          {discountPercentage > 0 && (
            <span className="absolute top-3 left-3 bg-ink-800 text-cream-100 text-[10px] font-semibold tracking-wide px-2 py-1 rounded-sm">
              {discountPercentage}% OFF
            </span>
          )}

          {/* Out of stock overlay */}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-cream-100/70 backdrop-blur-[2px] flex items-center justify-center">
              <span className="bg-ink-800 text-cream-100 text-[11px] font-semibold tracking-wider uppercase px-4 py-2 rounded-sm">
                Sold Out
              </span>
            </div>
          )}

          {/* Wishlist button — top right */}
          <button
            onClick={handleWishlist}
            disabled={wishlistLoading}
            className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-cream-100/90 backdrop-blur-sm hover:bg-cream-100 transition-colors disabled:opacity-50"
            aria-label={isWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            {isWishlist ? (
              <HeartSolidIcon className="w-4 h-4 text-burgundy-500" />
            ) : (
              <HeartIcon className="w-4 h-4 text-ink-800" />
            )}
          </button>

          {/* Quick add — desktop only, appears on hover */}
          <div className="hidden md:block absolute bottom-0 left-0 right-0">
            <motion.button
              initial={false}
              animate={{
                opacity: isHovered ? 1 : 0,
                y: isHovered ? 0 : 12,
              }}
              transition={{ duration: 0.2 }}
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className="w-full bg-ink-800 text-cream-100 py-3 text-[11px] font-semibold tracking-widest uppercase flex items-center justify-center gap-2 hover:bg-burgundy-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ShoppingBagIcon className="w-3.5 h-3.5" />
              {isOutOfStock ? 'Sold Out' : 'Add to Cart'}
            </motion.button>
          </div>
        </div>

        {/* ==========================================
            PRODUCT INFO — minimal
        ========================================== */}
        <div className="mt-3 md:mt-3.5">
          {/* Name */}
          <h3 className="text-sm md:text-[15px] font-medium text-ink-800 leading-snug line-clamp-1 group-hover:text-burgundy-500 transition-colors">
            {product.name}
          </h3>

          {/* Price row */}
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

          {/* Add to cart — mobile only */}
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className="md:hidden mt-3 w-full border border-ink-800 text-ink-800 py-2 text-[10px] font-semibold tracking-widest uppercase rounded hover:bg-ink-800 hover:text-cream-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isOutOfStock ? 'Sold Out' : 'Add to Cart'}
          </button>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;