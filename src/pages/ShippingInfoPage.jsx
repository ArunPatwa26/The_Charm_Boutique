import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  TruckIcon,
  GlobeAltIcon,
  ClockIcon,
  CurrencyRupeeIcon,
  MapPinIcon,
  EnvelopeIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

const ShippingInfoPage = () => {
  const shippingOptions = [
    {
      icon: TruckIcon,
      title: 'Standard Shipping',
      time: '3–5 Business Days',
      price: 'Free on orders ₹1000+',
      priceBelow: '₹50 below ₹1000',
      description: 'Nationwide delivery across India',
    },
    {
      icon: ClockIcon,
      title: 'Express Shipping',
      time: '1–2 Business Days',
      price: '₹150',
      priceBelow: null,
      description: 'Priority handling and faster delivery',
    },
    {
      icon: MapPinIcon,
      title: 'Same-Day Delivery',
      time: 'Same Day',
      price: '₹300',
      priceBelow: 'Mumbai, Delhi, Bangalore only',
      description: 'Order before 11 AM for same-day delivery',
    },
  ];

  const zones = [
    { zone: 'Metro Cities', time: '2–3 Days', cities: 'Mumbai, Delhi, Bangalore, Chennai, Kolkata, Hyderabad' },
    { zone: 'Tier-2 Cities', time: '3–5 Days', cities: 'Pune, Ahmedabad, Jaipur, Lucknow, Chandigarh' },
    { zone: 'Tier-3 Cities', time: '5–7 Days', cities: 'All other cities and towns' },
    { zone: 'Remote Areas', time: '7–10 Days', cities: 'Northeast India, Andaman, Lakshadweep' },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative pt-32 pb-20 bg-gradient-to-br from-amber-50 via-white to-yellow-50 overflow-hidden">
        <div className="absolute top-20 -right-20 w-80 h-80 bg-yellow-200/40 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-amber-200/30 rounded-full blur-3xl" />

        <div className="container-custom relative z-10 text-center max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 bg-yellow-100 text-yellow-700 px-4 py-2 rounded-full border border-yellow-200 mb-6">
              <TruckIcon className="w-4 h-4" />
              <span className="text-sm font-semibold">Fast & Secure Delivery</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-serif font-bold text-gray-900 mb-6">
              Shipping <span className="gradient-text">Information</span>
            </h1>
            <p className="text-base md:text-lg text-gray-600 leading-relaxed">
              We deliver across India with trusted courier partners and full tracking.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Shipping Options */}
      <section className="py-20">
        <div className="container-custom">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 text-center mb-14">
            Choose Your Delivery Speed
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {shippingOptions.map((option, i) => {
              const Icon = option.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all"
                >
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center mb-5 shadow-md">
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {option.title}
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">{option.description}</p>

                  <div className="space-y-2 pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-sm">
                      <ClockIcon className="w-4 h-4 text-amber-500" />
                      <span className="font-medium text-gray-900">{option.time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CurrencyRupeeIcon className="w-4 h-4 text-amber-500" />
                      <span className="font-medium text-gray-900">{option.price}</span>
                    </div>
                    {option.priceBelow && (
                      <p className="text-xs text-gray-400 pl-6">{option.priceBelow}</p>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Delivery Zones */}
      <section className="py-20 bg-gray-50">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-3">
              Delivery Timeline by Region
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Estimated delivery times based on your location in India.
            </p>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600 uppercase tracking-wider">
                      Region
                    </th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600 uppercase tracking-wider">
                      Delivery Time
                    </th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600 uppercase tracking-wider">
                      Cities Covered
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {zones.map((zone, i) => (
                    <tr
                      key={i}
                      className="border-b border-gray-50 hover:bg-amber-50/40 transition-colors"
                    >
                      <td className="py-4 px-6 font-medium text-gray-900 text-sm">
                        {zone.zone}
                      </td>
                      <td className="py-4 px-6">
                        <span className="px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-semibold">
                          {zone.time}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-500">
                        {zone.cities}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* What You Get */}
      <section className="py-20">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-3">
              What You Get with Every Order
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: CheckCircleIcon, title: 'Order Tracking', desc: 'Real-time SMS and email updates' },
              { icon: CheckCircleIcon, title: 'Secure Packaging', desc: 'Tamper-proof and elegant packaging' },
              { icon: CheckCircleIcon, title: 'Insurance', desc: 'All orders insured against loss or damage' },
              { icon: GlobeAltIcon, title: 'Pan-India Delivery', desc: 'Reaching 25,000+ pin codes' },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="text-center p-6 bg-gray-50 rounded-2xl"
                >
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm mb-1">
                    {item.title}
                  </h3>
                  <p className="text-xs text-gray-500">{item.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl" />
        </div>
        <div className="container-custom relative z-10 text-center max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mb-4">
            Have a Question About Shipping?
          </h2>
          <p className="text-gray-300 mb-8">
            We're here to help with any questions about delivery or tracking.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/contact"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-full font-semibold hover:from-amber-600 hover:to-yellow-600 transition-all shadow-lg"
            >
              <ChatBubbleLeftRightIcon className="w-5 h-5" />
              Contact Us
            </Link>
            <Link
              to="/orders"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-full font-semibold hover:bg-white/20 transition-all"
            >
              Track My Order
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ShippingInfoPage;