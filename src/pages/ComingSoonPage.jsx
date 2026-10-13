import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  SparklesIcon,
  ArrowLeftIcon,
  BellIcon,
  EnvelopeIcon,
} from '@heroicons/react/24/outline';
import { useState } from 'react';
import toast from 'react-hot-toast';

const ComingSoonPage = ({
  title = 'Coming Soon',
  description = 'This page is under construction. We are working hard to bring it to you soon.',
  icon: Icon = SparklesIcon,
}) => {
  const [email, setEmail] = useState('');

  const handleNotify = (e) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Please enter your email');
      return;
    }
    toast.success('Thanks! We will notify you when this page is live.');
    setEmail('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-white to-yellow-50 px-4 py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-lg w-full text-center"
      >
        <div className="relative mx-auto mb-8 w-24 h-24">
          <div className="absolute inset-0 rounded-full bg-yellow-200 blur-xl opacity-60" />
          <div className="relative w-24 h-24 rounded-full bg-white border border-yellow-200 shadow-xl flex items-center justify-center">
            <Icon className="w-12 h-12 text-amber-500" />
          </div>
        </div>

        <p className="text-sm uppercase tracking-[0.25em] text-yellow-600 font-semibold mb-3">
          {title}
        </p>
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-4">
          We're Building Something Amazing
        </h1>
        <p className="text-gray-500 leading-relaxed mb-8">
          {description}
        </p>

        <form onSubmit={handleNotify} className="flex gap-2 max-w-sm mx-auto">
          <div className="flex-1 relative">
            <EnvelopeIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-full focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none text-sm"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-full font-semibold hover:from-amber-600 hover:to-yellow-600 transition-all shadow-md text-sm whitespace-nowrap flex items-center gap-2"
          >
            <BellIcon className="w-4 h-4" />
            Notify Me
          </button>
        </form>

        <Link
          to="/"
          className="inline-flex items-center gap-2 mt-8 text-sm font-medium text-amber-600 hover:text-amber-700 transition-colors"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Back to Home
        </Link>
      </motion.div>
    </div>
  );
};

export default ComingSoonPage;