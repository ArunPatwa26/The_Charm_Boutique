import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  SparklesIcon,
  ArrowRightIcon,
  StarIcon,
  TruckIcon,
  ShieldCheckIcon,
  HeartIcon,
  ShoppingBagIcon,
  ChevronRightIcon,
  PlayIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import { getCategories } from '../../services/productService';
import ProductCard from '../products/ProductCard';
import { getAIRecommendations, getTrendingProducts } from '../../services/productService';
import LoadingSpinner from '../common/LoadingSpinner';

const HomePage = () => {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchHomeData();
  }, [user?.id]);

  const fetchHomeData = async () => {
    setLoading(true);
    try {
      const catRes = await getCategories();
      if (catRes.success) setCategories(catRes.categories || []);

      const trendingRes = await getTrendingProducts();
      if (trendingRes.success) setTrending(trendingRes.trending || []);

      if (user?.id) {
        const aiRes = await getAIRecommendations(user.id);
        if (aiRes.success) setRecommendations(aiRes.recommendations || []);
      }
    } catch (error) {
      console.error('Home data error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white overflow-x-hidden">
      {/* ============================================
          HERO SECTION — Mobile Optimized
      ============================================ */}
      <section className="relative min-h-[85vh] md:min-h-[92vh] flex items-center overflow-hidden bg-gradient-to-br from-[#fefcf7] via-white to-[#fff7e6]">
        {/* Decorative Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 -right-32 w-64 h-64 md:w-[500px] md:h-[500px] bg-yellow-200/40 rounded-full blur-3xl" />
          <div className="absolute -bottom-32 -left-32 w-64 h-64 md:w-[500px] md:h-[500px] bg-amber-200/30 rounded-full blur-3xl" />
        </div>

        <div className="container-custom relative z-10 pt-24 md:pt-32 pb-12 md:pb-20">
          <div className="grid lg:grid-cols-2 gap-10 md:gap-16 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-5 md:space-y-8 text-center lg:text-left"
            >
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 px-3 md:px-4 py-1.5 md:py-2 rounded-full border border-yellow-200">
                <SparklesIcon className="w-3.5 h-3.5 md:w-4 md:h-4" />
                <span className="text-xs md:text-sm font-semibold">
                  AI-Powered Jewellery Boutique
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif font-bold leading-[1.1] text-gray-900">
                Elegance
                <br />
                <span className="bg-gradient-to-r from-yellow-600 via-amber-600 to-yellow-500 bg-clip-text text-transparent">
                  Redefined
                </span>
              </h1>

              <p className="text-base md:text-xl text-gray-600 max-w-lg mx-auto lg:mx-0 leading-relaxed px-2 md:px-0">
                Discover handcrafted jewellery pieces curated by artificial intelligence
                to match your unique style and personality.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start px-2 md:px-0">
                <Link
                  to="/products"
                  className="group inline-flex items-center justify-center gap-2 px-6 md:px-8 py-3.5 md:py-4 bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-full font-semibold hover:from-yellow-600 hover:to-amber-600 transition-all duration-300 shadow-xl hover:shadow-2xl text-sm md:text-base"
                >
                  Explore Collection
                  <ArrowRightIcon className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  to="/categories"
                  className="inline-flex items-center justify-center gap-2 px-6 md:px-8 py-3.5 md:py-4 bg-white border-2 border-gray-200 text-gray-900 rounded-full font-semibold hover:border-yellow-400 hover:text-yellow-700 transition-all duration-300 text-sm md:text-base"
                >
                  <PlayIcon className="w-4 h-4 md:w-5 md:h-5" />
                  Shop Categories
                </Link>
              </div>

              {/* Trust Stats */}
              <div className="flex justify-center lg:justify-start gap-6 md:gap-8 pt-5 md:pt-6 border-t border-gray-100">
                <div className="text-center lg:text-left">
                  <p className="text-2xl md:text-3xl font-bold text-gray-900">10K+</p>
                  <p className="text-xs md:text-sm text-gray-500">Happy Clients</p>
                </div>
                <div className="text-center lg:text-left">
                  <p className="text-2xl md:text-3xl font-bold text-gray-900">500+</p>
                  <p className="text-xs md:text-sm text-gray-500">Unique Designs</p>
                </div>
                <div className="text-center lg:text-left">
                  <div className="flex items-center justify-center lg:justify-start gap-1">
                    <p className="text-2xl md:text-3xl font-bold text-gray-900">4.9</p>
                    <StarIcon className="w-4 h-4 md:w-5 md:h-5 text-yellow-400 fill-yellow-400 mb-1" />
                  </div>
                  <p className="text-xs md:text-sm text-gray-500">Client Rating</p>
                </div>
              </div>
            </motion.div>

            {/* Right Visual */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative max-w-md mx-auto lg:max-w-none w-full"
            >
              <div className="relative rounded-3xl md:rounded-[2.5rem] overflow-hidden shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&h=900&fit=crop"
                  alt="Luxury Jewellery"
                  className="w-full h-[350px] sm:h-[450px] md:h-[600px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              </div>

              {/* Floating Card 1 - Hidden on very small screens */}
              <motion.div
                animate={{ y: [0, -15, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="hidden sm:block absolute -top-4 md:-top-6 -left-4 md:-left-6 bg-white rounded-2xl shadow-2xl p-3 md:p-5 backdrop-blur-lg"
              >
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center shadow-md">
                    <SparklesIcon className="w-5 h-5 md:w-6 md:h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-xs md:text-sm font-bold text-gray-900">AI Curated</p>
                    <p className="text-[10px] md:text-xs text-gray-500">Just for you</p>
                  </div>
                </div>
              </motion.div>

              {/* Floating Card 2 */}
              <motion.div
                animate={{ y: [0, 15, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                className="hidden sm:block absolute -bottom-4 md:-bottom-6 -right-4 md:-right-6 bg-white rounded-2xl shadow-2xl p-3 md:p-5 backdrop-blur-lg"
              >
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center shadow-md">
                    <TruckIcon className="w-5 h-5 md:w-6 md:h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-xs md:text-sm font-bold text-gray-900">Free Shipping</p>
                    <p className="text-[10px] md:text-xs text-gray-500">On orders ₹1000+</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ============================================
          FEATURES STRIP — Mobile Optimized (2 cols)
      ============================================ */}
      <section className="py-10 md:py-12 bg-gray-900">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {[
              { icon: TruckIcon, title: 'Free Shipping', sub: 'Orders ₹1000+' },
              { icon: ShieldCheckIcon, title: 'Secure Payment', sub: 'Encrypted checkout' },
              { icon: SparklesIcon, title: 'AI Recommendations', sub: 'Personalized for you' },
              { icon: HeartIcon, title: 'Lifetime Warranty', sub: 'On all premium pieces' },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="flex flex-col sm:flex-row items-center sm:items-start gap-3 text-center sm:text-left"
              >
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center flex-shrink-0">
                  <feature.icon className="w-5 h-5 md:w-6 md:h-6 text-yellow-500" />
                </div>
                <div>
                  <p className="font-semibold text-white text-xs md:text-sm">
                    {feature.title}
                  </p>
                  <p className="text-[10px] md:text-xs text-gray-400 mt-0.5">
                    {feature.sub}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          SHOP BY CATEGORY — Mobile Optimized (2 cols)
      ============================================ */}
      <section className="py-14 md:py-24 bg-white">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 md:gap-6 mb-8 md:mb-14"
          >
            <div className="text-center md:text-left">
              <p className="text-yellow-600 font-semibold text-xs md:text-sm uppercase tracking-widest mb-2 md:mb-3">
                Shop by Category
              </p>
              <h2 className="text-3xl md:text-5xl font-serif font-bold text-gray-900">
                Curated Collections
              </h2>
              <p className="text-sm md:text-base text-gray-500 mt-2 md:mt-4 max-w-xl mx-auto md:mx-0">
                Browse our handpicked categories to find the perfect piece for your style.
              </p>
            </div>
            <Link
              to="/categories"
              className="inline-flex items-center justify-center gap-2 text-gray-900 font-semibold hover:text-yellow-600 transition-colors group text-sm md:text-base"
            >
              View All Categories
              <ChevronRightIcon className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>

          {loading ? (
            <div className="flex justify-center py-16">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
              {categories.slice(0, 8).map((category, index) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08 }}
                  viewport={{ once: true }}
                >
                  <Link
                    to={`/categories/${category.id}`}
                    className="group block relative overflow-hidden rounded-2xl md:rounded-3xl aspect-[4/5] bg-gray-100"
                  >
                    <img
                      src={
                        category.image ||
                        'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=500&h=600&fit=crop'
                      }
                      alt={category.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                    <div className="absolute bottom-0 left-0 right-0 p-3 md:p-5">
                      <h3 className="text-white font-serif text-sm md:text-xl font-bold mb-1 line-clamp-1">
                        {category.name}
                      </h3>
                      <div className="flex items-center justify-between">
                        <p className="text-white/70 text-[10px] md:text-xs hidden sm:block">
                          Explore Collection
                        </p>
                        <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:bg-yellow-500 transition-colors ml-auto">
                          <ArrowRightIcon className="w-3 h-3 md:w-4 md:h-4 text-white" />
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

      {/* ============================================
          AI RECOMMENDATIONS — Mobile: 2 cols
      ============================================ */}
      {recommendations.length > 0 && (
        <section className="py-14 md:py-24 bg-gradient-to-br from-gray-50 via-white to-yellow-50">
          <div className="container-custom">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-8 md:mb-14"
            >
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 px-3 md:px-4 py-1.5 md:py-2 rounded-full border border-yellow-200 mb-3 md:mb-4">
                <SparklesIcon className="w-3.5 h-3.5 md:w-4 md:h-4" />
                <span className="text-xs md:text-sm font-semibold">AI Curated For You</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-serif font-bold text-gray-900">
                Personalized Picks
              </h2>
              <p className="text-sm md:text-base text-gray-500 mt-2 md:mt-4 max-w-2xl mx-auto">
                Handpicked by our AI based on your unique taste and preferences.
              </p>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
              {recommendations.slice(0, 4).map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ============================================
          TRENDING PRODUCTS — Mobile: 2 cols
      ============================================ */}
      <section className="py-14 md:py-24 bg-white">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 md:gap-6 mb-8 md:mb-14"
          >
            <div className="text-center md:text-left">
              <p className="text-yellow-600 font-semibold text-xs md:text-sm uppercase tracking-widest mb-2 md:mb-3">
                Trending Now
              </p>
              <h2 className="text-3xl md:text-5xl font-serif font-bold text-gray-900">
                Most Loved Pieces
              </h2>
              <p className="text-sm md:text-base text-gray-500 mt-2 md:mt-4 max-w-xl mx-auto md:mx-0">
                Discover what our customers are loving right now.
              </p>
            </div>
            <Link
              to="/products?sort_by=rating"
              className="inline-flex items-center justify-center gap-2 text-gray-900 font-semibold hover:text-yellow-600 transition-colors group text-sm md:text-base"
            >
              View All Trending
              <ChevronRightIcon className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>

          {loading ? (
            <div className="flex justify-center py-16">
              <LoadingSpinner />
            </div>
          ) : trending.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
              {trending.slice(0, 4).map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-gray-50 rounded-3xl">
              <ShoppingBagIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No trending products available yet</p>
            </div>
          )}
        </div>
      </section>

      {/* ============================================
          CTA BANNER — Mobile Optimized
      ============================================ */}
      <section className="py-14 md:py-24 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-64 md:w-96 h-64 md:h-96 bg-yellow-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-64 md:w-96 h-64 md:h-96 bg-amber-500/10 rounded-full blur-3xl" />
        </div>

        <div className="container-custom relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="space-y-4 md:space-y-6"
            >
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 md:px-4 py-1.5 md:py-2 rounded-full border border-white/20">
                <SparklesIcon className="w-3.5 h-3.5 md:w-4 md:h-4 text-yellow-400" />
                <span className="text-xs md:text-sm font-semibold text-white">
                  Join Our VIP List
                </span>
              </div>

              <h2 className="text-3xl md:text-5xl font-serif font-bold text-white px-2">
                Get Early Access to New Drops
              </h2>

              <p className="text-sm md:text-lg text-gray-300 max-w-xl mx-auto px-2">
                Join our exclusive list for early access, special offers, and
                personalized jewellery recommendations.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto pt-4 px-4 sm:px-0">
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="flex-1 px-5 py-3.5 md:py-4 bg-white/10 border border-white/20 rounded-full text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 transition-colors text-sm md:text-base"
                />
                <button className="px-6 md:px-8 py-3.5 md:py-4 bg-gradient-to-r from-yellow-500 to-amber-500 text-gray-900 font-semibold rounded-full hover:from-yellow-400 hover:to-amber-400 transition-all shadow-lg text-sm md:text-base whitespace-nowrap">
                  Subscribe
                </button>
              </div>

              <p className="text-[10px] md:text-xs text-gray-500">
                No spam, unsubscribe anytime.
              </p>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;