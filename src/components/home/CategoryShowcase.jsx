import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRightIcon, FolderIcon } from '@heroicons/react/24/outline';
import { getCategories } from '../../services/productService';
import LoadingSpinner from '../common/LoadingSpinner';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&h=600&fit=crop';

const CategoryShowcase = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await getCategories();
      if (response.success) {
        setCategories(response.categories || []);
      }
    } catch (error) {
      console.error('Failed to load categories:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-14 md:py-20 bg-white">
      <div className="container-custom">
        {/* ==========================================
            SECTION HEADER
        ========================================== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-10 md:mb-14"
        >
          <span className="text-amber-600 font-semibold text-xs md:text-sm uppercase tracking-[0.2em]">
            Shop by Category
          </span>
          <h2 className="section-title mt-3">
            Explore Our <span className="gradient-text">Collections</span>
          </h2>
          <p className="section-subtitle max-w-2xl mx-auto">
            Find your perfect piece from our curated selection of premium jewellery
          </p>
        </motion.div>

        {/* ==========================================
            LOADING
        ========================================== */}
        {loading ? (
          <div className="flex justify-center py-16">
            <LoadingSpinner size="lg" />
          </div>
        ) : categories.length === 0 ? (
          /* ==========================================
              EMPTY STATE
          ========================================== */
          <div className="text-center py-16 bg-gray-50 rounded-3xl">
            <FolderIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">No categories yet</p>
            <p className="text-sm text-gray-400 mt-1">
              Categories will appear here once added
            </p>
          </div>
        ) : (
          /* ==========================================
              CATEGORIES GRID
          ========================================== */
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5 lg:gap-6">
            {categories.slice(0, 8).map((category, index) => {
              const displayName =
                category.name?.length > 30
                  ? category.name.substring(0, 30).trim() + '…'
                  : category.name;

              return (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.08 }}
                  viewport={{ once: true }}
                  className="group relative rounded-2xl md:rounded-3xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 md:hover:-translate-y-2"
                >
                  <Link to={`/categories/${category.id}`} className="block">
                    <div className="relative aspect-[3/4] md:aspect-[4/5]">
                      {/* Image */}
                      <img
                        src={category.image || FALLBACK_IMAGE}
                        alt={category.name}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        onError={(e) => {
                          e.target.src = FALLBACK_IMAGE;
                        }}
                      />

                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                      {/* Content */}
                      <div className="absolute bottom-0 left-0 right-0 p-3 md:p-5">
                        {/* Category Name */}
                        <h3
                          className="text-white font-serif font-bold text-sm md:text-xl mb-0.5 md:mb-1 leading-tight"
                          title={category.name}
                        >
                          {displayName}
                        </h3>

                        {/* Subtitle — hidden on very small screens */}
                        <p className="hidden sm:block text-white/75 text-[11px] md:text-xs mb-2 md:mb-3">
                          {category.description
                            ? category.description.length > 40
                              ? category.description.substring(0, 40).trim() + '…'
                              : category.description
                            : 'Explore Collection'}
                        </p>

                        {/* Shop Now Button */}
                        <div className="inline-flex items-center gap-1.5 md:gap-2 text-[10px] md:text-xs font-semibold bg-white/20 backdrop-blur-sm px-2.5 md:px-3.5 py-1 md:py-1.5 rounded-full group-hover:bg-amber-500 transition-all">
                          <span className="text-white">Shop Now</span>
                          <ArrowRightIcon className="w-3 h-3 md:w-3.5 md:h-3.5 text-white group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* ==========================================
            VIEW ALL BUTTON
        ========================================== */}
        {categories.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            viewport={{ once: true }}
            className="text-center mt-10 md:mt-14"
          >
            <Link
              to="/categories"
              className="inline-flex items-center gap-2 px-6 md:px-8 py-3 md:py-3.5 bg-gray-900 text-white rounded-full font-semibold text-sm hover:bg-amber-600 transition-all duration-300 shadow-md hover:shadow-lg"
            >
              View All Categories
              <ArrowRightIcon className="w-4 h-4" />
            </Link>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default CategoryShowcase;