import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import {
  FunnelIcon,
  XMarkIcon,
  Squares2X2Icon,
  Bars3BottomLeftIcon,
  ChevronDownIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import ProductCard from '../components/products/ProductCard';
import ProductFilters from '../components/products/ProductFilters';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { getProducts, getCategories } from '../services/productService';

const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0,
  });

  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    min_price: searchParams.get('min_price') || '',
    max_price: searchParams.get('max_price') || '',
    material: searchParams.get('material') || '',
    gemstone: searchParams.get('gemstone') || '',
    sort_by: searchParams.get('sort_by') || 'newest',
    search: searchParams.get('search') || '',
  });

  // ==========================================
  // LOCK BODY SCROLL WHEN MOBILE FILTER IS OPEN
  // ==========================================
  useEffect(() => {
    if (showFilters) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showFilters]);

  // ==========================================
  // FETCH CATEGORIES
  // ==========================================
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getCategories();
        if (response.success) {
          setCategories(response.categories || []);
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };
    fetchCategories();
  }, []);

  // ==========================================
  // FETCH PRODUCTS
  // ==========================================
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...filters,
      };

      Object.keys(params).forEach((key) => {
        if (!params[key]) delete params[key];
      });

      const response = await getProducts(params);
      if (response.success) {
        setProducts(response.products || []);
        setPagination(response.pagination || pagination);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, pagination.limit, filters]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // ==========================================
  // HANDLERS
  // ==========================================
  const handleFilterChange = (newFilters) => {
    setFilters({ ...filters, ...newFilters });
    setPagination({ ...pagination, page: 1 });

    const params = new URLSearchParams();
    Object.entries({ ...filters, ...newFilters }).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    setSearchParams(params);
  };

  const handlePageChange = (newPage) => {
    setPagination({ ...pagination, page: newPage });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      min_price: '',
      max_price: '',
      material: '',
      gemstone: '',
      sort_by: 'newest',
      search: '',
    });
    setPagination({ ...pagination, page: 1 });
    setSearchParams({});
  };

  const hasActiveFilters = Object.values(filters).some(
    (value) => value && value !== 'newest'
  );

  const activeFilterCount = Object.entries(filters).filter(
    ([key, value]) => value && key !== 'sort_by' && key !== 'search'
  ).length;

  // ==========================================
  // SORT OPTIONS
  // ==========================================
  const sortOptions = [
    { value: 'newest', label: 'Newest' },
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'name_asc', label: 'Name: A to Z' },
    { value: 'name_desc', label: 'Name: Z to A' },
  ];

  const currentSortLabel =
    sortOptions.find((o) => o.value === filters.sort_by)?.label || 'Newest';

  // ==========================================
  // PAGINATION LOGIC
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ==========================================
          PAGE HEADER
      ========================================== */}
      <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl" />

        <div className="container-custom py-10 md:py-14 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur border border-white/20 rounded-full px-4 py-1.5 mb-4">
              <SparklesIcon className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-xs font-medium text-amber-200">
                Curated Collection
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold">
              Our Collection
            </h1>
            <p className="text-gray-300 mt-2 text-sm md:text-base max-w-2xl">
              Discover timeless pieces crafted with love — from everyday
              elegance to statement jewellery.
            </p>
          </motion.div>
        </div>
      </div>

      {/* ==========================================
          STICKY TOOLBAR
      ========================================== */}
      <div className="sticky top-16 md:top-[72px] z-30 bg-white/95 backdrop-blur border-b border-gray-100 shadow-sm">
        <div className="container-custom py-3">
          <div className="flex items-center justify-between gap-3">
            {/* Left: Filter button (mobile) + result count */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFilters(true)}
                className="lg:hidden inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-full text-sm font-medium hover:bg-gray-800 transition-colors"
              >
                <FunnelIcon className="w-4 h-4" />
                Filters
                {activeFilterCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-xs font-bold flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              <p className="text-sm text-gray-600 hidden sm:block">
                <span className="font-semibold text-gray-900">
                  {pagination.total}
                </span>{' '}
                {pagination.total === 1 ? 'product' : 'products'}
              </p>
            </div>

            {/* Right: Sort */}
            <div className="relative">
              <button
                onClick={() => setSortOpen(!sortOpen)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Bars3BottomLeftIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Sort:</span>
                <span className="text-gray-900">{currentSortLabel}</span>
                <ChevronDownIcon
                  className={`w-4 h-4 transition-transform ${
                    sortOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              <AnimatePresence>
                {sortOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setSortOpen(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50"
                    >
                      {sortOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => {
                            handleFilterChange({ sort_by: option.value });
                            setSortOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                            filters.sort_by === option.value
                              ? 'bg-amber-50 text-amber-700 font-semibold'
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Active Filters Row */}
          <AnimatePresence>
            {hasActiveFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="flex flex-wrap items-center gap-2 pt-3">
                  {filters.category && (
                    <FilterChip
                      label={`Category: ${
                        categories.find((c) => c.id === filters.category)?.name ||
                        filters.category
                      }`}
                      onRemove={() => handleFilterChange({ category: '' })}
                    />
                  )}
                  {filters.material && (
                    <FilterChip
                      label={`Material: ${filters.material}`}
                      onRemove={() => handleFilterChange({ material: '' })}
                    />
                  )}
                  {filters.gemstone && (
                    <FilterChip
                      label={`Gemstone: ${filters.gemstone}`}
                      onRemove={() => handleFilterChange({ gemstone: '' })}
                    />
                  )}
                  {(filters.min_price || filters.max_price) && (
                    <FilterChip
                      label={`Price: ₹${filters.min_price || '0'} – ₹${
                        filters.max_price || '∞'
                      }`}
                      onRemove={() =>
                        handleFilterChange({ min_price: '', max_price: '' })
                      }
                    />
                  )}
                  {filters.search && (
                    <FilterChip
                      label={`Search: "${filters.search}"`}
                      onRemove={() => handleFilterChange({ search: '' })}
                    />
                  )}

                  <button
                    onClick={clearFilters}
                    className="text-xs text-gray-500 hover:text-rose-600 underline transition-colors ml-1"
                  >
                    Clear all
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ==========================================
          MAIN CONTENT
      ========================================== */}
      <div className="container-custom py-6 md:py-8">
        <div className="flex gap-8">
          {/* ==========================================
              FILTERS SIDEBAR
          ========================================== */}
          <aside
            className={`
              fixed inset-0 z-50 lg:relative lg:z-0 lg:block
              ${showFilters ? 'block' : 'hidden lg:block'}
            `}
          >
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm lg:hidden"
              onClick={() => setShowFilters(false)}
            />

            {/* Sidebar */}
            <div
              className={`
                fixed inset-y-0 left-0 w-full max-w-sm bg-white shadow-2xl lg:shadow-none
                lg:static lg:w-72 lg:bg-transparent lg:max-w-none
                transform transition-transform duration-300 ease-out
                ${
                  showFilters
                    ? 'translate-x-0'
                    : '-translate-x-full lg:translate-x-0'
                }
                flex flex-col
              `}
            >
              {/* Mobile drawer header */}
              <div className="lg:hidden flex items-center justify-between p-4 border-b border-gray-100 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <FunnelIcon className="w-5 h-5 text-gray-700" />
                  <h2 className="text-lg font-bold">Filters</h2>
                  {activeFilterCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-semibold">
                      {activeFilterCount}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setShowFilters(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  aria-label="Close filters"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable filter content */}
              <div className="flex-1 overflow-y-auto lg:overflow-visible">
                <div className="p-4 lg:p-0">
                  <ProductFilters
                    filters={filters}
                    categories={categories}
                    onFilterChange={handleFilterChange}
                    onClearFilters={clearFilters}
                  />
                </div>
              </div>

              {/* Mobile sticky footer */}
              {showFilters && (
                <div className="lg:hidden border-t border-gray-100 p-4 bg-white flex-shrink-0">
                  <button
                    onClick={() => setShowFilters(false)}
                    className="w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-white font-semibold rounded-xl hover:from-amber-600 hover:to-yellow-600 transition-all shadow-md"
                  >
                    Show {pagination.total}{' '}
                    {pagination.total === 1 ? 'product' : 'products'}
                  </button>
                </div>
              )}
            </div>
          </aside>

          {/* ==========================================
              PRODUCTS GRID
          ========================================== */}
          <main className="flex-1 min-w-0">
            {loading ? (
              <div className="flex justify-center items-center py-24">
                <LoadingSpinner size="lg" />
              </div>
            ) : products.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-20 bg-white rounded-3xl border border-gray-100"
              >
                <div className="w-20 h-20 mx-auto mb-6 bg-gray-50 rounded-full flex items-center justify-center">
                  <Squares2X2Icon className="w-10 h-10 text-gray-300" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  No products found
                </h3>
                <p className="text-gray-500 max-w-md mx-auto mb-6">
                  We couldn't find any products matching your filters. Try
                  adjusting them or clear all filters to see everything.
                </p>
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-white font-semibold rounded-full hover:from-amber-600 hover:to-yellow-600 transition-all shadow-md"
                >
                  Clear all filters
                </button>
              </motion.div>
            ) : (
              <>
                {/* Products Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  <AnimatePresence mode="popLayout">
                    {products.map((product, index) => (
                      <motion.div
                        key={product.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{
                          duration: 0.3,
                          delay: Math.min(index * 0.03, 0.3),
                        }}
                      >
                        <ProductCard product={product} />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {/* Pagination */}
                {pagination.pages > 1 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-10 md:mt-12">
                    <p className="text-sm text-gray-500 order-2 sm:order-1">
                      Page{' '}
                      <span className="font-semibold text-gray-900">
                        {pagination.page}
                      </span>{' '}
                      of{' '}
                      <span className="font-semibold text-gray-900">
                        {pagination.pages}
                      </span>
                    </p>

                    <nav className="flex items-center gap-1.5 order-1 sm:order-2">
                      {/* Previous */}
                      <button
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={pagination.page === 1}
                        className="px-3 md:px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      >
                        <span className="hidden sm:inline">Previous</span>
                        <span className="sm:hidden">←</span>
                      </button>

                      {/* Page numbers */}
                      {getPageNumbers().map((pageNum, idx) =>
                        pageNum === '...' ? (
                          <span
                            key={`dots-${idx}`}
                            className="px-2 text-gray-400"
                          >
                            …
                          </span>
                        ) : (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`
                              min-w-[40px] px-3 py-2 rounded-xl text-sm font-medium transition-all
                              ${
                                pagination.page === pageNum
                                  ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white shadow-md'
                                  : 'border border-gray-200 hover:bg-gray-50 text-gray-700'
                              }
                            `}
                          >
                            {pageNum}
                          </button>
                        )
                      )}

                      {/* Next */}
                      <button
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={pagination.page === pagination.pages}
                        className="px-3 md:px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      >
                        <span className="hidden sm:inline">Next</span>
                        <span className="sm:hidden">→</span>
                      </button>
                    </nav>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// FILTER CHIP
// ==========================================
const FilterChip = ({ label, onRemove }) => (
  <span className="inline-flex items-center gap-1.5 pl-3 pr-1.5 py-1.5 bg-white border border-amber-200 text-amber-800 rounded-full text-xs font-medium shadow-sm">
    {label}
    <button
      onClick={onRemove}
      className="w-5 h-5 rounded-full hover:bg-amber-100 flex items-center justify-center transition-colors"
      aria-label={`Remove ${label}`}
    >
      <XMarkIcon className="w-3.5 h-3.5" />
    </button>
  </span>
);

export default ProductsPage;