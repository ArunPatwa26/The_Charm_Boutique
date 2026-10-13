import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CheckCircleIcon,
  TruckIcon,
  ClockIcon,
  PrinterIcon,
  EnvelopeIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';
import { getOrderById } from '../services/orderService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const OrderConfirmation = () => {
  const [searchParams] = useSearchParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const orderId = searchParams.get('order_id');

  useEffect(() => {
    if (orderId) {
      fetchOrder();
    } else {
      setLoading(false);
    }
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const response = await getOrderById(orderId);
      if (response.success) {
        setOrder(response.order);
      } else {
        toast.error('Order not found');
      }
    } catch (error) {
      toast.error('Failed to load order');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Order not found</h2>
          <Link to="/" className="text-gold-600 hover:text-gold-700">
            Go back home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container-custom max-w-3xl">
        {/* Success Animation */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            type: 'spring',
            stiffness: 260,
            damping: 20,
            delay: 0.2,
          }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-24 h-24 bg-green-100 rounded-full mb-4">
            <CheckCircleIcon className="w-14 h-14 text-green-500" />
          </div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-3xl font-bold mb-2"
          >
            Order Confirmed! 🎉
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-gray-600"
          >
            Thank you for your purchase! We'll send you a confirmation email shortly.
          </motion.p>
        </motion.div>

        {/* Order Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white rounded-2xl shadow-lg overflow-hidden"
        >
          {/* Order Header */}
          <div className="bg-gradient-to-r from-gold-500 to-gold-600 text-white p-6">
            <div className="flex flex-wrap justify-between items-center gap-4">
              <div>
                <p className="text-sm opacity-80">Order Number</p>
                <p className="text-xl font-bold">#{order.order_number}</p>
              </div>
              <div>
                <p className="text-sm opacity-80">Order Date</p>
                <p className="font-semibold">
                  {new Date(order.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
              <div>
                <p className="text-sm opacity-80">Total Amount</p>
                <p className="text-xl font-bold">₹{order.total_price.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Order Status */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-2 text-sm">
              <div
                className={`flex items-center gap-2 px-3 py-1 rounded-full ${
                  order.status === 'delivered'
                    ? 'bg-green-100 text-green-700'
                    : order.status === 'shipped'
                    ? 'bg-blue-100 text-blue-700'
                    : order.status === 'processing'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {order.status === 'delivered' ? (
                  <CheckCircleIcon className="w-4 h-4" />
                ) : order.status === 'shipped' ? (
                  <TruckIcon className="w-4 h-4" />
                ) : (
                  <ClockIcon className="w-4 h-4" />
                )}
                <span className="font-medium capitalize">{order.status}</span>
              </div>
              <span className="text-gray-400">•</span>
              <span className="text-gray-500">{order.is_paid ? 'Paid' : 'Payment Pending'}</span>
            </div>
          </div>

          {/* Order Items */}
          <div className="p-6 border-b border-gray-200">
            <h3 className="font-semibold mb-4">Items</h3>
            <div className="space-y-4">
              {order.items.map((item, index) => (
                <div key={index} className="flex items-center gap-4">
                  <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-lg" />
                  <div className="flex-1">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                  </div>
                  <p className="font-semibold">₹{(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Price Breakdown */}
          <div className="p-6 border-b border-gray-200">
            <h3 className="font-semibold mb-4">Price Details</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-gray-600">
                <span>Items Total</span>
                <span>₹{order.items_price.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tax (10%)</span>
                <span>₹{order.tax_price.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>{order.shipping_price === 0 ? 'Free' : `₹${order.shipping_price.toFixed(2)}`}</span>
              </div>
              <div className="border-t border-gray-200 pt-2 mt-2">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-gold-600">₹{order.total_price.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="p-6">
            <h3 className="font-semibold mb-4">Shipping Address</h3>
            <div className="text-sm text-gray-600">
              <p>{order.shipping_address.street}</p>
              <p>
                {order.shipping_address.city}, {order.shipping_address.state}
              </p>
              <p>{order.shipping_address.zip_code}</p>
              <p>{order.shipping_address.country}</p>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="flex flex-wrap gap-4 mt-8 justify-center"
        >
          <Link to="/orders" className="btn-secondary inline-flex items-center gap-2">
            View All Orders
            <ArrowRightIcon className="w-4 h-4" />
          </Link>
          <button
            onClick={() => window.print()}
            className="px-6 py-3 border-2 border-gray-300 rounded-full hover:bg-gray-50 transition-all duration-300 flex items-center gap-2"
          >
            <PrinterIcon className="w-5 h-5" />
            Print Order
          </button>
          <button
            onClick={() => toast.success('Email sent!')}
            className="px-6 py-3 border-2 border-gray-300 rounded-full hover:bg-gray-50 transition-all duration-300 flex items-center gap-2"
          >
            <EnvelopeIcon className="w-5 h-5" />
            Email Receipt
          </button>
          <Link
            to="/"
            className="px-6 py-3 border-2 border-gray-300 rounded-full hover:bg-gray-50 transition-all duration-300"
          >
            Continue Shopping
          </Link>
        </motion.div>

        {/* Support Info */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>Need help with your order?</p>
          <p>
            Contact us at{' '}
            <a href="mailto:support@aijewellery.com" className="text-gold-600 hover:text-gold-700">
              support@aijewellery.com
            </a>{' '}
            or call +91-123-456-7890
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;