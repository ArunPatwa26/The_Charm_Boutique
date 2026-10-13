import { motion } from 'framer-motion';
import { EnvelopeIcon, SparklesIcon } from '@heroicons/react/24/outline';

const Newsletter = () => {
  const handleSubmit = (e) => {
    e.preventDefault();
    alert('🎉 Thank you for subscribing! You\'ll receive exclusive updates.');
  };

  return (
    <section className="py-20 bg-gradient-to-r from-yellow-500 to-yellow-600 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />

      <div className="container-custom relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center text-white"
        >
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-5 py-2 rounded-full mb-6">
            <SparklesIcon className="w-5 h-5" />
            <span className="text-sm font-semibold uppercase tracking-wider">Stay Inspired</span>
          </div>

          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Join Our <span className="text-gray-900">Luxury</span> Community
          </h2>

          <p className="text-white/90 text-lg mb-8 max-w-xl mx-auto">
            Subscribe to receive exclusive offers, new collection alerts, and personalized styling tips.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <div className="flex-1 relative">
              <EnvelopeIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                required
                placeholder="Enter your email"
                className="w-full pl-12 pr-4 py-3.5 rounded-full bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-white/30"
              />
            </div>
            <button
              type="submit"
              className="px-8 py-3.5 rounded-full bg-gray-900 text-white font-semibold hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 whitespace-nowrap"
            >
              Subscribe Now
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </form>

          <p className="text-white/70 text-sm mt-4">
            ✨ No spam. Unsubscribe anytime. Join 10,000+ subscribers.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default Newsletter;