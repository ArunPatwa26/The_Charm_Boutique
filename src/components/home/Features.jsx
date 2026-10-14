import { motion } from 'framer-motion';
import {
  SparklesIcon,
  CameraIcon,
  ShoppingBagIcon,
  TruckIcon,
  ShieldCheckIcon,
  HeartIcon,
} from '@heroicons/react/24/outline';

const features = [
  {
    icon: SparklesIcon,
    title: 'Handpicked with Care',
    description:
      'Every piece is personally selected and quality-checked before it reaches you.',
    gradient: 'linear-gradient(135deg, #e8b4a0 0%, #d99b82 100%)',
  },
  {
    icon: HeartIcon,
    title: 'Made with Love',
    description:
      'Jewellery is more than an accessory — it is a feeling, a memory, a moment.',
    gradient: 'linear-gradient(135deg, #f5ceb9 0%, #e8b4a0 100%)',
  },
  {
    icon: ShieldCheckIcon,
    title: 'Trust & Transparency',
    description:
      'Fair pricing, certified materials, and honest service. Always.',
    gradient: 'linear-gradient(135deg, #86b894 0%, #5a9367 100%)',
  },
  {
    icon: TruckIcon,
    title: 'Fast Delivery',
    description:
      'Get your orders delivered within 3-5 business days with tracking.',
    gradient: 'linear-gradient(135deg, #d99b82 0%, #a35f47 100%)',
  },
  {
    icon: ShoppingBagIcon,
    title: 'Curated Collections',
    description:
      'Handpicked premium jewellery pieces for every occasion and every mood.',
    gradient: 'linear-gradient(135deg, #b57fa5 0%, #9c5a87 100%)',
  },
  {
    icon: CameraIcon,
    title: 'Real Photos, Real Products',
    description:
      'What you see is what you get — every piece photographed as-is.',
    gradient: 'linear-gradient(135deg, #7d6676 0%, #5d3352 100%)',
  },
];

const Features = () => {
  return (
    <section
      className="py-14 md:py-20 relative overflow-hidden"
      style={{
        background:
          'linear-gradient(180deg, #fdf6f0 0%, #fffbf5 100%)',
      }}
    >
      {/* Decorative background */}
      <div className="absolute top-0 right-0 w-72 md:w-96 h-72 md:h-96 rounded-full blur-3xl opacity-30 pointer-events-none"
           style={{ backgroundColor: '#f5ceb9' }} />
      <div className="absolute bottom-0 left-0 w-72 md:w-96 h-72 md:h-96 rounded-full blur-3xl opacity-20 pointer-events-none"
           style={{ backgroundColor: '#e5ccdd' }} />

      <div className="container-custom relative z-10">
        {/* ================================
            SECTION HEADER
        ================================ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-10 md:mb-14 max-w-2xl mx-auto"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-rose-200 bg-white/80 backdrop-blur-sm shadow-sm mb-4">
            <SparklesIcon className="w-3.5 h-3.5" style={{ color: '#d99b82' }} />
            <span
              className="text-[10px] md:text-xs font-semibold tracking-wider uppercase"
              style={{ color: '#a35f47' }}
            >
              Why Choose Us
            </span>
          </div>

          {/* Heading */}
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-plum-900 leading-tight">
            Crafted for{' '}
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
              You
            </span>
          </h2>

          {/* Subtitle */}
          <p className="text-sm md:text-base text-plum-600 mt-3 md:mt-4 max-w-xl mx-auto leading-relaxed">
            Discover why customers trust The Charm Boutique for their jewellery
            needs.
          </p>
        </motion.div>

        {/* ================================
            FEATURES GRID — 2 cols mobile, 3 desktop
        ================================ */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: Math.min(index * 0.06, 0.3) }}
                viewport={{ once: true }}
                className="group bg-white rounded-2xl md:rounded-3xl p-4 md:p-6 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1 border border-plum-100"
              >
                {/* Icon */}
                <div
                  className="w-11 h-11 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center mb-3 md:mb-5 shadow-md group-hover:scale-105 transition-transform"
                  style={{ background: feature.gradient }}
                >
                  <Icon className="w-5 h-5 md:w-7 md:h-7 text-white" />
                </div>

                {/* Title */}
                <h3 className="font-serif text-sm md:text-lg lg:text-xl font-bold text-plum-900 mb-1.5 md:mb-2 leading-tight">
                  {feature.title}
                </h3>

                {/* Description — smaller on mobile */}
                <p className="text-xs md:text-sm text-plum-600 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;