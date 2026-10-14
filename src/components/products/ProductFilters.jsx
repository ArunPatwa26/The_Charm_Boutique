import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDownIcon,
  XMarkIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';

const ProductFilters = ({
  filters,
  categories,
  onFilterChange,
  onClearFilters,
}) => {
  const [expandedSections, setExpandedSections] = useState({
    category: true,
    price: true,
    material: true,
    gemstone: true,
  });

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const materials = ['Gold', 'Silver', 'Platinum', 'Rose Gold', 'White Gold', 'Brass'];
  const gemstones = ['Diamond', 'Ruby', 'Sapphire', 'Emerald', 'Cubic Zirconia', 'Pearl'];

  // Count active filters for the badge
  const activeCount = ['category', 'material', 'gemstone'].filter(
    (key) => filters[key]
  ).length + (filters.min_price || filters.max_price ? 1 : 0);

  return (
    <div className="bg-white lg:bg-transparent rounded-2xl lg:rounded-none">
      {/* ==========================================
          HEADER (desktop)
      ========================================== */}
      <div className="hidden lg:flex items-center justify-between mb-5 pb-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <FunnelIcon className="w-4 h-4 text-gray-700" />
          <h2 className="font-bold text-gray-900">Filters</h2>
          {activeCount > 0 && (
            <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-700 rounded-full">
              {activeCount}
            </span>
          )}
        </div>

        {activeCount > 0 && (
          <button
            onClick={onClearFilters}
            className="text-xs text-amber-600 hover:text-amber-700 font-medium underline transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      <div className="divide-y divide-gray-100">
        {/* ==========================================
            CATEGORY
        ========================================== */}
        <FilterSection
          title="Category"
          expanded={expandedSections.category}
          onToggle={() => toggleSection('category')}
          badge={filters.category ? 1 : 0}
        >
          <RadioOption
            name="category"
            value=""
            label="All Categories"
            checked={filters.category === ''}
            onChange={() => onFilterChange({ category: '' })}
          />
          {categories.map((category) => (
            <RadioOption
              key={category.id}
              name="category"
              value={category.id}
              label={category.name}
              checked={filters.category === category.id}
              onChange={() => onFilterChange({ category: category.id })}
            />
          ))}
        </FilterSection>

        {/* ==========================================
            PRICE
        ========================================== */}
        <FilterSection
          title="Price Range"
          expanded={expandedSections.price}
          onToggle={() => toggleSection('price')}
          badge={filters.min_price || filters.max_price ? 1 : 0}
        >
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[11px] text-gray-500 mb-1.5 font-medium uppercase tracking-wide">
                Min
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                  ₹
                </span>
                <input
                  type="number"
                  min="0"
                  value={filters.min_price}
                  onChange={(e) =>
                    onFilterChange({ min_price: e.target.value })
                  }
                  placeholder="0"
                  className="w-full pl-7 pr-2 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent focus:bg-white outline-none transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-[11px] text-gray-500 mb-1.5 font-medium uppercase tracking-wide">
                Max
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                  ₹
                </span>
                <input
                  type="number"
                  min="0"
                  value={filters.max_price}
                  onChange={(e) =>
                    onFilterChange({ max_price: e.target.value })
                  }
                  placeholder="100000"
                  className="w-full pl-7 pr-2 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent focus:bg-white outline-none transition-all"
                />
              </div>
            </div>
          </div>
        </FilterSection>

        {/* ==========================================
            MATERIAL
        ========================================== */}
        <FilterSection
          title="Material"
          expanded={expandedSections.material}
          onToggle={() => toggleSection('material')}
          badge={filters.material ? 1 : 0}
        >
          <RadioOption
            name="material"
            value=""
            label="All Materials"
            checked={filters.material === ''}
            onChange={() => onFilterChange({ material: '' })}
          />
          {materials.map((material) => (
            <RadioOption
              key={material}
              name="material"
              value={material}
              label={material}
              checked={filters.material === material}
              onChange={() => onFilterChange({ material })}
            />
          ))}
        </FilterSection>

        {/* ==========================================
            GEMSTONE
        ========================================== */}
        <FilterSection
          title="Gemstone"
          expanded={expandedSections.gemstone}
          onToggle={() => toggleSection('gemstone')}
          badge={filters.gemstone ? 1 : 0}
        >
          <RadioOption
            name="gemstone"
            value=""
            label="All Gemstones"
            checked={filters.gemstone === ''}
            onChange={() => onFilterChange({ gemstone: '' })}
          />
          {gemstones.map((gemstone) => (
            <RadioOption
              key={gemstone}
              name="gemstone"
              value={gemstone}
              label={gemstone}
              checked={filters.gemstone === gemstone}
              onChange={() => onFilterChange({ gemstone })}
            />
          ))}
        </FilterSection>
      </div>

      {/* ==========================================
          CLEAR ALL (desktop)
      ========================================== */}
      {activeCount > 0 && (
        <div className="hidden lg:block mt-5 pt-5 border-t border-gray-200">
          <button
            onClick={onClearFilters}
            className="w-full py-2.5 text-center text-sm text-gray-700 hover:text-amber-600 font-medium border-2 border-gray-200 rounded-xl hover:border-amber-400 transition-all"
          >
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  );
};

// ==========================================
// FILTER SECTION (collapsible)
// ==========================================
const FilterSection = ({ title, expanded, onToggle, children, badge }) => (
  <div className="py-4 first:pt-0 last:pb-0">
    <button
      onClick={onToggle}
      className="flex items-center justify-between w-full text-left group"
    >
      <div className="flex items-center gap-2">
        <h3 className="font-semibold text-sm text-gray-900 group-hover:text-amber-600 transition-colors">
          {title}
        </h3>
        {badge > 0 && (
          <span className="px-1.5 py-0.5 text-[10px] font-bold bg-amber-500 text-white rounded-full">
            {badge}
          </span>
        )}
      </div>
      <ChevronDownIcon
        className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${
          expanded ? 'rotate-180' : ''
        }`}
      />
    </button>

    <AnimatePresence initial={false}>
      {expanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="overflow-hidden"
        >
          <div className="pt-3.5 space-y-2.5">{children}</div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

// ==========================================
// RADIO OPTION (styled)
// ==========================================
const RadioOption = ({ name, value, label, checked, onChange }) => (
  <label
    className={`
      flex items-center gap-2.5 cursor-pointer group py-1 px-1 -mx-1 rounded-lg
      transition-colors
      ${checked ? 'text-amber-700 font-medium' : 'text-gray-600 hover:text-amber-600'}
    `}
  >
    <span
      className={`
        relative w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0
        transition-all
        ${
          checked
            ? 'border-amber-500 bg-amber-500'
            : 'border-gray-300 group-hover:border-amber-400'
        }
      `}
    >
      {checked && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-1.5 h-1.5 rounded-full bg-white"
        />
      )}
    </span>
    <span className="text-sm truncate">{label}</span>
    <input
      type="radio"
      name={name}
      value={value}
      checked={checked}
      onChange={onChange}
      className="sr-only"
    />
  </label>
);

export default ProductFilters;