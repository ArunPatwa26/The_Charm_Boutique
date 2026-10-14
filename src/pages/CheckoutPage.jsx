import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  TruckIcon,
  ShieldCheckIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  QrCodeIcon,
  LockClosedIcon,
} from '@heroicons/react/24/outline';

import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { createOrder } from '../services/orderService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

// ==========================================
// VALIDATION
// ==========================================
const checkoutSchema = yup.object().shape({
  street: yup.string().required('Street address is required'),
  city: yup.string().required('City is required'),
  state: yup.string().required('State is required'),
  zip_code: yup
    .string()
    .required('ZIP code is required')
    .matches(/^\d{5,6}$/, 'Invalid ZIP code'),
  country: yup.string().required('Country is required'),
  payment_method: yup.string().required('Please select a payment method'),
});

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { items, subtotal, clearCart, loading: cartLoading } = useCart();
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);

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

  // ==========================================
  // PRE-FILL FROM USER ADDRESS
  // ==========================================
  useEffect(() => {
    if (user?.address) {
      setValue('street', user.address.street || '');
      setValue('city', user.address.city || '');
      setValue('state', user.address.state || '');
      setValue('zip_code', user.address.zip_code || '');
      setValue('country', user.address.country || 'India');
    }
  }, [user, setValue]);

  // ==========================================
  // REDIRECT IF CART EMPTY
  // ==========================================
  useEffect(() => {
    if (!cartLoading && items.length === 0) {
      navigate('/cart');
    }
  }, [items, cartLoading, navigate]);

  // ==========================================
  // TOTALS
  // ==========================================
  const tax = subtotal * 0.1;
  const shipping = subtotal > 1000 ? 0 : 50;
  const total = subtotal + tax + shipping;

  // ==========================================
  // SUBMIT
  // ==========================================
  const onSubmit = async (data) => {
    setIsProcessing(true);

    try {
      const orderData = {
        shipping_address: {
          street: data.street,
          city: data.city,
          state: data.state,
          zip_code: data.zip_code,
          country: data.country,
        },
        payment_method: 'upi',
      };

      const orderResponse = await createOrder(orderData);

      if (!orderResponse.success) {
        throw new Error(orderResponse.message || 'Failed to create order');
      }

      const order = orderResponse.order;
      const orderIdValue = order._id || order.id;

      toast.success('Order created');
      navigate(`/payment/upi/${orderIdValue}`, { state: { order } });
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error(
        error.message || error.detail || 'Failed to process order'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // ==========================================
  // LOADING
  // ==========================================
  if (cartLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream-100">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (items.length === 0) return null;

  return (
    <div className="min-h-screen bg-cream-100 pb-24 lg:pb-8">
      {/* ==========================================
          HEADER
      ========================================== */}
      <section className="border-b border-line bg-cream-100">
        <div className="container-editorial py-6 md:py-8">
          <Link
            to="/cart"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-wider font-medium text-ink-500 hover:text-burgundy-500 transition-colors mb-4"
          >
            <ArrowLeftIcon className="w-3.5 h-3.5" />
            Back to Bag
          </Link>

          <p className="kicker mb-3">Secure Checkout</p>
          <h1 className="section-heading">
            Almost <span className="italic">there.</span>
          </h1>
        </div>
      </section>

      {/* ==========================================
          FORM
      ========================================== */}
      <section className="container-editorial py-8 md:py-12">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-12">
            {/* ==========================================
                LEFT — FORM (7 cols on desktop)
            ========================================== */}
            <div className="lg:col-span-7 space-y-8">
              {/* ==========================================
                  SHIPPING ADDRESS
              ========================================== */}
              <div>
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-line">
                  <span className="w-7 h-7 rounded-full bg-ink-800 text-cream-100 flex items-center justify-center text-xs font-bold flex-shrink-0">
                    1
                  </span>
                  <div>
                    <h2 className="font-serif text-lg font-bold text-ink-800">
                      Shipping Address
                    </h2>
                    <p className="text-xs text-ink-500">
                      Where should we deliver your order?
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Field
                      label="Street Address"
                      error={errors.street?.message}
                      required
                    >
                      <input
                        {...register('street')}
                        className={`input-editorial ${
                          errors.street ? 'border-red-400' : ''
                        }`}
                        placeholder="Building, street, area"
                      />
                    </Field>
                  </div>

                  <Field label="City" error={errors.city?.message} required>
                    <input
                      {...register('city')}
                      className={`input-editorial ${
                        errors.city ? 'border-red-400' : ''
                      }`}
                      placeholder="Mumbai"
                    />
                  </Field>

                  <Field label="State" error={errors.state?.message} required>
                    <input
                      {...register('state')}
                      className={`input-editorial ${
                        errors.state ? 'border-red-400' : ''
                      }`}
                      placeholder="Maharashtra"
                    />
                  </Field>

                  <Field
                    label="ZIP Code"
                    error={errors.zip_code?.message}
                    required
                  >
                    <input
                      {...register('zip_code')}
                      className={`input-editorial ${
                        errors.zip_code ? 'border-red-400' : ''
                      }`}
                      placeholder="400001"
                    />
                  </Field>

                  <Field
                    label="Country"
                    error={errors.country?.message}
                    required
                  >
                    <input
                      {...register('country')}
                      className={`input-editorial ${
                        errors.country ? 'border-red-400' : ''
                      }`}
                      placeholder="India"
                    />
                  </Field>
                </div>
              </div>

              {/* ==========================================
                  PAYMENT METHOD — UPI only
              ========================================== */}
              <div>
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-line">
                  <span className="w-7 h-7 rounded-full bg-ink-800 text-cream-100 flex items-center justify-center text-xs font-bold flex-shrink-0">
                    2
                  </span>
                  <div>
                    <h2 className="font-serif text-lg font-bold text-ink-800">
                      Payment Method
                    </h2>
                    <p className="text-xs text-ink-500">
                      Pay securely via UPI
                    </p>
                  </div>
                </div>

                {/* UPI card — highlighted as the only option */}
                <div className="border-2 border-ink-800 bg-cream-100 rounded-lg p-5">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-ink-800 text-cream-100 flex items-center justify-center">
                      <QrCodeIcon className="w-6 h-6" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-ink-800 mb-1">
                        UPI Payment
                      </p>
                      <p className="text-xs text-ink-500 leading-relaxed">
                        Pay via GPay · PhonePe · Paytm · BHIM · any UPI app.
                        Scan QR and upload payment screenshot.
                      </p>
                    </div>
                  </div>

                  {/* How it works */}
                  <div className="mt-5 pt-5 border-t border-line">
                    <div className="flex items-start gap-3">
                      <ShieldCheckIcon className="w-4 h-4 text-ink-800 flex-shrink-0 mt-0.5" />
                      <div className="text-xs text-ink-600 leading-relaxed">
                        <p className="font-semibold text-ink-800 mb-2">
                          How UPI payment works
                        </p>
                        <ol className="space-y-1 list-decimal list-inside">
                          <li>Click "Continue to UPI" below</li>
                          <li>Scan the QR code with any UPI app</li>
                          <li>Pay the exact amount</li>
                          <li>Upload the payment screenshot</li>
                          <li>
                            We verify within 24 hours and confirm your order
                          </li>
                        </ol>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Hidden input to satisfy form validation */}
                <input
                  type="hidden"
                  value="upi"
                  {...register('payment_method')}
                />
              </div>
            </div>

            {/* ==========================================
                RIGHT — ORDER SUMMARY (5 cols on desktop)
            ========================================== */}
            <div className="lg:col-span-5">
              <div className="lg:sticky lg:top-24">
                <div className="bg-white border border-line rounded-lg p-6">
                  <h2 className="text-[11px] uppercase tracking-kicker font-semibold text-ink-800 mb-6 pb-4 border-b border-line">
                    Order Summary
                  </h2>

                  {/* Items list */}
                  <div className="space-y-4 max-h-64 overflow-y-auto pr-2 -mr-2 mb-6">
                    {items.map((item) => (
                      <div
                        key={item.product_id}
                        className="flex items-center gap-3"
                      >
                        <div className="relative flex-shrink-0 w-14 h-14 rounded bg-cream-200 overflow-hidden">
                          <img
                            src={item.image || 'https://via.placeholder.com/80'}
                            alt={item.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/80';
                            }}
                          />
                          <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 bg-ink-800 text-cream-100 text-[10px] font-bold rounded-full flex items-center justify-center">
                            {item.quantity}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-ink-800 line-clamp-2">
                            {item.name}
                          </p>
                        </div>
                        <span className="text-xs font-medium text-ink-800 flex-shrink-0">
                          ₹
                          {(item.price * item.quantity).toLocaleString(
                            'en-IN'
                          )}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Totals */}
                  <div className="space-y-2.5 pb-4 border-b border-line">
                    <Row label={`Subtotal · ${items.length} items`} value={subtotal} />
                    <Row label="Tax (10%)" value={tax} />
                    <Row
                      label="Shipping"
                      value={shipping === 0 ? 'Free' : shipping}
                      isFree={shipping === 0}
                    />
                  </div>

                  <div className="pt-4 flex justify-between items-baseline mb-6">
                    <span className="text-[11px] uppercase tracking-kicker font-semibold text-ink-800">
                      Total
                    </span>
                    <span className="font-serif text-2xl font-bold text-ink-800">
                      ₹{total.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </span>
                  </div>

                  {/* Desktop submit button */}
                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="hidden lg:flex btn-solid w-full py-4 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isProcessing ? (
                      <>
                        <LoadingSpinner size="sm" />
                        Processing…
                      </>
                    ) : (
                      <>
                        <LockClosedIcon className="w-4 h-4" />
                        Continue to UPI
                      </>
                    )}
                  </button>

                  <p className="hidden lg:flex items-center justify-center gap-1.5 text-[11px] text-ink-500 mt-3">
                    <ShieldCheckIcon className="w-3.5 h-3.5" />
                    Verified manually within 24 hours
                  </p>
                </div>

                {/* Trust strip */}
                <div className="hidden lg:block mt-4 p-4 bg-white border border-line rounded-lg space-y-2.5">
                  <TrustRow
                    icon={<TruckIcon className="w-4 h-4" />}
                    text="Free shipping above ₹1000"
                  />
                  <TrustRow
                    icon={<ShieldCheckIcon className="w-4 h-4" />}
                    text="Secure UPI payment"
                  />
                  <TrustRow
                    icon={<QrCodeIcon className="w-4 h-4" />}
                    text="Pay via any UPI app"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ==========================================
              MOBILE STICKY BOTTOM BAR
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
                type="submit"
                disabled={isProcessing}
                className="btn-solid w-full py-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <>
                    <LoadingSpinner size="sm" />
                    Processing…
                  </>
                ) : (
                  <>
                    Continue to UPI
                    <ArrowRightIcon className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </section>
    </div>
  );
};

// ==========================================
// FIELD WRAPPER
// ==========================================
const Field = ({ label, required, error, children }) => (
  <div>
    <label className="block text-[11px] uppercase tracking-wider font-medium text-ink-500 mb-2">
      {label} {required && <span className="text-burgundy-500">*</span>}
    </label>
    {children}
    {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
  </div>
);

// ==========================================
// SUMMARY ROW
// ==========================================
const Row = ({ label, value, isFree }) => (
  <div className="flex justify-between text-sm">
    <span className="text-ink-600">{label}</span>
    <span className="font-medium text-ink-800">
      {isFree ? (
        <span className="text-burgundy-500">Free</span>
      ) : typeof value === 'number' ? (
        `₹${value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
      ) : (
        value
      )}
    </span>
  </div>
);

// ==========================================
// TRUST ROW
// ==========================================
const TrustRow = ({ icon, text }) => (
  <div className="flex items-center gap-3 text-ink-600">
    <span className="text-ink-800">{icon}</span>
    <span className="text-xs">{text}</span>
  </div>
);

export default CheckoutPage;