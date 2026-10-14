import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MagnifyingGlassIcon,
  ArrowRightIcon,
  SparklesIcon,
  Squares2X2Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { getCategories } from '../services/productService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const response = await getCategories();
        if (response.success) {
          setCategories(response.categories || []);
        }
      } catch (error) {
        console.error('Failed to load categories:', error);
        toast.error('Failed to load categories');
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const filteredCategories = categories.filter(
    (cat) =>
      cat.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cat.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ==========================================
          HERO HEADER
      ========================================== */}
      <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl" />

        <div className="container-custom py-10 md:py-16 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto text-center"
          >
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur border border-white/20 rounded-full px-4 py-1.5 mb-4 md:mb-5">
              <SparklesIcon className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-xs font-medium text-amber-200">
                Explore Our Collections
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-bold mb-3 md:mb-4">
              Our{' '}
              <span className="bg-gradient-to-r from-amber-400 to-yellow-300 bg-clip-text text-transparent">
                Categories
              </span>
            </h1>

            <p className="text-sm md:text-base text-gray-300 max-w-2xl mx-auto">
              Discover our carefully curated collections, each crafted to
              elevate your style with timeless elegance.
            </p>

            {/* Search Bar */}
            <div className="mt-6 md:mt-8 max-w-lg mx-auto">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-4 md:left-5 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-11 md:pl-14 pr-11 py-3 md:py-4 bg-white/95 text-gray-900 border border-white/20 rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all text-sm md:text-base placeholder:text-gray-400"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                    aria-label="Clear search"
                  >
                    <XMarkIcon className="w-3.5 h-3.5 text-gray-500" />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ==========================================
          RESULTS BAR
      ========================================== */}
      <section className="sticky top-16 md:top-[72px] z-20 bg-white/95 backdrop-blur border-b border-gray-100 shadow-sm">
        <div className="container-custom py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Squares2X2Icon className="w-4 h-4 text-gray-400" />
              <span>
                <strong className="text-gray-900">
                  {filteredCategories.length}
                </strong>{' '}
                {filteredCategories.length === 1 ? 'category' : 'categories'}
                {searchTerm && (
                  <span className="text-gray-500">
                    {' '}
                    matching "{searchTerm}"
                  </span>
                )}
              </span>
            </div>

            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="text-xs text-amber-600 hover:text-amber-700 underline"
              >
                Clear search
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ==========================================
          CATEGORIES GRID
      ========================================== */}
      <section className="py-8 md:py-12">
        <div className="container-custom">
          {loading ? (
            <div className="flex justify-center py-20">
              <LoadingSpinner size="lg" />
            </div>
          ) : filteredCategories.length === 0 ? (
            /* Empty state */
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16 md:py-20 bg-white rounded-3xl border border-gray-100 max-w-2xl mx-auto px-6"
            >
              <div className="w-20 h-20 md:w-24 md:h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-5">
                <Squares2X2Icon className="w-10 h-10 md:w-12 md:h-12 text-gray-300" />
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
                {searchTerm ? 'No categories found' : 'No categories yet'}
              </h3>
              <p className="text-sm md:text-base text-gray-500 mb-6">
                {searchTerm
                  ? `No results for "${searchTerm}". Try a different search.`
                  : 'Categories will appear here once added.'}
              </p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 text-white font-semibold rounded-full hover:from-amber-600 hover:to-yellow-600 transition-all shadow-md text-sm"
                >
                  Clear search
                </button>
              )}
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6 lg:gap-8">
              {filteredCategories.map((category, index) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.4,
                    delay: Math.min(index * 0.05, 0.4),
                  }}
                >
                  <Link
                    to={`/categories/${category.id}`}
                    className="group block bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-1.5 border border-gray-100"
                  >
                    {/* Image */}
                    <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                      <img
                        src={
                          category.image ||
                          'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&h=500&fit=crop'
                        }
                        alt={category.name}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        onError={(e) => {
                          e.target.src =
                            'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&h=500&fit=crop';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

                      {/* Badge */}
                      <div className="absolute top-4 right-4">
                        <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-gray-900 text-xs font-semibold rounded-full">
                          Collection
                        </span>
                      </div>

                      {/* Overlaid name for premium feel */}
                      <div className="absolute bottom-4 left-4 right-4">
                        <h3 className="text-xl md:text-2xl font-serif font-bold text-white drop-shadow-lg group-hover:text-amber-300 transition-colors">
                          {category.name}
                        </h3>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4 md:p-5">
                      <p className="text-sm text-gray-500 leading-relaxed line-clamp-2 mb-4">
                        {category.description ||
                          `Explore our stunning selection of ${category.name.toLowerCase()}`}
                      </p>

                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <span className="text-sm font-semibold text-gray-900 group-hover:text-amber-600 transition-colors">
                          Shop Now
                        </span>
                        <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-amber-50 flex items-center justify-center group-hover:bg-amber-500 transition-all">
                          <ArrowRightIcon className="w-4 h-4 md:w-5 md:h-5 text-amber-600 group-hover:text-white transition-colors" />
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default CategoriesPage;