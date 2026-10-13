import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  SparklesIcon,
  HeartIcon,
  ShieldCheckIcon,
  StarIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';
import { FaInstagram } from 'react-icons/fa';

const AboutUsPage = () => {
  const values = [
    {
      icon: SparklesIcon,
      title: 'Handpicked with Care',
      description:
        'Every piece is personally selected and quality-checked before it reaches you.',
    },
    {
      icon: HeartIcon,
      title: 'Made with Love',
      description:
        'Jewellery is more than an accessory — it is a feeling, a memory, a moment.',
    },
    {
      icon: ShieldCheckIcon,
      title: 'Trust & Transparency',
      description:
        'Fair pricing, certified materials, and honest service. Always.',
    },
    {
      icon: StarIcon,
      title: 'Timeless Designs',
      description:
        'Curated styles that never go out of fashion — for every occasion.',
    },
  ];

  const stats = [
    { label: 'Happy Customers', value: '1,000+' },
    { label: 'Unique Designs', value: '200+' },
    { label: '5-Star Reviews', value: '500+' },
    { label: 'Cities Served', value: '50+' },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* ================================
          HERO
      ================================ */}
      <section className="relative pt-32 pb-20 bg-gradient-to-br from-amber-50 via-white to-yellow-50 overflow-hidden">
        <div className="absolute top-20 -right-20 w-96 h-96 bg-yellow-200/40 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-amber-200/30 rounded-full blur-3xl" />

        <div className="container-custom relative z-10 text-center max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="inline-flex items-center gap-2 bg-yellow-100 text-yellow-700 px-4 py-2 rounded-full border border-yellow-200 mb-6">
              <SparklesIcon className="w-4 h-4" />
              <span className="text-sm font-semibold">
                About The Charm Boutique
              </span>
            </div>

            <h1 className="text-5xl md:text-6xl font-serif font-bold text-gray-900 mb-6">
              Where <span className="text-amber-500">Elegance</span> Meets
              Everyday
            </h1>

            <p className="text-lg text-gray-600 leading-relaxed">
              We are a modern jewellery boutique bringing you timeless pieces
              crafted with care. Our mission is simple — to make beautiful
              jewellery accessible, personal, and unforgettable.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ================================
          STATS
      ================================ */}
      <section className="py-14 bg-gray-900">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <p className="text-3xl md:text-4xl font-bold text-amber-400">
                  {stat.value}
                </p>
                <p className="text-sm text-gray-400 mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ================================
          OUR STORY
      ================================ */}
      <section className="py-20">
        <div className="container-custom grid lg:grid-cols-2 gap-14 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <img
              src="https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=800&h=800&fit=crop"
              alt="Our Story"
              className="rounded-3xl shadow-2xl"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-serif font-bold text-gray-900 mb-6">
              Our Story
            </h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>
                The Charm Boutique began with a simple idea — that beautiful
                jewellery shouldn't be complicated or overpriced. We wanted to
                create a place where every piece feels special, whether it's a
                gift for someone you love or a little treat for yourself.
              </p>
              <p>
                Each item in our collection is handpicked for its craftsmanship,
                quality, and timeless appeal. From delicate everyday wear to
                statement pieces for special occasions, we've got something for
                every moment that matters.
              </p>
              <p>
                We are proud to serve customers across India with fast shipping,
                secure payments, and a personal touch that big brands just can't
                match.
              </p>
            </div>

            <Link
              to="/products"
              className="inline-flex items-center gap-2 mt-8 px-6 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-full font-semibold hover:from-amber-600 hover:to-yellow-600 transition-all shadow-md"
            >
              Explore Our Collection
              <ArrowRightIcon className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ================================
          VALUES
      ================================ */}
      <section className="py-20 bg-gray-50">
        <div className="container-custom">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-serif font-bold text-gray-900 mb-3">
              What We Stand For
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Our values shape every piece we create and every interaction we
              have with you.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, i) => {
              const Icon = value.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-shadow"
                >
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">
                    {value.title}
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {value.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================================
          CONNECT
      ================================ */}
      <section className="py-20 bg-white">
        <div className="container-custom max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-100 to-purple-100 text-pink-700 px-4 py-2 rounded-full border border-pink-200 mb-6">
            <FaInstagram className="w-4 h-4" />
            <span className="text-sm font-semibold">Stay Connected</span>
          </div>

          <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-4">
            Follow Us on Instagram
          </h2>
          <p className="text-gray-600 mb-8 max-w-xl mx-auto">
            See our latest collections, behind-the-scenes moments, and styling
            inspiration. Tag us in your photos to be featured!
          </p>

          <a
            href="https://www.instagram.com/_the.charm.boutique_/?hl=en"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full font-semibold hover:from-pink-600 hover:to-purple-700 transition-all shadow-lg"
          >
            <FaInstagram className="w-5 h-5" />
            @_the.charm.boutique_
          </a>
        </div>
      </section>

      {/* ================================
          CTA
      ================================ */}
      <section className="py-20 bg-gradient-to-r from-amber-500 to-yellow-500">
        <div className="container-custom text-center">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mb-4">
            Ready to Find Your Perfect Piece?
          </h2>
          <p className="text-white/90 mb-8 max-w-xl mx-auto">
            Browse our collection or reach out — we'd love to help you find
            something special.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-amber-600 rounded-full font-semibold hover:bg-gray-100 transition-all shadow-lg"
            >
              Shop Now
              <ArrowRightIcon className="w-5 h-5" />
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 border-2 border-white/40 text-white rounded-full font-semibold hover:bg-white/20 transition-all"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutUsPage;