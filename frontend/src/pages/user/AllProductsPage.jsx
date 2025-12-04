/**
 * All Products Page - Sale Page with Filters and Pagination
 * Luxury design with sidebar filters and product grid
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

const AllProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // State
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [attributes, setAttributes] = useState([]);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  
  // Category dropdown state
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [categorySearchTerm, setCategorySearchTerm] = useState('');
  
  // Attribute dropdown state
  const [attributeDropdownOpen, setAttributeDropdownOpen] = useState(false);
  const [attributeSearchTerm, setAttributeSearchTerm] = useState('');
  
  // Attribute value dropdown state
  const [attributeValueDropdownOpen, setAttributeValueDropdownOpen] = useState(false);
  const [attributeValueSearchTerm, setAttributeValueSearchTerm] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const limit = 20;

  // Filters
  const [filters, setFilters] = useState({
    category_id: searchParams.get('category') || '',
    min_price: searchParams.get('min_price') || '',
    max_price: searchParams.get('max_price') || '',
    attribute_id: searchParams.get('attribute_id') || '',
    attribute_value_id: searchParams.get('attribute_value_id') || '',
    sort_by: searchParams.get('sort_by') || 'createdAt',
    sort_order: searchParams.get('sort_order') || 'desc',
  });

  // Fetch categories and attributes on mount
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

  // Close dropdowns when clicking outside
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

  // Fetch products when filters or page changes
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const page = parseInt(searchParams.get('page')) || 1;
        setCurrentPage(page);

        const filterParams = {
          page,
          limit,
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
  }, [filters, searchParams]);

  // Update URL params when filters change
  const updateFilters = (newFilters) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    setCurrentPage(1); // Reset to page 1 when filters change

    // Update URL params
    const params = new URLSearchParams();
    Object.keys(updatedFilters).forEach(key => {
      if (updatedFilters[key]) {
        params.set(key, updatedFilters[key]);
      }
    });
    params.set('page', '1');
    setSearchParams(params);
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      const params = new URLSearchParams(searchParams);
      params.set('page', newPage.toString());
      setSearchParams(params);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Clear all filters
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
    setSearchParams({ page: '1' });
  };

  // Filter sidebar component
  const FilterSidebar = ({ isMobile = false }) => {
    const selectedAttribute = attributes.find(a => a._id === filters.attribute_id);

    return (
      <div className={`bg-white ${isMobile ? 'p-6' : 'p-5'} rounded-lg border border-gray-200 shadow-md`}>
        {/* Header */}
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

        {/* Sort By */}
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
              <option value="createdAt-desc">Newest First</option>
              <option value="createdAt-asc">Oldest First</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name-asc">Name: A to Z</option>
              <option value="name-desc">Name: Z to A</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
          </div>
        </div>

        {/* Category Filter - Custom Dropdown with Search */}
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
                {/* Search Input */}
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

                {/* Category List - Shows 6-7 items, then scroll */}
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
                  {categories
                    .filter(cat =>
                      cat.name.toLowerCase().includes(categorySearchTerm.toLowerCase())
                    )
                    .map((cat) => (
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
                  {categories.filter(cat =>
                    cat.name.toLowerCase().includes(categorySearchTerm.toLowerCase())
                  ).length === 0 && (
                    <div className="px-4 py-3 text-sm text-gray-500 text-center">
                      No categories found
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Price Range Filter */}
        <div className="mb-6">
          <label className="flex items-center gap-2 text-xs font-semibold text-gray-800 mb-2.5 uppercase tracking-wide">
            <IndianRupee className="w-4 h-4 text-rose-600" />
            Price Range
          </label>
          <div className="flex gap-2">
            <div className="flex-1">
              <input
                type="number"
                placeholder="Min"
                value={filters.min_price}
                onChange={(e) => updateFilters({ min_price: e.target.value })}
                className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-sm bg-white shadow-sm hover:border-gray-300 transition-colors"
              />
            </div>
            <div className="flex-1">
              <input
                type="number"
                placeholder="Max"
                value={filters.max_price}
                onChange={(e) => updateFilters({ max_price: e.target.value })}
                className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-sm bg-white shadow-sm hover:border-gray-300 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Attribute Filter - Custom Dropdown with Search */}
        <div className="mb-6">
          <label className="flex items-center gap-2 text-xs font-semibold text-gray-800 mb-2.5 uppercase tracking-wide">
            <Tag className="w-4 h-4 text-rose-600" />
            Options
          </label>
          
          {/* Attribute Dropdown */}
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
                {/* Search Input */}
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

                {/* Attribute List - Shows 6-7 items, then scroll */}
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
                  {attributes
                    .filter(attr =>
                      attr.name.toLowerCase().includes(attributeSearchTerm.toLowerCase())
                    )
                    .map((attr) => (
                      <button
                        key={attr._id}
                        type="button"
                        onClick={() => {
                          updateFilters({ attribute_id: attr._id, attribute_value_id: '' });
                          setAttributeDropdownOpen(false);
                          setAttributeSearchTerm('');
                          setAttributeValueDropdownOpen(false);
                          setAttributeValueSearchTerm('');
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
                  {attributes.filter(attr =>
                    attr.name.toLowerCase().includes(attributeSearchTerm.toLowerCase())
                  ).length === 0 && (
                    <div className="px-4 py-3 text-sm text-gray-500 text-center">
                      No attributes found
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Attribute Value Dropdown - Only show if attribute is selected */}
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
                  {/* Search Input */}
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

                  {/* Attribute Value List - Shows 6-7 items, then scroll */}
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
                    {selectedAttribute.values
                      .filter(val =>
                        val.value.toLowerCase().includes(attributeValueSearchTerm.toLowerCase())
                      )
                      .map((val) => (
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
                    {selectedAttribute.values.filter(val =>
                      val.value.toLowerCase().includes(attributeValueSearchTerm.toLowerCase())
                    ).length === 0 && (
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
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Mobile Filter Button */}
      <div className="lg:hidden sticky top-20 z-40 bg-white border-b border-gray-200 shadow-sm px-4 py-3">
        <button
          onClick={() => setMobileFiltersOpen(true)}
          className="flex items-center gap-2 text-sm font-semibold text-gray-800 uppercase tracking-wide hover:text-rose-600 transition-colors"
        >
          <SlidersHorizontal className="w-5 h-5 text-rose-600" />
          Filters
        </button>
      </div>

      {/* Mobile Filter Overlay */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileFiltersOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-80 bg-white shadow-xl overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 uppercase">Filters</h3>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <FilterSidebar isMobile={true} />
          </div>
        </div>
      )}

      <main className="max-w-[1600px] mx-auto px-4 md:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3 tracking-tight">
            All Products
          </h1>
          <p className="text-base text-gray-600 font-medium">
            {totalCount > 0 ? `${totalCount} products found` : 'No products found'}
          </p>
        </div>

        <div className="flex gap-6 lg:gap-8">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-72 flex-shrink-0 -ml-4">
            <div className="sticky top-24">
              <FilterSidebar />
            </div>
          </aside>

          {/* Products Grid */}
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
                  className="text-rose-600 hover:text-rose-700 font-medium uppercase tracking-wide"
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

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>

                    {[...Array(totalPages)].map((_, index) => {
                      const page = index + 1;
                      // Show first page, last page, current page, and pages around current
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
                      } else if (
                        page === currentPage - 2 ||
                        page === currentPage + 2
                      ) {
                        return <span key={page} className="px-2">...</span>;
                      }
                      return null;
                    })}

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AllProductsPage;

