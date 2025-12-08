/**
 * Best Seller Products Page - With Filters and Pagination
 * Displays all bestseller products (is_best_seller: true) with filter sidebar
 */

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Loader2, 
  X, 
  ChevronLeft, 
  ChevronRight,
  SlidersHorizontal,
  Search,
  ChevronDown,
  Filter,
  ArrowUpDown,
  Tag,
  IndianRupee
} from 'lucide-react';
import Navbar from '../../components/user/Navbar';
import ProductCard from '../../components/user/ProductCard';
import Footer from '../../components/user/Footer';
import { getAllProducts } from '../../services/user/productService';
import { getCategoriesList } from '../../services/user/categoryService';
import { getAttributesList } from '../../services/user/attributeService';
import { Slider } from 'antd';

// ============================================================================
// CONSTANTS
// ============================================================================
const PRICE_BOUNDS = { min: 200, max: 5000 };
const ITEMS_PER_PAGE = 20;

const SORT_OPTIONS = [
  { value: 'createdAt-desc', label: 'Newest First' },
  { value: 'createdAt-asc', label: 'Oldest First' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'name-asc', label: 'Name: A to Z' },
  { value: 'name-desc', label: 'Name: Z to A' },
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================
const NewArrivalPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  
  // Products & Loading
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Filter Data
  const [categories, setCategories] = useState([]);
  const [attributes, setAttributes] = useState([]);
  
  // UI State
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [attributeDropdownOpen, setAttributeDropdownOpen] = useState(false);
  const [attributeValueDropdownOpen, setAttributeValueDropdownOpen] = useState(false);
  
  // Search Terms
  const [categorySearchTerm, setCategorySearchTerm] = useState('');
  const [attributeSearchTerm, setAttributeSearchTerm] = useState('');
  const [attributeValueSearchTerm, setAttributeValueSearchTerm] = useState('');
  
  // Price Slider State
  const [priceRange, setPriceRange] = useState([PRICE_BOUNDS.min, PRICE_BOUNDS.max]);
  
  // Active Filters
  const [filters, setFilters] = useState({
    category_id: searchParams.get('category') || '',
    min_price: searchParams.get('min_price') || '',
    max_price: searchParams.get('max_price') || '',
    attribute_id: searchParams.get('attribute_id') || '',
    attribute_value_id: searchParams.get('attribute_value_id') || '',
    sort_by: searchParams.get('sort_by') || 'createdAt',
    sort_order: searchParams.get('sort_order') || 'desc',
  });

  // ============================================================================
  // HELPER FUNCTIONS
  // ============================================================================
  
  const updateFilters = (newFilters) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    setCurrentPage(1);

    const params = new URLSearchParams();
    Object.keys(updatedFilters).forEach(key => {
      if (updatedFilters[key]) {
        params.set(key, updatedFilters[key]);
      }
    });
    params.set('page', '1');
    setSearchParams(params);
  };

  const clearFilters = () => {
    setFilters({
      category_id: '',
      min_price: '',
      max_price: '',
      attribute_id: '',
      attribute_value_id: '',
      sort_by: 'createdAt',
      sort_order: 'desc',
    });
    setPriceRange([PRICE_BOUNDS.min, PRICE_BOUNDS.max]);
    setSearchParams({ page: '1' });
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      const params = new URLSearchParams(searchParams);
      params.set('page', newPage.toString());
      setSearchParams(params);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const closeAllDropdowns = () => {
    setCategoryDropdownOpen(false);
    setAttributeDropdownOpen(false);
    setAttributeValueDropdownOpen(false);
    setCategorySearchTerm('');
    setAttributeSearchTerm('');
    setAttributeValueSearchTerm('');
  };

  // ============================================================================
  // EFFECTS
  // ============================================================================
  
  // Sync slider values with filters
  useEffect(() => {
    const filterMinPrice = Number(filters.min_price);
    const filterMaxPrice = Number(filters.max_price);
    
    const min = filterMinPrice && filterMinPrice >= PRICE_BOUNDS.min && filterMinPrice <= PRICE_BOUNDS.max 
      ? filterMinPrice 
      : PRICE_BOUNDS.min;
    const max = filterMaxPrice && filterMaxPrice >= PRICE_BOUNDS.min && filterMaxPrice <= PRICE_BOUNDS.max 
      ? filterMaxPrice 
      : PRICE_BOUNDS.max;
    
    setPriceRange([min, max]);
  }, [filters.min_price, filters.max_price]);

  // Fetch categories and attributes
  useEffect(() => {
    const fetchFilterData = async () => {
      try {
        const [categoriesRes, attributesRes] = await Promise.all([
          getCategoriesList(),
          getAttributesList(),
        ]);

        if (categoriesRes.status) {
          setCategories(categoriesRes.data || []);
        }
        if (attributesRes.status) {
          setAttributes(attributesRes.data || []);
        }
      } catch (error) {
        console.error('Error fetching filter data:', error);
      }
    };

    fetchFilterData();
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (categoryDropdownOpen && !event.target.closest('.category-dropdown-container')) {
        setCategoryDropdownOpen(false);
        setCategorySearchTerm('');
      }
      if (attributeDropdownOpen && !event.target.closest('.attribute-dropdown-container')) {
        setAttributeDropdownOpen(false);
        setAttributeSearchTerm('');
      }
      if (attributeValueDropdownOpen && !event.target.closest('.attribute-value-dropdown-container')) {
        setAttributeValueDropdownOpen(false);
        setAttributeValueSearchTerm('');
      }
    };

    if (categoryDropdownOpen || attributeDropdownOpen || attributeValueDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [categoryDropdownOpen, attributeDropdownOpen, attributeValueDropdownOpen]);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);

        const filterParams = {
          page: currentPage,
          limit: ITEMS_PER_PAGE,
          is_best_seller: true, // Key difference: filter by bestseller products
          ...filters,
        };

        // Remove empty filters
        Object.keys(filterParams).forEach(key => {
          if (filterParams[key] === '' || filterParams[key] === null) {
            delete filterParams[key];
          }
        });

        const res = await getAllProducts(filterParams);
        
        if (res.status && res.data) {
          setProducts(res.data.products || []);
          setTotalPages(res.data.total_pages || 1);
          setTotalCount(res.data.total_count || 0);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [filters, currentPage]);

  // ============================================================================
  // SUB-COMPONENTS (Same as AllProductsPage)
  // ============================================================================

  // Category Dropdown Component
  const CategoryDropdown = () => {
    const filteredCategories = categories.filter(cat =>
      cat.name.toLowerCase().includes(categorySearchTerm.toLowerCase())
    );

    return (
      <div className="mb-6 relative category-dropdown-container">
        <label className="flex items-center gap-2 text-xs font-semibold text-gray-800 mb-2.5 uppercase tracking-wide">
          <Tag className="w-4 h-4 text-rose-600" />
          Category
        </label>
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setCategoryDropdownOpen(!categoryDropdownOpen);
              setCategorySearchTerm('');
            }}
            className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-sm text-left flex items-center justify-between bg-white shadow-sm hover:border-gray-300 transition-colors"
          >
            <span className="truncate">
              {filters.category_id
                ? categories.find(c => c._id === filters.category_id)?.name || 'All Categories'
                : 'All Categories'}
            </span>
            <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${categoryDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {categoryDropdownOpen && (
            <div className="absolute z-50 w-full mt-2 bg-white border-2 border-gray-200 rounded-lg shadow-xl">
              <div className="p-3 border-b border-gray-200 bg-gray-50">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search categories..."
                    value={categorySearchTerm}
                    onChange={(e) => setCategorySearchTerm(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 text-sm border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 bg-white"
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
                  className={`w-full px-4 py-2.5 text-left text-sm hover:bg-rose-50 transition-colors ${
                    !filters.category_id ? 'bg-rose-100 text-rose-700 font-semibold' : 'text-gray-700 hover:text-rose-600'
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
                    className={`w-full px-4 py-2.5 text-left text-sm hover:bg-rose-50 transition-colors ${
                      filters.category_id === cat._id
                        ? 'bg-rose-100 text-rose-700 font-semibold'
                        : 'text-gray-700 hover:text-rose-600'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
                {filteredCategories.length === 0 && (
                  <div className="px-4 py-3 text-sm text-gray-500 text-center">
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
    const [testRange, setTestRange] = useState(() => {
      const [min, max] = priceRange;
      return [min, max];
    });

    useEffect(() => {
      const [min, max] = priceRange;
      setTestRange([min, max]);
    }, [priceRange]);

    const applyPriceFilter = () => {
      const [currentMin, currentMax] = testRange;
      updateFilters({ 
        min_price: currentMin !== PRICE_BOUNDS.min ? currentMin : '',
        max_price: currentMax !== PRICE_BOUNDS.max ? currentMax : ''
      });
    };

    const resetPriceFilter = () => {
      setTestRange([PRICE_BOUNDS.min, PRICE_BOUNDS.max]);
      updateFilters({ min_price: '', max_price: '' });
    };

    return (
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2.5">
          <label className="flex items-center gap-2 text-xs font-semibold text-gray-800 uppercase tracking-wide">
            <IndianRupee className="w-4 h-4 text-rose-600" />
            Price
          </label>
          <button
            onClick={resetPriceFilter}
            className="text-xs text-orange-500 hover:text-orange-600 font-medium uppercase tracking-wide"
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
                background: 'linear-gradient(to right, #f97316, #fb923c)',
              },
              handle: {
                borderColor: '#f97316',
              },
              rail: {
                backgroundColor: '#e5e7eb',
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
              className="text-sm font-semibold text-gray-900 border-b border-gray-300 pb-0.5 focus:outline-none focus:border-rose-500 w-full bg-transparent"
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
              className="text-sm font-semibold text-gray-900 border-b border-gray-300 pb-0.5 focus:outline-none focus:border-rose-500 w-full bg-transparent"
            />
          </div>
          <button
            onClick={applyPriceFilter}
            className="px-4 py-1.5 bg-orange-400 hover:bg-orange-500 text-white text-sm font-semibold rounded-lg transition-colors whitespace-nowrap flex-shrink-0"
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
        <label className="flex items-center gap-2 text-xs font-semibold text-gray-800 mb-2.5 uppercase tracking-wide">
          <Tag className="w-4 h-4 text-rose-600" />
          Options
        </label>
        <div className="mb-2.5 relative attribute-dropdown-container">
          <button
            type="button"
            onClick={() => {
              setAttributeDropdownOpen(!attributeDropdownOpen);
              setAttributeSearchTerm('');
            }}
            className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-sm text-left flex items-center justify-between bg-white shadow-sm hover:border-gray-300 transition-colors"
          >
            <span className="truncate">
              {filters.attribute_id
                ? attributes.find(a => a._id === filters.attribute_id)?.name || 'Select Attribute'
                : 'Select Attribute'}
            </span>
            <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform flex-shrink-0 ${attributeDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {attributeDropdownOpen && (
            <div className="absolute z-50 w-full mt-2 bg-white border-2 border-gray-200 rounded-lg shadow-xl">
              <div className="p-3 border-b border-gray-200 bg-gray-50">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search attributes..."
                    value={attributeSearchTerm}
                    onChange={(e) => setAttributeSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 text-sm border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 bg-white"
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
                  className={`w-full px-4 py-2.5 text-left text-sm hover:bg-rose-50 transition-colors ${
                    !filters.attribute_id ? 'bg-rose-100 text-rose-700 font-semibold' : 'text-gray-700 hover:text-rose-600'
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
                    className={`w-full px-4 py-2.5 text-left text-sm hover:bg-rose-50 transition-colors ${
                      filters.attribute_id === attr._id
                        ? 'bg-rose-100 text-rose-700 font-semibold'
                        : 'text-gray-700 hover:text-rose-600'
                    }`}
                  >
                    {attr.name}
                  </button>
                ))}
                {filteredAttributes.length === 0 && (
                  <div className="px-4 py-3 text-sm text-gray-500 text-center">
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
              className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-sm text-left flex items-center justify-between bg-white shadow-sm hover:border-gray-300 transition-colors"
            >
              <span className="truncate">
                {filters.attribute_value_id
                  ? selectedAttribute.values.find(v => v._id === filters.attribute_value_id)?.value || 'All Values'
                  : `All Values (${selectedAttribute.name})`}
              </span>
              <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform flex-shrink-0 ${attributeValueDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {attributeValueDropdownOpen && (
              <div className="absolute z-50 w-full mt-2 bg-white border-2 border-gray-200 rounded-lg shadow-xl">
                <div className="p-3 border-b border-gray-200 bg-gray-50">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search values..."
                      value={attributeValueSearchTerm}
                      onChange={(e) => setAttributeValueSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-3 py-2.5 text-sm border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 bg-white"
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
                    className={`w-full px-4 py-2.5 text-left text-sm hover:bg-rose-50 transition-colors ${
                      !filters.attribute_value_id ? 'bg-rose-100 text-rose-700 font-semibold' : 'text-gray-700 hover:text-rose-600'
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
                      className={`w-full px-4 py-2.5 text-left text-sm hover:bg-rose-50 transition-colors ${
                        filters.attribute_value_id === val._id
                          ? 'bg-rose-100 text-rose-700 font-semibold'
                          : 'text-gray-700 hover:text-rose-600'
                      }`}
                    >
                      {val.value}
                    </button>
                  ))}
                  {filteredAttributeValues.length === 0 && (
                    <div className="px-4 py-3 text-sm text-gray-500 text-center">
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

  // Filter Sidebar Component
  const FilterSidebar = ({ isMobile = false }) => {
    return (
      <div className={`bg-white ${isMobile ? 'p-6' : 'p-5'} rounded-lg border border-gray-200 shadow-md`}>
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-rose-600" />
            <h3 className="text-lg font-bold text-gray-900 uppercase tracking-wide">
              Filters
            </h3>
          </div>
          <button
            onClick={clearFilters}
            className="text-xs text-rose-600 hover:text-rose-700 uppercase tracking-wide font-medium hover:underline transition-all"
          >
            Clear All
          </button>
        </div>
        <div className="mb-6">
          <label className="flex items-center gap-2 text-xs font-semibold text-gray-800 mb-2.5 uppercase tracking-wide">
            <ArrowUpDown className="w-4 h-4 text-rose-600" />
            Sort By
          </label>
          <div className="relative">
            <select
              value={`${filters.sort_by}-${filters.sort_order}`}
              onChange={(e) => {
                const [sort_by, sort_order] = e.target.value.split('-');
                updateFilters({ sort_by, sort_order });
              }}
              className="w-full px-3 py-2.5 pr-10 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-sm bg-white shadow-sm hover:border-gray-300 transition-colors appearance-none"
            >
              {SORT_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
          </div>
        </div>
        <CategoryDropdown />
        <PriceRangeSlider />
        <AttributeFilter />
      </div>
    );
  };

  // Pagination Component
  const Pagination = () => {
    if (totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-center gap-2 mt-8">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        {[...Array(totalPages)].map((_, index) => {
          const page = index + 1;
          if (
            page === 1 ||
            page === totalPages ||
            (page >= currentPage - 1 && page <= currentPage + 1)
          ) {
            return (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-4 py-2 border rounded-lg font-medium transition-colors ${
                  currentPage === page
                    ? 'bg-rose-600 text-white border-rose-600'
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            );
          } else if (page === currentPage - 2 || page === currentPage + 2) {
            return <span key={page} className="px-2">...</span>;
          }
          return null;
        })}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    );
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="lg:hidden sticky top-20 z-40 bg-white border-b border-gray-200 shadow-sm px-4 py-3">
        <button
          onClick={() => setMobileFiltersOpen(true)}
          className="flex items-center gap-2 text-sm font-semibold text-gray-800 uppercase tracking-wide hover:text-rose-600 transition-colors"
        >
          <SlidersHorizontal className="w-5 h-5 text-rose-600" />
          Filters
        </button>
      </div>

      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div 
            className="absolute inset-0 bg-black/50" 
            onClick={() => setMobileFiltersOpen(false)} 
          />
          <div className="absolute right-0 top-0 h-full w-80 bg-white shadow-xl overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between z-10">
              <h3 className="text-lg font-semibold text-gray-900 uppercase">Filters</h3>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <FilterSidebar isMobile={true} />
          </div>
        </div>
      )}

      <main className="max-w-[1600px] mx-auto px-4 md:px-6 lg:px-8 py-10">
        <div className="mb-10 text-center">
          <h1 className="text-xs tracking-[0.35em] text-gray-500 uppercase mb-3">
            Best Sellers
          </h1>
        </div>

        <div className="flex gap-6 lg:gap-8">
          <aside className="hidden lg:block w-72 flex-shrink-0">
            <div className="sticky top-24">
              <div className="mb-4">
                <p className="text-base text-gray-600 font-medium">
                  {totalCount > 0 ? `${totalCount} products found` : 'No products found'}
                </p>
              </div>
              <FilterSidebar />
            </div>
          </aside>

          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-rose-600" />
              </div>
            ) : products.length === 0 ? (
              <div className="py-16 text-center">
                <p className="text-gray-600 mb-4">No products found matching your filters.</p>
                <button
                  onClick={clearFilters}
                  className="text-rose-600 hover:text-rose-700 font-medium uppercase tracking-wide transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-7 mb-10">
                  {products.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>
                <Pagination />
              </>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default NewArrivalPage;

