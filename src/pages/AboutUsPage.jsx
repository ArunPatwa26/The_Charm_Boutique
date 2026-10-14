import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HeartIcon,
  SparklesIcon,
  ShieldCheckIcon,
  StarIcon,
  ArrowRightIcon,
  ArrowUpRightIcon,
} from '@heroicons/react/24/outline';
import { FaInstagram } from 'react-icons/fa';

const AboutUsPage = () => {
  const values = [
    {
      icon: SparklesIcon,
      title: 'Handpicked',
      description:
        'Every piece is personally selected and quality-checked before it reaches you.',
    },
    {
      icon: HeartIcon,
      title: 'Made with Care',
      description:
        'Jewellery is more than an accessory. It holds memories, moments, and meaning.',
    },
    {
      icon: ShieldCheckIcon,
      title: 'Honest Pricing',
      description:
        'Fair prices, no hidden charges, certified materials, always.',
    },
    {
      icon: StarIcon,
      title: 'Timeless Design',
      description:
        'Curated styles that stay beautiful for years, not seasons.',
    },
  ];

  const stats = [
    { label: 'Happy Customers', value: '1,000+' },
    { label: 'Designs', value: '200+' },
    { label: 'Cities Served', value: '50+' },
    { label: 'Average Rating', value: '4.9' },
  ];

  return (
    <div className="bg-cream-100 overflow-x-hidden">
      {/* ==========================================
          HERO — Editorial
      ========================================== */}
      <section className="container-editorial pt-10 md:pt-16 pb-12 md:pb-20">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-5 space-y-5"
          >
            <p className="kicker">Our Story</p>

            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-ink-800 leading-[1.05]">
              Small boutique.
              <br />
              <span className="italic">Big heart.</span>
            </h1>

            <p className="text-sm md:text-base text-ink-600 leading-relaxed max-w-md">
              The Charm Boutique is a family-run jewellery studio in Mumbai.
              We handpick every piece ourselves — from delicate everyday
              accents to statement pieces for the moments that matter.
            </p>

            <div className="pt-2">
              <Link
                to="/products"
                className="inline-flex items-center gap-2 text-sm font-medium text-ink-800 hover:text-burgundy-500 transition-colors border-b border-ink-800 hover:border-burgundy-500 pb-1"
              >
                Shop the collection
                <ArrowRightIcon className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>

          {/* Image */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="lg:col-span-7"
          >
            <div className="aspect-[4/3] md:aspect-[16/10] overflow-hidden rounded-lg bg-cream-200">
              <img
                src="https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=1200&h=800&fit=crop&q=80"
                alt="The Charm Boutique"
                className="w-full h-full object-cover"
                loading="eager"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ==========================================
          STATS STRIP
      ========================================== */}
      <section className="border-y border-line bg-cream-100">
        <div className="container-editorial">
          <div className="py-8 md:py-10 grid grid-cols-2 md:grid-cols-4 divide-x divide-line">
            {stats.map((stat, i) => (
              <div
                key={i}
                className="px-4 md:px-6 text-center first:pl-0 last:pr-0"
              >
                <p className="font-serif text-2xl md:text-3xl font-bold text-ink-800">
                  {stat.value}
                </p>
                <p className="text-[11px] md:text-xs uppercase tracking-wider text-ink-500 font-medium mt-1.5">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==========================================
          THE STORY — Two-column editorial
      ========================================== */}
      <section className="container-editorial py-14 md:py-20">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-16 items-center">
          {/* Image — LEFT on desktop */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="lg:col-span-6 order-2 lg:order-1"
          >
            <div className="aspect-[4/5] overflow-hidden rounded-lg bg-cream-200">
              <img
                src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=900&h=1100&fit=crop&q=80"
                alt="Craftsmanship"
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          </motion.div>

          {/* Text — RIGHT */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            className="lg:col-span-6 order-1 lg:order-2 max-w-lg"
          >
            <p className="kicker mb-4">The Beginning</p>

            <h2 className="font-serif text-3xl md:text-4xl font-bold text-ink-800 leading-tight mb-6">
              It started with a
              <br />
              <span className="italic">simple idea.</span>
            </h2>

            <div className="space-y-4 text-sm md:text-base text-ink-600 leading-relaxed">
              <p>
                Finding beautiful jewellery shouldn't be complicated or
                overpriced. So we built a place where every piece feels
                special — whether it's a gift for someone you love, or a
                little treat for yourself.
              </p>
              <p>
                We work directly with artisans and verified suppliers, which
                means better quality and honest prices. No middlemen. No
                inflated markups. Just beautiful jewellery that lasts.
              </p>
              <p>
                Today, we serve customers across India with fast shipping,
                secure payments, and a personal touch that big brands just
                can't match.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ==========================================
          VALUES
      ========================================== */}
      <section className="border-t border-line bg-cream-100 py-14 md:py-20">
        <div className="container-editorial">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mb-10 md:mb-14"
          >
            <p className="kicker mb-3">What We Stand For</p>
            <h2 className="section-heading">
              Values, not <span className="italic">marketing.</span>
            </h2>
          </motion.div>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10">
            {values.map((value, i) => {
              const Icon = value.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.08, 0.4) }}
                  viewport={{ once: true }}
                >
                  <div className="w-9 h-9 mb-5 flex items-center justify-center rounded-full bg-ink-800 text-cream-100">
                    <Icon className="w-4 h-4" />
                  </div>
                  <h3 className="font-serif text-lg md:text-xl font-bold text-ink-800 mb-2">
                    {value.title}
                  </h3>
                  <p className="text-sm text-ink-600 leading-relaxed">
                    {value.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ==========================================
          QUOTE / MISSION BANNER
      ========================================== */}
      <section className="bg-ink-800 py-14 md:py-20">
        <div className="container-editorial max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <p className="text-[11px] uppercase tracking-kicker font-semibold text-burgundy-300 mb-6">
              Our Mission
            </p>

            <blockquote className="font-serif text-2xl md:text-3xl lg:text-4xl font-bold text-cream-100 leading-tight">
              "To make beautiful jewellery
              <br />
              <span className="italic text-burgundy-300">
                accessible and personal
              </span>{' '}
              — for every moment that matters."
            </blockquote>
          </motion.div>
        </div>
      </section>

      {/* ==========================================
          INSTAGRAM CTA
      ========================================== */}
      <section className="container-editorial py-14 md:py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white border border-line rounded-lg p-8 md:p-12"
        >
          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Text */}
            <div>
              <p className="kicker mb-4">Follow Along</p>

              <h2 className="font-serif text-2xl md:text-3xl lg:text-4xl font-bold text-ink-800 leading-tight mb-4">
                See our latest drops
                <br />
                <span className="italic">on Instagram.</span>
              </h2>

              <p className="text-sm md:text-base text-ink-600 leading-relaxed mb-6 max-w-md">
                Behind-the-scenes, new arrivals, styling inspiration, and the
                stories behind each piece.
              </p>

              <a
                href="https://www.instagram.com/_the.charm.boutique_/?hl=en"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3 bg-ink-800 text-cream-100 rounded text-[11px] uppercase tracking-wider font-semibold hover:bg-burgundy-500 transition-colors"
              >
                <FaInstagram className="w-3.5 h-3.5" />
                @_the.charm.boutique_
                <ArrowUpRightIcon className="w-3 h-3" />
              </a>
            </div>

            {/* Decorative image grid */}
            <div className="grid grid-cols-2 gap-3">
              {[
                'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400&h=400&fit=crop',
                'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&h=400&fit=crop',
                'https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=400&h=400&fit=crop',
                'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=400&fit=crop',
              ].map((src, i) => (
                <div
                  key={i}
                  className="aspect-square overflow-hidden rounded bg-cream-200"
                >
                  <img
                    src={src}
                    alt="Instagram preview"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* ==========================================
          BOTTOM CTA
      ========================================== */}
      <section className="border-t border-line bg-cream-100 py-14 md:py-20">
        <div className="container-editorial text-center max-w-xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="kicker mb-4">Ready to Shop?</p>

            <h2 className="font-serif text-3xl md:text-4xl font-bold text-ink-800 leading-tight mb-4">
              Find your perfect
              <br />
              <span className="italic">piece.</span>
            </h2>

            <p className="text-sm md:text-base text-ink-600 mb-8">
              Browse our collection or reach out — we'd love to help you find
              something special.
            </p>

            <div className="flex flex-wrap gap-3 justify-center">
              <Link to="/products" className="btn-solid">
                Shop Collection
                <ArrowRightIcon className="w-3.5 h-3.5" />
              </Link>
              <Link to="/categories" className="btn-outline">
                Browse Categories
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default AboutUsPage;