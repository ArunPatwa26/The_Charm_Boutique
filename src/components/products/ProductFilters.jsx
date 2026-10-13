import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';

const ProductFilters = ({ filters, categories, onFilterChange, onClearFilters }) => {
  const [expandedSections, setExpandedSections] = useState({
    category: true,
    price: true,
    material: true,
    gemstone: true,
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const materials = ['Gold', 'Silver', 'Platinum', 'Rose Gold', 'White Gold', 'Brass'];
  const gemstones = ['Diamond', 'Ruby', 'Sapphire', 'Emerald', 'Cubic Zirconia', 'Pearl'];

  return (
    <div className="space-y-6">
      {/* Category Filter */}
      <div className="border-b border-gray-200 pb-6">
        <button
          onClick={() => toggleSection('category')}
          className="flex items-center justify-between w-full text-left"
        >
          <h3 className="font-semibold text-gray-900">Category</h3>
          {expandedSections.category ? (
            <ChevronUpIcon className="w-5 h-5" />
          ) : (
            <ChevronDownIcon className="w-5 h-5" />
          )}
        </button>
        
        <AnimatePresence>
          {expandedSections.category && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-4 space-y-2 overflow-hidden"
            >
              <label className="flex items-center gap-2 cursor-pointer hover:text-gold-600 transition-colors">
                <input
                  type="radio"
                  name="category"
                  value=""
                  checked={filters.category === ''}
                  onChange={() => onFilterChange({ category: '' })}
                  className="w-4 h-4 text-gold-500 focus:ring-gold-400"
                />
                <span>All Categories</span>
              </label>
              {categories.map((category) => (
                <label
                  key={category.id}
                  className="flex items-center gap-2 cursor-pointer hover:text-gold-600 transition-colors"
                >
                  <input
                    type="radio"
                    name="category"
                    value={category.id}
                    checked={filters.category === category.id}
                    onChange={() => onFilterChange({ category: category.id })}
                    className="w-4 h-4 text-gold-500 focus:ring-gold-400"
                  />
                  <span>{category.name}</span>
                </label>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Price Filter */}
      <div className="border-b border-gray-200 pb-6">
        <button
          onClick={() => toggleSection('price')}
          className="flex items-center justify-between w-full text-left"
        >
          <h3 className="font-semibold text-gray-900">Price Range</h3>
          {expandedSections.price ? (
            <ChevronUpIcon className="w-5 h-5" />
          ) : (
            <ChevronDownIcon className="w-5 h-5" />
          )}
        </button>
        
        <AnimatePresence>
          {expandedSections.price && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-4 space-y-3 overflow-hidden"
            >
              <div>
                <label className="text-sm text-gray-600">Min Price</label>
                <input
                  type="number"
                  min="0"
                  value={filters.min_price}
                  onChange={(e) => onFilterChange({ min_price: e.target.value })}
                  placeholder="₹0"
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-400 focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600">Max Price</label>
                <input
                  type="number"
                  min="0"
                  value={filters.max_price}
                  onChange={(e) => onFilterChange({ max_price: e.target.value })}
                  placeholder="₹100000"
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-400 focus:border-transparent outline-none"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Material Filter */}
      <div className="border-b border-gray-200 pb-6">
        <button
          onClick={() => toggleSection('material')}
          className="flex items-center justify-between w-full text-left"
        >
          <h3 className="font-semibold text-gray-900">Material</h3>
          {expandedSections.material ? (
            <ChevronUpIcon className="w-5 h-5" />
          ) : (
            <ChevronDownIcon className="w-5 h-5" />
          )}
        </button>
        
        <AnimatePresence>
          {expandedSections.material && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-4 space-y-2 overflow-hidden"
            >
              <label className="flex items-center gap-2 cursor-pointer hover:text-gold-600 transition-colors">
                <input
                  type="radio"
                  name="material"
                  value=""
                  checked={filters.material === ''}
                  onChange={() => onFilterChange({ material: '' })}
                  className="w-4 h-4 text-gold-500 focus:ring-gold-400"
                />
                <span>All Materials</span>
              </label>
              {materials.map((material) => (
                <label
                  key={material}
                  className="flex items-center gap-2 cursor-pointer hover:text-gold-600 transition-colors"
                >
                  <input
                    type="radio"
                    name="material"
                    value={material}
                    checked={filters.material === material}
                    onChange={() => onFilterChange({ material: material })}
                    className="w-4 h-4 text-gold-500 focus:ring-gold-400"
                  />
                  <span>{material}</span>
                </label>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Gemstone Filter */}
      <div className="border-b border-gray-200 pb-6">
        <button
          onClick={() => toggleSection('gemstone')}
          className="flex items-center justify-between w-full text-left"
        >
          <h3 className="font-semibold text-gray-900">Gemstone</h3>
          {expandedSections.gemstone ? (
            <ChevronUpIcon className="w-5 h-5" />
          ) : (
            <ChevronDownIcon className="w-5 h-5" />
          )}
        </button>
        
        <AnimatePresence>
          {expandedSections.gemstone && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-4 space-y-2 overflow-hidden"
            >
              <label className="flex items-center gap-2 cursor-pointer hover:text-gold-600 transition-colors">
                <input
                  type="radio"
                  name="gemstone"
                  value=""
                  checked={filters.gemstone === ''}
                  onChange={() => onFilterChange({ gemstone: '' })}
                  className="w-4 h-4 text-gold-500 focus:ring-gold-400"
                />
                <span>All Gemstones</span>
              </label>
              {gemstones.map((gemstone) => (
                <label
                  key={gemstone}
                  className="flex items-center gap-2 cursor-pointer hover:text-gold-600 transition-colors"
                >
                  <input
                    type="radio"
                    name="gemstone"
                    value={gemstone}
                    checked={filters.gemstone === gemstone}
                    onChange={() => onFilterChange({ gemstone: gemstone })}
                    className="w-4 h-4 text-gold-500 focus:ring-gold-400"
                  />
                  <span>{gemstone}</span>
                </label>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Clear Filters Button */}
      <button
        onClick={onClearFilters}
        className="w-full py-3 text-center text-gold-600 hover:text-gold-700 font-semibold border-2 border-gold-200 rounded-lg hover:border-gold-400 transition-all duration-300"
      >
        Clear All Filters
      </button>
    </div>
  );
};

export default ProductFilters;