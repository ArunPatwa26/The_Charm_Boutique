import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MagnifyingGlassIcon,
  XMarkIcon,
  Squares2X2Icon,
  ArrowUpRightIcon,
} from '@heroicons/react/24/outline';

import { getCategories } from '../services/productService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&h=600&fit=crop';

// ==========================================
// ✅ ROBUST IMAGE EXTRACTION (matches CategoryShowcase)
// ==========================================

// Extract the URL from a string or an image object.
const extractImageUrl = (image) => {
  if (!image) return '';

  if (typeof image === 'string') {
    const url = image.trim().replace(/^["']|["']$/g, '');

    // Fix escaped colons from MongoDB import
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

// Try every possible category image field.
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
// PAGE
// ==========================================
const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // ==========================================
  // FETCH
  // ==========================================
  useEffect(() => {
    let isMounted = true;

    const fetchCategories = async () => {
      try {
        setLoading(true);

        const response = await getCategories();

        // Support common API response shapes
        const categoryList = Array.isArray(response)
          ? response
          : Array.isArray(response?.categories)
          ? response.categories
          : Array.isArray(response?.data?.categories)
          ? response.data.categories
          : Array.isArray(response?.data)
          ? response.data
          : [];

        if (!isMounted) return;

        if (categoryList.length > 0 || response?.success) {
          setCategories(categoryList);
        } else {
          setCategories([]);
          toast.error('No categories found');
        }
      } catch (error) {
        console.error('Failed to load categories:', error);

        if (isMounted) {
          setCategories([]);
          toast.error('Failed to load categories');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchCategories();

    return () => {
      isMounted = false;
    };
  }, []);

  // ==========================================
  // FILTER
  // ==========================================
  const filteredCategories = categories.filter((category) => {
    const search = searchTerm.toLowerCase();

    return (
      category.name?.toLowerCase().includes(search) ||
      category.description?.toLowerCase().includes(search)
    );
  });

  // ==========================================
  // IMAGE ERROR — fall back gracefully
  // ==========================================
  const handleImageError = (event) => {
    const img = event.currentTarget;

    if (img.dataset.fallbackApplied === 'true') {
      img.onerror = null;
      img.style.visibility = 'hidden';
      return;
    }

    img.dataset.fallbackApplied = 'true';
    img.src = FALLBACK_IMAGE;
  };

  // ==========================================
  // RENDER
  // ==========================================
  return (
    <div className="min-h-screen bg-cream-100 pb-16">
      {/* HEADER */}
      <section className="border-b border-line bg-cream-100">
        <div className="container-editorial py-8 md:py-12">
          <p className="kicker mb-3">Collections</p>

          <h1 className="section-heading">
            Shop by <span className="italic">category.</span>
          </h1>

          <p className="mt-3 text-sm md:text-base text-ink-600 max-w-xl">
            Explore curated pieces, handpicked and organized by style.
          </p>
        </div>
      </section>

      {/* SEARCH */}
      <div className="sticky top-14 md:top-16 z-30 border-b border-line bg-cream-100">
        <div className="container-editorial">
          <div className="py-3 flex items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <MagnifyingGlassIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />

              <input
                type="text"
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="w-full pl-10 pr-10 py-2.5 bg-white border border-line rounded focus:ring-0 focus:border-ink-800 outline-none transition-colors text-sm"
              />

              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-cream-100 rounded transition-colors"
                  aria-label="Clear search"
                >
                  <XMarkIcon className="w-3.5 h-3.5 text-ink-500" />
                </button>
              )}
            </div>

            <p className="hidden sm:block text-xs text-ink-500 whitespace-nowrap">
              <span className="text-ink-800 font-medium">
                {filteredCategories.length}
              </span>{' '}
              {filteredCategories.length === 1
                ? 'category'
                : 'categories'}
            </p>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <section className="container-editorial py-8 md:py-10">
        {loading ? (
          <div className="flex justify-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        ) : filteredCategories.length === 0 ? (
          /* EMPTY STATE */
          <div className="text-center py-20 max-w-md mx-auto">
            <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center rounded-full bg-cream-200">
              <Squares2X2Icon className="w-7 h-7 text-ink-400" />
            </div>

            <h2 className="font-serif text-2xl font-bold text-ink-800 mb-3">
              {searchTerm ? 'Nothing found.' : 'No categories yet.'}
            </h2>

            <p className="text-sm text-ink-500 mb-8">
              {searchTerm
                ? `No categories match "${searchTerm}". Try a different search.`
                : 'Check back soon — new collections are added regularly.'}
            </p>

            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="btn-outline text-xs"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          /* CATEGORY GRID */
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8 md:gap-x-6 md:gap-y-10">
            {filteredCategories.map((category, index) => {
              const categoryId = getCategoryId(category);
              const imageUrl = getCategoryImageUrl(category);

              return (
                <motion.div
                  key={categoryId || category.name || index}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.5,
                    delay: Math.min(index * 0.04, 0.4),
                  }}
                  viewport={{ once: true }}
                >
                  <Link
                    to={`/categories/${categoryId}`}
                    className="group block"
                  >
                    {/* CATEGORY IMAGE */}
                    <div className="relative aspect-square overflow-hidden rounded bg-cream-200 mb-3">
                      <img
                        src={imageUrl || FALLBACK_IMAGE}
                        alt={category.name || 'Jewellery category'}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        onError={handleImageError}
                      />

                      {/* HOVER OVERLAY */}
                      <div className="absolute inset-0 bg-ink-900/0 group-hover:bg-ink-900/15 transition-colors duration-300" />

                      <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white flex items-center justify-center opacity-0 group-hover:opacity-100 scale-95 group-hover:scale-100 transition-all duration-300">
                        <ArrowUpRightIcon className="w-4 h-4 text-ink-800" />
                      </div>
                    </div>

                    {/* CATEGORY NAME */}
                    <h3 className="font-serif text-base md:text-lg font-bold text-ink-800 group-hover:text-burgundy-500 transition-colors line-clamp-1">
                      {category.name}
                    </h3>

                    {/* CATEGORY DESCRIPTION */}
                    {category.description && (
                      <p className="hidden md:block text-xs text-ink-500 mt-1 line-clamp-1">
                        {category.description}
                      </p>
                    )}
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* BOTTOM CTA */}
        {!loading && filteredCategories.length > 0 && (
          <div className="mt-16 pt-10 border-t border-line text-center">
            <p className="text-xs uppercase tracking-kicker font-medium text-ink-500 mb-4">
              Looking for something specific?
            </p>

            <Link
              to="/products"
              className="btn-solid inline-flex items-center gap-2"
            >
              Shop All Products
            </Link>
          </div>
        )}
      </section>
    </div>
  );
};

export default CategoriesPage;