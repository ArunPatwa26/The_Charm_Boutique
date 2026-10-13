import { motion } from 'framer-motion';
import { TruckIcon, ShieldCheckIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

const CartSummary = ({ subtotal, tax, shipping, total, itemCount }) => {
  return (
    <div className="space-y-4">
      {/* Price Breakdown */}
      <div className="space-y-2">
        <div className="flex justify-between text-gray-600">
          <span>Subtotal ({itemCount} items)</span>
          <span>₹{subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>Tax (10%)</span>
          <span>₹{tax.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <div className="flex items-center gap-1">
            <span>Shipping</span>
            {shipping === 0 && (
              <span className="text-xs text-green-500 font-semibold bg-green-50 px-2 py-0.5 rounded-full">
                FREE
              </span>
            )}
          </div>
          <span>{shipping === 0 ? 'Free' : `₹${shipping.toFixed(2)}`}</span>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-4">
        <div className="flex justify-between text-xl font-bold">
          <span>Total</span>
          <span className="text-gold-600">₹{total.toFixed(2)}</span>
        </div>
      </div>

      {/* Savings Message */}
      {shipping === 0 && subtotal > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-50 border border-green-200 rounded-lg p-3 text-center"
        >
          <p className="text-sm text-green-700">
            🎉 You've saved ₹50 on shipping!
          </p>
        </motion.div>
      )}

      {subtotal < 1000 && subtotal > 0 && (
        <div className="bg-gold-50 border border-gold-200 rounded-lg p-3 text-center">
          <p className="text-sm text-gold-700">
            Add <span className="font-bold">₹{(1000 - subtotal).toFixed(2)}</span> more to get <span className="font-bold">Free Shipping</span>
          </p>
        </div>
      )}

      {/* Trust Icons */}
      <div className="flex justify-around pt-4 border-t border-gray-200">
        <div className="text-center">
          <TruckIcon className="w-5 h-5 mx-auto text-gold-500" />
          <p className="text-xs text-gray-500 mt-1">Fast Delivery</p>
        </div>
        <div className="text-center">
          <ShieldCheckIcon className="w-5 h-5 mx-auto text-gold-500" />
          <p className="text-xs text-gray-500 mt-1">Secure Payment</p>
        </div>
        <div className="text-center">
          <ArrowPathIcon className="w-5 h-5 mx-auto text-gold-500" />
          <p className="text-xs text-gray-500 mt-1">Easy Returns</p>
        </div>
      </div>
    </div>
  );
};

export default CartSummary;