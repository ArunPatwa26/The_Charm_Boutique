import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  SparklesIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';

import ProductCard from '../products/ProductCard';
import { getAIRecommendations } from '../../services/productService';
import LoadingSpinner from '../common/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';

const AIRecommendations = ({ userId }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const {
    isAuthenticated,
    loading: authLoading,
    user,
  } = useAuth();

  // Use logged-in user's ID if userId prop is not provided
  const currentUserId = userId || user?.id || user?._id;

  useEffect(() => {
    // Wait until authentication check is finished
    if (authLoading) {
      return;
    }

    // User is not logged in
    // DO NOT call the protected API
    if (!isAuthenticated) {
      setRecommendations([]);
      setError(null);
      setLoading(false);
      return;
    }

    // User is logged in
    fetchRecommendations();
  }, [isAuthenticated, authLoading, currentUserId]);

  const fetchRecommendations = async () => {
    // Extra safety check
    if (!isAuthenticated) {
      setRecommendations([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await getAIRecommendations(currentUserId);

      setRecommendations(data?.recommendations || []);
    } catch (err) {
      console.error('AI Recommendations Error:', err);

      // Don't show an error for authentication-related errors
      if (
        err?.status === 401 ||
        err?.status === 403 ||
        err?.detail === 'Not authenticated' ||
        err?.detail === 'Invalid authorization code'
      ) {
        setRecommendations([]);
        setError(null);
      } else {
        setError('Failed to load recommendations');
      }
    } finally {
      setLoading(false);
    }
  };

  // Authentication is still being checked
  if (authLoading) {
    return null;
  }

  // User is logged out
  // Don't show loading/error/recommendation section
  if (!isAuthenticated) {
    return null;
  }

  // Loading recommendations
  if (loading) {
    return (
      <div className="py-20">
        <div className="text-center">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <div className="py-20">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>

          <button
            onClick={fetchRecommendations}
            className="inline-flex items-center gap-2 text-gold-600 hover:text-gold-700 font-semibold"
          >
            <ArrowPathIcon className="w-5 h-5" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // No recommendations
  if (recommendations.length === 0) {
    return null;
  }

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 via-white to-gold-50">
      <div className="container-custom">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-gold-100 text-gold-700 px-4 py-2 rounded-full mb-4">
            <SparklesIcon className="w-5 h-5" />

            <span className="text-sm font-semibold">
              AI Powered
            </span>
          </div>

          <h2 className="section-title">
            Personalized{' '}
            <span className="gradient-text">
              Recommendations
            </span>
          </h2>

          <p className="section-subtitle">
            Based on your style preferences and shopping history
          </p>
        </motion.div>

        {/* Products */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {recommendations.map((product, index) => (
            <motion.div
              key={product.id || product._id || index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.5,
                delay: index * 0.1,
              }}
              viewport={{ once: true }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>

        {/* Refresh */}
        <div className="text-center mt-12">
          <button
            onClick={fetchRecommendations}
            disabled={loading}
            className="inline-flex items-center gap-2 text-gold-600 hover:text-gold-700 font-semibold disabled:opacity-50"
          >
            <ArrowPathIcon
              className={`w-5 h-5 ${
                loading ? 'animate-spin' : ''
              }`}
            />

            {loading
              ? 'Refreshing...'
              : 'Refresh Recommendations'}
          </button>
        </div>

      </div>
    </section>
  );
};

export default AIRecommendations;