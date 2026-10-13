import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingBagIcon, 
  TrashIcon, 
  PlusIcon, 
  MinusIcon,
  ArrowLeftIcon,
  CreditCardIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import EmptyCart from '../components/cart/EmptyCart';
import CartItem from '../components/cart/CartItem';
import CartSummary from '../components/cart/CartSummary';
import toast from 'react-hot-toast';

const CartPage = () => {
  const { 
    items, 
    total_items, 
    subtotal, 
    updateCartItem, 
    removeFromCart, 
    clearCart,
    loading 
  } = useCart();
  const { isAuthenticated } = useAuth();

  const handleQuantityChange = async (productId, newQuantity) => {
    if (newQuantity < 1) {
      await removeFromCart(productId);
      return;
    }
    await updateCartItem(productId, newQuantity);
  };

  const handleRemoveItem = async (productId) => {
    if (window.confirm('Are you sure you want to remove this item?')) {
      await removeFromCart(productId);
    }
  };

  const handleClearCart = async () => {
    if (window.confirm('Are you sure you want to clear your entire cart?')) {
      await clearCart();
    }
  };

  // Calculate totals
  const tax = subtotal * 0.10; // 10% tax
  const shipping = subtotal > 1000 ? 0 : 50;
  const total = subtotal + tax + shipping;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gold-500 border-t-transparent"></div>
      </div>
    );
  }

  if (items.length === 0) {
    return <EmptyCart />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-custom">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link to="/products" className="inline-flex items-center gap-2 text-gray-600 hover:text-gold-600 transition-colors">
              <ArrowLeftIcon className="w-4 h-4" />
              Continue Shopping
            </Link>
            <h1 className="text-3xl md:text-4xl font-bold mt-2">
              Your Cart
              <span className="text-gray-400 text-lg ml-2">({total_items} items)</span>
            </h1>
          </div>
          {items.length > 0 && (
            <button
              onClick={handleClearCart}
              className="text-red-500 hover:text-red-600 text-sm flex items-center gap-1 transition-colors"
            >
              <TrashIcon className="w-4 h-4" />
              Clear Cart
            </button>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="p-4 bg-gray-50 border-b hidden md:grid grid-cols-6 text-sm text-gray-500 font-medium">
                <div className="col-span-3">Product</div>
                <div className="text-center">Price</div>
                <div className="text-center">Quantity</div>
                <div className="text-right">Subtotal</div>
              </div>

              <AnimatePresence mode="wait">
                {items.map((item, index) => (
                  <motion.div
                    key={item.product_id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <CartItem
                      item={item}
                      onQuantityChange={handleQuantityChange}
                      onRemove={handleRemoveItem}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Continue Shopping */}
            <div className="mt-4">
              <Link 
                to="/products" 
                className="inline-flex items-center gap-2 text-gold-600 hover:text-gold-700 font-semibold transition-colors"
              >
                <ArrowLeftIcon className="w-4 h-4" />
                Continue Shopping
              </Link>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
              <h2 className="text-xl font-bold mb-6">Order Summary</h2>

              <CartSummary
                subtotal={subtotal}
                tax={tax}
                shipping={shipping}
                total={total}
                itemCount={total_items}
              />

              <Link to={isAuthenticated ? '/checkout' : '/login'}>
                <button
                  className="w-full btn-primary flex items-center justify-center gap-2 text-lg py-4 mt-6"
                  disabled={items.length === 0}
                >
                  <CreditCardIcon className="w-5 h-5" />
                  Proceed to Checkout
                </button>
              </Link>

              {!isAuthenticated && (
                <p className="text-xs text-gray-500 text-center mt-3">
                  You need to login to complete your purchase
                </p>
              )}

              {/* Trust Badges */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <div className="text-2xl mb-1">🔒</div>
                    <p className="text-xs text-gray-500">Secure Payment</p>
                  </div>
                  <div>
                    <div className="text-2xl mb-1">🚚</div>
                    <p className="text-xs text-gray-500">Free Shipping</p>
                  </div>
                  <div>
                    <div className="text-2xl mb-1">↩️</div>
                    <p className="text-xs text-gray-500">30-Day Returns</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;