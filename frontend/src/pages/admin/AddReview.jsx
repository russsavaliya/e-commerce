import React, { useState, useEffect, useRef } from 'react';
import { Star, Loader2, Save, X, Search, ChevronDown, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { addReview } from '../../services/admin/reviewService';
import { getAllProducts } from '../../services/admin/productService';
import { ROUTES, API_BASE_URL } from '../../utils/constants';
import toast from 'react-hot-toast';

// Helper function to normalize image paths
const normalizeImagePath = (imagePath) => {
  if (!imagePath) return '';
  // If already a full URL (Cloudinary or other CDN), return as is
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

const AddReview = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [products, setProducts] = useState([]);
  const [productDropdownOpen, setProductDropdownOpen] = useState(false);
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const productDropdownRef = useRef(null);

  const [formData, setFormData] = useState({
    productId: '',
    name: '',
    email: '',
    rating: 5,
    comment: '',
  });

  const [errors, setErrors] = useState({});

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (productDropdownRef.current && !productDropdownRef.current.contains(event.target)) {
        setProductDropdownOpen(false);
        setProductSearchTerm('');
      }
    };

    if (productDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [productDropdownOpen]);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoadingProducts(true);
      try {
        const response = await getAllProducts(1, 1000, '');
        if (response.status && response.data) {
          // Backend returns productData, not products
          setProducts(response.data.productData || response.data.products || []);
        }
      } catch (err) {
        toast.error('Failed to load products');
      } finally {
        setLoadingProducts(false);
      }
    };
    fetchProducts();
  }, []);

  // Filter products based on search term
  const filteredProducts = products.filter((product) =>
    product.name?.toLowerCase().includes(productSearchTerm.toLowerCase())
  );

  // Get selected product name
  const selectedProduct = products.find((p) => p._id === formData.productId);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleProductSelect = (productId) => {
    setFormData((prev) => ({
      ...prev,
      productId: productId,
    }));
    setProductDropdownOpen(false);
    setProductSearchTerm('');
    if (errors.productId) {
      setErrors((prev) => ({
        ...prev,
        productId: '',
      }));
    }
  };

  const handleRatingClick = (rating) => {
    setFormData((prev) => ({
      ...prev,
      rating: rating,
    }));
    if (errors.rating) {
      setErrors((prev) => ({
        ...prev,
        rating: '',
      }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.productId) {
      newErrors.productId = 'Product is required';
    }

    if (!formData.name || formData.name.trim() === '') {
      newErrors.name = 'Name is required';
    }

    if (!formData.rating || formData.rating < 1 || formData.rating > 5) {
      newErrors.rating = 'Rating is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        productId: formData.productId,
        name: formData.name.trim(),
        email: formData.email?.trim() || undefined,
        rating: parseInt(formData.rating),
        comment: formData.comment?.trim() || '',
      };

      const response = await addReview(payload);
      if (response.status) {
        toast.success('Review added successfully');
        navigate(ROUTES.ADMIN_REVIEWS_LIST);
      } else {
        toast.error(response.message || 'Failed to add review');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to add review');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      const isFilled = i <= rating;
      stars.push(
        <button
          key={i}
          type="button"
          onClick={() => handleRatingClick(i)}
          className={`transition-all duration-200 hover:scale-110 ${
            isFilled
              ? 'text-green-600'
              : 'text-gray-300 hover:text-green-600'
          }`}
        >
          <Star 
            className="w-5 h-5" 
            fill={isFilled ? 'currentColor' : 'none'}
            strokeWidth={isFilled ? 0 : 1.5}
          />
        </button>
      );
    }
    return <div className="flex items-center gap-1.5">{stars}</div>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Star className="w-5 h-5 text-green-600" />
              Add New Review
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Create a new customer review for a product
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
          {/* Product Selection */}
          <div className="product-dropdown-container" ref={productDropdownRef}>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Product <span className="text-red-500">*</span>
            </label>
            {loadingProducts ? (
              <div className="flex items-center gap-2 text-gray-500">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Loading products...</span>
              </div>
            ) : (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setProductDropdownOpen(!productDropdownOpen)}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-left flex items-center justify-between gap-3 ${
                    errors.productId ? 'border-red-300' : 'border-gray-300'
                  } ${!formData.productId ? 'text-gray-500' : 'text-gray-900'}`}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {selectedProduct && selectedProduct.images && selectedProduct.images.length > 0 ? (
                      <img
                        src={normalizeImagePath(selectedProduct.images[0])}
                        alt={selectedProduct.name}
                        className="w-10 h-10 object-cover rounded border border-gray-200 flex-shrink-0"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div
                      className={`w-10 h-10 bg-gray-100 rounded border border-gray-200 flex items-center justify-center flex-shrink-0 ${
                        selectedProduct && selectedProduct.images && selectedProduct.images.length > 0
                          ? 'hidden'
                          : ''
                      }`}
                    >
                      <Package className="w-5 h-5 text-gray-400" />
                    </div>
                    <span className="truncate">
                      {selectedProduct ? selectedProduct.name : 'Select a product'}
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ${
                      productDropdownOpen ? 'transform rotate-180' : ''
                    }`}
                  />
                </button>

                {productDropdownOpen && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-64 overflow-hidden">
                    {/* Search Input */}
                    <div className="p-2 border-b border-gray-200">
                      <div className="relative">
                        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          placeholder="Search products..."
                          value={productSearchTerm}
                          onChange={(e) => setProductSearchTerm(e.target.value)}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          autoFocus
                        />
                      </div>
                    </div>

                    {/* Product List */}
                    <div className="overflow-y-auto max-h-48">
                      {filteredProducts.length === 0 ? (
                        <div className="px-4 py-3 text-sm text-gray-500 text-center">
                          No products found
                        </div>
                      ) : (
                        filteredProducts.map((product) => (
                          <button
                            key={product._id}
                            type="button"
                            onClick={() => handleProductSelect(product._id)}
                            className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 transition-colors flex items-center gap-3 ${
                              formData.productId === product._id
                                ? 'bg-green-50 text-green-700 font-medium'
                                : 'text-gray-900'
                            }`}
                          >
                            {product.images && product.images.length > 0 ? (
                              <img
                                src={normalizeImagePath(product.images[0])}
                                alt={product.name}
                                className="w-10 h-10 object-cover rounded border border-gray-200 flex-shrink-0"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'flex';
                                }}
                              />
                            ) : null}
                            <div
                              className={`w-10 h-10 bg-gray-100 rounded border border-gray-200 flex items-center justify-center flex-shrink-0 ${
                                product.images && product.images.length > 0 ? 'hidden' : ''
                              }`}
                            >
                              <Package className="w-5 h-5 text-gray-400" />
                            </div>
                            <span className="truncate flex-1">{product.name}</span>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
            {errors.productId && (
              <p className="mt-1 text-sm text-red-600">{errors.productId}</p>
            )}
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Customer Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter customer name"
              className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                errors.name ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Email (Optional)
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter customer email"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>

          {/* Rating */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Rating <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-4">
              {renderStars(formData.rating)}
              <span className="text-sm text-gray-600">
                {formData.rating} / 5
              </span>
            </div>
            {errors.rating && (
              <p className="mt-1 text-sm text-red-600">{errors.rating}</p>
            )}
          </div>

          {/* Comment */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Review Comment (Optional)
            </label>
            <textarea
              name="comment"
              value={formData.comment}
              onChange={handleChange}
              placeholder="Enter review comment"
              rows={5}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate(ROUTES.ADMIN_REVIEWS_LIST)}
            className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Add Review
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddReview;

