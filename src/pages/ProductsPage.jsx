import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import {
  FunnelIcon,
  XMarkIcon,
  ChevronDownIcon,
  Squares2X2Icon,
  Bars3BottomLeftIcon,
} from '@heroicons/react/24/outline';

import ProductCard from '../components/products/ProductCard';
import ProductFilters from '../components/products/ProductFilters';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { getProducts, getCategories } from '../services/productService';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price · Low to High' },
  { value: 'price_desc', label: 'Price · High to Low' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'name_asc', label: 'Alphabetical · A–Z' },
];

const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

  const [viewMode, setViewMode] = useState('grid');

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
  // BODY SCROLL LOCK — MOBILE FILTERS
  // ==========================================
  useEffect(() => {
    document.body.style.overflow = filtersOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [filtersOpen]);

  // ==========================================
  // FETCH CATEGORIES ONCE
  // ==========================================
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await getCategories();
        if (res.success) setCategories(res.categories || []);
      } catch {
        // silent
      }
    };
    fetchCats();
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
      Object.keys(params).forEach((k) => {
        if (!params[k]) delete params[k];
      });

      const res = await getProducts(params);
      if (res.success) {
        setProducts(res.products || []);
        setPagination(res.pagination || pagination);
      }
    } catch (err) {
      console.error('Fetch products error:', err);
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
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setPagination((prev) => ({ ...prev, page: 1 }));

    const params = new URLSearchParams();
    Object.entries({ ...filters, ...newFilters }).forEach(([k, v]) => {
      if (v) params.set(k, v);
    });
    setSearchParams(params);
  };

  const handleClearFilters = () => {
    setFilters({
      category: '',
      min_price: '',
      max_price: '',
      material: '',
      gemstone: '',
      sort_by: 'newest',
      search: '',
    });
    setPagination((prev) => ({ ...prev, page: 1 }));
    setSearchParams({});
  };

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const activeFilterCount =
    ['category', 'material', 'gemstone'].filter((k) => filters[k]).length +
    (filters.min_price || filters.max_price ? 1 : 0);

  const hasActiveFilters = activeFilterCount > 0 || filters.search;

  const currentSortLabel =
    SORT_OPTIONS.find((o) => o.value === filters.sort_by)?.label || 'Newest';

  // ==========================================
  // PAGE NUMBER GENERATOR
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
    <div className="bg-cream-100 min-h-screen">
      {/* ==========================================
          PAGE HEADER — editorial
      ========================================== */}
      <section className="border-b border-line bg-cream-100">
        <div className="container-editorial py-8 md:py-12">
          <p className="kicker mb-3">Shop</p>
          <h1 className="section-heading">
            All <span className="italic">pieces.</span>
          </h1>
          <p className="mt-3 text-sm md:text-base text-ink-600 max-w-xl">
            Handcrafted jewellery for every moment — from everyday simplicity
            to statement pieces.
          </p>
        </div>
      </section>

      {/* ==========================================
          STICKY TOOLBAR
      ========================================== */}
      <div className="sticky top-14 md:top-16 z-30 bg-cream-100 border-b border-line">
        <div className="container-editorial">
          <div className="py-3 flex items-center justify-between gap-3">
            {/* LEFT — Filter button (mobile) + Result count */}
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => setFiltersOpen(true)}
                className="lg:hidden inline-flex items-center gap-2 px-3.5 py-2 border border-ink-800 rounded text-[11px] uppercase tracking-wider font-medium text-ink-800 hover:bg-ink-800 hover:text-cream-100 transition-colors"
              >
                <FunnelIcon className="w-3.5 h-3.5" />
                Filter
                {activeFilterCount > 0 && (
                  <span className="ml-0.5 text-burgundy-500 group-hover:text-cream-100">
                    · {activeFilterCount}
                  </span>
                )}
              </button>

              <p className="hidden sm:block text-sm text-ink-600">
                <span className="text-ink-800 font-medium">
                  {pagination.total}
                </span>{' '}
                {pagination.total === 1 ? 'piece' : 'pieces'}
              </p>
            </div>

            {/* RIGHT — Sort + View toggle */}
            <div className="flex items-center gap-2">
              {/* Sort dropdown */}
              <div className="relative">
                <button
                  onClick={() => setSortOpen(!sortOpen)}
                  className="inline-flex items-center gap-2 px-3.5 py-2 border border-line rounded text-[11px] uppercase tracking-wider font-medium text-ink-800 hover:border-ink-800 transition-colors bg-white"
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
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setSortOpen(false)}
                      />
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
                            onClick={() => {
                              handleFilterChange({ sort_by: opt.value });
                              setSortOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                              filters.sort_by === opt.value
                                ? 'bg-cream-100 text-burgundy-500 font-medium'
                                : 'text-ink-700 hover:bg-cream-100'
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>

              {/* View toggle — desktop only */}
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
                  <Bars3BottomLeftIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ==========================================
          MAIN — Sidebar + Grid
      ========================================== */}
      <section className="container-editorial py-8 md:py-10">
        <div className="flex gap-10">
          {/* ==========================================
              FILTERS SIDEBAR (desktop)
          ========================================== */}
          <aside className="hidden lg:block w-56 flex-shrink-0">
            <div className="sticky top-32">
              <ProductFilters
                filters={filters}
                categories={categories}
                onFilterChange={handleFilterChange}
                onClearFilters={handleClearFilters}
              />
            </div>
          </aside>

          {/* ==========================================
              PRODUCTS AREA
          ========================================== */}
          <main className="flex-1 min-w-0">
            {/* Active filter chips */}
            {hasActiveFilters && (
              <div className="flex flex-wrap items-center gap-2 mb-6">
                {filters.search && (
                  <FilterChip
                    label={`"${filters.search}"`}
                    onRemove={() => handleFilterChange({ search: '' })}
                  />
                )}
                {filters.category && (
                  <FilterChip
                    label={
                      categories.find((c) => c.id === filters.category)?.name ||
                      'Category'
                    }
                    onRemove={() => handleFilterChange({ category: '' })}
                  />
                )}
                {filters.material && (
                  <FilterChip
                    label={filters.material}
                    onRemove={() => handleFilterChange({ material: '' })}
                  />
                )}
                {filters.gemstone && (
                  <FilterChip
                    label={filters.gemstone}
                    onRemove={() => handleFilterChange({ gemstone: '' })}
                  />
                )}
                {(filters.min_price || filters.max_price) && (
                  <FilterChip
                    label={`₹${filters.min_price || '0'}–₹${
                      filters.max_price || '∞'
                    }`}
                    onRemove={() =>
                      handleFilterChange({ min_price: '', max_price: '' })
                    }
                  />
                )}
                <button
                  onClick={handleClearFilters}
                  className="text-[11px] uppercase tracking-wider font-medium text-ink-500 hover:text-burgundy-500 transition-colors ml-1"
                >
                  Clear all
                </button>
              </div>
            )}

            {/* Loading / Grid / Empty */}
            {loading ? (
              <div className="flex justify-center py-20">
                <LoadingSpinner size="lg" />
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20 border border-line rounded-lg bg-white">
                <p className="font-serif text-xl text-ink-800 mb-2">
                  Nothing here yet.
                </p>
                <p className="text-sm text-ink-500 mb-6">
                  Try adjusting your filters or search terms.
                </p>
                <button
                  onClick={handleClearFilters}
                  className="btn-outline text-xs"
                >
                  Clear filters
                </button>
              </div>
            ) : viewMode === 'grid' ? (
              /* -------- GRID VIEW -------- */
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
                {products.map((product, i) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.03, 0.3) }}
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </div>
            ) : (
              /* -------- LIST VIEW (desktop only) -------- */
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
          </main>
        </div>
      </section>

      {/* ==========================================
          MOBILE FILTER SHEET
      ========================================== */}
      <AnimatePresence>
        {filtersOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 bg-ink-900/40 lg:hidden"
              onClick={() => setFiltersOpen(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 32, stiffness: 320 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl max-h-[88vh] flex flex-col lg:hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-line">
                <h2 className="text-sm font-semibold tracking-wide">
                  Filters
                  {activeFilterCount > 0 && (
                    <span className="ml-2 text-burgundy-500">
                      · {activeFilterCount}
                    </span>
                  )}
                </h2>
                <button
                  onClick={() => setFiltersOpen(false)}
                  className="p-1.5 -mr-1.5 hover:bg-cream-100 rounded transition-colors"
                  aria-label="Close"
                >
                  <XMarkIcon className="w-5 h-5 text-ink-700" />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto px-5">
                <ProductFilters
                  filters={filters}
                  categories={categories}
                  onFilterChange={handleFilterChange}
                  onClearFilters={handleClearFilters}
                />
              </div>

              {/* Footer */}
              <div className="border-t border-line p-4 bg-white">
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      handleClearFilters();
                      setFiltersOpen(false);
                    }}
                    className="flex-1 py-3 border border-ink-800 rounded text-[11px] uppercase tracking-wider font-semibold text-ink-800 hover:bg-cream-100 transition-colors"
                  >
                    Clear
                  </button>
                  <button
                    onClick={() => setFiltersOpen(false)}
                    className="flex-1 py-3 bg-ink-800 text-cream-100 rounded text-[11px] uppercase tracking-wider font-semibold hover:bg-burgundy-500 transition-colors"
                  >
                    Show {pagination.total}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

// ==========================================
// FILTER CHIP
// ==========================================
const FilterChip = ({ label, onRemove }) => (
  <span className="inline-flex items-center gap-1.5 pl-3 pr-1.5 py-1 bg-white border border-line text-ink-700 rounded text-xs">
    {label}
    <button
      onClick={onRemove}
      className="w-4 h-4 rounded-full hover:bg-cream-200 flex items-center justify-center transition-colors"
      aria-label={`Remove ${label}`}
    >
      <XMarkIcon className="w-3 h-3" />
    </button>
  </span>
);

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
    <a
      href={`/products/${product.id}`}
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
    </a>
  );
};

export default ProductsPage;