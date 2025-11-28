/**
 * Product List Page
 * Display all products with pagination
 */

import React, { useState, useEffect } from 'react';
import { Package, Loader2, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getAllProducts } from '../../services/admin/productService';
import { API_BASE_URL } from '../../utils/constants';

// Helper function to normalize image paths (convert backslashes to forward slashes for URLs)
const normalizeImagePath = (imagePath) => {
  if (!imagePath) return '';
  // If already a full URL, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  // Convert Windows backslashes to forward slashes for URLs
  const normalizedPath = imagePath.replace(/\\/g, '/');
  // Remove leading 'public/' if present (since express.static serves from public folder)
  const cleanPath = normalizedPath.startsWith('public/')
    ? normalizedPath.replace('public/', '')
    : normalizedPath;
  return `${API_BASE_URL}/${cleanPath}`;
};

const ProductList = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total_count: 0,
    total_pages: 0,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [imageErrors, setImageErrors] = useState(new Set()); // Track which images failed to load
  const searchTimeoutRef = React.useRef(null);
  const isFetchingRef = React.useRef(false);
  const lastParamsRef = React.useRef({ page: null, limit: null, search: null });

  // Single unified effect to handle all data fetching
  useEffect(() => {
    // Clear any existing search timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
      searchTimeoutRef.current = null;
    }

    // Determine fetch parameters
    let fetchPage = pagination.page;
    let fetchLimit = pagination.limit;
    let fetchSearch = searchTerm;

    // If search term exists, debounce and reset to page 1
    if (searchTerm.trim() !== '') {
      searchTimeoutRef.current = setTimeout(() => {
        fetchPage = 1;
        fetchSearch = searchTerm;
        const params = { page: fetchPage, limit: fetchLimit, search: fetchSearch };

        // Only fetch if parameters changed and not already fetching
        if (!isFetchingRef.current &&
          (lastParamsRef.current.page !== params.page ||
            lastParamsRef.current.limit !== params.limit ||
            lastParamsRef.current.search !== params.search)) {
          fetchProducts(fetchPage, fetchLimit, fetchSearch);
        }
      }, 500);
    } else {
      // No search term - fetch immediately
      const params = { page: fetchPage, limit: fetchLimit, search: fetchSearch };

      // Only fetch if parameters changed and not already fetching
      if (!isFetchingRef.current &&
        (lastParamsRef.current.page !== params.page ||
          lastParamsRef.current.limit !== params.limit ||
          lastParamsRef.current.search !== params.search)) {
        fetchProducts(fetchPage, fetchLimit, fetchSearch);
      }
    }

    // Cleanup
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
        searchTimeoutRef.current = null;
      }
    };
  }, [pagination.page, pagination.limit, searchTerm]);

  const fetchProducts = async (page = 1, limit = 10, search = '') => {
    // Prevent duplicate calls
    if (isFetchingRef.current) {
      return;
    }

    // Check if same parameters
    if (lastParamsRef.current.page === page &&
      lastParamsRef.current.limit === limit &&
      lastParamsRef.current.search === search) {
      return;
    }

    isFetchingRef.current = true;
    lastParamsRef.current = { page, limit, search };

    try {
      setLoading(true);
      // Clear image errors when fetching new products
      setImageErrors(new Set());
      const response = await getAllProducts(page, limit, search);

      if (response.status && response.data) {
        const productData = response.data.productData || [];
        setProducts(productData);

        // Update pagination state only if values actually changed
        const newPage = response.data.page || page;
        const newLimit = response.data.limit || limit;
        const newTotalCount = response.data.total_count || 0;
        const newTotalPages = response.data.total_pages || 0;

        setPagination(prev => {
          if (prev.page !== newPage || prev.limit !== newLimit ||
            prev.total_count !== newTotalCount ||
            prev.total_pages !== newTotalPages) {
            return {
              page: newPage,
              limit: newLimit,
              total_count: newTotalCount,
              total_pages: newTotalPages,
            };
          }
          return prev;
        });
      } else {
        setProducts([]);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to fetch products');
      setProducts([]);
      // Reset last params on error so we can retry
      lastParamsRef.current = { page: null, limit: null, search: null };
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.total_pages) {
      fetchProducts(newPage, pagination.limit, searchTerm);
    }
  };

  const handleLimitChange = (e) => {
    const newLimit = Number(e.target.value);
    const newPage = 1;
    // Update local pagination state
    setPagination(prev => ({
      ...prev,
      limit: newLimit,
      page: newPage,
    }));
    // Fetch with new settings
    fetchProducts(newPage, newLimit, searchTerm);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    // Reset to page 1 when search changes
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 min-h-[400px]">
        <Loader2 className="w-10 h-10 animate-spin text-green-600 mb-4" />
        <span className="text-lg font-medium text-gray-700">Loading products...</span>
        <span className="text-sm text-gray-500 mt-2">Please wait while we fetch the data</span>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      {/* Header with Search */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Package className="w-5 h-5 text-green-600" />
                Product List
              </h1>
              <p className="text-xs text-gray-500 mt-1">
                Manage and view all your products
              </p>
            </div>
            <div className="text-sm text-gray-600">
              <span className="font-semibold text-gray-900">{pagination.total_count}</span> total products
            </div>
          </div>
        </div>
        <div className="p-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search products by name or SKU..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        {products.length === 0 ? (
          <div className="text-center py-16">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-base font-semibold text-gray-700 mb-1">No products found</p>
            <p className="text-sm text-gray-500">
              {searchTerm ? 'Try adjusting your search terms' : 'Start by adding your first product'}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-green-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      SKU
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Price
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {products.map((product) => (
                    <tr
                      key={product._id || product.id}
                      className="hover:bg-green-50/50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/admin/products/edit/${product._id || product.id}`)}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-md border border-gray-200 bg-gray-100 flex items-center justify-center flex-shrink-0 relative overflow-hidden">
                            {product.images && product.images.length > 0 && !imageErrors.has(product._id || product.id) ? (
                              <img
                                src={normalizeImagePath(product.images[0])}
                                alt={product.name || 'Product'}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  console.error('Image load error:', product.images[0], 'Normalized:', normalizeImagePath(product.images[0]));
                                  // Add product ID to error set to show default icon
                                  setImageErrors(prev => new Set([...prev, product._id || product.id]));
                                  e.target.style.display = 'none';
                                }}
                              />
                            ) : null}
                            {/* Default icon - shown when no image, image fails to load, or image is in error set */}
                            {(!product.images || product.images.length === 0 || imageErrors.has(product._id || product.id)) && (
                              <Package className="w-5 h-5 text-gray-400" />
                            )}
                          </div>
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {product.name || 'N/A'}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-600">
                          {product.SKU || 'N/A'}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-600">
                          {Array.isArray(product.category)
                            ? product.category.join(', ')
                            : product.category || 'N/A'}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm font-semibold text-gray-900">
                          ₹{product.selling_price || 0}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination – same layout as CategoryManagement */}
            {pagination.total_pages > 1 && (
              <div className="bg-white border-t border-gray-200 px-4 py-3">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  {/* Items per page selector */}
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-700">Items per page:</label>
                    <select
                      value={pagination.limit}
                      onChange={handleLimitChange}
                      className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                    </select>
                  </div>

                  {/* Page info */}
                  <div className="text-sm text-gray-700">
                    Showing{' '}
                    <span className="font-medium">
                      {((pagination.page - 1) * pagination.limit) + 1}
                    </span>{' '}
                    to{' '}
                    <span className="font-medium">
                      {Math.min(pagination.page * pagination.limit, pagination.total_count)}
                    </span>{' '}
                    of{' '}
                    <span className="font-medium">{pagination.total_count}</span> products
                  </div>

                  {/* Pagination buttons with page numbers */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                      className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label="Previous page"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    {/* Page numbers */}
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, pagination.total_pages) }, (_, i) => {
                        let pageNum;
                        if (pagination.total_pages <= 5) {
                          pageNum = i + 1;
                        } else if (pagination.page <= 3) {
                          pageNum = i + 1;
                        } else if (pagination.page >= pagination.total_pages - 2) {
                          pageNum = pagination.total_pages - 4 + i;
                        } else {
                          pageNum = pagination.page - 2 + i;
                        }

                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${pagination.page === pageNum
                                ? 'bg-green-600 text-white'
                                : 'border border-gray-300 hover:bg-gray-50'
                              }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.total_pages}
                      className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label="Next page"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ProductList;

