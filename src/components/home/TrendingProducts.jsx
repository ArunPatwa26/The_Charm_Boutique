import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SparklesIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import ProductCard from '../products/ProductCard';
import { getTrendingProducts } from '../../services/productService';
import LoadingSpinner from '../common/LoadingSpinner';

const TrendingProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrending();
  }, []);

  const fetchTrending = async () => {
    setLoading(true);
    try {
      const response = await getTrendingProducts();
      if (response.success) {
        setProducts(response.trending || []);
      }
    } catch (error) {
      console.error('Failed to fetch trending:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20">
        <div className="text-center">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="flex items-center justify-between mb-12"
        >
          <div>
            <div className="inline-flex items-center gap-2 bg-yellow-100 text-yellow-700 px-4 py-1.5 rounded-full mb-3">
              <SparklesIcon className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">Trending Now</span>
            </div>
            <h2 className="section-title">
              Most <span className="gradient-text">Popular</span> Pieces
            </h2>
            <p className="section-subtitle">
              Discover what everyone is loving right now
            </p>
          </div>
          <Link
            to="/products?sort_by=rating"
            className="hidden md:flex items-center gap-2 text-yellow-600 hover:text-yellow-700 font-semibold group"
          >
            View All
            <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.slice(0, 4).map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-10 md:hidden">
          <Link
            to="/products?sort_by=rating"
            className="inline-flex items-center gap-2 text-yellow-600 hover:text-yellow-700 font-semibold group"
          >
            View All Trending
            <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default TrendingProducts;