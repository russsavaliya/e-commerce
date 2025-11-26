import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Save,
  Loader2,
  IndianRupee,
  Package,
  Calendar,
  FileText,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  getAllMarketingSpends,
  createMarketingSpend,
  updateMarketingSpend,
  deleteMarketingSpend,
} from '../../services/admin/marketingSpendService';
import { getAllProducts } from '../../services/admin/productService';

const MarketingSpendManagement = () => {
  // State Management
  const [marketingSpends, setMarketingSpends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingSpend, setEditingSpend] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [productFilterOpen, setProductFilterOpen] = useState(false);
  const [formProductDropdownOpen, setFormProductDropdownOpen] = useState(false);
  const [productFilterSearch, setProductFilterSearch] = useState('');
  const [formProductSearch, setFormProductSearch] = useState('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalSpends, setTotalSpends] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [formData, setFormData] = useState({
    product_id: '',
    date: '',
    description: '',
    amount: '',
  });

  const [formErrors, setFormErrors] = useState({});

  const searchTimeoutRef = React.useRef(null);
  const isFetchingRef = React.useRef(false);
  const lastParamsRef = React.useRef({ page: null, limit: null, search: null, product_id: null, date: null });

  // Fetch products for dropdown
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoadingProducts(true);
      const response = await getAllProducts(1, 1000, ''); // Get all products
      if (response.status && response.data) {
        setProducts(response.data.productData || []);
        // Reset searches when products change
        setProductFilterSearch('');
        setFormProductSearch('');
      }
    } catch (error) {
      toast.error('Failed to fetch products');
    } finally {
      setLoadingProducts(false);
    }
  };

  // Single unified effect to handle all data fetching
  useEffect(() => {
    // Clear any existing search timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
      searchTimeoutRef.current = null;
    }

    // Determine fetch parameters
    let fetchPage = currentPage;
    let fetchLimit = itemsPerPage;
    let fetchSearch = searchQuery;
    let fetchProductId = selectedProductId;
    let fetchDate = '';
    
    // Build date filter from month and year
    if (selectedMonth && selectedYear) {
      fetchDate = `${selectedMonth}/${selectedYear}`;
    }

    // If search query exists, debounce and reset to page 1
    if (searchQuery.trim() !== '') {
      searchTimeoutRef.current = setTimeout(() => {
        fetchPage = 1;
        fetchSearch = searchQuery;
        const params = { page: fetchPage, limit: fetchLimit, search: fetchSearch, product_id: fetchProductId, date: fetchDate };
        
        // Only fetch if parameters changed and not already fetching
        if (!isFetchingRef.current && 
            (lastParamsRef.current.page !== params.page || 
             lastParamsRef.current.limit !== params.limit || 
             lastParamsRef.current.search !== params.search ||
             lastParamsRef.current.product_id !== params.product_id ||
             lastParamsRef.current.date !== params.date)) {
          fetchMarketingSpends(fetchPage, fetchLimit, fetchSearch, fetchProductId, fetchDate);
        }
      }, 500);
    } else {
      // No search query - fetch immediately
      const params = { page: fetchPage, limit: fetchLimit, search: fetchSearch, product_id: fetchProductId, date: fetchDate };
      
      // Only fetch if parameters changed and not already fetching
      if (!isFetchingRef.current && 
          (lastParamsRef.current.page !== params.page || 
           lastParamsRef.current.limit !== params.limit || 
           lastParamsRef.current.search !== params.search ||
           lastParamsRef.current.product_id !== params.product_id ||
           lastParamsRef.current.date !== params.date)) {
        fetchMarketingSpends(fetchPage, fetchLimit, fetchSearch, fetchProductId, fetchDate);
      }
    }

    // Cleanup
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
        searchTimeoutRef.current = null;
      }
    };
  }, [currentPage, itemsPerPage, searchQuery, selectedProductId, selectedMonth, selectedYear]);

  const fetchMarketingSpends = async (page = 1, limit = 10, search = '', product_id = '', date = '', forceRefresh = false) => {
    if (isFetchingRef.current && !forceRefresh) {
      return;
    }

    // Check if same parameters
    if (!forceRefresh && 
        lastParamsRef.current.page === page && 
        lastParamsRef.current.limit === limit && 
        lastParamsRef.current.search === search &&
        lastParamsRef.current.product_id === product_id &&
        lastParamsRef.current.date === date) {
      return;
    }

    isFetchingRef.current = true;
    lastParamsRef.current = { page, limit, search, product_id, date };

    try {
      setLoading(true);
      const response = await getAllMarketingSpends(page, limit, search, product_id, date);
      
      if (response.status && response.data) {
        setMarketingSpends(response.data.marketing_spends || []);
        setTotalSpends(response.data.total_count || 0);
        setTotalPages(response.data.total_pages || 1);
        setCurrentPage(response.data.page || page);
      } else {
        setMarketingSpends([]);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to fetch marketing spends');
      setMarketingSpends([]);
      lastParamsRef.current = { page: null, limit: null, search: null, product_id: null, date: null };
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.product_id.trim()) {
      errors.product_id = 'Product is required';
    }
    
    if (!formData.date.trim()) {
      errors.date = 'Date is required';
    } else {
      // Validate date format (should be like "1/2024" or "12/2024")
      const datePattern = /^\d{1,2}\/\d{4}$/;
      if (!datePattern.test(formData.date.trim())) {
        errors.date = 'Date must be in format: MM/YYYY (e.g., 1/2024 or 12/2024)';
      }
    }
    
    if (!formData.amount.trim()) {
      errors.amount = 'Amount is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);
      
      if (editingSpend) {
        await updateMarketingSpend(editingSpend._id, formData);
        toast.success('Marketing spend updated successfully!');
      } else {
        await createMarketingSpend(formData);
        toast.success('Marketing spend created successfully!');
      }
      
      setShowForm(false);
      setEditingSpend(null);
      setFormData({
        product_id: '',
        date: '',
        description: '',
        amount: '',
      });
      setFormErrors({});
      
      // Build date filter
      const dateFilter = selectedMonth && selectedYear ? `${selectedMonth}/${selectedYear}` : '';
      
      // Refresh list
      fetchMarketingSpends(currentPage, itemsPerPage, searchQuery, selectedProductId, dateFilter, true);
    } catch (error) {
      toast.error(error.message || 'Failed to save marketing spend');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (spend) => {
    setEditingSpend(spend);
    setFormData({
      product_id: spend.product_id?._id || spend.product_id || '',
      date: spend.date || '',
      description: spend.description || '',
      amount: spend.amount || '',
    });
    setFormErrors({});
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    try {
      await deleteMarketingSpend(id);
      toast.success('Marketing spend deleted successfully!');
      setDeleteConfirm(null);
      const dateFilter = selectedMonth && selectedYear ? `${selectedMonth}/${selectedYear}` : '';
      fetchMarketingSpends(currentPage, itemsPerPage, searchQuery, selectedProductId, dateFilter, true);
    } catch (error) {
      toast.error(error.message || 'Failed to delete marketing spend');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingSpend(null);
    setFormData({
      product_id: '',
      date: '',
      description: '',
      amount: '',
    });
    setFormErrors({});
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <IndianRupee className="w-7 h-7" style={{ color: '#4EA674' }} />
            Marketing Spend Management
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Track marketing expenses for products by month
          </p>
        </div>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingSpend(null);
            setFormData({
              product_id: selectedProductId || '',
              date: '',
              description: '',
              amount: '',
            });
            setFormErrors({});
          }}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Marketing Spend
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Product Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Filter by Product
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setProductFilterOpen((prev) => !prev)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <span className="truncate">
                  {selectedProductId
                    ? products.find((p) => (p._id || p.id) === selectedProductId)?.name ||
                      'Selected Product'
                    : 'All Products'}
                </span>
                <svg
                  className={`w-4 h-4 text-gray-400 transform transition-transform ${
                    productFilterOpen ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {productFilterOpen && (
                <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                  {/* Search inside dropdown */}
                  <div className="p-2 border-b border-gray-200 sticky top-0 bg-white">
                    <input
                      type="text"
                      value={productFilterSearch}
                      onChange={(e) => setProductFilterSearch(e.target.value)}
                      placeholder="Search products..."
                      className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-green-500"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedProductId('');
                      setCurrentPage(1);
                      setProductFilterOpen(false);
                    }}
                    className={`w-full px-3 py-2 text-sm text-left hover:bg-gray-50 ${
                      !selectedProductId ? 'bg-green-50 text-green-700 font-medium' : 'text-gray-700'
                    }`}
                  >
                    All Products
                  </button>
                  {products
                    .filter((product) => {
                      if (!productFilterSearch.trim()) return true;
                      const term = productFilterSearch.toLowerCase();
                      return (
                        (product.name || '').toLowerCase().includes(term) ||
                        (product.SKU || '').toLowerCase().includes(term)
                      );
                    })
                    .map((product) => {
                    const id = product._id || product.id;
                    const isActive = selectedProductId === id;
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => {
                          setSelectedProductId(id);
                          setCurrentPage(1);
                          setProductFilterOpen(false);
                        }}
                        className={`w-full px-3 py-2 text-sm text-left hover:bg-gray-50 ${
                          isActive ? 'bg-green-50 text-green-700 font-medium' : 'text-gray-700'
                        }`}
                      >
                        {product.name} ({product.SKU})
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Month Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Filter by Month
            </label>
            <select
              value={selectedMonth}
              onChange={(e) => {
                setSelectedMonth(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">All Months</option>
              <option value="1">January</option>
              <option value="2">February</option>
              <option value="3">March</option>
              <option value="4">April</option>
              <option value="5">May</option>
              <option value="6">June</option>
              <option value="7">July</option>
              <option value="8">August</option>
              <option value="9">September</option>
              <option value="10">October</option>
              <option value="11">November</option>
              <option value="12">December</option>
            </select>
          </div>

          {/* Year Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Filter by Year
            </label>
            <select
              value={selectedYear}
              onChange={(e) => {
                setSelectedYear(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">All Years</option>
              {Array.from({ length: 3 }, (_, i) => {
                const year = new Date().getFullYear() - i;
                return (
                  <option key={year} value={year}>
                    {year}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by description, amount..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div
            className="bg-white rounded-lg shadow-2xl p-6 border border-gray-200 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingSpend ? 'Edit Marketing Spend' : 'Add Marketing Spend'}
              </h2>
              <button
                onClick={handleCancel}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Product Selection */}
              <div>
                <label
                  htmlFor="product_id"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Product <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => !loadingProducts && setFormProductDropdownOpen((prev) => !prev)}
                    className={`w-full px-3 py-2 border rounded-lg text-sm bg-white text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                      formErrors.product_id
                        ? 'border-red-300 bg-red-50'
                        : 'border-gray-300'
                    } ${loadingProducts ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <span className="truncate text-gray-900">
                      {formData.product_id
                        ? products.find((p) => (p._id || p.id) === formData.product_id)?.name ||
                          'Selected Product'
                        : 'Select a product'}
                    </span>
                    <svg
                      className={`w-4 h-4 text-gray-400 transform transition-transform ${
                        formProductDropdownOpen ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {formProductDropdownOpen && !loadingProducts && (
                    <div className="absolute z-30 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                      {/* Search inside form product dropdown */}
                      <div className="p-2 border-b border-gray-200 sticky top-0 bg-white">
                        <input
                          type="text"
                          value={formProductSearch}
                          onChange={(e) => setFormProductSearch(e.target.value)}
                          placeholder="Search products..."
                          className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-green-500"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setFormData((prev) => ({ ...prev, product_id: '' }));
                        }}
                        className={`w-full px-3 py-2 text-sm text-left hover:bg-gray-50 ${
                          !formData.product_id ? 'bg-green-50 text-green-700 font-medium' : 'text-gray-700'
                        }`}
                      >
                        Select a product
                      </button>
                      {products
                        .filter((product) => {
                          if (!formProductSearch.trim()) return true;
                          const term = formProductSearch.toLowerCase();
                          return (
                            (product.name || '').toLowerCase().includes(term) ||
                            (product.SKU || '').toLowerCase().includes(term)
                          );
                        })
                        .map((product) => {
                        const id = product._id || product.id;
                        const isActive = formData.product_id === id;
                        return (
                          <button
                            key={id}
                            type="button"
                            onClick={() => {
                              setFormData((prev) => ({ ...prev, product_id: id }));
                              if (formErrors.product_id) {
                                setFormErrors((prev) => ({ ...prev, product_id: '' }));
                              }
                              setFormProductDropdownOpen(false);
                            }}
                            className={`w-full px-3 py-2 text-sm text-left hover:bg-gray-50 ${
                              isActive ? 'bg-green-50 text-green-700 font-medium' : 'text-gray-700'
                            }`}
                          >
                            {product.name} ({product.SKU})
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
                {formErrors.product_id && (
                  <p className="mt-1.5 text-xs text-red-600">{formErrors.product_id}</p>
                )}
              </div>

              {/* Date */}
              <div>
                <label
                  htmlFor="date"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Month/Year <span className="text-red-500">*</span>
                  <span className="text-xs text-gray-500 ml-2">(Format: MM/YYYY, e.g., 1/2024 or 12/2024)</span>
                </label>
                <input
                  type="text"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  placeholder="e.g., 1/2024 or 12/2024"
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    formErrors.date
                      ? 'border-red-300 bg-red-50'
                      : 'border-gray-300 bg-white'
                  }`}
                />
                {formErrors.date && (
                  <p className="mt-1.5 text-xs text-red-600">{formErrors.date}</p>
                )}
              </div>

              {/* Amount */}
              <div>
                <label
                  htmlFor="amount"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Amount <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="amount"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  placeholder="Enter amount"
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    formErrors.amount
                      ? 'border-red-300 bg-red-50'
                      : 'border-gray-300 bg-white'
                  }`}
                />
                {formErrors.amount && (
                  <p className="mt-1.5 text-xs text-red-600">{formErrors.amount}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Enter description (optional)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              {/* Form Actions */}
              <div className="flex items-center gap-3 pt-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {editingSpend ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      {editingSpend ? 'Update' : 'Create'}
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={submitting}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-green-600 mb-3" />
            <span className="text-sm font-medium text-gray-700">Loading marketing spends...</span>
          </div>
        ) : marketingSpends.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <IndianRupee className="w-12 h-12 text-gray-300 mb-3" />
            <p className="text-base font-medium text-gray-900">No marketing spends found</p>
            <p className="text-sm text-gray-500 mt-1">
              {searchQuery || selectedProductId
                ? 'Try adjusting your filters'
                : 'Get started by adding your first marketing spend'}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Month/Year
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {marketingSpends.map((spend) => (
                    <tr key={spend._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {spend.product_id?.name || 'N/A'}
                            </p>
                            <p className="text-xs text-gray-500">
                              {spend.product_id?.SKU || ''}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-900">{spend.date || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <IndianRupee className="w-4 h-4 text-green-600" />
                          <span className="text-sm font-medium text-gray-900">{spend.amount || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600 max-w-xs truncate">
                            {spend.description || '-'}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(spend)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(spend._id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing {((currentPage - 1) * itemsPerPage) + 1} to{' '}
                  {Math.min(currentPage * itemsPerPage, totalSpends)} of {totalSpends} results
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 border border-gray-300 rounded-lg hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-sm text-gray-700 px-3">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 border border-gray-300 rounded-lg hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl p-6 border border-gray-200 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Marketing Spend</h3>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to delete this marketing spend? This action cannot be undone.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm"
              >
                Delete
              </button>
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketingSpendManagement;

