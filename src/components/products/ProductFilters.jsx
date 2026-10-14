import { useState } from 'react';
import { PlusIcon, MinusIcon } from '@heroicons/react/24/outline';

const ProductFilters = ({
  filters,
  categories,
  onFilterChange,
  onClearFilters,
}) => {
  const [openSections, setOpenSections] = useState({
    category: true,
    price: true,
    material: true,
    gemstone: true,
  });

  const materials = [
    'Gold',
    'Silver',
    'Platinum',
    'Rose Gold',
    'White Gold',
    'Brass',
  ];
  const gemstones = [
    'Diamond',
    'Ruby',
    'Sapphire',
    'Emerald',
    'Cubic Zirconia',
    'Pearl',
  ];

  const toggleSection = (section) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Count active filters
  const activeCount =
    ['category', 'material', 'gemstone'].filter((k) => filters[k]).length +
    (filters.min_price || filters.max_price ? 1 : 0);

  return (
    <div className="text-ink-800">
      {/* ==========================================
          HEADER (desktop only)
      ========================================== */}
      <div className="hidden lg:flex items-baseline justify-between pb-5 border-b border-line mb-2">
        <div className="flex items-baseline gap-2">
          <h2 className="text-[11px] uppercase tracking-kicker font-semibold text-ink-800">
            Filters
          </h2>
          {activeCount > 0 && (
            <span className="text-[11px] text-burgundy-500 font-medium">
              · {activeCount}
            </span>
          )}
        </div>

        {activeCount > 0 && (
          <button
            onClick={onClearFilters}
            className="text-[11px] uppercase tracking-wider font-medium text-ink-500 hover:text-burgundy-500 transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {/* ==========================================
          SECTIONS
      ========================================== */}
      <div className="divide-y divide-line">
        {/* CATEGORY */}
        <FilterSection
          title="Category"
          open={openSections.category}
          onToggle={() => toggleSection('category')}
          count={filters.category ? 1 : 0}
        >
          <RadioRow
            label="All"
            checked={!filters.category}
            onChange={() => onFilterChange({ category: '' })}
          />
          {categories.map((cat) => (
            <RadioRow
              key={cat.id}
              label={cat.name}
              checked={filters.category === cat.id}
              onChange={() => onFilterChange({ category: cat.id })}
            />
          ))}
        </FilterSection>

        {/* PRICE */}
        <FilterSection
          title="Price"
          open={openSections.price}
          onToggle={() => toggleSection('price')}
          count={filters.min_price || filters.max_price ? 1 : 0}
        >
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-ink-400 mb-1.5">
                Min
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-ink-400">
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
                  className="w-full pl-7 pr-2 py-2 text-sm bg-cream-100 border border-line rounded outline-none focus:border-ink-800 transition-colors"
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-ink-400 mb-1.5">
                Max
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-ink-400">
                  ₹
                </span>
                <input
                  type="number"
                  min="0"
                  value={filters.max_price}
                  onChange={(e) =>
                    onFilterChange({ max_price: e.target.value })
                  }
                  placeholder="Any"
                  className="w-full pl-7 pr-2 py-2 text-sm bg-cream-100 border border-line rounded outline-none focus:border-ink-800 transition-colors"
                />
              </div>
            </div>
          </div>
        </FilterSection>

        {/* MATERIAL */}
        <FilterSection
          title="Material"
          open={openSections.material}
          onToggle={() => toggleSection('material')}
          count={filters.material ? 1 : 0}
        >
          <RadioRow
            label="All"
            checked={!filters.material}
            onChange={() => onFilterChange({ material: '' })}
          />
          {materials.map((mat) => (
            <RadioRow
              key={mat}
              label={mat}
              checked={filters.material === mat}
              onChange={() => onFilterChange({ material: mat })}
            />
          ))}
        </FilterSection>

        {/* GEMSTONE */}
        <FilterSection
          title="Gemstone"
          open={openSections.gemstone}
          onToggle={() => toggleSection('gemstone')}
          count={filters.gemstone ? 1 : 0}
        >
          <RadioRow
            label="All"
            checked={!filters.gemstone}
            onChange={() => onFilterChange({ gemstone: '' })}
          />
          {gemstones.map((gem) => (
            <RadioRow
              key={gem}
              label={gem}
              checked={filters.gemstone === gem}
              onChange={() => onFilterChange({ gemstone: gem })}
            />
          ))}
        </FilterSection>
      </div>

      {/* ==========================================
          CLEAR ALL (desktop only)
      ========================================== */}
      {activeCount > 0 && (
        <div className="hidden lg:block pt-5 mt-2 border-t border-line">
          <button
            onClick={onClearFilters}
            className="w-full py-2.5 text-[11px] uppercase tracking-wider font-semibold text-ink-800 border border-ink-800 rounded hover:bg-ink-800 hover:text-cream-100 transition-colors"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
};

// ==========================================
// FILTER SECTION (collapsible)
// ==========================================
const FilterSection = ({ title, open, onToggle, count, children }) => (
  <div className="py-5">
    <button
      onClick={onToggle}
      className="flex items-center justify-between w-full text-left group"
    >
      <div className="flex items-center gap-2">
        <span className="text-[11px] uppercase tracking-kicker font-semibold text-ink-800 group-hover:text-burgundy-500 transition-colors">
          {title}
        </span>
        {count > 0 && (
          <span className="text-[10px] text-burgundy-500 font-medium">
            ({count})
          </span>
        )}
      </div>
      {open ? (
        <MinusIcon className="w-3.5 h-3.5 text-ink-500" />
      ) : (
        <PlusIcon className="w-3.5 h-3.5 text-ink-500" />
      )}
    </button>

    {open && <div className="mt-4 space-y-2.5">{children}</div>}
  </div>
);

// ==========================================
// RADIO ROW
// ==========================================
const RadioRow = ({ label, checked, onChange }) => (
  <label className="flex items-center gap-2.5 cursor-pointer group py-0.5">
    <span
      className={`
        relative flex-shrink-0 w-3.5 h-3.5 rounded-full border transition-colors
        ${
          checked
            ? 'border-burgundy-500 bg-burgundy-500'
            : 'border-ink-300 group-hover:border-ink-800'
        }
      `}
    >
      {checked && (
        <span className="absolute inset-0 m-auto w-1.5 h-1.5 rounded-full bg-cream-100" />
      )}
    </span>
    <span
      className={`text-sm transition-colors ${
        checked
          ? 'text-ink-800 font-medium'
          : 'text-ink-600 group-hover:text-ink-800'
      }`}
    >
      {label}
    </span>
    <input
      type="radio"
      checked={checked}
      onChange={onChange}
      className="sr-only"
    />
  </label>
);

export default ProductFilters;