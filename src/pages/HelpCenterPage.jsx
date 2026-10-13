import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MagnifyingGlassIcon,
  TruckIcon,
  ArrowPathIcon,
  CreditCardIcon,
  UserCircleIcon,
  ShieldCheckIcon,
  ChatBubbleLeftRightIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';

const HelpCenterPage = () => {
  const [search, setSearch] = useState('');

  const categories = [
    {
      icon: TruckIcon,
      title: 'Orders & Shipping',
      description: 'Track orders, delivery times, and shipping info',
      color: 'from-blue-400 to-blue-500',
      articles: 12,
    },
    {
      icon: ArrowPathIcon,
      title: 'Returns & Refunds',
      description: 'Learn how to return or exchange products',
      color: 'from-green-400 to-emerald-500',
      articles: 8,
    },
    {
      icon: CreditCardIcon,
      title: 'Payments & Billing',
      description: 'Payment methods, invoices, and refund timelines',
      color: 'from-purple-400 to-pink-500',
      articles: 10,
    },
    {
      icon: UserCircleIcon,
      title: 'Account & Profile',
      description: 'Manage your account, password, and preferences',
      color: 'from-amber-400 to-yellow-500',
      articles: 7,
    },
    {
      icon: ShieldCheckIcon,
      title: 'Product & Safety',
      description: 'Certification, care, and material information',
      color: 'from-red-400 to-rose-500',
      articles: 9,
    },
    {
      icon: ChatBubbleLeftRightIcon,
      title: 'Contact Support',
      description: 'Reach our team via email or phone',
      color: 'from-cyan-400 to-teal-500',
      articles: 3,
    },
  ];

  const filtered = categories.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative pt-32 pb-16 bg-gradient-to-br from-amber-50 via-white to-yellow-50">
        <div className="container-custom text-center max-w-3xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-serif font-bold text-gray-900 mb-4">
            Help <span className="gradient-text">Center</span>
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Find answers to your questions about orders, shipping, returns, and more.
          </p>

          <div className="relative max-w-xl mx-auto">
            <MagnifyingGlassIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search help articles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-14 pr-6 py-4 bg-white border border-gray-200 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all"
            />
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16">
        <div className="container-custom">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((cat, i) => {
              const Icon = cat.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    to="/contact"
                    className="block bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all"
                  >
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${cat.color} flex items-center justify-center mb-4`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-bold text-gray-900 mb-1">{cat.title}</h3>
                    <p className="text-sm text-gray-500 mb-3">{cat.description}</p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">
                        {cat.articles} articles
                      </span>
                      <ChevronRightIcon className="w-4 h-4 text-amber-500" />
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-20">
              <p className="text-gray-500">No results found for "{search}"</p>
            </div>
          )}
        </div>
      </section>

      {/* Still need help */}
      <section className="py-20 bg-gray-50">
        <div className="container-custom text-center max-w-2xl mx-auto">
          <h2 className="text-3xl font-serif font-bold text-gray-900 mb-3">
            Still Need Help?
          </h2>
          <p className="text-gray-500 mb-8">
            Our friendly support team is here to help with anything you need.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              to="/contact"
              className="px-6 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-full font-semibold hover:from-amber-600 hover:to-yellow-600 transition-all shadow-md"
            >
              Contact Support
            </Link>
            <a
              href="mailto:support@aijewellery.com"
              className="px-6 py-3 bg-white border border-gray-200 rounded-full font-semibold text-gray-700 hover:bg-gray-50 transition-all"
            >
              Email Us
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HelpCenterPage;