import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  SparklesIcon,
  ArrowRightIcon,
  StarIcon,
  ShieldCheckIcon,
  TruckIcon,
} from '@heroicons/react/24/outline';

const Hero = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#fefcf7] via-white to-[#fff7e6]">
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -right-32 w-96 h-96 bg-amber-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-0 -left-32 w-96 h-96 bg-yellow-200/30 rounded-full blur-3xl" />
      </div>

      <div className="container-custom relative z-10 py-12 lg:py-16">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">

          {/* ========================================
              LEFT CONTENT (5 columns on lg)
          ======================================== */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-5 space-y-6"
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-800 px-3.5 py-1.5 rounded-full border border-amber-200">
              <SparklesIcon className="w-3.5 h-3.5" />
              <span className="text-xs font-semibold tracking-wide">
                AI-Powered Jewellery Boutique
              </span>
            </div>

            {/* Heading */}
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-900 leading-[1.05]">
              Elegance
              <br />
              <span className="gradient-text italic">Redefined</span>
            </h1>

            {/* Subtext */}
            <p className="text-base lg:text-lg text-gray-600 leading-relaxed max-w-md">
              Discover handcrafted jewellery pieces curated by artificial
              intelligence to match your unique style and personality.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-3 pt-2">
              <Link to="/products" className="btn-primary group">
                Explore Collection
                <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link to="/categories" className="btn-secondary">
                Shop Categories
              </Link>
            </div>

            {/* Trust Stats Row */}
            <div className="flex items-center gap-6 pt-4 border-t border-gray-100">
              <div>
                <p className="font-serif text-2xl lg:text-3xl font-bold text-gray-900">
                  10K+
                </p>
                <p className="text-xs text-gray-500 mt-0.5">Happy Clients</p>
              </div>
              <div className="w-px h-10 bg-gray-200" />
              <div>
                <p className="font-serif text-2xl lg:text-3xl font-bold text-gray-900">
                  500+
                </p>
                <p className="text-xs text-gray-500 mt-0.5">Designs</p>
              </div>
              <div className="w-px h-10 bg-gray-200" />
              <div>
                <div className="flex items-center gap-1">
                  <p className="font-serif text-2xl lg:text-3xl font-bold text-gray-900">
                    4.9
                  </p>
                  <StarIcon className="w-4 h-4 text-amber-400 fill-amber-400" />
                </div>
                <p className="text-xs text-gray-500 mt-0.5">Rating</p>
              </div>
            </div>
          </motion.div>

          {/* ========================================
              RIGHT VISUAL (7 columns on lg)
          ======================================== */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="lg:col-span-7 relative"
          >
            {/* Main Image */}
            <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-amber-50">
              <img
                src="https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=900&h=700&fit=crop"
                alt="Luxury Jewellery"
                className="w-full h-[280px] sm:h-[380px] lg:h-[500px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
            </div>

            {/* Floating Card 1 — AI Curated (top-left) */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute top-4 lg:top-6 -left-2 lg:-left-6 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl p-3 lg:p-4 border border-white/60"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 lg:w-11 lg:h-11 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-xl flex items-center justify-center shadow-md">
                  <SparklesIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs lg:text-sm font-bold text-gray-900">
                    AI Curated
                  </p>
                  <p className="text-[10px] lg:text-xs text-gray-500">
                    Just for you
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Floating Card 2 — Trust (bottom-right) */}
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
              className="absolute bottom-4 lg:bottom-6 -right-2 lg:-right-4 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl p-3 lg:p-4 border border-white/60"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 lg:w-11 lg:h-11 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center shadow-md">
                  <ShieldCheckIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs lg:text-sm font-bold text-gray-900">
                    100% Secure
                  </p>
                  <p className="text-[10px] lg:text-xs text-gray-500">
                    Certified pieces
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* ========================================
            BOTTOM STRIP — Trust Signals
        ======================================== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-10 lg:mt-14 grid grid-cols-2 lg:grid-cols-4 gap-4 pt-8 border-t border-gray-100"
        >
          {[
            {
              icon: TruckIcon,
              title: 'Free Shipping',
              subtitle: 'On orders above ₹1000',
            },
            {
              icon: ShieldCheckIcon,
              title: 'Secure Payments',
              subtitle: 'Razorpay protected',
            },
            {
              icon: SparklesIcon,
              title: 'AI Recommendations',
              subtitle: 'Tailored to your taste',
            },
            {
              icon: StarIcon,
              title: 'Lifetime Warranty',
              subtitle: 'On all premium pieces',
            },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <div key={i} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-amber-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs lg:text-sm font-semibold text-gray-900 truncate">
                    {item.title}
                  </p>
                  <p className="text-[10px] lg:text-xs text-gray-500 truncate">
                    {item.subtitle}
                  </p>
                </div>
              </div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;