import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MinusIcon,
  PlusIcon,
  XMarkIcon,
  ArrowRightIcon,
  ShoppingBagIcon,
  TruckIcon,
  ShieldCheckIcon,
  TagIcon,
} from '@heroicons/react/24/outline';

import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const CartPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    items = [],
    loading,
    updateQuantity,
    removeFromCart,
    clearCart,
    subtotal = 0,
  } = useCart();

  const [updatingId, setUpdatingId] = useState(null);
  const [removingId, setRemovingId] = useState(null);

  // ==========================================
  // CALCULATE TOTALS
  // ==========================================
  const tax = subtotal * 0.1;
  const shipping = subtotal > 1000 ? 0 : 50;
  const total = subtotal + tax + shipping;
  const freeShippingGap = Math.max(0, 1000 - subtotal);

  // ==========================================
  // HANDLERS
  // ==========================================
  const handleQuantityUpdate = async (productId, newQty) => {
    if (newQty < 1) return;
    setUpdatingId(productId);
    try {
      await updateQuantity(productId, newQty);
    } catch (err) {
      toast.error(err?.message || 'Failed to update quantity');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRemove = async (productId) => {
    setRemovingId(productId);
    try {
      await removeFromCart(productId);
      toast.success('Removed from cart');
    } catch (err) {
      toast.error(err?.message || 'Failed to remove item');
    } finally {
      setRemovingId(null);
    }
  };

  const handleCheckout = () => {
    if (!user) {
      toast.error('Please log in to checkout');
      navigate('/login', { state: { from: { pathname: '/checkout' } } });
      return;
    }
    navigate('/checkout');
  };

  // ==========================================
  // LOADING
  // ==========================================
  if (loading && items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream-100">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // ==========================================
  // EMPTY STATE
  // ==========================================
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-cream-100 flex items-center justify-center px-4 py-16">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center rounded-full bg-cream-200">
            <ShoppingBagIcon className="w-10 h-10 text-ink-400" />
          </div>
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-ink-800 mb-3">
            Your bag is empty.
          </h1>
          <p className="text-sm md:text-base text-ink-500 mb-8">
            Discover our collection and add pieces you love.
          </p>
          <Link to="/products" className="btn-solid">
            Shop Collection
            <ArrowRightIcon className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-100 pb-24 lg:pb-8">
      {/* ==========================================
          PAGE HEADER
      ========================================== */}
      <section className="border-b border-line bg-cream-100">
        <div className="container-editorial py-8 md:py-12">
          <p className="kicker mb-3">Shopping Bag</p>
          <h1 className="section-heading">
            Your <span className="italic">bag.</span>
          </h1>
          <p className="mt-3 text-sm text-ink-600">
            {items.length} {items.length === 1 ? 'piece' : 'pieces'} in your bag
          </p>
        </div>
      </section>

      {/* ==========================================
          MAIN — Items + Summary
      ========================================== */}
      <section className="container-editorial py-8 md:py-12">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12">
          {/* ==========================================
              ITEMS LIST (spans 7 on lg)
          ========================================== */}
          <div className="lg:col-span-7">
            {/* Free shipping progress bar */}
            {freeShippingGap > 0 && (
              <div className="mb-6 pb-6 border-b border-line">
                <p className="text-xs text-ink-600 mb-3">
                  Add{' '}
                  <span className="font-semibold text-ink-800">
                    ₹{freeShippingGap.toLocaleString('en-IN')}
                  </span>{' '}
                  more for free shipping
                </p>
                <div className="h-1 bg-cream-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-ink-800 transition-all duration-500"
                    style={{
                      width: `${Math.min((subtotal / 1000) * 100, 100)}%`,
                    }}
                  />
                </div>
              </div>
            )}

            {/* Items — cards on mobile, rows on desktop */}
            <div className="divide-y divide-line border-y border-line">
              <AnimatePresence initial={false}>
                {items.map((item) => (
                  <motion.div
                    key={item.product_id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="py-5 md:py-6"
                  >
                    <div className="flex gap-4 md:gap-6">
                      {/* Product image */}
                      <Link
                        to={`/products/${item.product_id}`}
                        className="flex-shrink-0 w-24 h-28 md:w-28 md:h-32 overflow-hidden rounded bg-cream-200"
                      >
                        <img
                          src={item.image || 'https://via.placeholder.com/150'}
                          alt={item.name}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/150';
                          }}
                        />
                      </Link>

                      {/* Details */}
                      <div className="flex-1 min-w-0 flex flex-col">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="min-w-0">
                            <Link
                              to={`/products/${item.product_id}`}
                              className="text-sm md:text-[15px] font-medium text-ink-800 hover:text-burgundy-500 transition-colors line-clamp-2"
                            >
                              {item.name}
                            </Link>
                            {item.category_name && (
                              <p className="text-[11px] uppercase tracking-wider text-ink-500 mt-1">
                                {item.category_name}
                              </p>
                            )}
                          </div>

                          {/* Remove */}
                          <button
                            onClick={() => handleRemove(item.product_id)}
                            disabled={removingId === item.product_id}
                            className="p-1.5 -mr-1.5 hover:bg-cream-200 rounded transition-colors disabled:opacity-50 flex-shrink-0"
                            aria-label="Remove"
                          >
                            <XMarkIcon className="w-4 h-4 text-ink-500" />
                          </button>
                        </div>

                        {/* Price */}
                        <div className="flex items-baseline gap-2 mb-3">
                          <span className="text-sm md:text-[15px] font-semibold text-ink-800">
                            ₹
                            {Number(item.price).toLocaleString('en-IN')}
                          </span>
                          {item.discount_price && (
                            <span className="text-xs text-ink-400 line-through">
                              ₹
                              {Number(
                                item.original_price || item.price
                              ).toLocaleString('en-IN')}
                            </span>
                          )}
                        </div>

                        {/* Quantity + line total */}
                        <div className="mt-auto flex items-center justify-between gap-3">
                          {/* Quantity */}
                          <div className="flex items-center border border-line rounded">
                            <button
                              onClick={() =>
                                handleQuantityUpdate(
                                  item.product_id,
                                  item.quantity - 1
                                )
                              }
                              disabled={
                                item.quantity <= 1 ||
                                updatingId === item.product_id
                              }
                              className="p-2 hover:bg-cream-200 transition-colors disabled:opacity-30"
                              aria-label="Decrease"
                            >
                              <MinusIcon className="w-3.5 h-3.5" />
                            </button>
                            <span className="w-8 text-center text-sm font-medium tabular-nums">
                              {updatingId === item.product_id ? '…' : item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                handleQuantityUpdate(
                                  item.product_id,
                                  item.quantity + 1
                                )
                              }
                              disabled={
                                updatingId === item.product_id ||
                                item.quantity >= (item.stock || 10)
                              }
                              className="p-2 hover:bg-cream-200 transition-colors disabled:opacity-30"
                              aria-label="Increase"
                            >
                              <PlusIcon className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Line total */}
                          <span className="text-sm font-medium text-ink-800">
                            ₹
                            {(Number(item.price) * item.quantity).toLocaleString(
                              'en-IN'
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Actions */}
            <div className="mt-6 flex items-center justify-between flex-wrap gap-3">
              <Link
                to="/products"
                className="inline-flex items-center gap-2 text-xs uppercase tracking-wider font-medium text-ink-700 hover:text-burgundy-500 transition-colors"
              >
                ← Continue Shopping
              </Link>

              <button
                onClick={() => {
                  if (window.confirm('Clear all items from cart?')) {
                    clearCart();
                  }
                }}
                className="text-xs uppercase tracking-wider font-medium text-ink-500 hover:text-burgundy-500 transition-colors"
              >
                Clear Bag
              </button>
            </div>
          </div>

          {/* ==========================================
              ORDER SUMMARY (spans 5 on lg)
          ========================================== */}
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-24 bg-white border border-line rounded-lg p-6">
              <h2 className="text-[11px] uppercase tracking-kicker font-semibold text-ink-800 mb-6 pb-4 border-b border-line">
                Order Summary
              </h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-ink-600">
                    Subtotal · {items.length}{' '}
                    {items.length === 1 ? 'item' : 'items'}
                  </span>
                  <span className="text-ink-800 font-medium">
                    ₹{subtotal.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-ink-600">Tax (10%)</span>
                  <span className="text-ink-800 font-medium">
                    ₹{tax.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-ink-600">Shipping</span>
                  <span className="text-ink-800 font-medium">
                    {shipping === 0 ? (
                      <span className="text-burgundy-500">Free</span>
                    ) : (
                      `₹${shipping}`
                    )}
                  </span>
                </div>
              </div>

              {/* Total */}
              <div className="pt-4 border-t border-line flex justify-between items-baseline mb-6">
                <span className="text-[11px] uppercase tracking-kicker font-semibold text-ink-800">
                  Total
                </span>
                <span className="font-serif text-2xl font-bold text-ink-800">
                  ₹{total.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </span>
              </div>

              {/* Checkout */}
              <button
                onClick={handleCheckout}
                className="btn-solid w-full py-4 mb-3"
              >
                Proceed to Checkout
                <ArrowRightIcon className="w-4 h-4" />
              </button>

              <p className="text-center text-[11px] text-ink-500 mb-6">
                Secure UPI payment · Verified manually within 24 hours
              </p>

              {/* Trust strip */}
              <div className="pt-6 border-t border-line space-y-3">
                <div className="flex items-center gap-3">
                  <TruckIcon className="w-4 h-4 text-ink-800 flex-shrink-0" />
                  <span className="text-xs text-ink-600">
                    Free shipping above ₹1000
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <ShieldCheckIcon className="w-4 h-4 text-ink-800 flex-shrink-0" />
                  <span className="text-xs text-ink-600">
                    Secure UPI payment
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <TagIcon className="w-4 h-4 text-ink-800 flex-shrink-0" />
                  <span className="text-xs text-ink-600">
                    Handpicked with care
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================
          MOBILE STICKY SUMMARY (at bottom)
      ========================================== */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-line">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] uppercase tracking-wider text-ink-500">
              Total
            </span>
            <span className="font-serif text-lg font-bold text-ink-800">
              ₹{total.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </span>
          </div>
          <button
            onClick={handleCheckout}
            className="btn-solid w-full py-3"
          >
            Proceed to Checkout
            <ArrowRightIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartPage;