import { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  StarIcon,
  HeartIcon,
  ShoppingBagIcon,
  TruckIcon,
  ShieldCheckIcon,
  ArrowLeftIcon,
  ShareIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CheckIcon,
  MinusIcon,
  PlusIcon,
  ArrowRightIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { getProductById, getProducts } from '../services/productService';
import { getWishlist, addToWishlistAPI, removeFromWishlistAPI } from '../services/wishlistService';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ProductCard from '../components/products/ProductCard';
import toast from 'react-hot-toast';

const FALLBACK_IMAGE = 'https://via.placeholder.com/600';

const ProductDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [relatedLoading, setRelatedLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isWishlist, setIsWishlist] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  // ==========================================
  // FETCH PRODUCT + RELATED
  // ==========================================
  useEffect(() => {
    fetchProduct();
    window.scrollTo(0, 0);
  }, [id]);

  const fetchProduct = async () => {
    setLoading(true);
    setRelatedProducts([]);
    try {
      const response = await getProductById(id);
      if (response.success) {
        setProduct(response.product);
        setSelectedImage(0);
        setQuantity(1);

        // Check wishlist status
        if (isAuthenticated) {
          checkWishlistStatus(response.product.id);
        }

        // Fetch related products
        fetchRelated(response.product);
      } else {
        toast.error('Product not found');
      }
    } catch (error) {
      console.error('Failed to fetch product:', error);
      toast.error('Product not found');
    } finally {
      setLoading(false);
    }
  };

  const fetchRelated = async (currentProduct) => {
    setRelatedLoading(true);
    try {
      let related = [];

      // ==========================================
      // STRATEGY 1: Same category products
      // ==========================================
      const categoryId =
        typeof currentProduct.category === 'string'
          ? currentProduct.category
          : currentProduct.category?.$oid || currentProduct.category?._id;

      if (categoryId) {
        const response = await getProducts({
          category: categoryId,
          limit: 10,
        });

        if (response.success && response.products?.length > 0) {
          related = response.products.filter((p) => p.id !== currentProduct.id);
        }
      }

      // ==========================================
      // STRATEGY 2: Fallback — highest rated products
      // ==========================================
      if (related.length < 4) {
        const fallbackRes = await getProducts({
          limit: 10,
          sort_by: 'rating',
        });

        if (fallbackRes.success) {
          const fallbackProducts = (fallbackRes.products || []).filter(
            (p) =>
              p.id !== currentProduct.id &&
              !related.some((r) => r.id === p.id)
          );
          related = [...related, ...fallbackProducts];
        }
      }

      // ==========================================
      // STRATEGY 3: Last resort — any products
      // ==========================================
      if (related.length < 4) {
        const allRes = await getProducts({ limit: 12 });
        if (allRes.success) {
          const allProducts = (allRes.products || []).filter(
            (p) =>
              p.id !== currentProduct.id &&
              !related.some((r) => r.id === p.id)
          );
          related = [...related, ...allProducts];
        }
      }

      setRelatedProducts(related.slice(0, 4));
    } catch (error) {
      console.error('Failed to fetch related products:', error);
      setRelatedProducts([]);
    } finally {
      setRelatedLoading(false);
    }
  };

  const checkWishlistStatus = async (productId) => {
    try {
      const response = await getWishlist();
      if (response.success) {
        const exists = response.wishlist?.some((item) => item.id === productId);
        setIsWishlist(!!exists);
      }
    } catch (error) {
      console.error('Wishlist check error:', error);
    }
  };

  // ==========================================
  // ACTIONS
  // ==========================================
  const handleAddToCart = async () => {
    const success = await addToCart(product.id, quantity);
    if (success) {
      toast.success(`${quantity} × ${product.name} added to cart!`);
    }
  };

  const handleBuyNow = async () => {
    const success = await addToCart(product.id, quantity);
    if (success) {
      navigate('/cart');
    }
  };

  const handleWishlist = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to wishlist');
      return;
    }

    setWishlistLoading(true);
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
      setWishlistLoading(false);
    }
  };

  const handleQuantityChange = (newQty) => {
    if (newQty >= 1 && newQty <= (product?.stock || 10)) {
      setQuantity(newQty);
    }
  };

  const handleShare = async (platform) => {
    const url = window.location.href;
    const text = `Check out this beautiful ${product.name} at AI Jewellery Shop!`;

    try {
      if (platform === 'copy') {
        await navigator.clipboard.writeText(url);
        toast.success('Link copied to clipboard!');
      } else if (platform === 'whatsapp') {
        window.open(
          `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`,
          '_blank'
        );
      } else if (platform === 'twitter') {
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(
            text
          )}&url=${encodeURIComponent(url)}`,
          '_blank'
        );
      } else if (platform === 'facebook') {
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
            url
          )}`,
          '_blank'
        );
      } else if (platform === 'native' && navigator.share) {
        await navigator.share({ title: product.name, text, url });
      }
      setShowShareMenu(false);
    } catch (error) {
      if (error.name !== 'AbortError') {
        toast.error('Failed to share');
      }
    }
  };

  // ==========================================
  // FORMATTED DESCRIPTION
  // ==========================================
  const renderedDescription = useMemo(() => {
    if (!product?.description) return null;
    return renderFormattedDescription(product.description);
  }, [product?.description]);

  // ==========================================
  // LOADING STATE
  // ==========================================
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // ==========================================
  // NOT FOUND STATE
  // ==========================================
  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-gray-50">
        <ShoppingBagIcon className="w-20 h-20 text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          Product not found
        </h2>
        <p className="text-gray-500 mb-6 text-center">
          The product you're looking for doesn't exist or has been removed.
        </p>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-full hover:bg-amber-600 transition-colors font-medium"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Back to Products
        </Link>
      </div>
    );
  }

  const discountPercentage = product.discount_price
    ? Math.round(((product.price - product.discount_price) / product.price) * 100)
    : 0;

  const images =
    product.images?.length > 0
      ? product.images
      : [product.main_image || FALLBACK_IMAGE];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ==========================================
          BREADCRUMB
      ========================================== */}
      <div className="bg-white border-b border-gray-100">
        <div className="container-custom py-3 md:py-4">
          <div className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm text-gray-500 overflow-x-auto whitespace-nowrap">
            <Link to="/" className="hover:text-amber-600 transition-colors">
              Home
            </Link>
            <span className="text-gray-300">/</span>
            <Link to="/products" className="hover:text-amber-600 transition-colors">
              Products
            </Link>
            {product.category && (
              <>
                <span className="text-gray-300">/</span>
                <Link
                  to={`/categories/${product.category}`}
                  className="hover:text-amber-600 transition-colors"
                >
                  {product.category_name || 'Category'}
                </Link>
              </>
            )}
            <span className="text-gray-300">/</span>
            <span className="text-gray-900 font-medium truncate max-w-[150px] md:max-w-xs">
              {product.name}
            </span>
          </div>
        </div>
      </div>

      {/* ==========================================
          MAIN PRODUCT SECTION
      ========================================== */}
      <div className="container-custom py-6 md:py-10">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* ==========================================
              LEFT: IMAGE GALLERY
          ========================================== */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="relative">
              <motion.div
                key={selectedImage}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-2xl md:rounded-3xl overflow-hidden shadow-sm border border-gray-100 relative"
              >
                <img
                  src={images[selectedImage] || FALLBACK_IMAGE}
                  alt={product.name}
                  className="w-full h-[320px] sm:h-[420px] md:h-[520px] object-cover"
                  onError={(e) => {
                    e.target.src = FALLBACK_IMAGE;
                  }}
                />

                {discountPercentage > 0 && (
                  <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1.5 rounded-full text-xs md:text-sm font-bold shadow-lg">
                    -{discountPercentage}% OFF
                  </div>
                )}

                <button
                  onClick={handleWishlist}
                  disabled={wishlistLoading}
                  className="absolute top-4 right-4 w-10 h-10 md:w-12 md:h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all hover:scale-110 disabled:opacity-50"
                  aria-label="Wishlist"
                >
                  {isWishlist ? (
                    <HeartSolidIcon className="w-5 h-5 md:w-6 md:h-6 text-red-500" />
                  ) : (
                    <HeartIcon className="w-5 h-5 md:w-6 md:h-6 text-gray-600" />
                  )}
                </button>
              </motion.div>

              {images.length > 1 && (
                <>
                  <button
                    onClick={() =>
                      setSelectedImage((prev) =>
                        prev === 0 ? images.length - 1 : prev - 1
                      )
                    }
                    className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 w-10 h-10 md:w-11 md:h-11 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
                    aria-label="Previous image"
                  >
                    <ChevronLeftIcon className="w-5 h-5 md:w-6 md:h-6" />
                  </button>
                  <button
                    onClick={() =>
                      setSelectedImage((prev) =>
                        prev === images.length - 1 ? 0 : prev + 1
                      )
                    }
                    className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 w-10 h-10 md:w-11 md:h-11 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
                    aria-label="Next image"
                  >
                    <ChevronRightIcon className="w-5 h-5 md:w-6 md:h-6" />
                  </button>
                </>
              )}

              {images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs px-3 py-1 rounded-full backdrop-blur-sm">
                  {selectedImage + 1} / {images.length}
                </div>
              )}
            </div>

            {images.length > 1 && (
              <div className="flex gap-2 md:gap-3 mt-3 md:mt-4 overflow-x-auto pb-2">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`
                      flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden border-2 transition-all duration-300
                      ${
                        selectedImage === index
                          ? 'border-amber-500 ring-2 ring-amber-200 shadow-md'
                          : 'border-gray-200 hover:border-amber-300'
                      }
                    `}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = FALLBACK_IMAGE;
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ==========================================
              RIGHT: PRODUCT INFO
          ========================================== */}
          <div className="space-y-5 md:space-y-6">
            {/* Category + Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <Link
                to={`/categories/${product.category}`}
                className="text-xs md:text-sm text-amber-700 font-semibold bg-amber-50 hover:bg-amber-100 px-3 py-1 rounded-full transition-colors"
              >
                {product.category_name || 'Jewellery'}
              </Link>

              {product.is_featured && (
                <span className="text-xs md:text-sm bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full font-medium flex items-center gap-1">
                  <StarIcon className="w-3 h-3 fill-yellow-800" />
                  Featured
                </span>
              )}

              {product.is_ai_recommended && (
                <span className="text-xs md:text-sm bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-medium flex items-center gap-1">
                  <SparklesIcon className="w-3 h-3" />
                  AI Recommended
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-gray-900 leading-tight">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <StarIcon
                    key={i}
                    className={`w-4 h-4 md:w-5 md:h-5 ${
                      i < Math.floor(product.average_rating || 4.5)
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm font-semibold text-gray-900">
                {(product.average_rating || 4.5).toFixed(1)}
              </span>
              <span className="text-xs md:text-sm text-gray-400">
                ({product.num_reviews || 0}{' '}
                {product.num_reviews === 1 ? 'review' : 'reviews'})
              </span>
            </div>

            {/* Price */}
            <div className="bg-gray-50 rounded-2xl p-4 md:p-5 border border-gray-100">
              {product.discount_price ? (
                <>
                  <div className="flex items-baseline gap-3 flex-wrap">
                    <span className="text-3xl md:text-4xl font-bold text-amber-600">
                      ₹{Number(product.discount_price).toFixed(2)}
                    </span>
                    <span className="text-lg md:text-xl text-gray-400 line-through">
                      ₹{Number(product.price).toFixed(2)}
                    </span>
                    <span className="text-xs md:text-sm text-green-700 font-semibold bg-green-100 px-2.5 py-1 rounded-full">
                      Save ₹
                      {Number(product.price - product.discount_price).toFixed(2)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1.5">
                    Inclusive of all taxes
                  </p>
                </>
              ) : (
                <>
                  <span className="text-3xl md:text-4xl font-bold text-amber-600">
                    ₹{Number(product.price).toFixed(2)}
                  </span>
                  <p className="text-xs text-gray-500 mt-1.5">
                    Inclusive of all taxes
                  </p>
                </>
              )}
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-2">
              {product.stock > 0 ? (
                <>
                  <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></span>
                  <span className="text-sm text-green-700 font-semibold">
                    In Stock
                  </span>
                  {product.stock <= 5 && (
                    <span className="text-xs text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full font-medium">
                      Only {product.stock} left!
                    </span>
                  )}
                </>
              ) : (
                <>
                  <span className="w-2.5 h-2.5 bg-red-500 rounded-full"></span>
                  <span className="text-sm text-red-600 font-semibold">
                    Out of Stock
                  </span>
                </>
              )}
            </div>

            {/* ==========================================
                FORMATTED DESCRIPTION
            ========================================== */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2 uppercase tracking-wider">
                Product Description
              </h3>
              <div className="text-sm md:text-base text-gray-600 leading-relaxed space-y-1">
                {renderedDescription}
              </div>
            </div>

            {/* ==========================================
                SPECIFICATIONS
            ========================================== */}
            <div className="bg-gray-50 rounded-2xl p-4 md:p-5 border border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider">
                Specifications
              </h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                {product.material && (
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Material</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {product.material}
                    </p>
                  </div>
                )}
                {product.gemstone && (
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Gemstone</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {product.gemstone}
                    </p>
                  </div>
                )}
                {product.weight && (
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Weight</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {product.weight} g
                    </p>
                  </div>
                )}
                {product.category_name && (
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Category</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {product.category_name}
                    </p>
                  </div>
                )}
              </div>

              {product.tags && product.tags.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500 mb-2">Tags</p>
                  <div className="flex flex-wrap gap-1.5">
                    {product.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs bg-white border border-gray-200 text-gray-600 px-2.5 py-1 rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ==========================================
                QUANTITY + ADD TO CART
            ========================================== */}
            {product.stock > 0 && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-gray-900 mb-2 block">
                    Quantity
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center border-2 border-gray-200 rounded-full overflow-hidden bg-white">
                      <button
                        onClick={() => handleQuantityChange(quantity - 1)}
                        disabled={quantity <= 1}
                        className="px-3 md:px-4 py-2.5 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        aria-label="Decrease quantity"
                      >
                        <MinusIcon className="w-4 h-4" />
                      </button>
                      <span className="w-12 md:w-14 text-center font-bold text-base">
                        {quantity}
                      </span>
                      <button
                        onClick={() => handleQuantityChange(quantity + 1)}
                        disabled={quantity >= product.stock}
                        className="px-3 md:px-4 py-2.5 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        aria-label="Increase quantity"
                      >
                        <PlusIcon className="w-4 h-4" />
                      </button>
                    </div>
                    <span className="text-sm text-gray-500">
                      Max:{' '}
                      <strong className="text-gray-900">{product.stock}</strong>
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleAddToCart}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white border-2 border-amber-500 text-amber-600 rounded-full font-semibold text-sm hover:bg-amber-50 transition-all shadow-sm"
                  >
                    <ShoppingBagIcon className="w-5 h-5" />
                    Add to Cart
                  </button>
                  <button
                    onClick={handleBuyNow}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-full font-semibold text-sm hover:from-amber-600 hover:to-yellow-600 transition-all shadow-md hover:shadow-lg"
                  >
                    Buy Now
                    <ArrowRightIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {product.stock === 0 && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-center">
                <p className="text-sm text-red-700 font-medium">
                  This product is currently out of stock.
                </p>
                <p className="text-xs text-red-500 mt-1">
                  Please check back later or explore similar items below.
                </p>
              </div>
            )}

            {/* ==========================================
                SHARE + WISHLIST
            ========================================== */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleWishlist}
                disabled={wishlistLoading}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 border-2 border-gray-200 rounded-full hover:border-amber-300 hover:bg-amber-50 transition-all text-sm font-medium text-gray-700 disabled:opacity-50"
              >
                {isWishlist ? (
                  <HeartSolidIcon className="w-4 h-4 text-red-500" />
                ) : (
                  <HeartIcon className="w-4 h-4" />
                )}
                {isWishlist ? 'Wishlisted' : 'Add to Wishlist'}
              </button>

              <div className="relative">
                <button
                  onClick={() => setShowShareMenu(!showShareMenu)}
                  className="inline-flex items-center justify-center gap-2 px-4 py-3 border-2 border-gray-200 rounded-full hover:border-amber-300 hover:bg-amber-50 transition-all text-sm font-medium text-gray-700"
                >
                  <ShareIcon className="w-4 h-4" />
                  Share
                </button>

                <AnimatePresence>
                  {showShareMenu && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setShowShareMenu(false)}
                      />
                      <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.95 }}
                        className="absolute right-0 bottom-full mb-2 w-44 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-20"
                      >
                        <button
                          onClick={() => handleShare('copy')}
                          className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-amber-50 transition-colors"
                        >
                          📋 Copy Link
                        </button>
                        <button
                          onClick={() => handleShare('whatsapp')}
                          className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-amber-50 transition-colors"
                        >
                          💬 WhatsApp
                        </button>
                        <button
                          onClick={() => handleShare('twitter')}
                          className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-amber-50 transition-colors"
                        >
                          🐦 Twitter
                        </button>
                        <button
                          onClick={() => handleShare('facebook')}
                          className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-amber-50 transition-colors"
                        >
                          📘 Facebook
                        </button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* ==========================================
                TRUST FEATURES
            ========================================== */}
            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2.5 text-xs md:text-sm text-gray-700">
                <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center flex-shrink-0">
                  <TruckIcon className="w-4 h-4 text-amber-600" />
                </div>
                <span>Free Shipping</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs md:text-sm text-gray-700">
                <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center flex-shrink-0">
                  <ShieldCheckIcon className="w-4 h-4 text-amber-600" />
                </div>
                <span>Secure Payment</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs md:text-sm text-gray-700">
                <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center flex-shrink-0">
                  <ArrowLeftIcon className="w-4 h-4 text-amber-600" />
                </div>
                <span>30-Day Returns</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs md:text-sm text-gray-700">
                <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center flex-shrink-0">
                  <CheckIcon className="w-4 h-4 text-amber-600" />
                </div>
                <span>Certified</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ==========================================
          RELATED PRODUCTS
      ========================================== */}
      <section className="py-10 md:py-14 bg-white border-t border-gray-100">
        <div className="container-custom">
          <div className="flex items-end justify-between mb-6 md:mb-8">
            <div>
              <p className="text-amber-600 text-xs md:text-sm font-semibold uppercase tracking-wider mb-1">
                You May Also Like
              </p>
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-gray-900">
                Similar Pieces
              </h2>
            </div>
            {product.category && (
              <Link
                to={`/categories/${product.category}`}
                className="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-amber-600 hover:text-amber-700 transition-colors"
              >
                View All
                <ArrowRightIcon className="w-4 h-4" />
              </Link>
            )}
          </div>

          {relatedLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="bg-gray-100 rounded-2xl aspect-[3/4] animate-pulse"
                />
              ))}
            </div>
          ) : relatedProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
              {relatedProducts.map((p, index) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08 }}
                  viewport={{ once: true }}
                >
                  <ProductCard product={p} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 bg-gray-50 rounded-2xl">
              <ShoppingBagIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm mb-4">
                No similar products found in this category
              </p>
              <Link
                to="/products"
                className="inline-flex items-center gap-1 px-5 py-2.5 bg-gray-900 text-white rounded-full hover:bg-amber-600 transition-colors text-sm font-medium"
              >
                Browse All Products
                <ArrowRightIcon className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

