/**
 * FilterSidebar Component - Reusable filter sidebar for product pages
 * Used in SalePage, BestSellerPage, NewArrivalPage
 */

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  ChevronDown, 
  Filter, 
  ArrowUpDown, 
  Tag, 
  IndianRupee 
} from 'lucide-react';
import { Slider } from 'antd';

const PRICE_BOUNDS = { min: 200, max: 5000 };

const SORT_OPTIONS = [
  { value: 'createdAt-desc', label: 'Newest First' },
  { value: 'createdAt-asc', label: 'Oldest First' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'name-asc', label: 'Name: A to Z' },
  { value: 'name-desc', label: 'Name: Z to A' },
];

const FilterSidebar = ({
  isMobile = false,
  filters,
  updateFilters,
  clearFilters,
  categories = [],
  attributes = [],
  priceRange: externalPriceRange,
  setPriceRange: setExternalPriceRange,
  // State handlers
  categoryDropdownOpen,
  setCategoryDropdownOpen,
  attributeDropdownOpen,
  setAttributeDropdownOpen,
  attributeValueDropdownOpen,
  setAttributeValueDropdownOpen,
  categorySearchTerm,
  setCategorySearchTerm,
  attributeSearchTerm,
  setAttributeSearchTerm,
  attributeValueSearchTerm,
  setAttributeValueSearchTerm,
}) => {
  // Internal price range state
  const [testRange, setTestRange] = useState(() => {
    const [min, max] = externalPriceRange || [PRICE_BOUNDS.min, PRICE_BOUNDS.max];
    return [min, max];
  });

  // Sync testRange when external priceRange changes
  useEffect(() => {
    const [min, max] = externalPriceRange || [PRICE_BOUNDS.min, PRICE_BOUNDS.max];
    setTestRange([min, max]);
  }, [externalPriceRange]);

  // Category Dropdown Component
  const CategoryDropdown = () => {
    const filteredCategories = categories.filter(cat =>
      cat.name.toLowerCase().includes(categorySearchTerm.toLowerCase())
    );

    return (
      <div className="mb-6 relative category-dropdown-container">
        <label className="flex items-center gap-2 text-xs font-semibold text-[rgb(72,29,111)] mb-2.5 uppercase tracking-wide">
          <Tag className="w-4 h-4 text-[rgb(72,29,111)]" />
          Category
        </label>
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setCategoryDropdownOpen(!categoryDropdownOpen);
              setCategorySearchTerm('');
            }}
            className="w-full px-3 py-2.5 border border-[rgb(72,29,111)] rounded-lg focus:outline-none text-sm text-left flex items-center justify-between bg-[#faf9f5] shadow-sm hover:border-[rgb(72,29,111)] transition-colors"
          >
            <span className="truncate">
              {filters.category_id
                ? categories.find(c => c._id === filters.category_id)?.name || 'All Categories'
                : 'All Categories'}
            </span>
            <ChevronDown className={`w-4 h-4 text-[rgb(72,29,111)] transition-transform ${categoryDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {categoryDropdownOpen && (
            <div className="absolute z-50 w-full mt-2 bg-[#faf9f5] border border-[rgb(72,29,111)] rounded-lg shadow-xl overflow-hidden">
              <div className="p-3 border-b border-gray-200 bg-gray-50">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search categories..."
                    value={categorySearchTerm}
                    onChange={(e) => setCategorySearchTerm(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 text-sm border border-[rgb(72,29,111)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(72,29,111)] focus:border-[rgb(72,29,111)] bg-[#faf9f5]"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </div>
              <div className="max-h-[210px] overflow-y-auto">
                <button
                  type="button"
                  onClick={() => {
                    updateFilters({ category_id: '', attribute_id: '', attribute_value_id: '' });
                    setCategoryDropdownOpen(false);
                    setCategorySearchTerm('');
                  }}
                  className={`w-full px-4 py-2.5 text-left text-sm hover:bg-[rgb(72,29,111)] transition-colors ${
                    !filters.category_id 
                      ? 'bg-[rgb(72,29,111)] text-[#faf9f5] font-semibold' 
                      : 'text-[rgb(72,29,111)] hover:text-[rgb(72,29,111)]'
                  }`}
                >
                  All Categories
                </button>
                {filteredCategories.map((cat) => (
                  <button
                    key={cat._id}
                    type="button"
                    onClick={() => {
                      updateFilters({ category_id: cat._id, attribute_id: '', attribute_value_id: '' });
                      setCategoryDropdownOpen(false);
                      setCategorySearchTerm('');
                    }}
                    className={`w-full px-4 py-2.5 text-left text-sm hover:bg-[rgb(72,29,111)] transition-colors ${
                      filters.category_id === cat._id
                        ? 'bg-[rgb(72,29,111)] text-[#faf9f5] font-semibold'
                        : 'text-[rgb(72,29,111)] hover:text-[rgb(72,29,111)]'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
                {filteredCategories.length === 0 && (
                  <div className="px-4 py-3 text-sm text-[rgb(72,29,111)] text-center">
                    No categories found
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Price Range Slider Component
  const PriceRangeSlider = () => {
    const applyPriceFilter = () => {
      const [currentMin, currentMax] = testRange;
      updateFilters({
        min_price: currentMin !== PRICE_BOUNDS.min ? currentMin : '',
        max_price: currentMax !== PRICE_BOUNDS.max ? currentMax : ''
      });
      if (setExternalPriceRange) {
        setExternalPriceRange([currentMin, currentMax]);
      }
    };

    const resetPriceFilter = () => {
      setTestRange([PRICE_BOUNDS.min, PRICE_BOUNDS.max]);
      updateFilters({ min_price: '', max_price: '' });
      if (setExternalPriceRange) {
        setExternalPriceRange([PRICE_BOUNDS.min, PRICE_BOUNDS.max]);
      }
    };

    return (
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2.5">
          <label className="flex items-center gap-2 text-xs font-semibold text-[rgb(72,29,111)] uppercase tracking-wide">
            <IndianRupee className="w-4 h-4 text-[rgb(72,29,111)]" />
            Price
          </label>
          <button
            onClick={resetPriceFilter}
            className="text-xs text-[rgb(72,29,111)] hover:opacity-80 font-medium uppercase tracking-wide"
          >
            Reset
          </button>
        </div>
        <div className="mt-4 mb-4">
          <Slider
            range
            min={PRICE_BOUNDS.min}
            max={PRICE_BOUNDS.max}
            step={50}
            value={testRange}
            onChange={setTestRange}
            tooltip={{
              formatter: (value) => `₹${value?.toLocaleString('en-IN')}`,
            }}
            styles={{
              track: {
                background: 'linear-gradient(to right, rgb(72,29,111), rgb(72,29,111))',
              },
              handle: {
                borderColor: 'rgb(72,29,111)',
              },
              rail: {
                backgroundColor: 'rgb(72,29,111)',
              },
              thumb: {
                backgroundColor: 'rgb(72,29,111)',
                borderColor: 'rgb(72,29,111)',
              },
            }}
          />
        </div>
        <div className="flex items-end gap-3 mt-4">
          <div className="flex-1 flex items-center gap-2">
            <span className="text-[10px] text-gray-500">Rs.</span>
            <input
              type="number"
              min={PRICE_BOUNDS.min}
              max={PRICE_BOUNDS.max}
              value={testRange[0]}
              onChange={(e) => {
                const value = Number(e.target.value);
                if (value >= PRICE_BOUNDS.min && value <= PRICE_BOUNDS.max && value <= testRange[1]) {
                  setTestRange([value, testRange[1]]);
                }
              }}
              onBlur={(e) => {
                const value = Number(e.target.value);
                if (value < PRICE_BOUNDS.min) {
                  setTestRange([PRICE_BOUNDS.min, testRange[1]]);
                } else if (value > testRange[1]) {
                  setTestRange([testRange[1], testRange[1]]);
                } else if (value > PRICE_BOUNDS.max) {
                  setTestRange([PRICE_BOUNDS.max, testRange[1]]);
                }
              }}
              className="text-sm font-semibold text-[rgb(72,29,111)] border-b border-[rgb(72,29,111)] pb-0.5 focus:outline-none focus:border-[rgb(72,29,111)] w-full bg-transparent"
            />
          </div>
          <div className="flex-1 flex items-center gap-2">
            <span className="text-[10px] text-gray-500">Rs.</span>
            <input
              type="number"
              min={PRICE_BOUNDS.min}
              max={PRICE_BOUNDS.max}
              value={testRange[1]}
              onChange={(e) => {
                const value = Number(e.target.value);
                if (value >= PRICE_BOUNDS.min && value <= PRICE_BOUNDS.max && value >= testRange[0]) {
                  setTestRange([testRange[0], value]);
                }
              }}
              onBlur={(e) => {
                const value = Number(e.target.value);
                if (value < testRange[0]) {
                  setTestRange([testRange[0], testRange[0]]);
                } else if (value < PRICE_BOUNDS.min) {
                  setTestRange([testRange[0], PRICE_BOUNDS.min]);
                } else if (value > PRICE_BOUNDS.max) {
                  setTestRange([testRange[0], PRICE_BOUNDS.max]);
                }
              }}
              className="text-sm font-semibold text-[rgb(72,29,111)] border-b border-[rgb(72,29,111)] pb-0.5 focus:outline-none focus:border-[rgb(72,29,111)] w-full bg-transparent"
            />
          </div>
          <button
            onClick={applyPriceFilter}
            className="px-4 py-1.5 bg-[rgb(72,29,111)] hover:opacity-90 text-white text-sm font-semibold rounded-lg transition-colors whitespace-nowrap flex-shrink-0"
          >
            GO
          </button>
        </div>
      </div>
    );
  };

  // Attribute Filter Component
  const AttributeFilter = () => {
    const selectedAttribute = attributes.find(a => a._id === filters.attribute_id);
    const filteredAttributes = attributes.filter(attr =>
      attr.name.toLowerCase().includes(attributeSearchTerm.toLowerCase())
    );
    const filteredAttributeValues = selectedAttribute
      ? selectedAttribute.values.filter(val =>
          val.value.toLowerCase().includes(attributeValueSearchTerm.toLowerCase())
        )
      : [];

    return (
      <div className="mb-6">
        <label className="flex items-center gap-2 text-xs font-semibold text-[rgb(72,29,111)] mb-2.5 uppercase tracking-wide">
          <Tag className="w-4 h-4 text-[rgb(72,29,111)]" />
          Options
        </label>
        <div className="mb-2.5 relative attribute-dropdown-container">
          <button
            type="button"
            onClick={() => {
              setAttributeDropdownOpen(!attributeDropdownOpen);
              setAttributeSearchTerm('');
            }}
            className="w-full px-3 py-2.5 border border-[rgb(72,29,111)] rounded-lg focus:outline-none text-sm text-left flex items-center justify-between bg-[#faf9f5] shadow-sm hover:border-[rgb(72,29,111)] transition-colors"
          >
            <span className="truncate">
              {filters.attribute_id
                ? attributes.find(a => a._id === filters.attribute_id)?.name || 'Select Attribute'
                : 'Select Attribute'}
            </span>
            <ChevronDown className={`w-4 h-4 text-[rgb(72,29,111)] transition-transform flex-shrink-0 ${attributeDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {attributeDropdownOpen && (
            <div className="absolute z-50 w-full mt-2 bg-[#faf9f5] border border-[rgb(72,29,111)] rounded-lg shadow-xl overflow-hidden">
              <div className="p-3 border-b border-gray-200 bg-gray-50">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search attributes..."
                    value={attributeSearchTerm}
                    onChange={(e) => setAttributeSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 text-sm border border-[rgb(72,29,111)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(72,29,111)] focus:border-[rgb(72,29,111)] bg-[#faf9f5]"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </div>
              <div className="max-h-[210px] overflow-y-auto">
                <button
                  type="button"
                  onClick={() => {
                    updateFilters({ attribute_id: '', attribute_value_id: '' });
                    setAttributeDropdownOpen(false);
                    setAttributeSearchTerm('');
                  }}
                  className={`w-full px-4 py-2.5 text-left text-sm hover:bg-[rgb(72,29,111)] transition-colors ${
                    !filters.attribute_id 
                      ? 'bg-[rgb(72,29,111)] text-[#faf9f5] font-semibold' 
                      : 'text-[rgb(72,29,111)] hover:text-[rgb(72,29,111)]'
                  }`}
                >
                  Select Attribute
                </button>
                {filteredAttributes.map((attr) => (
                  <button
                    key={attr._id}
                    type="button"
                    onClick={() => {
                      updateFilters({ attribute_id: attr._id, attribute_value_id: '' });
                      setAttributeDropdownOpen(false);
                      setAttributeSearchTerm('');
                    }}
                    className={`w-full px-4 py-2.5 text-left text-sm hover:bg-[rgb(72,29,111)] transition-colors ${
                      filters.attribute_id === attr._id
                        ? 'bg-[rgb(72,29,111)] text-[#faf9f5] font-semibold'
                        : 'text-[rgb(72,29,111)] hover:text-[rgb(72,29,111)]'
                    }`}
                  >
                    {attr.name}
                  </button>
                ))}
                {filteredAttributes.length === 0 && (
                  <div className="px-4 py-3 text-sm text-[rgb(72,29,111)] text-center">
                    No attributes found
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {selectedAttribute && (
          <div className="relative attribute-value-dropdown-container">
            <button
              type="button"
              onClick={() => {
                setAttributeValueDropdownOpen(!attributeValueDropdownOpen);
                setAttributeValueSearchTerm('');
              }}
              className="w-full px-3 py-2.5 border border-[rgb(72,29,111)] rounded-lg focus:outline-none text-sm text-left flex items-center justify-between bg-[#faf9f5] shadow-sm hover:border-[rgb(72,29,111)] transition-colors"
            >
              <span className="truncate">
                {filters.attribute_value_id
                  ? selectedAttribute.values.find(v => v._id === filters.attribute_value_id)?.value || 'All Values'
                  : `All Values (${selectedAttribute.name})`}
              </span>
              <ChevronDown className={`w-4 h-4 text-[rgb(72,29,111)] transition-transform flex-shrink-0 ${attributeValueDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {attributeValueDropdownOpen && (
              <div className="absolute z-50 w-full mt-2 bg-[#faf9f5] border border-[rgb(72,29,111)] rounded-lg shadow-xl overflow-hidden">
                <div className="p-3 border-b border-gray-200 bg-gray-50">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search values..."
                      value={attributeValueSearchTerm}
                      onChange={(e) => setAttributeValueSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-3 py-2.5 text-sm border border-[rgb(72,29,111)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(72,29,111)] focus:border-[rgb(72,29,111)] bg-[#faf9f5]"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                </div>
                <div className="max-h-[210px] overflow-y-auto">
                  <button
                    type="button"
                    onClick={() => {
                      updateFilters({ attribute_value_id: '' });
                      setAttributeValueDropdownOpen(false);
                      setAttributeValueSearchTerm('');
                    }}
                    className={`w-full px-4 py-2.5 text-left text-sm hover:bg-[rgb(72,29,111)] transition-colors ${
                      !filters.attribute_value_id 
                        ? 'bg-[rgb(72,29,111)] text-[#faf9f5] font-semibold' 
                        : 'text-[rgb(72,29,111)] hover:text-[rgb(72,29,111)]'
                    }`}
                  >
                    All Values ({selectedAttribute.name})
                  </button>
                  {filteredAttributeValues.map((val) => (
                    <button
                      key={val._id}
                      type="button"
                      onClick={() => {
                        updateFilters({ attribute_value_id: val._id });
                        setAttributeValueDropdownOpen(false);
                        setAttributeValueSearchTerm('');
                      }}
                      className={`w-full px-4 py-2.5 text-left text-sm hover:bg-[rgb(72,29,111)] transition-colors ${
                        filters.attribute_value_id === val._id
                          ? 'bg-[rgb(72,29,111)] text-[#faf9f5] font-semibold'
                          : 'text-[rgb(72,29,111)] hover:text-[rgb(72,29,111)]'
                      }`}
                    >
                      {val.value}
                    </button>
                  ))}
                  {filteredAttributeValues.length === 0 && (
                    <div className="px-4 py-3 text-sm text-[rgb(72,29,111)] text-center">
                      No values found
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`bg-[#faf9f5] ${isMobile ? 'p-6' : 'p-5'} rounded-lg border border-gray-200 shadow-md`}>
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-[rgb(72,29,111)]" />
          <h3 className="text-lg font-bold text-[rgb(72,29,111)] uppercase tracking-wide">
            Filters
          </h3>
        </div>
        <button
          onClick={clearFilters}
          className="text-xs text-[rgb(72,29,111)] hover:opacity-80 uppercase tracking-wide font-medium hover:underline transition-all"
        >
          Clear All
        </button>
      </div>
      <div className="mb-6">
        <label className="flex items-center gap-2 text-xs font-semibold text-[rgb(72,29,111)] mb-2.5 uppercase tracking-wide">
          <ArrowUpDown className="w-4 h-4 text-[rgb(72,29,111)]" />
          Sort By
        </label>
        <div className="relative">
          <select
            value={`${filters.sort_by}-${filters.sort_order}`}
            onChange={(e) => {
              const [sort_by, sort_order] = e.target.value.split('-');
              updateFilters({ sort_by, sort_order });
            }}
            className="w-full px-3 py-2.5 pr-10 border border-[rgb(72,29,111)] rounded-lg focus:outline-none text-sm bg-[#faf9f5] shadow-sm hover:border-[rgb(72,29,111)] transition-colors appearance-none"
          >
            {SORT_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[rgb(72,29,111)] pointer-events-none" />
        </div>
      </div>
      <CategoryDropdown />
      <PriceRangeSlider />
      <AttributeFilter />
    </div>
  );
};

export default FilterSidebar;
