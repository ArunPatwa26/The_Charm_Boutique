import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowRightIcon,
  SparklesIcon,
  FolderIcon,
} from '@heroicons/react/24/outline';
import { getCategories } from '../services/productService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

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

  const filteredCategories = categories.filter((cat) =>
    cat.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cat.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Banner */}
      <section className="relative pt-32 pb-20 bg-gradient-to-br from-[#fefcf7] via-white to-[#fff7e6] overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-200/40 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-200/30 rounded-full blur-3xl" />
        </div>

        <div className="container-custom relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto text-center"
          >
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 px-4 py-2 rounded-full border border-yellow-200 mb-6">
              <SparklesIcon className="w-4 h-4" />
              <span className="text-sm font-semibold">Explore Our Collections</span>
            </div>

            <h1 className="text-5xl md:text-6xl font-serif font-bold text-gray-900 mb-6">
              Our{' '}
              <span className="bg-gradient-to-r from-yellow-600 via-amber-600 to-yellow-500 bg-clip-text text-transparent">
                Categories
              </span>
            </h1>

            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover our carefully curated collections, each crafted to
              elevate your style with timeless elegance.
            </p>

            {/* Search Bar */}
            <div className="mt-10 max-w-lg mx-auto">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-14 pr-6 py-4 bg-white border border-gray-200 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="pb-24 pt-8">
        <div className="container-custom">
          {/* Stats Bar */}
          <div className="flex items-center justify-between mb-10 pb-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <FunnelIcon className="w-5 h-5 text-gray-400" />
              <span className="text-gray-600 text-sm">
                <strong className="text-gray-900">{filteredCategories.length}</strong>{' '}
                {filteredCategories.length === 1 ? 'category' : 'categories'} found
              </span>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <LoadingSpinner size="lg" />
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="text-center py-20">
              <FolderIcon className="w-20 h-20 text-gray-300 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                {searchTerm ? 'No categories found' : 'No categories yet'}
              </h3>
              <p className="text-gray-500 mb-6">
                {searchTerm
                  ? 'Try adjusting your search terms'
                  : 'Categories will appear here once added'}
              </p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="text-yellow-600 hover:text-yellow-700 font-semibold"
                >
                  Clear search
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredCategories.map((category, index) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08 }}
                >
                  <Link
                    to={`/categories/${category.id}`}
                    className="group block bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-100"
                  >
                    {/* Image */}
                    <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                      <img
                        src={
                          category.image ||
                          'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&h=500&fit=crop'
                        }
                        alt={category.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

                      {/* Badge */}
                      <div className="absolute top-5 right-5">
                        <span className="px-3 py-1.5 bg-white/90 backdrop-blur-sm text-gray-900 text-xs font-semibold rounded-full">
                          Collection
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <h3 className="text-2xl font-serif font-bold text-gray-900 mb-2 group-hover:text-yellow-700 transition-colors">
                        {category.name}
                      </h3>

                      <p className="text-gray-500 text-sm leading-relaxed line-clamp-2 mb-5">
                        {category.description ||
                          `Explore our stunning selection of ${category.name.toLowerCase()}`}
                      </p>

                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <span className="text-sm font-semibold text-gray-900">
                          Shop Now
                        </span>
                        <div className="w-10 h-10 rounded-full bg-yellow-50 flex items-center justify-center group-hover:bg-yellow-500 transition-all">
                          <ArrowRightIcon className="w-5 h-5 text-yellow-600 group-hover:text-white transition-colors" />
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