// ==========================================
// DESCRIPTION FORMATTER
// ==========================================
function renderFormattedDescription(text) {
  if (!text)
    return (
      <p className="text-gray-500 italic">No description available</p>
    );

  const lines = text.split('\n');
  const elements = [];

  lines.forEach((line, lineIdx) => {
    const trimmed = line.trim();

    if (!trimmed) {
      elements.push(<div key={`sp-${lineIdx}`} className="h-2" />);
      return;
    }

    // Bullet points
    if (trimmed.startsWith('• ') || trimmed.startsWith('- ')) {
      elements.push(
        <div key={lineIdx} className="flex items-start gap-2 ml-2">
          <span className="text-amber-500 mt-0.5 flex-shrink-0">•</span>
          <span>{applyInlineFormatting(trimmed.substring(2))}</span>
        </div>
      );
      return;
    }

    // Numbered lists
    if (/^\d+\.\s/.test(trimmed)) {
      const match = trimmed.match(/^(\d+)\.\s(.*)$/);
      if (match) {
        elements.push(
          <div key={lineIdx} className="flex items-start gap-2 ml-2">
            <span className="text-amber-500 font-medium min-w-[1.2rem]">
              {match[1]}.
            </span>
            <span>{applyInlineFormatting(match[2])}</span>
          </div>
        );
        return;
      }
    }

    // Regular paragraph
    elements.push(
      <p key={lineIdx} className="leading-relaxed">
        {applyInlineFormatting(trimmed)}
      </p>
    );
  });

  return elements;
}

function applyInlineFormatting(text) {
  const parts = [];
  const regex = /(\*\*[^*]+\*\*|\*[^*]+\*)/g;
  let lastIndex = 0;
  let match;
  let keyIdx = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }

    const token = match[0];

    if (token.startsWith('**') && token.endsWith('**')) {
      parts.push(
        <strong key={`b-${keyIdx++}`} className="font-bold text-gray-900">
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith('*') && token.endsWith('*')) {
      parts.push(
        <em key={`i-${keyIdx++}`} className="italic text-gray-700">
          {token.slice(1, -1)}
        </em>
      );
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts.length ? parts : text;
}

export default ProductDetailsPage;