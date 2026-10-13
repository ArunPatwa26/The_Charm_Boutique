import { useEffect, useState } from 'react';
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
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0,
  });

  // ==========================================
  // FETCH DATA
  // ==========================================
  useEffect(() => {
    fetchCategoryAndProducts();
  }, [id, pagination.page, sortBy]);

  const fetchCategoryAndProducts = async () => {
    setLoading(true);
    try {
      // Fetch category details (only on first load or id change)
      if (!category || category.id !== id) {
        const catRes = await getCategoryById(id);
        if (catRes.success) {
          setCategory(catRes.category);
        } else {
          toast.error('Category not found');
        }
      }

      // Fetch products
      const prodRes = await getProducts({
        category: id,
        page: pagination.page,
        limit: pagination.limit,
        sort_by: sortBy,
      });

      if (prodRes.success) {
        setProducts(prodRes.products || []);
        setPagination(prodRes.pagination);
      }
    } catch (error) {
      console.error('Error loading category:', error);
      toast.error('Failed to load category');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    setPagination({ ...pagination, page: newPage });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSortChange = (value) => {
    setSortBy(value);
    setPagination({ ...pagination, page: 1 });
  };

  const clearFilters = () => {
    setSortBy('newest');
    setPagination({ ...pagination, page: 1 });
  };

  // ==========================================
  // LOADING (Initial)
  // ==========================================
  if (loading && !category) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // ==========================================
  // CATEGORY NOT FOUND
  // ==========================================
  if (!category) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 pt-20">
        <ShoppingBagIcon className="w-20 h-20 text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          Category not found
        </h2>
        <p className="text-gray-500 mb-6 text-center">
          The category you're looking for doesn't exist or has been removed.
        </p>
        <Link
          to="/categories"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-full hover:bg-amber-600 transition-colors font-medium"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Back to Categories
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">

      {/* ==========================================
          HERO BANNER WITH CATEGORY IMAGE
      ========================================== */}
      <section className="relative pt-24 md:pt-32 pb-12 md:pb-20 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src={category.image || FALLBACK_IMAGE}
            alt={category.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = FALLBACK_IMAGE;
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40" />
        </div>

        <div className="container-custom relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Breadcrumb */}
            <Link
              to="/categories"
              className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-4 md:mb-6 transition-colors text-sm"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              All Categories
            </Link>

            {/* Category Name */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-white mb-3 md:mb-4 leading-tight">
              {category.name}
            </h1>

            {/* Description */}
            <p className="text-sm md:text-lg text-white/80 max-w-2xl leading-relaxed">
              {category.description ||
                `Explore our exclusive collection of ${category.name.toLowerCase()}`}
            </p>

            {/* Item Count */}
            <div className="flex items-center gap-2 mt-5 md:mt-6">
              <div className="px-3 py-1.5 bg-white/15 backdrop-blur-sm rounded-full flex items-center gap-2 border border-white/20">
                <ShoppingBagIcon className="w-4 h-4 text-white" />
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
          FILTER / SORT BAR
      ========================================== */}
      <section className="bg-white border-b border-gray-100 sticky top-[72px] z-30 backdrop-blur-md">
        <div className="container-custom py-3 md:py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">

            {/* Results Count */}
            <div className="flex items-center gap-2 text-xs md:text-sm text-gray-500">
              <FunnelIcon className="w-4 h-4" />
              <span>
                Showing{' '}
                <strong className="text-gray-900">
                  {products.length}
                </strong>{' '}
                of{' '}
                <strong className="text-gray-900">
                  {pagination.total}
                </strong>{' '}
                products
              </span>
            </div>

            {/* Sort + View Toggle */}
            <div className="flex items-center gap-3">

              {/* Sort Dropdown */}
              <div className="flex items-center gap-2">
                <label className="text-xs md:text-sm text-gray-500 hidden sm:block">
                  Sort:
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="px-3 py-1.5 md:py-2 text-xs md:text-sm border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none cursor-pointer"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* View Mode Toggle — hidden on mobile */}
              <div className="hidden md:flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-md transition-all ${
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
                  className={`p-1.5 rounded-md transition-all ${
                    viewMode === 'list'
                      ? 'bg-white shadow-sm text-amber-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  title="List view"
                >
                  <ListBulletIcon className="w-4 h-4" />
                </button>
              </div>

              {/* Reset Button */}
              {sortBy !== 'newest' && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1 px-3 py-1.5 md:py-2 text-xs md:text-sm text-amber-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors"
                >
                  <ArrowPathIcon className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  Reset
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================
          PRODUCTS GRID
      ========================================== */}
      <section className="py-8 md:py-12">
        <div className="container-custom">
          {loading ? (
            <div className="flex justify-center py-20">
              <LoadingSpinner size="lg" />
            </div>
          ) : products.length === 0 ? (
            /* ==========================================
                EMPTY STATE
            ========================================== */
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20 bg-gray-50 rounded-3xl max-w-2xl mx-auto"
            >
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                <ShoppingBagIcon className="w-12 h-12 text-gray-300" />
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">
                No products in this category yet
              </h3>
              <p className="text-sm md:text-base text-gray-500 mb-8 px-6">
                Check back soon for new arrivals or explore our other collections.
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                <Link
                  to="/products"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-full hover:bg-amber-600 transition-colors font-medium text-sm"
                >
                  <ShoppingBagIcon className="w-4 h-4" />
                  Browse All Products
                </Link>
                <Link
                  to="/categories"
                  className="inline-flex items-center gap-2 px-6 py-3 border-2 border-gray-200 text-gray-900 rounded-full hover:border-amber-400 hover:text-amber-700 transition-colors font-medium text-sm"
                >
                  View Other Categories
                </Link>
              </div>
            </motion.div>
          ) : (
            <>
              {/* ==========================================
                  PRODUCT GRID / LIST
              ========================================== */}
              <AnimatePresence mode="wait">
                {viewMode === 'grid' ? (
                  <motion.div
                    key="grid"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6"
                  >
                    {products.map((product, index) => (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <ProductCard product={product} />
                      </motion.div>
                    ))}
                  </motion.div>
                ) : (
                  /* ==========================================
                      LIST VIEW (Desktop only)
                  ========================================== */
                  <motion.div
                    key="list"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4"
                  >
                    {products.map((product, index) => (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Link
                          to={`/products/${product.id}`}
                          className="flex gap-5 p-4 bg-white border border-gray-100 rounded-2xl hover:shadow-lg hover:border-amber-200 transition-all group"
                        >
                          {/* Image */}
                          <div className="w-32 h-32 md:w-40 md:h-40 flex-shrink-0 rounded-xl overflow-hidden bg-gray-50">
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

                          {/* Info */}
                          <div className="flex-1 min-w-0 flex flex-col">
                            <p className="text-xs text-amber-600 font-semibold uppercase tracking-wide mb-1">
                              {product.category_name || 'Jewellery'}
                            </p>
                            <h3 className="font-semibold text-base md:text-lg text-gray-900 mb-2 line-clamp-2 group-hover:text-amber-600 transition-colors">
                              {product.name}
                            </h3>
                            <p className="text-sm text-gray-500 line-clamp-2 mb-3">
                              {product.description}
                            </p>

                            <div className="mt-auto flex items-center justify-between flex-wrap gap-3">
                              <div className="flex items-baseline gap-2">
                                {product.discount_price ? (
                                  <>
                                    <span className="text-xl font-bold text-amber-600">
                                      ₹{Number(product.discount_price).toFixed(2)}
                                    </span>
                                    <span className="text-sm text-gray-400 line-through">
                                      ₹{Number(product.price).toFixed(2)}
                                    </span>
                                  </>
                                ) : (
                                  <span className="text-xl font-bold text-amber-600">
                                    ₹{Number(product.price).toFixed(2)}
                                  </span>
                                )}
                              </div>

                              <span className="text-xs text-amber-600 font-medium group-hover:translate-x-1 transition-transform flex items-center gap-1">
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
                  className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-10 md:mt-16 p-4 bg-gray-50 rounded-2xl"
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

                  <div className="flex items-center gap-1.5 md:gap-2 order-1 sm:order-2">
                    {/* Previous */}
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                      className="w-9 h-9 md:w-10 md:h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-white hover:border-amber-400 hover:text-amber-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    >
                      <ChevronLeftIcon className="w-4 h-4 md:w-5 md:h-5" />
                    </button>

                    {/* Page Numbers */}
                    {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                      let pageNum;
                      if (pagination.pages <= 5) pageNum = i + 1;
                      else if (pagination.page <= 3) pageNum = i + 1;
                      else if (pagination.page >= pagination.pages - 2)
                        pageNum = pagination.pages - 4 + i;
                      else pageNum = pagination.page - 2 + i;

                      return (
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
                      );
                    })}

                    {/* Next */}
                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.pages}
                      className="w-9 h-9 md:w-10 md:h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-white hover:border-amber-400 hover:text-amber-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    >
                      <ChevronRightIcon className="w-4 h-4 md:w-5 md:h-5" />
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
        <section className="py-12 md:py-16 bg-gray-50">
          <div className="container-custom">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center max-w-2xl mx-auto"
            >
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-gray-900 mb-3">
                Can't find what you're looking for?
              </h2>
              <p className="text-gray-500 mb-6 text-sm md:text-base">
                Explore our other collections or let our AI recommend the perfect piece for you.
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                <Link
                  to="/categories"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-full hover:bg-amber-600 transition-colors font-medium text-sm"
                >
                  Browse All Categories
                </Link>
                <Link
                  to="/products"
                  className="inline-flex items-center gap-2 px-6 py-3 border-2 border-gray-200 text-gray-900 rounded-full hover:border-amber-400 hover:text-amber-700 transition-colors font-medium text-sm"
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