import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { 
  FunnelIcon, 
  XMarkIcon, 
  ChevronDownIcon,
  ChevronUpIcon,
  AdjustmentsHorizontalIcon 
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

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, [filters, pagination.page]);

  const fetchCategories = async () => {
    try {
      const response = await getCategories();
      if (response.success) {
        setCategories(response.categories);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...filters,
      };
      
      // Remove empty filters
      Object.keys(params).forEach(key => {
        if (!params[key]) delete params[key];
      });

      const response = await getProducts(params);
      if (response.success) {
        setProducts(response.products);
        setPagination(response.pagination);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters({ ...filters, ...newFilters });
    setPagination({ ...pagination, page: 1 });
    // Update URL params
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
    value => value && value !== 'newest'
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-gold-500 via-gold-600 to-gold-700 text-white">
        <div className="container-custom py-12">
          <h1 className="text-4xl md:text-5xl font-bold">
            Our Collection
          </h1>
          <p className="text-gold-100 mt-2 text-lg">
            Discover our curated selection of premium jewellery
          </p>
        </div>
      </div>

      <div className="container-custom py-8">
        {/* Mobile Filter Toggle */}
        <div className="lg:hidden flex items-center justify-between mb-6">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow"
          >
            <FunnelIcon className="w-5 h-5" />
            <span>Filters</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 bg-gold-500 rounded-full"></span>
            )}
          </button>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              {pagination.total} products
            </span>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Filters Sidebar */}
          <div className={`
            fixed inset-0 z-50 lg:relative lg:z-0
            ${showFilters ? 'block' : 'hidden lg:block'}
          `}>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-black/50 lg:hidden"
              onClick={() => setShowFilters(false)}
            ></div>
            
            {/* Sidebar */}
            <div className={`
              fixed inset-y-0 left-0 w-full max-w-sm bg-white shadow-2xl lg:shadow-none
              lg:static lg:w-72 lg:bg-transparent
              transform transition-transform duration-300 ease-in-out
              ${showFilters ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
              <div className="p-4 lg:p-0">
                <div className="flex items-center justify-between lg:hidden mb-4">
                  <h2 className="text-xl font-bold">Filters</h2>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>

                <ProductFilters
                  filters={filters}
                  categories={categories}
                  onFilterChange={handleFilterChange}
                  onClearFilters={clearFilters}
                />
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            {/* Sort and Results */}
            <div className="hidden lg:flex items-center justify-between mb-6">
              <p className="text-gray-600">
                Showing <span className="font-semibold text-gray-900">{products.length}</span> of{' '}
                <span className="font-semibold text-gray-900">{pagination.total}</span> products
              </p>
              
              <div className="flex items-center gap-4">
                <label className="text-sm text-gray-600">Sort by:</label>
                <select
                  value={filters.sort_by}
                  onChange={(e) => handleFilterChange({ sort_by: e.target.value })}
                  className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gold-400 focus:border-transparent outline-none"
                >
                  <option value="newest">Newest</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                  <option value="name_asc">Name: A to Z</option>
                  <option value="name_desc">Name: Z to A</option>
                </select>
              </div>
            </div>

            {/* Active Filters */}
            {hasActiveFilters && (
              <div className="flex flex-wrap gap-2 mb-6">
                {filters.category && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-gold-100 text-gold-700 rounded-full text-sm">
                    Category: {categories.find(c => c.id === filters.category)?.name}
                    <button
                      onClick={() => handleFilterChange({ category: '' })}
                      className="hover:text-gold-900"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  </span>
                )}
                {filters.material && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-gold-100 text-gold-700 rounded-full text-sm">
                    Material: {filters.material}
                    <button
                      onClick={() => handleFilterChange({ material: '' })}
                      className="hover:text-gold-900"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  </span>
                )}
                {filters.gemstone && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-gold-100 text-gold-700 rounded-full text-sm">
                    Gemstone: {filters.gemstone}
                    <button
                      onClick={() => handleFilterChange({ gemstone: '' })}
                      className="hover:text-gold-900"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  </span>
                )}
                {(filters.min_price || filters.max_price) && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-gold-100 text-gold-700 rounded-full text-sm">
                    Price: ₹{filters.min_price || '0'} - ₹{filters.max_price || '∞'}
                    <button
                      onClick={() => handleFilterChange({ min_price: '', max_price: '' })}
                      className="hover:text-gold-900"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  </span>
                )}
                <button
                  onClick={clearFilters}
                  className="text-sm text-gray-500 hover:text-gray-700 underline"
                >
                  Clear all
                </button>
              </div>
            )}

            {/* Products Grid */}
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <LoadingSpinner />
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-2xl font-bold mb-2">No products found</h3>
                <p className="text-gray-500">
                  Try adjusting your filters or search terms
                </p>
                <button
                  onClick={clearFilters}
                  className="mt-4 text-gold-600 hover:text-gold-700 font-semibold"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  <AnimatePresence>
                    {products.map((product, index) => (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.05 }}
                      >
                        <ProductCard product={product} />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {/* Pagination */}
                {pagination.pages > 1 && (
                  <div className="flex justify-center mt-12">
                    <nav className="flex items-center gap-2">
                      <button
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={pagination.page === 1}
                        className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Previous
                      </button>
                      
                      {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                        let pageNum;
                        if (pagination.pages <= 5) {
                          pageNum = i + 1;
                        } else if (pagination.page <= 3) {
                          pageNum = i + 1;
                        } else if (pagination.page >= pagination.pages - 2) {
                          pageNum = pagination.pages - 4 + i;
                        } else {
                          pageNum = pagination.page - 2 + i;
                        }
                        
                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`
                              px-4 py-2 rounded-lg transition-colors
                              ${pagination.page === pageNum
                                ? 'bg-gold-500 text-white'
                                : 'border border-gray-200 hover:bg-gray-50'
                              }
                            `}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                      
                      <button
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={pagination.page === pagination.pages}
                        className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Next
                      </button>
                    </nav>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;