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
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MinusIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

import { getProductById, getProducts } from '../services/productService';
import {
  getWishlist,
  addToWishlistAPI,
  removeFromWishlistAPI,
} from '../services/wishlistService';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ProductCard from '../components/products/ProductCard';
import toast from 'react-hot-toast';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=900&h=1100&fit=crop';

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
  const [openSection, setOpenSection] = useState('description');

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setRelatedProducts([]);
      window.scrollTo(0, 0);

      try {
        const response = await getProductById(id);
        if (response.success) {
          setProduct(response.product);
          setSelectedImage(0);
          setQuantity(1);
          setOpenSection('description');

          if (isAuthenticated) {
            checkWishlistStatus(response.product.id);
          }
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

    fetchProduct();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchRelated = async (currentProduct) => {
    setRelatedLoading(true);
    try {
      let related = [];
      const categoryId =
        typeof currentProduct.category === 'string'
          ? currentProduct.category
          : currentProduct.category?.$oid || currentProduct.category?._id;

      if (categoryId) {
        const response = await getProducts({ category: categoryId, limit: 10 });
        if (response.success && response.products?.length > 0) {
          related = response.products.filter((p) => p.id !== currentProduct.id);
        }
      }

      if (related.length < 4) {
        const fallbackRes = await getProducts({ limit: 10, sort_by: 'rating' });
        if (fallbackRes.success) {
          const fb = (fallbackRes.products || []).filter(
            (p) => p.id !== currentProduct.id && !related.some((r) => r.id === p.id)
          );
          related = [...related, ...fb];
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
        setIsWishlist(!!response.wishlist?.some((item) => item.id === productId));
      }
    } catch (error) {
      console.error('Wishlist check error:', error);
    }
  };

  const handleAddToCart = async () => {
    const success = await addToCart(product.id, quantity);
    if (success) toast.success('Added to cart');
  };

  const handleBuyNow = async () => {
    const success = await addToCart(product.id, quantity);
    if (success) navigate('/cart');
  };

  const handleWishlist = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in to save items');
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
    const text = `Check out this ${product.name} at The Charm Boutique`;

    try {
      if (platform === 'copy') {
        await navigator.clipboard.writeText(url);
        toast.success('Link copied');
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
      }
      setShowShareMenu(false);
    } catch (err) {
      if (err.name !== 'AbortError') toast.error('Failed to share');
    }
  };

  const renderedDescription = useMemo(() => {
    if (!product?.description) return null;
    return renderFormattedDescription(product.description);
  }, [product?.description]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream-100">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-cream-100">
        <ShoppingBagIcon className="w-14 h-14 text-ink-300 mb-5" />
        <h2 className="font-serif text-2xl font-bold text-ink-800 mb-2">
          Piece not found
        </h2>
        <p className="text-sm text-ink-500 mb-6 text-center max-w-sm">
          The piece you're looking for doesn't exist or has been removed.
        </p>
        <Link to="/products" className="btn-outline text-xs">
          <ArrowLeftIcon className="w-3.5 h-3.5" />
          Back to Shop
        </Link>
      </div>
    );
  }

  const isOutOfStock = product.stock === 0;
  const discountPercentage = product.discount_price
    ? Math.round(((product.price - product.discount_price) / product.price) * 100)
    : 0;

  const images =
    product.images?.length > 0
      ? product.images
      : [product.main_image || FALLBACK_IMAGE];

  const specs = [
    { label: 'Material', value: product.material },
    { label: 'Gemstone', value: product.gemstone },
    { label: 'Weight', value: product.weight ? `${product.weight} g` : null },
    { label: 'Category', value: product.category_name },
  ].filter((s) => s.value);

  return (
    <div className="min-h-screen bg-cream-100 pb-24 lg:pb-0">
      {/* BREADCRUMB */}
      <div className="border-b border-line bg-cream-100">
        <div className="container-editorial py-3.5">
          <nav className="flex items-center gap-2 text-xs text-ink-500 overflow-x-auto whitespace-nowrap scrollbar-hide">
            <Link to="/" className="hover:text-burgundy-500 transition-colors">
              Home
            </Link>
            <span className="text-ink-300">/</span>
            <Link
              to="/products"
              className="hover:text-burgundy-500 transition-colors"
            >
              Shop
            </Link>
            {product.category_name && (
              <>
                <span className="text-ink-300">/</span>
                <span className="text-ink-700 truncate max-w-[160px]">
                  {product.category_name}
                </span>
              </>
            )}
          </nav>
        </div>
      </div>

      {/* MAIN */}
      <section className="container-editorial py-6 md:py-10">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-14">
          {/* ==========================================
              LEFT — Image Gallery
              CHANGED: max-w to prevent image dominance
          ========================================== */}
          <div>
            <div className="lg:sticky lg:top-24">
              {/* Main Image — REDUCED MAX WIDTH + BETTER ASPECT */}
              <div className="max-w-[480px] mx-auto lg:mx-0">
                <div className="relative aspect-square overflow-hidden rounded-lg bg-cream-200">
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={selectedImage}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      src={images[selectedImage] || FALLBACK_IMAGE}
                      alt={product.name}
                      className="absolute inset-0 w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = FALLBACK_IMAGE;
                      }}
                    />
                  </AnimatePresence>

                  {/* Discount badge */}
                  {discountPercentage > 0 && (
                    <span className="absolute top-4 left-4 bg-ink-800 text-cream-100 text-[11px] font-semibold tracking-wide px-2.5 py-1 rounded-sm">
                      {discountPercentage}% OFF
                    </span>
                  )}

                  {/* Sold out */}
                  {isOutOfStock && (
                    <div className="absolute inset-0 bg-cream-100/70 backdrop-blur-[2px] flex items-center justify-center">
                      <span className="bg-ink-800 text-cream-100 text-[11px] font-semibold tracking-wider uppercase px-4 py-2 rounded-sm">
                        Sold Out
                      </span>
                    </div>
                  )}

                  {/* Nav arrows */}
                  {images.length > 1 && (
                    <>
                      <button
                        onClick={() =>
                          setSelectedImage((p) =>
                            p === 0 ? images.length - 1 : p - 1
                          )
                        }
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center bg-cream-100/90 backdrop-blur rounded-full hover:bg-cream-100 transition-colors"
                        aria-label="Previous"
                      >
                        <ChevronLeftIcon className="w-4 h-4 text-ink-800" />
                      </button>
                      <button
                        onClick={() =>
                          setSelectedImage((p) =>
                            p === images.length - 1 ? 0 : p + 1
                          )
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center bg-cream-100/90 backdrop-blur rounded-full hover:bg-cream-100 transition-colors"
                        aria-label="Next"
                      >
                        <ChevronRightIcon className="w-4 h-4 text-ink-800" />
                      </button>
                    </>
                  )}
                </div>

                {/* Thumbnails — smaller */}
                {images.length > 1 && (
                  <div className="flex gap-2 mt-3 overflow-x-auto scrollbar-hide">
                    {images.map((img, i) => (
                      <button
                        key={i}
                        onClick={() => setSelectedImage(i)}
                        className={`flex-shrink-0 w-14 h-14 md:w-16 md:h-16 overflow-hidden rounded border-2 transition-colors ${
                          selectedImage === i
                            ? 'border-ink-800'
                            : 'border-line hover:border-line-strong'
                        }`}
                      >
                        <img
                          src={img}
                          alt={`View ${i + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ==========================================
              RIGHT — Info
          ========================================== */}
          <div>
            {product.category_name && (
              <Link
                to={`/categories/${product.category}`}
                className="kicker inline-block mb-3 hover:text-ink-800 transition-colors"
              >
                {product.category_name}
              </Link>
            )}

            <h1 className="font-serif text-2xl md:text-3xl font-bold text-ink-800 leading-tight mb-4">
              {product.name}
            </h1>

            {product.average_rating !== undefined && (
              <div className="flex items-center gap-2 mb-5">
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon
                      key={i}
                      className={`w-3.5 h-3.5 ${
                        i < Math.floor(product.average_rating || 4.5)
                          ? 'text-ink-800 fill-ink-800'
                          : 'text-ink-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs text-ink-500">
                  {product.average_rating?.toFixed(1) || '4.5'}
                  {product.num_reviews > 0 && ` · ${product.num_reviews} reviews`}
                </span>
              </div>
            )}

            <div className="flex items-baseline gap-3 mb-6 pb-6 border-b border-line">
              {product.discount_price ? (
                <>
                  <span className="font-serif text-2xl md:text-3xl font-bold text-burgundy-500">
                    ₹{Number(product.discount_price).toLocaleString('en-IN')}
                  </span>
                  <span className="text-base text-ink-400 line-through">
                    ₹{Number(product.price).toLocaleString('en-IN')}
                  </span>
                </>
              ) : (
                <span className="font-serif text-2xl md:text-3xl font-bold text-ink-800">
                  ₹{Number(product.price).toLocaleString('en-IN')}
                </span>
              )}
              <span className="text-[11px] text-ink-500 ml-auto">
                Incl. of all taxes
              </span>
            </div>

            <div className="flex items-center gap-2 mb-6">
              {product.stock > 0 ? (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-green-600" />
                  <span className="text-xs uppercase tracking-wider font-medium text-ink-700">
                    In Stock
                  </span>
                  {product.stock <= 5 && (
                    <span className="text-[11px] text-burgundy-500 ml-2">
                      · Only {product.stock} left
                    </span>
                  )}
                </>
              ) : (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  <span className="text-xs uppercase tracking-wider font-medium text-ink-500">
                    Sold Out
                  </span>
                </>
              )}
            </div>

            {/* DESKTOP CTA */}
            <div className="hidden lg:block">
              {!isOutOfStock && (
                <>
                  <div className="flex items-center justify-between mb-5">
                    <span className="text-[11px] uppercase tracking-kicker font-semibold text-ink-800">
                      Quantity
                    </span>
                    <div className="flex items-center border border-line rounded">
                      <button
                        onClick={() => handleQuantityChange(quantity - 1)}
                        disabled={quantity <= 1}
                        className="p-2.5 hover:bg-cream-200 transition-colors disabled:opacity-30"
                        aria-label="Decrease"
                      >
                        <MinusIcon className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-10 text-center text-sm font-medium tabular-nums">
                        {quantity}
                      </span>
                      <button
                        onClick={() => handleQuantityChange(quantity + 1)}
                        disabled={quantity >= product.stock}
                        className="p-2.5 hover:bg-cream-200 transition-colors disabled:opacity-30"
                        aria-label="Increase"
                      >
                        <PlusIcon className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <button
                      onClick={handleAddToCart}
                      className="btn-solid flex-1 py-4"
                    >
                      <ShoppingBagIcon className="w-4 h-4" />
                      Add to Cart
                    </button>
                    <button
                      onClick={handleWishlist}
                      disabled={wishlistLoading}
                      className="p-4 border border-line rounded hover:border-ink-800 transition-colors disabled:opacity-50"
                      aria-label="Wishlist"
                    >
                      {isWishlist ? (
                        <HeartSolidIcon className="w-5 h-5 text-burgundy-500" />
                      ) : (
                        <HeartIcon className="w-5 h-5 text-ink-800" />
                      )}
                    </button>
                  </div>

                  <button
                    onClick={handleBuyNow}
                    className="w-full py-4 border border-ink-800 rounded text-[11px] uppercase tracking-wider font-semibold text-ink-800 hover:bg-ink-800 hover:text-cream-100 transition-colors"
                  >
                    Buy It Now
                  </button>
                </>
              )}
            </div>

            {/* TRUST STRIP */}
            <div className="grid grid-cols-3 gap-3 py-6 border-y border-line my-6">
              <div className="flex flex-col items-start gap-2">
                <TruckIcon className="w-4 h-4 text-ink-800" />
                <p className="text-[11px] text-ink-600 leading-tight">
                  Free shipping above ₹1000
                </p>
              </div>
              <div className="flex flex-col items-start gap-2">
                <ShieldCheckIcon className="w-4 h-4 text-ink-800" />
                <p className="text-[11px] text-ink-600 leading-tight">
                  Secure UPI payment
                </p>
              </div>
              <div className="flex flex-col items-start gap-2">
                <HeartIcon className="w-4 h-4 text-ink-800" />
                <p className="text-[11px] text-ink-600 leading-tight">
                  Handpicked with care
                </p>
              </div>
            </div>

            {/* ACCORDIONS */}
            <div className="divide-y divide-line border-b border-line">
              <Accordion
                title="Description"
                open={openSection === 'description'}
                onToggle={() =>
                  setOpenSection((s) => (s === 'description' ? null : 'description'))
                }
              >
                <div className="text-sm text-ink-600 leading-relaxed space-y-1">
                  {renderedDescription}
                </div>
              </Accordion>

              {specs.length > 0 && (
                <Accordion
                  title="Details"
                  open={openSection === 'details'}
                  onToggle={() =>
                    setOpenSection((s) => (s === 'details' ? null : 'details'))
                  }
                >
                  <dl className="space-y-2.5">
                    {specs.map((s) => (
                      <div
                        key={s.label}
                        className="flex items-start justify-between gap-4 text-sm"
                      >
                        <dt className="text-ink-500">{s.label}</dt>
                        <dd className="text-ink-800 font-medium text-right">
                          {s.value}
                        </dd>
                      </div>
                    ))}
                  </dl>

                  {product.tags?.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-line">
                      <p className="text-[10px] uppercase tracking-kicker font-semibold text-ink-500 mb-2">
                        Tags
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {product.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-[10px] bg-cream-100 border border-line text-ink-600 px-2 py-0.5 rounded"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </Accordion>
              )}

              <Accordion
                title="Shipping & Returns"
                open={openSection === 'shipping'}
                onToggle={() =>
                  setOpenSection((s) => (s === 'shipping' ? null : 'shipping'))
                }
              >
                <div className="text-sm text-ink-600 space-y-3 leading-relaxed">
                  <p>
                    Free shipping on orders above ₹1000. Standard delivery
                    within 3–5 business days.
                  </p>
                  <p>
                    Easy returns within 7 days of delivery. Product must be in
                    original condition.
                  </p>
                </div>
              </Accordion>

              <div className="py-4 flex items-center justify-between">
                <span className="text-[11px] uppercase tracking-kicker font-semibold text-ink-800">
                  Share
                </span>
                <div className="relative">
                  <button
                    onClick={() => setShowShareMenu(!showShareMenu)}
                    className="p-2 hover:bg-cream-200 rounded transition-colors"
                    aria-label="Share"
                  >
                    <ShareIcon className="w-4 h-4 text-ink-800" />
                  </button>

                  <AnimatePresence>
                    {showShareMenu && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setShowShareMenu(false)}
                        />
                        <motion.div
                          initial={{ opacity: 0, y: -6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -6 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-0 bottom-full mb-2 w-40 bg-white rounded-lg border border-line shadow-lg overflow-hidden z-20"
                        >
                          {[
                            { key: 'copy', label: 'Copy Link' },
                            { key: 'whatsapp', label: 'WhatsApp' },
                            { key: 'twitter', label: 'Twitter' },
                            { key: 'facebook', label: 'Facebook' },
                          ].map((opt) => (
                            <button
                              key={opt.key}
                              onClick={() => handleShare(opt.key)}
                              className="w-full text-left px-4 py-2.5 text-sm text-ink-700 hover:bg-cream-100 transition-colors"
                            >
                              {opt.label}
                            </button>
                          ))}
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* RELATED */}
      {relatedProducts.length > 0 && (
        <section className="border-t border-line bg-cream-100 py-12 md:py-16">
          <div className="container-editorial">
            <div className="flex items-end justify-between mb-8">
              <div>
                <p className="kicker mb-3">You May Also Like</p>
                <h2 className="section-heading">
                  Similar <span className="italic">pieces.</span>
                </h2>
              </div>
              <Link
                to="/products"
                className="hidden md:inline-block text-xs uppercase tracking-wider font-medium text-ink-700 hover:text-burgundy-500 transition-colors"
              >
                View all →
              </Link>
            </div>

            {relatedLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="aspect-[4/5] bg-cream-200 rounded-lg animate-pulse"
                  />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
                {relatedProducts.map((p, i) => (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.06, 0.3) }}
                    viewport={{ once: true }}
                  >
                    <ProductCard product={p} />
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* MOBILE STICKY BAR */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-line">
        <div className="px-4 py-3 flex items-center gap-3">
          <button
            onClick={handleWishlist}
            disabled={wishlistLoading}
            className="p-2.5 border border-line rounded disabled:opacity-50"
            aria-label="Wishlist"
          >
            {isWishlist ? (
              <HeartSolidIcon className="w-5 h-5 text-burgundy-500" />
            ) : (
              <HeartIcon className="w-5 h-5 text-ink-800" />
            )}
          </button>

          {!isOutOfStock && (
            <div className="flex items-center border border-line rounded">
              <button
                onClick={() => handleQuantityChange(quantity - 1)}
                disabled={quantity <= 1}
                className="p-2.5 disabled:opacity-30"
                aria-label="Decrease"
              >
                <MinusIcon className="w-3.5 h-3.5" />
              </button>
              <span className="px-2.5 text-sm font-medium tabular-nums">
                {quantity}
              </span>
              <button
                onClick={() => handleQuantityChange(quantity + 1)}
                disabled={quantity >= product.stock}
                className="p-2.5 disabled:opacity-30"
                aria-label="Increase"
              >
                <PlusIcon className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className="flex-1 bg-ink-800 text-cream-100 py-3 rounded text-[11px] uppercase tracking-wider font-semibold hover:bg-burgundy-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isOutOfStock ? 'Sold Out' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// ACCORDION
// ==========================================
const Accordion = ({ title, open, onToggle, children }) => (
  <div>
    <button
      onClick={onToggle}
      className="w-full py-4 flex items-center justify-between text-left group"
    >
      <span className="text-[11px] uppercase tracking-kicker font-semibold text-ink-800 group-hover:text-burgundy-500 transition-colors">
        {title}
      </span>
      <ChevronDownIcon
        className={`w-4 h-4 text-ink-500 transition-transform duration-200 ${
          open ? 'rotate-180' : ''
        }`}
      />
    </button>
    <AnimatePresence initial={false}>
      {open && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="overflow-hidden"
        >
          <div className="pb-5">{children}</div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

// ==========================================
// DESCRIPTION FORMATTER
// ==========================================
function renderFormattedDescription(text) {
  if (!text) {
    return <p className="text-ink-500 italic">No description available</p>;
  }

  const lines = text.split('\n');
  const elements = [];

  lines.forEach((line, lineIdx) => {
    const trimmed = line.trim();

    if (!trimmed) {
      elements.push(<div key={`sp-${lineIdx}`} className="h-2" />);
      return;
    }

    if (trimmed.startsWith('• ') || trimmed.startsWith('- ')) {
      elements.push(
        <div key={lineIdx} className="flex items-start gap-2 ml-1">
          <span className="text-burgundy-500 mt-1.5 flex-shrink-0">•</span>
          <span>{applyInlineFormatting(trimmed.substring(2))}</span>
        </div>
      );
      return;
    }

    if (/^\d+\.\s/.test(trimmed)) {
      const match = trimmed.match(/^(\d+)\.\s(.*)$/);
      if (match) {
        elements.push(
          <div key={lineIdx} className="flex items-start gap-2 ml-1">
            <span className="text-burgundy-500 font-medium min-w-[1.2rem]">
              {match[1]}.
            </span>
            <span>{applyInlineFormatting(match[2])}</span>
          </div>
        );
        return;
      }
    }

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
        <strong key={`b-${keyIdx++}`} className="font-semibold text-ink-800">
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith('*') && token.endsWith('*')) {
      parts.push(
        <em key={`i-${keyIdx++}`} className="italic text-ink-700">
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