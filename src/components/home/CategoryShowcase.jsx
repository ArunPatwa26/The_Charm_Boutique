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
  'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=500&h=600&fit=crop';

// ==========================================
// ✅ ROBUST IMAGE EXTRACTION (matches other pages)
// ==========================================
const extractImageUrl = (image) => {
  if (!image) return '';

  if (typeof image === 'string') {
    const url = image.trim().replace(/^["']|["']$/g, '');
    return url
      .replace(/^https\\:/i, 'https:')
      .replace(/^http\\:/i, 'http:');
  }

  if (typeof image === 'object') {
    return (
      extractImageUrl(image.url) ||
      extractImageUrl(image.secure_url) ||
      extractImageUrl(image.src) ||
      extractImageUrl(image.path) ||
      ''
    );
  }

  return '';
};

const getCategoryImageUrl = (category) => {
  if (!category) return '';

  const possibleImages = [
    category.displayedImage,
    category.originalImage,
    category.image,
    category.categoryImage,
    category.imageUrl,
    category.photo,
    category.image_url,
    category.imageUrlList?.[0],
    category.images?.[0],
  ];

  for (const image of possibleImages) {
    const url = extractImageUrl(image);
    if (url) return url;
  }

  return '';
};

const getCategoryId = (category) =>
  category?._id || category?.id || category?.categoryId;

// ==========================================
// SHOWCASE
// ==========================================
const CategoryShowcase = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // ==========================================
  // FETCH
  // ==========================================
  useEffect(() => {
    let isMounted = true;

    const fetchCategories = async () => {
      try {
        setLoading(true);

        const response = await getCategories();

        const categoryList = Array.isArray(response)
          ? response
          : Array.isArray(response?.categories)
          ? response.categories
          : Array.isArray(response?.data?.categories)
          ? response.data.categories
          : Array.isArray(response?.data)
          ? response.data
          : [];

        if (isMounted) setCategories(categoryList);
      } catch (error) {
        console.error('[CategoryShowcase] Failed to load:', error);
        if (isMounted) setCategories([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchCategories();

    return () => {
      isMounted = false;
    };
  }, []);

  const displayedCategories = categories.slice(0, 8);

  return (
    <section
      className="py-14 md:py-20 relative overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #fffbf5 0%, #fdf6f0 100%)',
      }}
    >
      {/* Decorative orbs */}
      <div
        className="absolute top-10 right-0 w-72 md:w-96 h-72 md:h-96 rounded-full blur-3xl opacity-30 pointer-events-none"
        style={{ backgroundColor: '#f5ceb9' }}
      />

      <div
        className="absolute bottom-10 left-0 w-72 md:w-96 h-72 md:h-96 rounded-full blur-3xl opacity-20 pointer-events-none"
        style={{ backgroundColor: '#e5ccdd' }}
      />

      <div className="container-custom relative z-10">
        {/* ==========================================
            SECTION HEADER
        ========================================== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-8 md:mb-12 max-w-2xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-rose-200 bg-white/80 backdrop-blur-sm shadow-sm mb-4">
            <SparklesIcon
              className="w-3.5 h-3.5"
              style={{ color: '#d99b82' }}
            />

            <span
              className="text-[10px] md:text-xs font-semibold tracking-wider uppercase"
              style={{ color: '#a35f47' }}
            >
              Shop by Category
            </span>
          </div>

          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-plum-900 leading-tight">
            Explore Our{' '}
            <span
              className="italic"
              style={{
                background:
                  'linear-gradient(90deg, #a35f47, #d99b82, #e8b4a0, #d99b82, #a35f47)',
                backgroundSize: '200% auto',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Collections
            </span>
          </h2>

          <p className="text-sm md:text-base text-plum-600 mt-3 md:mt-4 max-w-xl mx-auto leading-relaxed">
            Find your perfect piece from our curated selection of premium
            jewellery.
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
            className="text-center py-14 bg-white rounded-3xl border border-plum-100 max-w-md mx-auto"
          >
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: '#fdf6f0' }}
            >
              <Squares2X2Icon
                className="w-10 h-10"
                style={{ color: '#d99b82' }}
              />
            </div>

            <p className="text-plum-800 font-semibold mb-1">
              No categories yet
            </p>

            <p className="text-sm text-plum-500 px-6">
              Categories will appear here once added.
            </p>
          </motion.div>
        ) : (
          <>
            {/* MOBILE: Horizontal scroll */}
            <div className="md:hidden -mx-4 px-4">
              <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-3 scrollbar-hide">
                {displayedCategories.map((category, index) => (
                  <div
                    key={getCategoryId(category) || category.name || index}
                    className="flex-shrink-0 w-[160px] snap-start"
                  >
                    <CategoryCard category={category} index={index} />
                  </div>
                ))}
              </div>

              <p className="text-center text-[10px] text-plum-400 mt-2 tracking-wide">
                Swipe to see more →
              </p>
            </div>

            {/* DESKTOP/TABLET: Grid */}
            <div className="hidden md:grid grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {displayedCategories.map((category, index) => (
                <CategoryCard
                  key={getCategoryId(category) || category.name || index}
                  category={category}
                  index={index}
                />
              ))}
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
            className="text-center mt-8 md:mt-12"
          >
            <Link
              to="/categories"
              className="group inline-flex items-center gap-2 px-6 md:px-8 py-3 md:py-3.5 rounded-full text-white font-semibold text-sm transition-all shadow-lg hover:-translate-y-0.5"
              style={{
                background:
                  'linear-gradient(135deg, #2d1b2e 0%, #43243c 100%)',
                boxShadow: '0 10px 30px rgba(45, 27, 46, 0.25)',
              }}
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
  const [imageFailed, setImageFailed] = useState(false);

  const categoryId = getCategoryId(category);
  const imageUrl = getCategoryImageUrl(category);

  const displayName =
    category.name?.length > 22
      ? category.name.substring(0, 22).trim() + '…'
      : category.name || 'Category';

  // ✅ Use fallback if image is missing OR failed to load
  const finalImageUrl = !imageFailed && imageUrl ? imageUrl : FALLBACK_IMAGE;

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
        to={`/categories/${categoryId}`}
        className="block relative rounded-2xl md:rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 md:hover:-translate-y-2 border border-plum-100"
      >
        <div className="relative aspect-[3/4] md:aspect-[4/5] bg-plum-100">
          {/* CATEGORY IMAGE */}
          <img
            src={finalImageUrl}
            alt={category.name || 'Jewellery category'}
            loading="lazy"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            onError={() => {
              if (!imageFailed) setImageFailed(true);
            }}
          />

          {/* DARK OVERLAY */}
          <div
            className="absolute inset-0 transition-opacity duration-500"
            style={{
              background:
                'linear-gradient(to top, rgba(45,27,46,0.85) 0%, rgba(45,27,46,0.15) 50%, transparent 100%)',
            }}
          />

          {/* ROSE TINT ON HOVER */}
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{
              background:
                'linear-gradient(to top, rgba(163,95,71,0.4) 0%, transparent 60%)',
            }}
          />

          {/* CONTENT */}
          <div className="absolute bottom-0 left-0 right-0 p-3 md:p-5">
            <h3
              className="text-white font-serif font-bold text-sm md:text-lg lg:text-xl mb-1.5 md:mb-2 leading-tight drop-shadow-md line-clamp-2"
              title={category.name}
            >
              {displayName}
            </h3>

            <div className="flex items-center justify-between">
              <p className="hidden sm:block text-white/70 text-[11px] md:text-xs line-clamp-1">
                {category.description
                  ? category.description.length > 40
                    ? category.description.substring(0, 40).trim() + '…'
                    : category.description
                  : 'Explore Collection'}
              </p>

              <div
                className="w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center flex-shrink-0 ml-auto transition-all group-hover:scale-110"
                style={{ backgroundColor: 'rgba(255,255,255,0.95)' }}
              >
                <ArrowRightIcon
                  className="w-3.5 h-3.5 md:w-4 md:h-4 transition-transform group-hover:translate-x-0.5"
                  style={{ color: '#2d1b2e' }}
                />
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default CategoryShowcase;