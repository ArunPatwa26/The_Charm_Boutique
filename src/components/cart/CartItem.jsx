import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TrashIcon, PlusIcon, MinusIcon } from '@heroicons/react/24/outline';

const CartItem = ({ item, onQuantityChange, onRemove }) => {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleQuantityChange = async (newQuantity) => {
    setIsUpdating(true);
    await onQuantityChange(item.product_id, newQuantity);
    setIsUpdating(false);
  };

  const handleRemove = async () => {
    if (window.confirm('Remove this item from cart?')) {
      await onRemove(item.product_id);
    }
  };

  return (
    <div className="p-4 border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        {/* Product Image */}
        <div className="md:w-24 md:h-24 flex-shrink-0">
          <Link to={`/products/${item.product_id}`}>
            <img
              src={item.image || 'https://via.placeholder.com/100'}
              alt={item.name}
              className="w-full h-24 object-cover rounded-lg"
            />
          </Link>
        </div>

        {/* Product Info */}
        <div className="flex-1 min-w-0">
          <Link to={`/products/${item.product_id}`}>
            <h3 className="font-semibold text-lg hover:text-gold-600 transition-colors line-clamp-1">
              {item.name}
            </h3>
          </Link>
          <p className="text-sm text-gray-500">
            ₹{item.price.toFixed(2)}
          </p>
          {item.stock <= 5 && item.stock > 0 && (
            <p className="text-xs text-orange-500">
              Only {item.stock} left in stock!
            </p>
          )}
        </div>

        {/* Quantity Controls */}
        <div className="flex items-center gap-3">
          <div className="flex items-center border-2 border-gray-200 rounded-full overflow-hidden">
            <button
              onClick={() => handleQuantityChange(item.quantity - 1)}
              disabled={isUpdating || item.quantity <= 1}
              className="px-3 py-1 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <MinusIcon className="w-4 h-4" />
            </button>
            <span className="w-10 text-center font-semibold">
              {isUpdating ? '...' : item.quantity}
            </span>
            <button
              onClick={() => handleQuantityChange(item.quantity + 1)}
              disabled={isUpdating || item.quantity >= item.stock}
              className="px-3 py-1 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <PlusIcon className="w-4 h-4" />
            </button>
          </div>
          <button
            onClick={handleRemove}
            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
            aria-label="Remove item"
          >
            <TrashIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Subtotal */}
        <div className="text-right min-w-[100px]">
          <p className="font-bold text-gold-600">
            ₹{(item.price * item.quantity).toFixed(2)}
          </p>
          {item.stock > 0 && item.quantity === item.stock && (
            <p className="text-xs text-orange-500">Max quantity</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartItem;