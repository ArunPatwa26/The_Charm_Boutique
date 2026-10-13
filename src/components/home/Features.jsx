import { motion } from 'framer-motion';
import { 
  SparklesIcon, 
  CameraIcon, 
  ShoppingBagIcon,
  TruckIcon,
  ShieldCheckIcon,
  HeartIcon 
} from '@heroicons/react/24/outline';

const features = [
  {
    icon: SparklesIcon,
    title: 'AI Recommendations',
    description: 'Get personalized jewellery suggestions based on your style and preferences.',
    color: 'from-purple-500 to-pink-500',
  },
  {
    icon: CameraIcon,
    title: 'Virtual Try-On',
    description: 'See how jewellery looks on you with our AI-powered virtual try-on feature.',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: ShoppingBagIcon,
    title: 'Curated Collection',
    description: 'Handpicked premium jewellery pieces from top designers worldwide.',
    color: 'from-gold-500 to-yellow-500',
  },
  {
    icon: TruckIcon,
    title: 'Fast Delivery',
    description: 'Get your orders delivered within 3-5 business days with tracking.',
    color: 'from-green-500 to-emerald-500',
  },
  {
    icon: ShieldCheckIcon,
    title: 'Secure Shopping',
    description: '100% secure payments with encrypted transactions and buyer protection.',
    color: 'from-red-500 to-orange-500',
  },
  {
    icon: HeartIcon,
    title: 'Love It or Return It',
    description: '30-day return policy with free shipping both ways.',
    color: 'from-pink-500 to-rose-500',
  },
];

const Features = () => {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-gold-500 font-semibold text-sm uppercase tracking-wider">
            Why Choose Us
          </span>
          <h2 className="section-title">
            Experience the <span className="gradient-text">Future</span> of Jewellery
          </h2>
          <p className="section-subtitle max-w-2xl mx-auto">
            Discover why thousands of customers trust us for their jewellery needs
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="card p-8 hover:scale-105"
            >
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6`}>
                <feature.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;