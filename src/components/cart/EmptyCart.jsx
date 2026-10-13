import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBagIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

const EmptyCart = () => {
  return (
    <div className="min-h-[60vh] flex items-center justify-center py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-md"
      >
        <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShoppingBagIcon className="w-16 h-16 text-gray-400" />
        </div>
        
        <h2 className="text-3xl font-bold mb-3">Your Cart is Empty</h2>
        <p className="text-gray-500 mb-8">
          Looks like you haven't added any items to your cart yet. 
          Explore our collection and find your perfect piece!
        </p>
        
        <div className="space-y-3">
          <Link to="/products" className="btn-primary inline-flex items-center gap-2">
            Start Shopping
            <ArrowRightIcon className="w-5 h-5" />
          </Link>
          
          <div className="flex justify-center gap-4 text-sm text-gray-400">
            <Link to="/" className="hover:text-gold-600 transition-colors">Home</Link>
            <span>•</span>
            <Link to="/products" className="hover:text-gold-600 transition-colors">Products</Link>
            <span>•</span>
            <Link to="/ai/recommendations" className="hover:text-gold-600 transition-colors">AI Recommendations</Link>
          </div>
        </div>
        
        {/* Featured Collections */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
            Featured Collections
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <Link to="/products?category=necklaces" className="bg-gray-50 rounded-lg p-3 hover:bg-gold-50 transition-colors">
              <p className="font-medium">Necklaces</p>
              <p className="text-xs text-gray-500">Explore Now →</p>
            </Link>
            <Link to="/products?category=rings" className="bg-gray-50 rounded-lg p-3 hover:bg-gold-50 transition-colors">
              <p className="font-medium">Rings</p>
              <p className="text-xs text-gray-500">Explore Now →</p>
            </Link>
            <Link to="/products?category=earrings" className="bg-gray-50 rounded-lg p-3 hover:bg-gold-50 transition-colors">
              <p className="font-medium">Earrings</p>
              <p className="text-xs text-gray-500">Explore Now →</p>
            </Link>
            <Link to="/products?category=bracelets" className="bg-gray-50 rounded-lg p-3 hover:bg-gold-50 transition-colors">
              <p className="font-medium">Bracelets</p>
              <p className="text-xs text-gray-500">Explore Now →</p>
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default EmptyCart;