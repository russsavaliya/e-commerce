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

  useEffect(() => {
    fetchProducts(pagination.page, pagination.limit);
  }, []);

  const fetchProducts = async (page = 1, limit = 10) => {
    try {
      setLoading(true);
      // Clear image errors when fetching new products
      setImageErrors(new Set());
      const response = await getAllProducts(page, limit);
      
      if (response.status && response.data) {
        const productData = response.data.productData || [];
        setProducts(productData);
        setPagination({
          page: response.data.page || page,
          limit: response.data.limit || limit,
          total_count: response.data.total_count || 0,
          total_pages: response.data.total_pages || 0,
        });
      } else {
        setProducts([]);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to fetch products');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.total_pages) {
      fetchProducts(newPage, pagination.limit);
    }
  };

  const filteredProducts = products.filter((product) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      product.name?.toLowerCase().includes(searchLower) ||
      product.SKU?.toLowerCase().includes(searchLower) ||
      product.category?.some(cat => cat?.toLowerCase().includes(searchLower))
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-3 text-gray-600">Loading products...</span>
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
                <Package className="w-5 h-5 text-blue-600" />
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
              placeholder="Search products by name, SKU, or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        {filteredProducts.length === 0 ? (
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
                <thead className="bg-gray-50">
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
                  {filteredProducts.map((product) => (
                    <tr 
                      key={product._id || product.id} 
                      className="hover:bg-blue-50/50 transition-colors cursor-pointer"
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

            {/* Pagination */}
            {pagination.total_pages > 1 && (
              <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-600">
                    Showing page <span className="font-semibold text-gray-900">{pagination.page}</span> of{' '}
                    <span className="font-semibold text-gray-900">{pagination.total_pages}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                      className="px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-white hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Previous
                    </button>
                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page >= pagination.total_pages}
                      className="px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-white hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                    >
                      Next
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

