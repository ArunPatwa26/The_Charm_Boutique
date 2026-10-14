import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRightIcon,
  Squares2X2Icon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { getCategories } from '../../services/productService';
import LoadingSpinner from '../common/LoadingSpinner';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&h=600&fit=crop';

const CategoryShowcase = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
    fetchCategories();
  }, []);

  const displayedCategories = categories.slice(0, 8);

  return (
    <section className="relative py-14 md:py-20 bg-gradient-to-b from-white via-gray-50/50 to-white overflow-hidden">
      {/* Background accents */}
      <div className="absolute top-20 right-0 w-72 h-72 bg-amber-100/40 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-0 w-72 h-72 bg-yellow-100/40 rounded-full blur-3xl" />

      <div className="container-custom relative z-10">
        {/* ==========================================
            SECTION HEADER
        ========================================== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-10 md:mb-14 max-w-2xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-full px-4 py-1.5 mb-4">
            <SparklesIcon className="w-3.5 h-3.5 text-amber-600" />
            <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">
              Shop by Category
            </span>
          </div>

          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-gray-900 mb-3">
            Explore Our{' '}
            <span className="bg-gradient-to-r from-amber-600 to-yellow-500 bg-clip-text text-transparent">
              Collections
            </span>
          </h2>

          <p className="text-sm md:text-base text-gray-600 leading-relaxed">
            Find your perfect piece from our curated selection of premium
            jewellery
          </p>
        </motion.div>

        {/* ==========================================
            LOADING
        ========================================== */}
        {loading ? (
          <div className="flex justify-center py-16">
            <LoadingSpinner size="lg" />
          </div>
        ) : displayedCategories.length === 0 ? (
          /* ==========================================
              EMPTY STATE
          ========================================== */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-14 bg-white rounded-3xl border border-gray-100 max-w-md mx-auto"
          >
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Squares2X2Icon className="w-10 h-10 text-gray-300" />
            </div>
            <p className="text-gray-700 font-semibold mb-1">
              No categories yet
            </p>
            <p className="text-sm text-gray-400 px-6">
              Categories will appear here once added
            </p>
          </motion.div>
        ) : (
          /* ==========================================
              CATEGORIES GRID
          ========================================== */
          <>
            {/* Mobile: horizontal scroll — Desktop: grid */}
            <div className="hidden md:grid grid-cols-3 lg:grid-cols-4 gap-5 lg:gap-6">
              {displayedCategories.map((category, index) => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  index={index}
                />
              ))}
            </div>

            {/* Mobile: horizontal snap scroll */}
            <div className="md:hidden -mx-4 px-4">
              <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-4 scrollbar-hide">
                {displayedCategories.map((category, index) => (
                  <div
                    key={category.id}
                    className="flex-shrink-0 w-[160px] snap-start"
                  >
                    <CategoryCard category={category} index={index} />
                  </div>
                ))}
              </div>

              {/* Scroll hint */}
              <p className="text-center text-[11px] text-gray-400 mt-1">
                Swipe to see more →
              </p>
            </div>
          </>
        )}

        {/* ==========================================
            VIEW ALL BUTTON
        ========================================== */}
        {categories.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            viewport={{ once: true }}
            className="text-center mt-10 md:mt-14"
          >
            <Link
              to="/categories"
              className="inline-flex items-center gap-2 px-6 md:px-8 py-3 md:py-3.5 bg-gray-900 text-white rounded-full font-semibold text-sm hover:bg-amber-600 transition-all duration-300 shadow-md hover:shadow-lg group"
            >
              View All Categories
              <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        )}
      </div>
    </section>
  );
};

// ==========================================
// CATEGORY CARD
// ==========================================
const CategoryCard = ({ category, index }) => {
  const displayName =
    category.name?.length > 22
      ? category.name.substring(0, 22).trim() + '…'
      : category.name;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: Math.min(index * 0.06, 0.4),
      }}
      viewport={{ once: true }}
      className="group"
    >
      <Link
        to={`/categories/${category.id}`}
        className="block relative rounded-2xl md:rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 md:hover:-translate-y-2 ring-1 ring-gray-100"
      >
        <div className="relative aspect-[3/4] md:aspect-[4/5] bg-gray-100">
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

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/5 group-hover:from-black/90 transition-colors duration-500" />

          {/* Subtle amber tint on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-amber-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          {/* Content */}
          <div className="absolute bottom-0 left-0 right-0 p-3 md:p-5">
            <h3
              className="text-white font-serif font-bold text-sm md:text-lg lg:text-xl mb-1.5 md:mb-2 leading-tight drop-shadow-md"
              title={category.name}
            >
              {displayName}
            </h3>

            <p className="hidden sm:block text-white/70 text-[11px] md:text-xs mb-2.5 md:mb-3 line-clamp-1">
              {category.description
                ? category.description.length > 45
                  ? category.description.substring(0, 45).trim() + '…'
                  : category.description
                : 'Explore Collection'}
            </p>

            <div className="inline-flex items-center gap-1.5 md:gap-2 text-[10px] md:text-xs font-semibold bg-white/20 backdrop-blur-md border border-white/20 px-2.5 md:px-3.5 py-1 md:py-1.5 rounded-full group-hover:bg-amber-500 group-hover:border-amber-500 transition-all duration-300">
              <span className="text-white">Shop Now</span>
              <ArrowRightIcon className="w-3 h-3 md:w-3.5 md:h-3.5 text-white group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default CategoryShowcase;