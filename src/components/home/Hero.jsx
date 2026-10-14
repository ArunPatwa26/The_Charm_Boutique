import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRightIcon, StarIcon } from '@heroicons/react/24/outline';

const Hero = () => {
  return (
    <section className="bg-cream-100">
      <div className="container-editorial pt-8 md:pt-12 pb-10 md:pb-14">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* LEFT — Text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="lg:col-span-5 space-y-5"
          >
            <p className="kicker">New Season · Autumn 2026</p>

            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-ink-800 leading-[1.05]">
              Elegance,
              <br />
              <span className="italic">made simple.</span>
            </h1>

            <p className="text-sm md:text-base text-ink-600 leading-relaxed max-w-md">
              Handcrafted jewellery for the moments that matter — curated by
              hand, worn with love.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link to="/products" className="btn-solid group">
                Shop Collection
                <ArrowRightIcon className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link
                to="/categories"
                className="group inline-flex items-center gap-2 text-sm font-medium text-ink-800 hover:text-burgundy-500 transition-colors border-b border-ink-800 hover:border-burgundy-500 pb-0.5"
              >
                Browse Categories
                <ArrowRightIcon className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            {/* Inline trust — compact */}
            <div className="flex items-center gap-5 pt-4 border-t border-line">
              <div>
                <p className="font-serif text-lg font-bold text-ink-800">
                  1,000+
                </p>
                <p className="text-[10px] uppercase tracking-wider text-ink-500 font-medium mt-0.5">
                  Happy Customers
                </p>
              </div>
              <div className="w-px h-8 bg-line" />
              <div>
                <p className="font-serif text-lg font-bold text-ink-800">
                  200+
                </p>
                <p className="text-[10px] uppercase tracking-wider text-ink-500 font-medium mt-0.5">
                  Unique Designs
                </p>
              </div>
              <div className="w-px h-8 bg-line" />
              <div>
                <div className="flex items-center gap-1">
                  <p className="font-serif text-lg font-bold text-ink-800">
                    4.9
                  </p>
                  <StarIcon className="w-3 h-3 text-ink-800 fill-ink-800" />
                </div>
                <p className="text-[10px] uppercase tracking-wider text-ink-500 font-medium mt-0.5">
                  Rating
                </p>
              </div>
            </div>
          </motion.div>

          {/* RIGHT — Image grid (2 stacked images, editorial) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="lg:col-span-7"
          >
            <div className="grid grid-cols-3 gap-3 md:gap-4">
              {/* Large image */}
              <div className="col-span-2 aspect-[4/5] overflow-hidden rounded-lg bg-cream-200">
                <img
                  src="https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=900&h=1100&fit=crop&q=80"
                  alt="Handcrafted jewellery"
                  className="w-full h-full object-cover"
                  loading="eager"
                />
              </div>

              {/* Two small stacked images */}
              <div className="col-span-1 flex flex-col gap-3 md:gap-4">
                <div className="flex-1 overflow-hidden rounded-lg bg-cream-200">
                  <img
                    src="https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&h=600&fit=crop&q=80"
                    alt="Detail"
                    className="w-full h-full object-cover"
                    loading="eager"
                  />
                </div>
                <div className="flex-1 overflow-hidden rounded-lg bg-cream-200">
                  <img
                    src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=500&h=600&fit=crop&q=80"
                    alt="Detail"
                    className="w-full h-full object-cover"
                    loading="eager"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;