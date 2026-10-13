import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  CheckCircleIcon,
  TruckIcon,
  CreditCardIcon,
  ShieldCheckIcon,
  ArrowLeftIcon,
  LockClosedIcon,
  QrCodeIcon,
} from '@heroicons/react/24/outline';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { createOrder } from '../services/orderService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const checkoutSchema = yup.object().shape({
  street: yup.string().required('Street address is required'),
  city: yup.string().required('City is required'),
  state: yup.string().required('State is required'),
  zip_code: yup.string().required('ZIP code is required').matches(/^\d{5,6}$/, 'Invalid ZIP code'),
  country: yup.string().required('Country is required'),
  payment_method: yup.string().required('Please select a payment method'),
});

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { items, subtotal, clearCart, loading: cartLoading } = useCart();
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStep, setPaymentStep] = useState('form');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    resolver: yupResolver(checkoutSchema),
    defaultValues: {
      country: 'India',
      payment_method: 'upi',
    },
  });

  const paymentMethod = watch('payment_method');

  useEffect(() => {
    if (user?.address) {
      setValue('street', user.address.street || '');
      setValue('city', user.address.city || '');
      setValue('state', user.address.state || '');
      setValue('zip_code', user.address.zip_code || '');
      setValue('country', user.address.country || 'India');
    }
  }, [user, setValue]);

  useEffect(() => {
    if (!cartLoading && items.length === 0) {
      navigate('/cart');
    }
  }, [items, cartLoading, navigate]);

  const calculateTotals = () => {
    const tax = subtotal * 0.10;
    const shipping = subtotal > 1000 ? 0 : 50;
    const total = subtotal + tax + shipping;
    return { tax, shipping, total };
  };

  const { tax, shipping, total } = calculateTotals();

  const onSubmit = async (data) => {
    setIsProcessing(true);
    setPaymentStep('processing');

    try {
      const orderData = {
        shipping_address: {
          street: data.street,
          city: data.city,
          state: data.state,
          zip_code: data.zip_code,
          country: data.country,
        },
        payment_method: data.payment_method,
      };

      const orderResponse = await createOrder(orderData);

      if (!orderResponse.success) {
        throw new Error(orderResponse.message || 'Failed to create order');
      }

      const order = orderResponse.order;
      const orderIdValue = order._id || order.id;

      console.log('✅ Order created:', order);
      console.log('✅ Order ID:', orderIdValue);

      // ============================================================
      // UPI PAYMENT → Redirect to UPI Payment Page
      // ============================================================
      if (data.payment_method === 'upi') {
        toast.success('Order created! Complete your UPI payment.');

        // Navigate to UPI payment page — do NOT clear cart yet.
        // Cart will be cleared after payment proof submission.
        navigate(`/payment/upi/${orderIdValue}`, {
          state: { order },
        });
        return;
      }

      // ============================================================
      // CASH ON DELIVERY → Order placed, done
      // ============================================================
      setPaymentStep('success');
      toast.success('Order placed successfully!');
      await clearCart();
      navigate('/orders');
    } catch (error) {
      console.error('❌ Checkout error:', error);

      if (error.detail && error.detail.includes('temporarily unavailable')) {
        toast.error('Payment service is busy. Please try again.');
      } else {
        toast.error(error.message || error.detail || 'Failed to process order');
      }

      setPaymentStep('form');
      setIsProcessing(false);
    }
  };

  if (cartLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-custom">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate('/cart')}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold">Checkout</h1>
            <p className="text-gray-600">Complete your order</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <form onSubmit={handleSubmit(onSubmit)}>
                {/* Progress Steps */}
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        paymentStep === 'form' || paymentStep === 'processing' || paymentStep === 'success'
                          ? 'bg-gold-500 text-white'
                          : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      1
                    </div>
                    <span className="text-sm font-medium">Shipping</span>
                  </div>
                  <div className="flex-1 h-0.5 bg-gray-200 mx-2"></div>
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        paymentStep === 'processing' || paymentStep === 'success'
                          ? 'bg-gold-500 text-white'
                          : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      2
                    </div>
                    <span className="text-sm font-medium">Payment</span>
                  </div>
                  <div className="flex-1 h-0.5 bg-gray-200 mx-2"></div>
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        paymentStep === 'success'
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      3
                    </div>
                    <span className="text-sm font-medium">Confirm</span>
                  </div>
                </div>

                {/* Shipping Address */}
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <TruckIcon className="w-5 h-5 text-gold-500" />
                    Shipping Address
                  </h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Street Address
                      </label>
                      <input
                        {...register('street')}
                        className={`input-field ${errors.street ? 'border-red-500' : ''}`}
                        placeholder="123 Main St"
                      />
                      {errors.street && (
                        <p className="mt-1 text-sm text-red-500">{errors.street.message}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        City
                      </label>
                      <input
                        {...register('city')}
                        className={`input-field ${errors.city ? 'border-red-500' : ''}`}
                        placeholder="Mumbai"
                      />
                      {errors.city && (
                        <p className="mt-1 text-sm text-red-500">{errors.city.message}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        State
                      </label>
                      <input
                        {...register('state')}
                        className={`input-field ${errors.state ? 'border-red-500' : ''}`}
                        placeholder="Maharashtra"
                      />
                      {errors.state && (
                        <p className="mt-1 text-sm text-red-500">{errors.state.message}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        ZIP Code
                      </label>
                      <input
                        {...register('zip_code')}
                        className={`input-field ${errors.zip_code ? 'border-red-500' : ''}`}
                        placeholder="400001"
                      />
                      {errors.zip_code && (
                        <p className="mt-1 text-sm text-red-500">{errors.zip_code.message}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Country
                      </label>
                      <input
                        {...register('country')}
                        className={`input-field ${errors.country ? 'border-red-500' : ''}`}
                        placeholder="India"
                      />
                      {errors.country && (
                        <p className="mt-1 text-sm text-red-500">{errors.country.message}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="mt-8 pt-8 border-t border-gray-200">
                  <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
                    <CreditCardIcon className="w-5 h-5 text-gold-500" />
                    Payment Method
                  </h2>
                  <div className="space-y-3">
                    <label
                      className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                        paymentMethod === 'upi'
                          ? 'border-gold-500 bg-gold-50'
                          : 'border-gray-200 hover:border-gold-300'
                      }`}
                    >
                      <input
                        type="radio"
                        value="upi"
                        {...register('payment_method')}
                        className="w-4 h-4 text-gold-500"
                      />
                      <div className="flex-1">
                        <p className="font-semibold">Pay via UPI</p>
                        <p className="text-sm text-gray-500">
                          GPay / PhonePe / Paytm — Scan QR & upload payment screenshot
                        </p>
                      </div>
                      <QrCodeIcon className="w-8 h-8 text-gold-500" />
                    </label>

                    <label
                      className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                        paymentMethod === 'cash_on_delivery'
                          ? 'border-gold-500 bg-gold-50'
                          : 'border-gray-200 hover:border-gold-300'
                      }`}
                    >
                      <input
                        type="radio"
                        value="cash_on_delivery"
                        {...register('payment_method')}
                        className="w-4 h-4 text-gold-500"
                      />
                      <div className="flex-1">
                        <p className="font-semibold">Cash on Delivery</p>
                        <p className="text-sm text-gray-500">Pay when you receive your order</p>
                      </div>
                      <div className="text-2xl">💵</div>
                    </label>
                  </div>
                  {errors.payment_method && (
                    <p className="mt-2 text-sm text-red-500">{errors.payment_method.message}</p>
                  )}

                  {paymentMethod === 'upi' && (
                    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl flex gap-3">
                      <ShieldCheckIcon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-blue-800">
                        <p className="font-semibold mb-1">How UPI payment works:</p>
                        <ol className="list-decimal list-inside space-y-1 text-blue-700">
                          <li>Click "Place Order" below</li>
                          <li>Scan the UPI QR code shown on the next page</li>
                          <li>Pay the exact amount via any UPI app</li>
                          <li>Upload the payment screenshot</li>
                          <li>We'll verify and confirm your order</li>
                        </ol>
                      </div>
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <div className="mt-8 pt-8 border-t border-gray-200">
                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="w-full btn-primary flex items-center justify-center gap-2 py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isProcessing ? (
                      <>
                        <LoadingSpinner size="sm" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <LockClosedIcon className="w-5 h-5" />
                        {paymentMethod === 'upi'
                          ? `Continue to UPI Payment • ₹${total.toFixed(2)}`
                          : `Place Order • ₹${total.toFixed(2)}`}
                      </>
                    )}
                  </button>
                  <p className="text-xs text-gray-500 text-center mt-3 flex items-center justify-center gap-1">
                    <ShieldCheckIcon className="w-4 h-4" />
                    {paymentMethod === 'upi'
                      ? 'Payment verified manually within 24 hours'
                      : 'Your order is protected'}
                  </p>
                </div>
              </form>
            </motion.div>
          </div>

          {/* Order Summary */}
          <div className="hidden lg:block">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
              <h2 className="text-xl font-bold mb-6">Order Summary</h2>
              <div className="space-y-3 max-h-60 overflow-y-auto mb-4">
                {items.map((item) => (
                  <div key={item.product_id} className="flex items-center gap-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-12 h-12 object-cover rounded-lg flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{item.name}</p>
                      <p className="text-sm text-gray-500">x{item.quantity}</p>
                    </div>
                    <p className="font-semibold text-sm">₹{(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-200 pt-4 space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({items.length} items)</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax (10%)</span>
                  <span>₹{tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? 'Free' : `₹${shipping.toFixed(2)}`}</span>
                </div>
              </div>
              <div className="border-t border-gray-200 pt-4 mt-4">
                <div className="flex justify-between text-xl font-bold">
                  <span>Total</span>
                  <span className="text-gold-600">₹{total.toFixed(2)}</span>
                </div>
              </div>
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

export default CheckoutPage;