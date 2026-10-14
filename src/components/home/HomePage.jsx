import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRightIcon,
  ArrowUpRightIcon,
} from '@heroicons/react/24/outline';

import { useAuth } from '../../context/AuthContext';
import {
  getCategories,
  getAIRecommendations,
  getTrendingProducts,
} from '../../services/productService';
import ProductCard from '../../components/products/ProductCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Hero from '../../components/home/Hero';

const HomePage = () => {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);

    const fetchHomeData = async () => {
      setLoading(true);
      try {
        const [catRes, trendingRes] = await Promise.all([
          getCategories(),
          getTrendingProducts(),
        ]);
        if (catRes?.success) setCategories(catRes.categories || []);
        if (trendingRes?.success) setTrending(trendingRes.trending || []);

        if (user?.id) {
          const aiRes = await getAIRecommendations(user.id);
          if (aiRes?.success) setRecommendations(aiRes.recommendations || []);
        }
      } catch (error) {
        console.error('Home data error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, [user?.id]);

  return (
    <div className="bg-cream-100">
      {/* ==========================================
          1. HERO — Split layout, no full-bleed banner
      ========================================== */}
      <Hero />

      {/* ==========================================
          2. CATEGORIES — Editorial grid
      ========================================== */}
      <section className="border-t border-line py-12 md:py-16">
        <div className="container-editorial">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8 md:mb-10">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <p className="kicker mb-3">Browse by Category</p>
              <h2 className="section-heading">
                Find your <span className="italic">piece.</span>
              </h2>
            </motion.div>

            <Link
              to="/categories"
              className="group inline-flex items-center gap-2 text-sm font-medium text-ink-700 hover:text-burgundy-500 transition-colors"
            >
              View all categories
              <ArrowUpRightIcon className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <LoadingSpinner />
            </div>
          ) : categories.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
              {categories.slice(0, 6).map((cat, i) => (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.05, 0.3) }}
                  viewport={{ once: true }}
                >
                  <Link to={`/categories/${cat.id}`} className="group block">
                    <div className="aspect-square overflow-hidden rounded-lg bg-cream-200 mb-3">
                      <img
                        src={cat.image || 'https://via.placeholder.com/400'}
                        alt={cat.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    </div>
                    <p className="text-sm font-medium text-ink-800 group-hover:text-burgundy-500 transition-colors line-clamp-1">
                      {cat.name}
                    </p>
                  </Link>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-ink-500 text-sm">
              No categories available yet.
            </div>
          )}
        </div>
      </section>

      {/* ==========================================
          3. NEW ARRIVALS — Product grid
      ========================================== */}
      <section className="border-t border-line py-12 md:py-16 bg-white">
        <div className="container-editorial">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8 md:mb-10">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <p className="kicker mb-3">Just Landed</p>
              <h2 className="section-heading">
                New <span className="italic">arrivals.</span>
              </h2>
            </motion.div>

            <Link
              to="/products?sort_by=newest"
              className="group inline-flex items-center gap-2 text-sm font-medium text-ink-700 hover:text-burgundy-500 transition-colors"
            >
              View all new
              <ArrowUpRightIcon className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <LoadingSpinner />
            </div>
          ) : trending.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {trending.slice(0, 4).map((product, i) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.06, 0.3) }}
                  viewport={{ once: true }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-ink-500 text-sm">
              No products yet.
            </div>
          )}
        </div>
      </section>

      {/* ==========================================
          4. EDITORIAL STORY — Split with small image
      ========================================== */}
      <section className="border-t border-line py-12 md:py-16">
        <div className="container-editorial">
          <div className="grid md:grid-cols-12 gap-8 md:gap-14 items-center">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="md:col-span-5"
            >
              <p className="kicker mb-4">Our Story</p>

              <h2 className="section-heading mb-5">
                Crafted with
                <br />
                <span className="italic">intention.</span>
              </h2>

              <p className="text-sm md:text-base text-ink-600 leading-relaxed mb-6">
                Every piece in our collection is chosen with care — because we
                believe jewellery should tell a story. Yours.
              </p>

              <Link
                to="/about"
                className="group inline-flex items-center gap-2 text-sm font-medium text-ink-800 hover:text-burgundy-500 transition-colors border-b border-ink-800 hover:border-burgundy-500 pb-1"
              >
                Read our story
                <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              viewport={{ once: true }}
              className="md:col-span-7"
            >
              <div className="grid grid-cols-2 gap-3 md:gap-4">
                <div className="aspect-[4/5] overflow-hidden rounded-lg bg-cream-200">
                  <img
                    src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&h=750&fit=crop&q=80"
                    alt="Craftsmanship"
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="aspect-[4/5] overflow-hidden rounded-lg bg-cream-200 mt-6 md:mt-10">
                  <img
                    src="https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=600&h=750&fit=crop&q=80"
                    alt="Detail"
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ==========================================
          5. AI RECOMMENDATIONS (if logged in)
      ========================================== */}
      {recommendations.length > 0 && (
        <section className="border-t border-line py-12 md:py-16 bg-white">
          <div className="container-editorial">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8 md:mb-10">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <p className="kicker mb-3">Made For You</p>
                <h2 className="section-heading">
                  Your <span className="italic">picks.</span>
                </h2>
              </motion.div>

              <Link
                to="/products"
                className="group inline-flex items-center gap-2 text-sm font-medium text-ink-700 hover:text-burgundy-500 transition-colors"
              >
                Browse all
                <ArrowUpRightIcon className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {recommendations.slice(0, 4).map((product, i) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.06, 0.3) }}
                  viewport={{ once: true }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ==========================================
          6. TRENDING — Best sellers
      ========================================== */}
      <section className="border-t border-line py-12 md:py-16">
        <div className="container-editorial">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8 md:mb-10">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <p className="kicker mb-3">Most Loved</p>
              <h2 className="section-heading">
                Trending <span className="italic">now.</span>
              </h2>
            </motion.div>

            <Link
              to="/products?sort_by=rating"
              className="group inline-flex items-center gap-2 text-sm font-medium text-ink-700 hover:text-burgundy-500 transition-colors"
            >
              View all trending
              <ArrowUpRightIcon className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <LoadingSpinner />
            </div>
          ) : trending.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {trending.slice(0, 4).map((product, i) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.06, 0.3) }}
                  viewport={{ once: true }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-ink-500 text-sm">
              No trending products yet.
            </div>
          )}
        </div>
      </section>

      {/* ==========================================
          7. NEWSLETTER — Minimal inline
      ========================================== */}
      <section className="border-t border-line bg-white py-12 md:py-16">
        <div className="container-editorial">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-xl mx-auto text-center"
          >
            <p className="kicker mb-4">Stay in Touch</p>

            <h2 className="section-heading mb-4">
              Join our <span className="italic">list.</span>
            </h2>

            <p className="text-sm md:text-base text-ink-600 mb-8 max-w-md mx-auto">
              Early access to new drops, styling tips, and exclusive offers —
              straight to your inbox.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                alert('Thank you for subscribing!');
              }}
              className="flex items-center max-w-md mx-auto border-b-2 border-ink-800 pb-3"
            >
              <input
                type="email"
                required
                placeholder="Your email address"
                className="flex-1 bg-transparent border-none outline-none text-base text-ink-800 placeholder-ink-400"
              />
              <button
                type="submit"
                className="text-sm font-medium text-ink-800 hover:text-burgundy-500 transition-colors flex items-center gap-1.5 pl-4 whitespace-nowrap"
              >
                Subscribe
                <ArrowRightIcon className="w-4 h-4" />
              </button>
            </form>

            <p className="text-xs text-ink-400 mt-4">
              No spam. Unsubscribe anytime.
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;