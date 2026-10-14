import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CheckCircleIcon,
  ArrowRightIcon,
  PrinterIcon,
  EnvelopeIcon,
  ShoppingBagIcon,
  TruckIcon,
  MapPinIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

import { getOrderById } from '../services/orderService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

// ==========================================
// STATUS META
// ==========================================
const STATUS_META = {
  pending: { label: 'Pending', dot: 'bg-ink-400', text: 'text-ink-600' },
  processing: { label: 'Processing', dot: 'bg-blue-500', text: 'text-blue-700' },
  shipped: { label: 'Shipped', dot: 'bg-purple-500', text: 'text-purple-700' },
  delivered: { label: 'Delivered', dot: 'bg-green-600', text: 'text-green-700' },
  cancelled: { label: 'Cancelled', dot: 'bg-red-500', text: 'text-red-700' },
};

const OrderConfirmation = () => {
  const [searchParams] = useSearchParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const orderId = searchParams.get('order_id');

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) {
        setLoading(false);
        return;
      }
      try {
        const response = await getOrderById(orderId);
        if (response.success) {
          setOrder(response.order);
        } else {
          toast.error('Order not found');
        }
      } catch {
        toast.error('Failed to load order');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  // ==========================================
  // LOADING
  // ==========================================
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream-100">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // ==========================================
  // NOT FOUND
  // ==========================================
  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-cream-100 px-4">
        <ShoppingBagIcon className="w-14 h-14 text-ink-300 mb-5" />
        <h2 className="font-serif text-2xl font-bold text-ink-800 mb-2">
          Order not found
        </h2>
        <p className="text-sm text-ink-500 mb-6 text-center max-w-sm">
          We couldn't find this order. It may have been removed or the link is
          invalid.
        </p>
        <Link to="/orders" className="btn-outline text-xs">
          Back to Orders
        </Link>
      </div>
    );
  }

  const statusMeta = STATUS_META[order.status] || STATUS_META.pending;
  const formatPrice = (v) =>
    `₹${Number(v || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
  const formatDate = (d) =>
    d
      ? new Date(d).toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })
      : 'N/A';

  return (
    <div className="min-h-screen bg-cream-100 pb-16">
      {/* ==========================================
          SUCCESS HEADER
      ========================================== */}
      <section className="border-b border-line bg-cream-100">
        <div className="container-editorial py-12 md:py-16 max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            {/* Success icon */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              className="inline-flex w-14 h-14 items-center justify-center rounded-full bg-cream-200 mb-6"
            >
              <CheckCircleIcon className="w-7 h-7 text-ink-800" />
            </motion.div>

            <p className="kicker mb-3">Order Confirmed</p>
            <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-ink-800 leading-tight mb-4">
              Thank you.
            </h1>
            <p className="text-sm md:text-base text-ink-600 max-w-lg mx-auto leading-relaxed">
              Your order has been placed successfully. A confirmation email is
              on its way to your inbox.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ==========================================
          MAIN
      ========================================== */}
      <section className="container-editorial py-8 md:py-10 max-w-3xl">
        {/* ---------- ORDER HEADER CARD ---------- */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-line rounded-lg p-6 md:p-8 mb-5"
        >
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            <div>
              <p className="text-[10px] uppercase tracking-wider font-medium text-ink-500 mb-1.5">
                Order Number
              </p>
              <p className="font-serif text-base md:text-lg font-bold text-ink-800">
                #{order.order_number}
              </p>
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-wider font-medium text-ink-500 mb-1.5">
                Order Date
              </p>
              <p className="text-sm font-medium text-ink-800">
                {formatDate(order.created_at)}
              </p>
            </div>

            <div className="col-span-2 md:col-span-1">
              <p className="text-[10px] uppercase tracking-wider font-medium text-ink-500 mb-1.5">
                Total
              </p>
              <p className="font-serif text-base md:text-lg font-bold text-ink-800">
                {formatPrice(order.total_price)}
              </p>
            </div>
          </div>

          {/* Status row */}
          <div className="mt-6 pt-6 border-t border-line flex items-center gap-3 flex-wrap">
            <span className="inline-flex items-center gap-1.5 text-xs">
              <span className={`w-1.5 h-1.5 rounded-full ${statusMeta.dot}`} />
              <span className={`font-medium ${statusMeta.text}`}>
                {statusMeta.label}
              </span>
            </span>
            <span className="text-ink-300">•</span>
            <span className="text-xs text-ink-500">
              {order.is_paid ? 'Payment received' : 'Payment pending'}
            </span>
          </div>
        </motion.div>

        {/* ---------- ITEMS ---------- */}
        <div className="bg-white border border-line rounded-lg overflow-hidden mb-5">
          <div className="px-5 md:px-6 py-4 border-b border-line flex items-center justify-between">
            <p className="text-[11px] uppercase tracking-kicker font-semibold text-ink-800">
              Items
            </p>
            <p className="text-xs text-ink-500">
              {order.items?.length || 0}{' '}
              {order.items?.length === 1 ? 'piece' : 'pieces'}
            </p>
          </div>

          <div className="divide-y divide-line">
            {(order.items || []).map((item, i) => (
              <div
                key={i}
                className="px-5 md:px-6 py-4 flex items-center gap-4"
              >
                <div className="flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded overflow-hidden bg-cream-200">
                  <img
                    src={item.image || 'https://via.placeholder.com/100'}
                    alt={item.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/100';
                    }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ink-800 line-clamp-2">
                    {item.name}
                  </p>
                  <p className="text-xs text-ink-500 mt-1">
                    {formatPrice(item.price)} × {item.quantity}
                  </p>
                </div>
                <span className="text-sm font-medium text-ink-800 flex-shrink-0">
                  {formatPrice(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ---------- PRICE + SHIPPING (2 cols) ---------- */}
        <div className="grid md:grid-cols-2 gap-5 mb-5">
          {/* Price Details */}
          <div className="bg-white border border-line rounded-lg p-5 md:p-6">
            <p className="text-[11px] uppercase tracking-kicker font-semibold text-ink-800 mb-4">
              Price Details
            </p>
            <div className="space-y-3 pb-4 border-b border-line">
              <Row label="Subtotal" value={formatPrice(order.items_price)} />
              <Row label="Tax (10%)" value={formatPrice(order.tax_price)} />
              <Row
                label="Shipping"
                value={
                  order.shipping_price === 0
                    ? 'Free'
                    : formatPrice(order.shipping_price)
                }
                isFree={order.shipping_price === 0}
              />
            </div>
            <div className="pt-4 flex justify-between items-baseline">
              <span className="text-[11px] uppercase tracking-kicker font-semibold text-ink-800">
                Total
              </span>
              <span className="font-serif text-xl md:text-2xl font-bold text-ink-800">
                {formatPrice(order.total_price)}
              </span>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white border border-line rounded-lg p-5 md:p-6">
            <div className="flex items-start gap-3 mb-4">
              <MapPinIcon className="w-4 h-4 text-ink-800 flex-shrink-0 mt-0.5" />
              <p className="text-[11px] uppercase tracking-kicker font-semibold text-ink-800">
                Shipping Address
              </p>
            </div>
            <div className="text-sm text-ink-700 leading-relaxed pl-7">
              <p className="font-medium text-ink-800">
                {order.shipping_address?.street}
              </p>
              <p>
                {order.shipping_address?.city},{' '}
                {order.shipping_address?.state}{' '}
                {order.shipping_address?.zip_code}
              </p>
              <p>{order.shipping_address?.country}</p>
            </div>
          </div>
        </div>

        {/* ---------- WHAT'S NEXT ---------- */}
        <div className="bg-white border border-line rounded-lg p-5 md:p-6 mb-5">
          <p className="text-[11px] uppercase tracking-kicker font-semibold text-ink-500 mb-5">
            What Happens Next
          </p>

          <div className="grid sm:grid-cols-3 gap-5">
            <NextStep
              icon={<ClockIcon className="w-4 h-4" />}
              title="Confirmation"
              text="Email with order details is on its way."
            />
            <NextStep
              icon={<TruckIcon className="w-4 h-4" />}
              title="Processing"
              text="We'll pack your order within 24 hours."
            />
            <NextStep
              icon={<CheckCircleIcon className="w-4 h-4" />}
              title="Delivery"
              text="Shipped within 3–5 business days."
            />
          </div>
        </div>

        {/* ---------- ACTIONS ---------- */}
        <div className="pt-2 flex flex-wrap gap-2">
          <Link to="/orders" className="btn-solid py-3 px-5">
            View All Orders
            <ArrowRightIcon className="w-3.5 h-3.5" />
          </Link>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-4 py-3 border border-line rounded text-[11px] uppercase tracking-wider font-semibold text-ink-800 hover:border-ink-800 transition-colors"
          >
            <PrinterIcon className="w-3.5 h-3.5" />
            Print
          </button>
          <button
            onClick={() => toast.success('Receipt sent')}
            className="inline-flex items-center gap-2 px-4 py-3 border border-line rounded text-[11px] uppercase tracking-wider font-semibold text-ink-800 hover:border-ink-800 transition-colors"
          >
            <EnvelopeIcon className="w-3.5 h-3.5" />
            Email Receipt
          </button>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-4 py-3 border border-line rounded text-[11px] uppercase tracking-wider font-semibold text-ink-800 hover:border-ink-800 transition-colors ml-auto"
          >
            Continue Shopping
          </Link>
        </div>

        {/* ---------- SUPPORT FOOTER ---------- */}
        <div className="mt-10 pt-6 border-t border-line text-center">
          <p className="text-xs text-ink-500">
            Need help? Contact us at{' '}
            <a
              href="mailto:thecharmboutique@gmail.com"
              className="text-burgundy-500 hover:text-burgundy-600 underline underline-offset-2 font-medium"
            >
              thecharmboutique@gmail.com
            </a>
          </p>
        </div>
      </section>
    </div>
  );
};

// ==========================================
// ROW (price breakdown)
// ==========================================
const Row = ({ label, value, isFree }) => (
  <div className="flex justify-between text-sm">
    <span className="text-ink-600">{label}</span>
    <span className="font-medium text-ink-800">
      {isFree ? <span className="text-burgundy-500">Free</span> : value}
    </span>
  </div>
);

// ==========================================
// NEXT STEP
// ==========================================
const NextStep = ({ icon, title, text }) => (
  <div className="flex items-start gap-3">
    <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-ink-800 text-cream-100">
      {icon}
    </div>
    <div className="min-w-0">
      <p className="text-sm font-semibold text-ink-800 mb-1">{title}</p>
      <p className="text-xs text-ink-600 leading-relaxed">{text}</p>
    </div>
  </div>
);

export default OrderConfirmation;