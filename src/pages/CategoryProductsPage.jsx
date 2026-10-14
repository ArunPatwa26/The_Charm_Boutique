import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeftIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  ShoppingBagIcon,
  Squares2X2Icon,
  ListBulletIcon,
  ArrowUpRightIcon,
} from '@heroicons/react/24/outline';

import { getCategoryById } from '../services/categoryService';
import { getProducts } from '../services/productService';
import ProductCard from '../components/products/ProductCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=1200&h=600&fit=crop';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price · Low to High' },
  { value: 'price_desc', label: 'Price · High to Low' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'name_asc', label: 'Alphabetical · A–Z' },
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
  // FETCH
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

  // Close sort dropdown on outside click
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

  const currentSortLabel =
    SORT_OPTIONS.find((o) => o.value === sortBy)?.label || 'Newest';

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
  // LOADING (initial)
  // ==========================================
  if (loading && !category) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream-100">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // ==========================================
  // NOT FOUND
  // ==========================================
  if (!category) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-cream-100 px-4">
        <ShoppingBagIcon className="w-14 h-14 text-ink-300 mb-5" />
        <h2 className="font-serif text-2xl font-bold text-ink-800 mb-2">
          Category not found
        </h2>
        <p className="text-sm text-ink-500 mb-6 text-center max-w-sm">
          The category you're looking for doesn't exist or has been removed.
        </p>
        <Link to="/categories" className="btn-outline text-xs">
          <ArrowLeftIcon className="w-3.5 h-3.5" />
          Back to Categories
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-100">
      {/* ==========================================
          BREADCRUMB + EDITORIAL HEADER
      ========================================== */}
      <section className="border-b border-line bg-cream-100">
        <div className="container-editorial py-6 md:py-10">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-ink-500 mb-5">
            <Link to="/" className="hover:text-burgundy-500 transition-colors">
              Home
            </Link>
            <span className="text-ink-300">/</span>
            <Link
              to="/categories"
              className="hover:text-burgundy-500 transition-colors"
            >
              Categories
            </Link>
            <span className="text-ink-300">/</span>
            <span className="text-ink-700 truncate max-w-[160px]">
              {category.name}
            </span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <p className="kicker mb-3">Collection</p>
              <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-ink-800 leading-tight">
                {category.name}
              </h1>
              {category.description && (
                <p className="mt-3 text-sm md:text-base text-ink-600 max-w-xl leading-relaxed">
                  {category.description}
                </p>
              )}
            </div>

            {/* Result count */}
            <div className="flex items-center gap-2 text-xs text-ink-500 whitespace-nowrap">
              <ShoppingBagIcon className="w-4 h-4" />
              <span>
                <span className="font-medium text-ink-800">
                  {pagination.total}
                </span>{' '}
                {pagination.total === 1 ? 'piece' : 'pieces'}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================
          STICKY TOOLBAR
      ========================================== */}
      <div className="sticky top-14 md:top-16 z-30 border-b border-line bg-cream-100">
        <div className="container-editorial">
          <div className="py-3 flex items-center justify-between gap-3">
            {/* Count */}
            <p className="text-xs text-ink-500">
              Showing{' '}
              <span className="text-ink-800 font-medium">
                {products.length}
              </span>{' '}
              of{' '}
              <span className="text-ink-800 font-medium">
                {pagination.total}
              </span>
            </p>

            {/* Sort + view toggle */}
            <div className="flex items-center gap-2">
              {/* Sort dropdown */}
              <div className="relative sort-dropdown">
                <button
                  onClick={() => setSortOpen(!sortOpen)}
                  className="inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-line rounded text-[11px] uppercase tracking-wider font-medium text-ink-800 hover:border-ink-800 transition-colors"
                >
                  <span className="hidden sm:inline">Sort:</span>
                  <span className="truncate max-w-[100px] sm:max-w-none">
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
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg border border-line shadow-lg overflow-hidden z-50"
                    >
                      {SORT_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => handleSortChange(opt.value)}
                          className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                            sortBy === opt.value
                              ? 'bg-cream-100 text-burgundy-500 font-medium'
                              : 'text-ink-700 hover:bg-cream-100'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* View toggle */}
              <div className="hidden md:flex items-center border border-line rounded overflow-hidden bg-white">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-ink-800 text-cream-100'
                      : 'text-ink-500 hover:bg-cream-100'
                  }`}
                  aria-label="Grid view"
                >
                  <Squares2X2Icon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 transition-colors ${
                    viewMode === 'list'
                      ? 'bg-ink-800 text-cream-100'
                      : 'text-ink-500 hover:bg-cream-100'
                  }`}
                  aria-label="List view"
                >
                  <ListBulletIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ==========================================
          PRODUCTS
      ========================================== */}
      <section className="container-editorial py-8 md:py-10">
        {loading ? (
          <div className="flex justify-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        ) : products.length === 0 ? (
          /* Empty state */
          <div className="text-center py-20 max-w-md mx-auto">
            <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center rounded-full bg-cream-200">
              <ShoppingBagIcon className="w-7 h-7 text-ink-400" />
            </div>
            <h2 className="font-serif text-2xl font-bold text-ink-800 mb-3">
              Nothing here yet.
            </h2>
            <p className="text-sm text-ink-500 mb-8">
              Check back soon — new pieces are added to this collection
              regularly.
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              <Link to="/products" className="btn-solid text-xs">
                Shop All Products
              </Link>
              <Link to="/categories" className="btn-outline text-xs">
                View Categories
              </Link>
            </div>
          </div>
        ) : viewMode === 'grid' ? (
          /* Grid view */
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
            {products.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(index * 0.03, 0.3) }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
        ) : (
          /* List view (desktop) */
          <div className="space-y-4">
            {products.map((product) => (
              <ListRow key={product.id} product={product} />
            ))}
          </div>
        )}

        {/* ==========================================
            PAGINATION
        ========================================== */}
        {pagination.pages > 1 && (
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-line">
            <p className="text-xs text-ink-500 order-2 sm:order-1">
              Page {pagination.page} of {pagination.pages}
            </p>

            <nav className="flex items-center gap-1 order-1 sm:order-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="px-3 py-1.5 text-xs uppercase tracking-wider font-medium border border-line rounded hover:border-ink-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                Prev
              </button>

              {getPageNumbers().map((pageNum, i) =>
                pageNum === '...' ? (
                  <span
                    key={`dots-${i}`}
                    className="px-2 text-ink-400 text-xs"
                  >
                    …
                  </span>
                ) : (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`min-w-[34px] px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                      pagination.page === pageNum
                        ? 'bg-ink-800 text-cream-100'
                        : 'border border-line hover:border-ink-800 text-ink-700'
                    }`}
                  >
                    {pageNum}
                  </button>
                )
              )}

              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
                className="px-3 py-1.5 text-xs uppercase tracking-wider font-medium border border-line rounded hover:border-ink-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </nav>
          </div>
        )}
      </section>

      {/* ==========================================
          BOTTOM CTA
      ========================================== */}
      {products.length > 0 && (
        <section className="border-t border-line bg-cream-100 py-12 md:py-16">
          <div className="container-editorial text-center max-w-xl mx-auto">
            <p className="kicker mb-4">Explore More</p>
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-ink-800 mb-3">
              Looking for something <span className="italic">else?</span>
            </h2>
            <p className="text-sm text-ink-600 mb-8">
              Browse our other collections or view all pieces in one place.
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              <Link to="/categories" className="btn-solid text-xs">
                All Categories
              </Link>
              <Link to="/products" className="btn-outline text-xs">
                Shop All
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

// ==========================================
// LIST ROW (desktop list view)
// ==========================================
const ListRow = ({ product }) => {
  const discount = product.discount_price
    ? Math.round(
        ((product.price - product.discount_price) / product.price) * 100
      )
    : 0;

  return (
    <Link
      to={`/products/${product.id}`}
      className="group flex gap-5 p-4 bg-white border border-line rounded-lg hover:border-ink-800 transition-colors"
    >
      <div className="w-28 h-32 flex-shrink-0 rounded overflow-hidden bg-cream-200">
        <img
          src={product.main_image || product.images?.[0]}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>
      <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
        <div>
          <h3 className="font-medium text-ink-800 mb-1 group-hover:text-burgundy-500 transition-colors">
            {product.name}
          </h3>
          <p className="text-sm text-ink-500 line-clamp-2">
            {product.description}
          </p>
        </div>
        <div className="flex items-baseline gap-2">
          {product.discount_price ? (
            <>
              <span className="text-base font-semibold text-burgundy-500">
                ₹{Number(product.discount_price).toLocaleString('en-IN')}
              </span>
              <span className="text-sm text-ink-400 line-through">
                ₹{Number(product.price).toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] uppercase tracking-wider font-semibold text-burgundy-500 ml-auto">
                {discount}% off
              </span>
            </>
          ) : (
            <span className="text-base font-semibold text-ink-800">
              ₹{Number(product.price).toLocaleString('en-IN')}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default CategoryProductsPage;