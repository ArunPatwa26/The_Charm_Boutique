import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeftIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ShoppingBagIcon,
  ArrowPathIcon,
  FunnelIcon,
  Squares2X2Icon,
  ListBulletIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';
import { getCategoryById } from '../services/categoryService';
import { getProducts } from '../services/productService';
import ProductCard from '../components/products/ProductCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=1600&h=600&fit=crop';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'name_asc', label: 'Name: A to Z' },
];

const CategoryProductsPage = () => {
  const { id } = useParams();
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('grid');
  const [sortOpen, setSortOpen] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0,
  });

  // ==========================================
  // FETCH DATA
  // ==========================================
  const fetchCategoryAndProducts = useCallback(async () => {
    setLoading(true);
    try {
      if (!category || category.id !== id) {
        const catRes = await getCategoryById(id);
        if (catRes.success) {
          setCategory(catRes.category);
        } else {
          toast.error('Category not found');
        }
      }

      const prodRes = await getProducts({
        category: id,
        page: pagination.page,
        limit: pagination.limit,
        sort_by: sortBy,
      });

      if (prodRes.success) {
        setProducts(prodRes.products || []);
        setPagination(prodRes.pagination || pagination);
      }
    } catch (error) {
      console.error('Error loading category:', error);
      toast.error('Failed to load category');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, pagination.page, pagination.limit, sortBy]);

  useEffect(() => {
    fetchCategoryAndProducts();
  }, [fetchCategoryAndProducts]);

  // ==========================================
  // CLOSE SORT DROPDOWN ON OUTSIDE CLICK
  // ==========================================
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (sortOpen && !e.target.closest('.sort-dropdown')) {
        setSortOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [sortOpen]);

  const handlePageChange = (newPage) => {
    setPagination({ ...pagination, page: newPage });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSortChange = (value) => {
    setSortBy(value);
    setPagination({ ...pagination, page: 1 });
    setSortOpen(false);
  };

  const clearFilters = () => {
    setSortBy('newest');
    setPagination({ ...pagination, page: 1 });
  };

  const currentSortLabel =
    SORT_OPTIONS.find((o) => o.value === sortBy)?.label || 'Newest First';

  // ==========================================
  // PAGINATION NUMBERS
  // ==========================================
  const getPageNumbers = () => {
    const pages = [];
    const total = pagination.pages;
    const current = pagination.page;

    if (total <= 5) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else if (current <= 3) {
      pages.push(1, 2, 3, 4, '...', total);
    } else if (current >= total - 2) {
      pages.push(1, '...', total - 3, total - 2, total - 1, total);
    } else {
      pages.push(1, '...', current - 1, current, current + 1, '...', total);
    }
    return pages;
  };

  // ==========================================
  // LOADING (Initial)
  // ==========================================
  if (loading && !category) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // ==========================================
  // CATEGORY NOT FOUND
  // ==========================================
  if (!category) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-5">
          <ShoppingBagIcon className="w-10 h-10 text-gray-300" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          Category not found
        </h2>
        <p className="text-gray-500 mb-6 text-center max-w-sm">
          The category you're looking for doesn't exist or has been removed.
        </p>
        <Link
          to="/categories"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-full hover:from-amber-600 hover:to-yellow-600 transition-all font-medium shadow-md"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Back to Categories
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ==========================================
          HERO BANNER
      ========================================== */}
      <section className="relative pt-16 sm:pt-20 md:pt-24 pb-12 md:pb-20 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={category.image || FALLBACK_IMAGE}
            alt={category.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = FALLBACK_IMAGE;
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/65 to-black/40" />
        </div>

        <div className="container-custom relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link
              to="/categories"
              className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-3 md:mb-5 transition-colors text-xs md:text-sm"
            >
              <ArrowLeftIcon className="w-3.5 h-3.5 md:w-4 md:h-4" />
              All Categories
            </Link>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-white mb-3 md:mb-4 leading-tight">
              {category.name}
            </h1>

            <p className="text-sm md:text-lg text-white/80 max-w-2xl leading-relaxed">
              {category.description ||
                `Explore our exclusive collection of ${category.name.toLowerCase()}`}
            </p>

            <div className="flex items-center gap-2 mt-4 md:mt-6">
              <div className="px-3 py-1.5 bg-white/15 backdrop-blur-sm rounded-full flex items-center gap-2 border border-white/20">
                <ShoppingBagIcon className="w-3.5 h-3.5 md:w-4 md:h-4 text-white" />
                <span className="text-white text-xs md:text-sm font-medium">
                  {pagination.total}{' '}
                  {pagination.total === 1 ? 'item' : 'items'} available
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ==========================================
          STICKY TOOLBAR
      ========================================== */}
      <section className="sticky top-16 md:top-[72px] z-30 bg-white/95 backdrop-blur border-b border-gray-100 shadow-sm">
        <div className="container-custom py-3">
          <div className="flex items-center justify-between gap-3">
            {/* Left: Result count */}
            <div className="flex items-center gap-2 text-xs md:text-sm text-gray-600 min-w-0">
              <FunnelIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span className="truncate">
                <strong className="text-gray-900">{products.length}</strong>
                <span className="text-gray-400 mx-1">/</span>
                <strong className="text-gray-900">{pagination.total}</strong>
                <span className="hidden sm:inline"> products</span>
              </span>
            </div>

            {/* Right: Sort + view toggle */}
            <div className="flex items-center gap-2">
              {/* Custom Sort Dropdown */}
              <div className="relative sort-dropdown">
                <button
                  onClick={() => setSortOpen(!sortOpen)}
                  className="inline-flex items-center gap-2 px-3 md:px-4 py-2 bg-white border border-gray-200 rounded-full text-xs md:text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <span className="hidden sm:inline">Sort:</span>
                  <span className="text-gray-900 truncate max-w-[100px] sm:max-w-none">
                    {currentSortLabel}
                  </span>
                  <ChevronDownIcon
                    className={`w-3.5 h-3.5 transition-transform ${
                      sortOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                <AnimatePresence>
                  {sortOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50"
                    >
                      {SORT_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => handleSortChange(opt.value)}
                          className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                            sortBy === opt.value
                              ? 'bg-amber-50 text-amber-700 font-semibold'
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* View toggle (desktop only) */}
              <div className="hidden md:flex items-center bg-gray-100 rounded-full p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-full transition-all ${
                    viewMode === 'grid'
                      ? 'bg-white shadow-sm text-amber-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  title="Grid view"
                >
                  <Squares2X2Icon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-full transition-all ${
                    viewMode === 'list'
                      ? 'bg-white shadow-sm text-amber-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  title="List view"
                >
                  <ListBulletIcon className="w-4 h-4" />
                </button>
              </div>

              {/* Reset */}
              {sortBy !== 'newest' && (
                <button
                  onClick={clearFilters}
                  className="hidden sm:flex items-center gap-1 px-3 py-2 text-xs md:text-sm text-amber-600 hover:text-amber-700 hover:bg-amber-50 rounded-full transition-colors"
                >
                  <ArrowPathIcon className="w-3.5 h-3.5" />
                  <span className="hidden lg:inline">Reset</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================
          PRODUCTS
      ========================================== */}
      <section className="py-6 md:py-10">
        <div className="container-custom">
          {loading ? (
            <div className="flex justify-center py-20">
              <LoadingSpinner size="lg" />
            </div>
          ) : products.length === 0 ? (
            /* Empty state */
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16 md:py-20 bg-white rounded-3xl border border-gray-100 max-w-2xl mx-auto px-6"
            >
              <div className="w-20 h-20 md:w-24 md:h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-5">
                <ShoppingBagIcon className="w-10 h-10 md:w-12 md:h-12 text-gray-300" />
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
                No products in this category yet
              </h3>
              <p className="text-sm md:text-base text-gray-500 mb-6">
                Check back soon for new arrivals or explore our other
                collections.
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                <Link
                  to="/products"
                  className="inline-flex items-center gap-2 px-5 md:px-6 py-2.5 md:py-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-full hover:from-amber-600 hover:to-yellow-600 transition-all font-medium text-sm shadow-md"
                >
                  <ShoppingBagIcon className="w-4 h-4" />
                  Browse All Products
                </Link>
                <Link
                  to="/categories"
                  className="inline-flex items-center gap-2 px-5 md:px-6 py-2.5 md:py-3 border-2 border-gray-200 text-gray-900 rounded-full hover:border-amber-400 hover:text-amber-700 transition-colors font-medium text-sm"
                >
                  View Categories
                </Link>
              </div>
            </motion.div>
          ) : (
            <>
              {/* Grid / List */}
              <AnimatePresence mode="wait">
                {viewMode === 'grid' ? (
                  <motion.div
                    key="grid"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5 lg:gap-6"
                  >
                    {products.map((product, index) => (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: Math.min(index * 0.04, 0.3) }}
                      >
                        <ProductCard product={product} />
                      </motion.div>
                    ))}
                  </motion.div>
                ) : (
                  /* List view (desktop) */
                  <motion.div
                    key="list"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-3"
                  >
                    {products.map((product, index) => (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: Math.min(index * 0.04, 0.3) }}
                      >
                        <Link
                          to={`/products/${product.id}`}
                          className="flex gap-4 md:gap-5 p-3 md:p-4 bg-white border border-gray-100 rounded-2xl hover:shadow-lg hover:border-amber-200 transition-all group"
                        >
                          <div className="w-24 h-24 md:w-32 md:h-32 lg:w-40 lg:h-40 flex-shrink-0 rounded-xl overflow-hidden bg-gray-50">
                            <img
                              src={
                                product.main_image ||
                                product.images?.[0] ||
                                FALLBACK_IMAGE
                              }
                              alt={product.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          </div>

                          <div className="flex-1 min-w-0 flex flex-col">
                            <p className="text-[10px] md:text-xs text-amber-600 font-semibold uppercase tracking-wide mb-1">
                              {product.category_name || 'Jewellery'}
                            </p>
                            <h3 className="font-semibold text-sm md:text-base lg:text-lg text-gray-900 mb-1.5 line-clamp-2 group-hover:text-amber-600 transition-colors">
                              {product.name}
                            </h3>
                            <p className="hidden sm:block text-xs md:text-sm text-gray-500 line-clamp-2 mb-3">
                              {product.description}
                            </p>

                            <div className="mt-auto flex items-center justify-between flex-wrap gap-2">
                              <div className="flex items-baseline gap-2">
                                {product.discount_price ? (
                                  <>
                                    <span className="text-base md:text-xl font-bold text-amber-600">
                                      ₹
                                      {Number(product.discount_price).toFixed(
                                        2
                                      )}
                                    </span>
                                    <span className="text-xs md:text-sm text-gray-400 line-through">
                                      ₹{Number(product.price).toFixed(2)}
                                    </span>
                                  </>
                                ) : (
                                  <span className="text-base md:text-xl font-bold text-amber-600">
                                    ₹{Number(product.price).toFixed(2)}
                                  </span>
                                )}
                              </div>

                              <span className="hidden md:flex text-xs text-amber-600 font-medium group-hover:translate-x-1 transition-transform items-center gap-1">
                                View Details
                                <ChevronRightIcon className="w-3.5 h-3.5" />
                              </span>
                            </div>
                          </div>
                        </Link>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ==========================================
                  PAGINATION
              ========================================== */}
              {pagination.pages > 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-10 md:mt-14"
                >
                  <p className="text-xs md:text-sm text-gray-500 order-2 sm:order-1">
                    Page{' '}
                    <strong className="text-gray-900">
                      {pagination.page}
                    </strong>{' '}
                    of{' '}
                    <strong className="text-gray-900">
                      {pagination.pages}
                    </strong>
                  </p>

                  <div className="flex items-center gap-1.5 order-1 sm:order-2">
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                      className="w-9 h-9 md:w-10 md:h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-white hover:border-amber-400 hover:text-amber-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                      aria-label="Previous page"
                    >
                      <ChevronLeftIcon className="w-4 h-4" />
                    </button>

                    {getPageNumbers().map((pageNum, idx) =>
                      pageNum === '...' ? (
                        <span
                          key={`dots-${idx}`}
                          className="px-1 md:px-2 text-gray-400 text-sm"
                        >
                          …
                        </span>
                      ) : (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`w-9 h-9 md:w-10 md:h-10 rounded-full font-medium text-xs md:text-sm transition-all ${
                            pagination.page === pageNum
                              ? 'bg-gradient-to-br from-amber-500 to-yellow-500 text-white shadow-md'
                              : 'border border-gray-200 hover:bg-white hover:border-amber-400 hover:text-amber-600'
                          }`}
                        >
                          {pageNum}
                        </button>
                      )
                    )}

                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.pages}
                      className="w-9 h-9 md:w-10 md:h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-white hover:border-amber-400 hover:text-amber-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                      aria-label="Next page"
                    >
                      <ChevronRightIcon className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}
            </>
          )}
        </div>
      </section>

      {/* ==========================================
          CTA SECTION
      ========================================== */}
      {products.length > 0 && (
        <section className="py-12 md:py-16 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl" />

          <div className="container-custom relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center max-w-2xl mx-auto"
            >
              <h2 className="text-2xl md:text-3xl font-serif font-bold mb-3">
                Can't find what you're looking for?
              </h2>
              <p className="text-gray-300 mb-6 text-sm md:text-base">
                Explore our other collections or let our AI recommend the
                perfect piece for you.
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                <Link
                  to="/categories"
                  className="inline-flex items-center gap-2 px-5 md:px-6 py-2.5 md:py-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-full hover:from-amber-600 hover:to-yellow-600 transition-all font-medium text-sm shadow-md"
                >
                  Browse All Categories
                </Link>
                <Link
                  to="/products"
                  className="inline-flex items-center gap-2 px-5 md:px-6 py-2.5 md:py-3 border-2 border-white/30 text-white rounded-full hover:border-amber-400 hover:bg-white/10 transition-colors font-medium text-sm"
                >
                  Shop All Products
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      )}
    </div>
  );
};

export default CategoryProductsPage;