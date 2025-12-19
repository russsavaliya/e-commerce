/**
 * New Arrival Products Page - With Filters and Pagination
 * Displays all new products (is_new: true) with filter sidebar
 */

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Loader2, 
  X, 
  ChevronLeft, 
  ChevronRight,
  SlidersHorizontal,
} from 'lucide-react';
import Navbar from '../../components/user/Navbar';
import ProductCard from '../../components/user/ProductCard';
import Footer from '../../components/user/Footer';
import FilterSidebar from '../../components/user/FilterSidebar';
import { getAllProducts } from '../../services/user/productService';
import { getCategoriesList } from '../../services/user/categoryService';
import { getAttributesList } from '../../services/user/attributeService';

// ============================================================================
// CONSTANTS
// ============================================================================
const PRICE_BOUNDS = { min: 200, max: 5000 };
const ITEMS_PER_PAGE = 20;

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
          is_new: true, // Key difference: filter by new products
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
  // SUB-COMPONENTS
  // ============================================================================

  // Pagination Component
  const Pagination = () => {
    if (totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-center gap-2 mt-8">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 border border-gray-300 rounded-lg hover:bg-[#faf9f5] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-[rgb(72,29,111)]" />
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
                    ? 'bg-[rgb(72,29,111)] text-white border-[rgb(72,29,111)]'
                    : 'border-gray-300 hover:bg-[#faf9f5] text-[rgb(72,29,111)]'
                }`}
              >
                {page}
              </button>
            );
          } else if (page === currentPage - 2 || page === currentPage + 2) {
            return <span key={page} className="px-2 text-[rgb(72,29,111)]">...</span>;
          }
          return null;
        })}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 border border-gray-300 rounded-lg hover:bg-[#faf9f5] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="w-5 h-5 text-[rgb(72,29,111)]" />
        </button>
      </div>
    );
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="min-h-screen bg-[#faf9f5]">
      <Navbar />

      <div className="lg:hidden sticky top-20 z-40 bg-[#faf9f5] border-b border-gray-200 shadow-sm px-4 py-3">
        <button
          onClick={() => setMobileFiltersOpen(true)}
          className="flex items-center gap-2 text-sm font-semibold text-[rgb(72,29,111)] uppercase tracking-wide hover:opacity-80 transition-colors"
        >
          <SlidersHorizontal className="w-5 h-5 text-[rgb(72,29,111)]" />
          Filters
        </button>
      </div>

      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div 
            className="absolute inset-0 bg-black/50" 
            onClick={() => setMobileFiltersOpen(false)} 
          />
          <div className="absolute right-0 top-0 h-full w-80 bg-[#faf9f5] shadow-xl overflow-y-auto">
            <div className="sticky top-0 bg-[#faf9f5] border-b border-gray-200 p-4 flex items-center justify-between z-10">
              <h3 className="text-lg font-semibold text-[rgb(72,29,111)] uppercase">Filters</h3>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <FilterSidebar
              isMobile={true}
              filters={filters}
              updateFilters={updateFilters}
              clearFilters={clearFilters}
              categories={categories}
              attributes={attributes}
              priceRange={priceRange}
              setPriceRange={setPriceRange}
              categoryDropdownOpen={categoryDropdownOpen}
              setCategoryDropdownOpen={setCategoryDropdownOpen}
              attributeDropdownOpen={attributeDropdownOpen}
              setAttributeDropdownOpen={setAttributeDropdownOpen}
              attributeValueDropdownOpen={attributeValueDropdownOpen}
              setAttributeValueDropdownOpen={setAttributeValueDropdownOpen}
              categorySearchTerm={categorySearchTerm}
              setCategorySearchTerm={setCategorySearchTerm}
              attributeSearchTerm={attributeSearchTerm}
              setAttributeSearchTerm={setAttributeSearchTerm}
              attributeValueSearchTerm={attributeValueSearchTerm}
              setAttributeValueSearchTerm={setAttributeValueSearchTerm}
            />
          </div>
        </div>
      )}

      <main className="max-w-[1600px] mx-auto px-4 md:px-6 lg:px-8 py-10 bg-[#faf9f5]">
        <div className="flex gap-6 lg:gap-8">
          <aside className="hidden lg:block w-72 flex-shrink-0">
            <div className="sticky top-24">
              <div className="mb-4">
                <p className="text-base text-[rgb(72,29,111)] font-medium">
                  {totalCount > 0 ? `${totalCount} products found` : 'No products found'}
                </p>
              </div>
              <FilterSidebar
                filters={filters}
                updateFilters={updateFilters}
                clearFilters={clearFilters}
                categories={categories}
                attributes={attributes}
                priceRange={priceRange}
                setPriceRange={setPriceRange}
                categoryDropdownOpen={categoryDropdownOpen}
                setCategoryDropdownOpen={setCategoryDropdownOpen}
                attributeDropdownOpen={attributeDropdownOpen}
                setAttributeDropdownOpen={setAttributeDropdownOpen}
                attributeValueDropdownOpen={attributeValueDropdownOpen}
                setAttributeValueDropdownOpen={setAttributeValueDropdownOpen}
                categorySearchTerm={categorySearchTerm}
                setCategorySearchTerm={setCategorySearchTerm}
                attributeSearchTerm={attributeSearchTerm}
                setAttributeSearchTerm={setAttributeSearchTerm}
                attributeValueSearchTerm={attributeValueSearchTerm}
                setAttributeValueSearchTerm={setAttributeValueSearchTerm}
              />
            </div>
          </aside>

          <div className="flex-1 min-w-0">
            <div className="mb-10 text-center">
              <h1 className="text-base font-medium tracking-wide text-[#481d6f] uppercase">
                New Arrival
              </h1>
            </div>
            {loading ? (
              <div className="flex items-center justify-center py-16 bg-[#faf9f5]">
                <Loader2 className="w-8 h-8 animate-spin text-[rgb(72,29,111)]" />
              </div>
            ) : products.length === 0 ? (
              <div className="py-16 text-center bg-[#faf9f5]">
                <p className="text-[rgb(72,29,111)] mb-4">No products found matching your filters.</p>
                <button
                  onClick={clearFilters}
                  className="text-[rgb(72,29,111)] hover:opacity-80 font-medium uppercase tracking-wide transition-colors"
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

