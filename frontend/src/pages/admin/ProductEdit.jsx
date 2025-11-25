/**
 * Product Edit Page
 * View and edit existing product with all details
 */

import React, { useState, useEffect } from 'react';
import {
  Save,
  X,
  Loader2,
  Plus,
  Trash2,
  Upload,
  Package,
  DollarSign,
  Tag,
  Layers,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Search,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';
import { getProductById, updateProduct } from '../../services/admin/productService';
import { getAllCategories } from '../../services/admin/categoryService';
import { getAllAttributes } from '../../services/admin/attributeService';
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

const ProductEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  // Loading states
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingAttributes, setLoadingAttributes] = useState(false);

  // Data states
  const [categories, setCategories] = useState([]);
  const [attributes, setAttributes] = useState([]);

  // Form data
  const [formData, setFormData] = useState({
    name: '',
    SKU: '',
    description: '',
    category: '',
    status: 'ACTIVE',
    selling_price: '',
    original_price: '',
    cost_price: '',
    quantity: '',
    productImages: [], // Array of File objects (new images)
    productImagePreviews: [], // Array of preview URLs (new images)
    existingImages: [], // Array of existing image URLs from server
  });

  // Attributes state - array of { attributeId, selectedValueIds: [] }
  const [productAttributes, setProductAttributes] = useState([]);

  // Variants state - array of variant objects
  const [variants, setVariants] = useState([]);
  const [showVariants, setShowVariants] = useState(false);
  // Track which variants are in attribute selection mode
  const [variantAttributeMode, setVariantAttributeMode] = useState({});

  // Form errors
  const [formErrors, setFormErrors] = useState({});

  // Category dropdown state
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [categorySearchTerm, setCategorySearchTerm] = useState('');

  // Fetch product data and initial data on mount
  useEffect(() => {
    fetchInitialData();
  }, [id]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchProduct(),
        fetchCategories(),
        fetchAttributes()
      ]);
    } catch (error) {
      toast.error('Failed to load product data');
    } finally {
      setLoading(false);
    }
  };

  const fetchProduct = async () => {
    try {
      const response = await getProductById(id);
      
      console.log('Full Product API Response:', JSON.stringify(response, null, 2));
      
      // Backend returns: { data: [...], message: "...", success: true }
      // getProductById returns response.data from axios, so response = { data: [...], message: "...", success: true }
      let productData = [];
      
      if (response && response.data) {
        // If response.data is an array, use it directly
        if (Array.isArray(response.data)) {
          productData = response.data;
        } 
        // If response.data.data exists (nested), use that
        else if (response.data.data && Array.isArray(response.data.data)) {
          productData = response.data.data;
        }
      } else if (Array.isArray(response)) {
        // If response itself is an array
        productData = response;
      }
      
      console.log('Extracted Product Data:', productData);
      
      if (Array.isArray(productData) && productData.length > 0) {
        const product = productData[0];
        
        console.log('Product Object:', product);
        
        // Set basic form data
        setFormData({
          name: product.name || '',
          SKU: product.SKU || '',
          description: product.description || '',
          category: product.category?._id || product.category || '',
          status: product.status || 'ACTIVE',
          selling_price: product.selling_price || '',
          original_price: product.original_price || '',
          cost_price: product.cost_price || '',
          quantity: product.quantity || '',
          productImages: [],
          productImagePreviews: [],
          existingImages: product.images || [], // Store original paths, normalize only for display
        });

        // Set product attributes
        if (product.attributesvalues && Array.isArray(product.attributesvalues)) {
          const formattedAttributes = product.attributesvalues.map((attr) => ({
            attributeId: attr._id,
            selectedValueIds: attr.values?.map(v => v._id) || [],
          }));
          setProductAttributes(formattedAttributes);
        }

        // Set variants
        if (product.variants && Array.isArray(product.variants) && product.variants.length > 0) {
          setShowVariants(true);
          const formattedVariants = product.variants.map((variant) => ({
            variant_name: variant.variant_name || '',
            variant_SKU: variant.variant_SKU || '',
            variant_price: variant.variant_price || '',
            variant_image: null, // New file if uploaded
            variant_image_preview: variant.variant_image 
              ? normalizeImagePath(variant.variant_image)
              : null,
            variant_image_existing: variant.variant_image || null, // Existing image URL
            variant_attributes: variant.variant_attributes?.map((vAttr) => ({
              attribute_id: vAttr.attribute_id,
              value_id: vAttr.value_id,
            })) || [],
            quantity: variant.quantity || '',
            status: variant.status || 'ACTIVE',
          }));
          setVariants(formattedVariants);
        }
        setLoading(false);
      } else {
        console.error('Product data not found in response:', response);
        toast.error('Product not found');
        setLoading(false);
        navigate('/admin/products/list');
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error(error.message || 'Failed to fetch product');
      setLoading(false);
      navigate('/admin/products/list');
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (categoryDropdownOpen && !event.target.closest('.category-dropdown-container')) {
        setCategoryDropdownOpen(false);
        setCategorySearchTerm('');
      }
    };

    if (categoryDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [categoryDropdownOpen]);

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      const data = await getAllCategories(1, 1000);
      const categoriesArray = Array.isArray(data.data?.exist_category)
        ? data.data.exist_category
        : Array.isArray(data.data)
          ? data.data
          : [];
      setCategories(categoriesArray);
    } catch (error) {
      toast.error('Failed to fetch categories');
      setCategories([]);
    } finally {
      setLoadingCategories(false);
    }
  };

  const fetchAttributes = async () => {
    try {
      setLoadingAttributes(true);
      const data = await getAllAttributes(1, 1000);
      const attributesArray = Array.isArray(data.data?.attributes)
        ? data.data.attributes
        : Array.isArray(data.data)
          ? data.data
          : Array.isArray(data.attributes)
            ? data.attributes
            : Array.isArray(data)
              ? data
              : [];
      setAttributes(attributesArray);
    } catch (error) {
      toast.error('Failed to fetch attributes');
      setAttributes([]);
    } finally {
      setLoadingAttributes(false);
    }
  };

  // Handle basic form field changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Handle product images upload
  const handleProductImagesChange = (e) => {
    const files = Array.from(e.target.files);
    const newPreviews = [];
    const newFiles = [];

    files.forEach((file) => {
      if (file.type.startsWith('image/')) {
        newFiles.push(file);
        newPreviews.push(URL.createObjectURL(file));
      }
    });

    setFormData((prev) => ({
      ...prev,
      productImages: [...prev.productImages, ...newFiles],
      productImagePreviews: [...prev.productImagePreviews, ...newPreviews],
    }));
  };

  const removeProductImage = (index, isExisting = false) => {
    if (isExisting) {
      // Remove existing image
      setFormData((prev) => {
        const newExisting = [...prev.existingImages];
        newExisting.splice(index, 1);
        return {
          ...prev,
          existingImages: newExisting,
        };
      });
    } else {
      // Remove new image
      setFormData((prev) => {
        const newImages = [...prev.productImages];
        const newPreviews = [...prev.productImagePreviews];
        if (newPreviews[index]) {
          URL.revokeObjectURL(newPreviews[index]);
        }
        newImages.splice(index, 1);
        newPreviews.splice(index, 1);
        return {
          ...prev,
          productImages: newImages,
          productImagePreviews: newPreviews,
        };
      });
    }
  };

  // Handle product attributes
  const addProductAttribute = () => {
    setProductAttributes((prev) => [
      ...prev,
      {
        attributeId: '',
        selectedValueIds: [],
      },
    ]);
  };

  const removeProductAttribute = (index) => {
    setProductAttributes((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAttributeChange = (index, attributeId) => {
    setProductAttributes((prev) => {
      const updated = [...prev];
      updated[index] = {
        attributeId: attributeId,
        selectedValueIds: [], // Reset selected values when attribute changes
      };
      return updated;
    });
  };

  const handleAttributeValueToggle = (attrIndex, valueId) => {
    setProductAttributes((prev) => {
      const updated = [...prev];
      const currentValueIds = updated[attrIndex].selectedValueIds || [];
      if (currentValueIds.includes(valueId)) {
        updated[attrIndex].selectedValueIds = currentValueIds.filter(
          (id) => id !== valueId
        );
      } else {
        updated[attrIndex].selectedValueIds = [...currentValueIds, valueId];
      }
      return updated;
    });
  };

  // Get attribute values for a given attribute ID
  const getAttributeValues = (attributeId) => {
    const attribute = attributes.find(
      (attr) => (attr._id || attr.id) === attributeId
    );
    return attribute?.values || [];
  };

  // Get available attributes for a variant (excluding already selected ones)
  const getAvailableAttributesForVariant = (variantIndex, currentAttrIndex) => {
    const variant = variants[variantIndex];
    if (!variant || !variant.variant_attributes) {
      return attributes;
    }
    
    const selectedAttributeIds = variant.variant_attributes
      .map((attr, idx) => idx !== currentAttrIndex ? attr.attribute_id : null)
      .filter(Boolean);
    
    return attributes.filter(
      (attr) => !selectedAttributeIds.includes(attr._id || attr.id)
    );
  };

  const generateVariantNameAndSKU = (variantAttributes) => {
    if (!variantAttributes || variantAttributes.length === 0) {
      return { name: '', sku: '' };
    }

    // Get all complete attribute-value pairs
    const completePairs = variantAttributes.filter(
      (attr) => attr.attribute_id && attr.value_id
    );

    if (completePairs.length === 0) {
      return { name: '', sku: '' };
    }

    // Build name: "Red-Puma" (just values separated by hyphens)
    const nameParts = [];
    const skuParts = [];

    completePairs.forEach((pair) => {
      const attribute = attributes.find(
        (a) => (a._id || a.id) === pair.attribute_id
      );
      const value = attribute?.values?.find(
        (v) => (v._id || v.id) === pair.value_id
      );

      if (attribute && value) {
        // For name: just the value (e.g., "Red")
        nameParts.push(value.value);
        // For SKU: uppercase value without spaces/special chars
        const skuValue = value.value
          .toUpperCase()
          .replace(/[^A-Z0-9]/g, '-')
          .substring(0, 15); // Limit length
        skuParts.push(skuValue);
      }
    });

    // Name format: "Red-Puma"
    const generatedName = nameParts.join('-');
    // SKU format: "PROD-RED-PUMA"
    const baseSKU = formData.SKU.trim() || 'PROD';
    const generatedSKU = skuParts.length > 0 
      ? `${baseSKU}-${skuParts.join('-')}` 
      : '';

    return { name: generatedName, sku: generatedSKU };
  };

  // Handle variants
  const addVariant = () => {
    setShowVariants(true);
    const newIndex = variants.length;
    setVariants((prev) => [
      ...prev,
      {
        variant_name: '',
        variant_SKU: '',
        variant_price: '',
        variant_image: null,
        variant_image_preview: null,
        variant_image_existing: null,
        variant_attributes: [],
        quantity: '',
        status: 'ACTIVE',
      },
    ]);
    setVariantAttributeMode((prev) => ({
      ...prev,
      [newIndex]: true,
    }));
  };

  const removeVariant = (index) => {
    setVariants((prev) => {
      const updated = [...prev];
      if (updated[index].variant_image_preview && !updated[index].variant_image_existing) {
        URL.revokeObjectURL(updated[index].variant_image_preview);
      }
      updated.splice(index, 1);
      return updated;
    });
    setVariantAttributeMode((prev) => {
      const updated = { ...prev };
      delete updated[index];
      const newMode = {};
      Object.keys(updated).forEach((key) => {
        const keyNum = parseInt(key);
        if (keyNum > index) {
          newMode[keyNum - 1] = updated[key];
        } else if (keyNum < index) {
          newMode[keyNum] = updated[key];
        }
      });
      return newMode;
    });
  };

  const continueVariantDetails = (variantIndex) => {
    setVariants((prev) => {
      const updated = [...prev];
      // Regenerate name and SKU when continuing to details
      const { name, sku } = generateVariantNameAndSKU(updated[variantIndex].variant_attributes);
      if (name) {
        updated[variantIndex].variant_name = name;
      }
      if (sku) {
        updated[variantIndex].variant_SKU = sku;
      }
      return updated;
    });
    setVariantAttributeMode((prev) => ({
      ...prev,
      [variantIndex]: false,
    }));
  };

  const handleVariantChange = (index, field, value) => {
    setVariants((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [field]: value,
      };
      return updated;
    });
  };

  const handleVariantImageChange = (index, e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const prev = variants[index];
      if (prev.variant_image_preview && !prev.variant_image_existing) {
        URL.revokeObjectURL(prev.variant_image_preview);
      }

      setVariants((prev) => {
        const updated = [...prev];
        updated[index] = {
          ...updated[index],
          variant_image: file,
          variant_image_preview: URL.createObjectURL(file),
          variant_image_existing: null, // Clear existing when new file is uploaded
        };
        return updated;
      });
    }
  };

  const removeVariantImage = (index) => {
    setVariants((prev) => {
      const updated = [...prev];
      if (updated[index].variant_image_preview && !updated[index].variant_image_existing) {
        URL.revokeObjectURL(updated[index].variant_image_preview);
      }
      updated[index] = {
        ...updated[index],
        variant_image: null,
        variant_image_preview: null,
        variant_image_existing: null,
      };
      return updated;
    });
  };

  // Handle variant attributes
  const addVariantAttribute = (variantIndex) => {
    setVariants((prev) => {
      const updated = [...prev];
      updated[variantIndex].variant_attributes = [
        ...updated[variantIndex].variant_attributes,
        {
          attribute_id: '',
          value_id: '',
        },
      ];
      return updated;
    });
  };

  const removeVariantAttribute = (variantIndex, attrIndex) => {
    setVariants((prev) => {
      const updated = [...prev];
      updated[variantIndex].variant_attributes = updated[
        variantIndex
      ].variant_attributes.filter((_, i) => i !== attrIndex);
      
      // Regenerate variant name and SKU after removing attribute
      const { name, sku } = generateVariantNameAndSKU(updated[variantIndex].variant_attributes);
      
      // Auto-update if generated values exist (user can still override)
      if (name) {
        updated[variantIndex].variant_name = name;
      } else {
        // Clear if no attributes left
        updated[variantIndex].variant_name = '';
      }
      if (sku) {
        updated[variantIndex].variant_SKU = sku;
      } else {
        // Clear if no attributes left
        updated[variantIndex].variant_SKU = '';
      }
      
      return updated;
    });
  };

  const handleVariantAttributeChange = (
    variantIndex,
    attrIndex,
    field,
    value
  ) => {
    setVariants((prev) => {
      const updated = [...prev];
      updated[variantIndex].variant_attributes[attrIndex] = {
        ...updated[variantIndex].variant_attributes[attrIndex],
        [field]: value,
        // Reset value_id when attribute_id changes
        ...(field === 'attribute_id' ? { value_id: '' } : {}),
      };
      
      // Auto-generate variant name and SKU from attributes
      const { name, sku } = generateVariantNameAndSKU(updated[variantIndex].variant_attributes);
      
      // Always regenerate name and SKU when attributes change
      if (name) {
        updated[variantIndex].variant_name = name;
      } else {
        // Clear if no complete attributes
        updated[variantIndex].variant_name = '';
      }
      if (sku) {
        updated[variantIndex].variant_SKU = sku;
      } else {
        // Clear if no complete attributes
        updated[variantIndex].variant_SKU = '';
      }
      
      return updated;
    });
  };

  // Form validation
  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = 'Product name is required';
    }
    if (!formData.SKU.trim()) {
      errors.SKU = 'SKU is required';
    }
    if (!formData.category) {
      errors.category = 'Category is required';
    }
    if (!formData.selling_price || parseFloat(formData.selling_price) <= 0) {
      errors.selling_price = 'Valid selling price is required';
    }

    productAttributes.forEach((attr, index) => {
      if (!attr.attributeId) {
        errors[`productAttribute_${index}`] = 'Please select an attribute';
      } else if (!attr.selectedValueIds || attr.selectedValueIds.length === 0) {
        errors[`productAttributeValue_${index}`] = 'Please select at least one value';
      }
    });

    if (variants.length > 0) {
      variants.forEach((variant, index) => {
        if (!variant.variant_name?.trim()) {
          errors[`variant_name_${index}`] = 'Variant name is required';
        }
        if (!variant.variant_SKU?.trim()) {
          errors[`variant_SKU_${index}`] = 'Variant SKU is required';
        }
        if (!variant.variant_price || parseFloat(variant.variant_price) <= 0) {
          errors[`variant_price_${index}`] = 'Valid variant price is required';
        }
        if (!variant.quantity || parseInt(variant.quantity) < 0) {
          errors[`variant_quantity_${index}`] = 'Valid quantity is required';
        }
        variant.variant_attributes.forEach((vAttr, vAttrIndex) => {
          if (!vAttr.attribute_id) {
            errors[`variant_attr_${index}_${vAttrIndex}`] = 'Please select an attribute';
          }
          if (!vAttr.value_id) {
            errors[`variant_value_${index}_${vAttrIndex}`] = 'Please select a value';
          }
        });
      });
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    try {
      setSubmitting(true);

      const formDataToSend = new FormData();

      formDataToSend.append('name', formData.name.trim());
      formDataToSend.append('SKU', formData.SKU.trim());
      formDataToSend.append('description', formData.description.trim() || '');
      formDataToSend.append('category', formData.category);
      formDataToSend.append('status', formData.status);
      formDataToSend.append('selling_price', parseFloat(formData.selling_price));
      formDataToSend.append('original_price', parseFloat(formData.original_price) || 0);
      formDataToSend.append('cost_price', parseFloat(formData.cost_price) || 0);
      formDataToSend.append('quantity', parseInt(formData.quantity) || 0);

      // Add new product images
      formData.productImages.forEach((file) => {
        formDataToSend.append('images', file);
      });

      // Product attributes
      const formattedAttributes = productAttributes.map((attr) => ({
        attributeId: attr.attributeId,
        attributeValuesIds: attr.selectedValueIds,
      }));
      formDataToSend.append('attributes', JSON.stringify(formattedAttributes));

      // Variants
      const formattedVariants = variants.length > 0 ? variants.map((variant, index) => {
        const variantData = {
          variant_name: variant.variant_name.trim(),
          variant_SKU: variant.variant_SKU.trim(),
          variant_price: parseFloat(variant.variant_price),
          variant_attributes: variant.variant_attributes.map((vAttr) => ({
            attribute_id: vAttr.attribute_id,
            value_id: vAttr.value_id,
          })),
          quantity: parseInt(variant.quantity) || 0,
          status: variant.status,
        };

        // Add variant image if new file uploaded
        if (variant.variant_image) {
          formDataToSend.append(`variant_images[${index}]`, variant.variant_image);
        }

        return variantData;
      }) : [];
      formDataToSend.append('variants', JSON.stringify(formattedVariants));

      // Add existing product images (original paths, not normalized URLs)
      formDataToSend.append('existing_images', JSON.stringify(formData.existingImages || []));

      // Add existing variant images (original paths)
      const existingVariantImages = variants.map(v => v.variant_image_existing || null);
      formDataToSend.append('existing_variant_images', JSON.stringify(existingVariantImages));

      await updateProduct(id, formDataToSend);
      toast.success('Product updated successfully!');
      navigate('/admin/products/list');
    } catch (error) {
      toast.error(error.message || 'Failed to update product');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 min-h-[400px]">
        <Loader2 className="w-10 h-10 animate-spin text-green-600 mb-4" />
        <span className="text-lg font-medium text-gray-700">Loading product data...</span>
        <span className="text-sm text-gray-500 mt-2">Please wait while we fetch the product details</span>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4 px-4 relative">
      {/* Loading Overlay */}
      {submitting && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-xl p-8 flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 animate-spin text-green-600" />
            <span className="text-lg font-semibold text-gray-900">Updating Product...</span>
            <span className="text-sm text-gray-600">Please wait, this may take a few moments</span>
          </div>
        </div>
      )}
      {/* Header */}
      <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl border border-green-200 p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Package className="w-6 h-6 text-green-600" />
              Edit Product
            </h1>
            <p className="text-sm text-gray-600 mt-1.5">
              Update product details below. Fields marked with <span className="text-red-500">*</span> are required.
            </p>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-white/80 rounded-lg transition-colors"
            aria-label="Go back"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Basic Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-5 flex items-center gap-2">
            <Package className="w-5 h-5 text-green-600" />
            Basic Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Product Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  formErrors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter product name"
              />
              {formErrors.name && (
                <p className="text-xs text-red-500 mt-1">{formErrors.name}</p>
              )}
            </div>

            {/* SKU */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                SKU <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="SKU"
                value={formData.SKU}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  formErrors.SKU ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter SKU"
              />
              {formErrors.SKU && (
                <p className="text-xs text-red-500 mt-1">{formErrors.SKU}</p>
              )}
            </div>

            {/* Category - Searchable Dropdown */}
            <div className="relative category-dropdown-container">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    if (!loadingCategories) {
                      setCategoryDropdownOpen(!categoryDropdownOpen);
                      setCategorySearchTerm('');
                    }
                  }}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 flex items-center justify-between ${
                    formErrors.category ? 'border-red-500' : 'border-gray-300'
                  } ${loadingCategories ? 'bg-gray-100 cursor-not-allowed' : 'bg-white cursor-pointer'}`}
                  disabled={loadingCategories}
                >
                  <span className={formData.category ? 'text-gray-900' : 'text-gray-500'}>
                    {formData.category
                      ? categories.find(cat => (cat._id || cat.id) === formData.category)?.name || 'Select Category'
                      : 'Select Category'}
                  </span>
                  {categoryDropdownOpen ? (
                    <ChevronUp className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  )}
                </button>
                
                {categoryDropdownOpen && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-64 overflow-hidden">
                    {/* Search Input */}
                    <div className="p-2 border-b border-gray-200">
                      <div className="relative">
                        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search category..."
                          value={categorySearchTerm}
                          onChange={(e) => setCategorySearchTerm(e.target.value)}
                          className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                          autoFocus
                        />
                      </div>
                    </div>
                    
                    {/* Category List */}
                    <div className="overflow-y-auto max-h-48">
                      <button
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, category: '' }));
                          setCategoryDropdownOpen(false);
                          setCategorySearchTerm('');
                        }}
                        className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 transition-colors ${
                          !formData.category ? 'bg-green-50 text-green-600' : 'text-gray-700'
                        }`}
                      >
                        Select Category
                      </button>
                      {categories
                        .filter(cat => 
                          cat.name.toLowerCase().includes(categorySearchTerm.toLowerCase())
                        )
                        .map((cat) => (
                          <button
                            key={cat._id || cat.id}
                            type="button"
                            onClick={() => {
                              setFormData(prev => ({ ...prev, category: cat._id || cat.id }));
                              setCategoryDropdownOpen(false);
                              setCategorySearchTerm('');
                            }}
                            className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 transition-colors ${
                              formData.category === (cat._id || cat.id) 
                                ? 'bg-green-50 text-green-600 font-medium' 
                                : 'text-gray-700'
                            }`}
                          >
                            {cat.name}
                          </button>
                        ))}
                      {categories.filter(cat => 
                        cat.name.toLowerCase().includes(categorySearchTerm.toLowerCase())
                      ).length === 0 && (
                        <div className="px-3 py-4 text-sm text-gray-500 text-center">
                          No categories found
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              {formErrors.category && (
                <p className="text-xs text-red-500 mt-1">{formErrors.category}</p>
              )}
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="ACTIVE">Active</option>
                <option value="DRAFT">Draft</option>
              </select>
            </div>

            {/* Selling Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Selling Price <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="number"
                  name="selling_price"
                  value={formData.selling_price}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    formErrors.selling_price ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="0.00"
                />
              </div>
              {formErrors.selling_price && (
                <p className="text-xs text-red-500 mt-1">{formErrors.selling_price}</p>
              )}
            </div>

            {/* Original Price (MRP) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Original Price (MRP)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="number"
                  name="original_price"
                  value={formData.original_price}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Cost Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cost Price
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="number"
                  name="cost_price"
                  value={formData.cost_price}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantity
              </label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleInputChange}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="0"
              />
              <p className="text-xs text-gray-500 mt-1">
                Product quantity (if no variants are added)
              </p>
            </div>
          </div>

          {/* Description */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Enter product description"
            />
          </div>

          {/* Product Images */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product Images
            </label>
            <div className="flex flex-wrap gap-4">
              {/* Existing Images */}
              {formData.existingImages.map((imageUrl, index) => (
                <div key={`existing-${index}`} className="relative">
                  <img
                    src={normalizeImagePath(imageUrl)}
                    alt={`Product ${index + 1}`}
                    className="w-24 h-24 object-cover rounded-lg border border-gray-300"
                    onError={(e) => {
                      console.error('Image load error:', imageUrl, 'Normalized:', normalizeImagePath(imageUrl));
                      e.target.style.display = 'none';
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => removeProductImage(index, true)}
                    className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}

              {/* New Image Previews */}
              {formData.productImagePreviews.map((preview, index) => (
                <div key={`new-${index}`} className="relative">
                  <img
                    src={preview}
                    alt={`New Product ${index + 1}`}
                    className="w-24 h-24 object-cover rounded-lg border border-gray-300"
                  />
                  <button
                    type="button"
                    onClick={() => removeProductImage(index, false)}
                    className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}

              {/* Upload Button */}
              <label className="flex flex-col items-center justify-center w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-green-500 transition-colors">
                <Upload className="w-6 h-6 text-gray-400" />
                <span className="text-xs text-gray-500 mt-1">Upload</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleProductImagesChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Product Attributes */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Tag className="w-5 h-5 text-green-600" />
                Product Attributes
              </h2>
              <p className="text-xs text-gray-500 mt-1.5">
                Add multiple attributes (e.g., Brand, Material, Color) and select multiple values for each
              </p>
            </div>
            {productAttributes.length > 0 && (
              <button
                type="button"
                onClick={addProductAttribute}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Add More
              </button>
            )}
          </div>

          {productAttributes.length === 0 ? (
            <div className="text-center py-10 border-2 border-dashed border-green-200 rounded-xl bg-gradient-to-br from-green-50 to-green-100">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Tag className="w-8 h-8 text-green-600" />
              </div>
              <p className="text-base font-semibold text-gray-800 mb-1">
                No attributes added yet
              </p>
              <p className="text-sm text-gray-600 mb-6 max-w-md mx-auto">
                Start by adding your first product attribute. You can add multiple attributes like Brand, Material, Color, etc.
              </p>
              <button
                type="button"
                onClick={addProductAttribute}
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                <Plus className="w-5 h-5" />
                Add Your First Attribute
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm text-gray-600 bg-green-50 px-3 py-2 rounded-lg">
                <span>
                  <span className="font-semibold text-blue-700">{productAttributes.length}</span> attribute{productAttributes.length !== 1 ? 's' : ''} added
                </span>
                <button
                  type="button"
                  onClick={addProductAttribute}
                  className="text-green-600 hover:text-blue-700 font-medium flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  Add Another
                </button>
              </div>

              {productAttributes.map((attr, index) => {
                const selectedAttribute = attributes.find(
                  (a) => (a._id || a.id) === attr.attributeId
                );
                const attributeValues = getAttributeValues(attr.attributeId);
                const selectedValuesCount = attr.selectedValueIds?.length || 0;

                return (
                  <div
                    key={index}
                    className="p-5 border-2 border-gray-200 rounded-lg bg-white hover:border-blue-300 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            Attribute #{index + 1}
                          </span>
                          {selectedAttribute && (
                            <span className="text-sm font-medium text-green-600">
                              {selectedAttribute.name}
                            </span>
                          )}
                          {selectedValuesCount > 0 && (
                            <span className="text-xs text-gray-500">
                              ({selectedValuesCount} value{selectedValuesCount !== 1 ? 's' : ''} selected)
                            </span>
                          )}
                        </div>

                        <div className="mb-3">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Select Attribute <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={attr.attributeId}
                            onChange={(e) => handleAttributeChange(index, e.target.value)}
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                              formErrors[`productAttribute_${index}`]
                                ? 'border-red-500'
                                : 'border-gray-300'
                            }`}
                            disabled={loadingAttributes}
                          >
                            <option value="">Choose an attribute...</option>
                            {attributes.map((a) => (
                              <option key={a._id || a.id} value={a._id || a.id}>
                                {a.name}
                              </option>
                            ))}
                          </select>
                          {formErrors[`productAttribute_${index}`] && (
                            <p className="text-xs text-red-500 mt-1">
                              {formErrors[`productAttribute_${index}`]}
                            </p>
                          )}
                        </div>

                        {selectedAttribute && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Select Values (You can select multiple) <span className="text-red-500">*</span>
                            </label>
                            {attributeValues.length === 0 ? (
                              <p className="text-xs text-gray-500 italic">
                                No values available for this attribute
                              </p>
                            ) : (
                              <div className="flex flex-wrap gap-2">
                                {attributeValues.map((valueObj) => {
                                  const valueId = valueObj._id || valueObj.id;
                                  const isSelected = attr.selectedValueIds?.includes(valueId);

                                  return (
                                    <button
                                      key={valueId}
                                      type="button"
                                      onClick={() => handleAttributeValueToggle(index, valueId)}
                                      className={`px-3 py-1.5 text-sm rounded-lg border transition-all ${
                                        isSelected
                                          ? 'bg-green-600 text-white border-blue-600 shadow-sm'
                                          : 'bg-white text-gray-700 border-gray-300 hover:border-green-500 hover:bg-green-50'
                                      }`}
                                    >
                                      {valueObj.value}
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                            {formErrors[`productAttributeValue_${index}`] && (
                              <p className="text-xs text-red-500 mt-2">
                                {formErrors[`productAttributeValue_${index}`]}
                              </p>
                            )}
                            {selectedValuesCount > 0 && (
                              <p className="text-xs text-green-600 mt-2">
                                ✓ {selectedValuesCount} value{selectedValuesCount !== 1 ? 's' : ''} selected
                              </p>
                            )}
                          </div>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => removeProductAttribute(index)}
                        className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remove this attribute"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Variants Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Layers className="w-5 h-5 text-green-600" />
                Product Variants
              </h2>
              <p className="text-xs text-gray-500 mt-1.5">
                Variants are optional. Add variants if your product has different sizes, colors, etc.
              </p>
            </div>
            {!showVariants && (
              <button
                type="button"
                onClick={addVariant}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Add Variant
              </button>
            )}
          </div>

          {!showVariants ? (
            <div className="text-center py-6 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
              <Layers className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-700 mb-1">
                No variants added
              </p>
              <p className="text-xs text-gray-500">
                Variants are optional. Click "Add Variant" button above to add variants.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="font-semibold text-gray-700">{variants.length}</span> variant{variants.length !== 1 ? 's' : ''} added
                </div>
                <button
                  type="button"
                  onClick={addVariant}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add More Variant
                </button>
              </div>
              
              {variants.map((variant, variantIndex) => {
                const isAttributeMode = variantAttributeMode[variantIndex] === true;
                
                return (
                  <div
                    key={variantIndex}
                    className="bg-gradient-to-br from-gray-50 to-blue-50 border-2 border-gray-300 rounded-xl p-4 shadow-sm hover:shadow-md transition-all"
                  >
                    {/* Variant Header */}
                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                          {variantIndex + 1}
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-gray-900">
                            {isAttributeMode 
                              ? `Variant ${variantIndex + 1} - Select Attributes`
                              : (variant.variant_name || `Variant ${variantIndex + 1}`)
                            }
                          </h3>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {isAttributeMode 
                              ? 'Select attributes first, then add details'
                              : (variant.variant_SKU || 'No SKU yet')
                            }
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          if (variants.length === 1) {
                            setShowVariants(false);
                            setVariants([]);
                            setVariantAttributeMode({});
                          } else {
                            removeVariant(variantIndex);
                          }
                        }}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                        title="Remove variant"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Selected Attributes - Show at top when in details mode */}
                    {!isAttributeMode && variant.variant_attributes.length > 0 && (
                      <div className="mb-4 pt-3 pb-3 border-b-2 border-gray-300 bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                          <label className="block text-base font-bold text-gray-800 flex items-center gap-2">
                            <Tag className="w-5 h-5 text-green-600" />
                            Selected Attributes
                          </label>
                          <button
                            type="button"
                            onClick={() => setVariantAttributeMode((prev) => ({ ...prev, [variantIndex]: true }))}
                            className="text-sm text-green-600 hover:text-blue-700 font-semibold flex items-center gap-1.5 px-3 py-1.5 rounded-md hover:bg-blue-100 transition-colors"
                          >
                            <Tag className="w-4 h-4" />
                            Edit Attributes
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-3">
                          {variant.variant_attributes.map((vAttr, vAttrIndex) => {
                            const selectedAttr = attributes.find(
                              (a) => (a._id || a.id) === vAttr.attribute_id
                            );
                            const selectedValue = selectedAttr?.values?.find(
                              (v) => (v._id || v.id) === vAttr.value_id
                            );
                            
                            return (
                              <div
                                key={vAttrIndex}
                                className="px-4 py-2.5 bg-white text-blue-800 rounded-lg text-sm font-semibold border-2 border-blue-300 shadow-sm hover:shadow-md transition-shadow flex items-center gap-2 min-w-[120px]"
                              >
                                <span className="text-green-600 font-bold">{selectedAttr?.name || 'Unknown'}:</span>
                                <span className="text-gray-700 font-medium">{selectedValue?.value || 'Unknown'}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Attribute Selection Mode */}
                    {isAttributeMode ? (
                      <div className="space-y-4">
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                              1
                            </div>
                            <h4 className="text-sm font-semibold text-gray-900">
                              Select Variant Attributes
                            </h4>
                          </div>
                          <p className="text-xs text-gray-600 ml-8">
                            Add attributes like Color, Size, etc. for this variant. You can add multiple attributes.
                          </p>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center justify-between mb-3">
                            <label className="block text-sm font-semibold text-gray-700">
                              Variant Attributes <span className="text-red-500">*</span>
                            </label>
                            <button
                              type="button"
                              onClick={() => addVariantAttribute(variantIndex)}
                              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              Add Attribute
                            </button>
                          </div>

                          {variant.variant_attributes.length === 0 ? (
                            <div className="text-center py-6 border-2 border-dashed border-gray-200 rounded-lg bg-white">
                              <Tag className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                              <p className="text-sm font-medium text-gray-700 mb-1">
                                No attributes added yet
                              </p>
                              <p className="text-xs text-gray-500 mb-4">
                                Click "Add Attribute" to start adding attributes for this variant
                              </p>
                              <button
                                type="button"
                                onClick={() => addVariantAttribute(variantIndex)}
                                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                              >
                                <Plus className="w-4 h-4" />
                                Add Your First Attribute
                              </button>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {variant.variant_attributes.map((vAttr, vAttrIndex) => {
                                const selectedAttr = attributes.find(
                                  (a) => (a._id || a.id) === vAttr.attribute_id
                                );
                                const vAttrValues = getAttributeValues(vAttr.attribute_id);
                                const availableAttributes = getAvailableAttributesForVariant(variantIndex, vAttrIndex);

                                return (
                                  <div
                                    key={vAttrIndex}
                                    className="flex items-center gap-3 p-4 bg-white rounded-lg border-2 border-gray-200 hover:border-blue-300 transition-colors"
                                  >
                                    <select
                                      value={vAttr.attribute_id}
                                      onChange={(e) =>
                                        handleVariantAttributeChange(
                                          variantIndex,
                                          vAttrIndex,
                                          'attribute_id',
                                          e.target.value
                                        )
                                      }
                                      className={`flex-1 px-3 py-2 text-sm border-2 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all ${
                                        formErrors[`variant_attr_${variantIndex}_${vAttrIndex}`]
                                          ? 'border-red-500 bg-red-50'
                                          : 'border-gray-300'
                                      }`}
                                      disabled={loadingAttributes}
                                    >
                                      <option value="">Select Attribute</option>
                                      {availableAttributes.map((a) => (
                                        <option key={a._id || a.id} value={a._id || a.id}>
                                          {a.name}
                                        </option>
                                      ))}
                                    </select>

                                    <select
                                      value={vAttr.value_id}
                                      onChange={(e) =>
                                        handleVariantAttributeChange(
                                          variantIndex,
                                          vAttrIndex,
                                          'value_id',
                                          e.target.value
                                        )
                                      }
                                      disabled={!vAttr.attribute_id || loadingAttributes}
                                      className={`flex-1 px-3 py-2 text-sm border-2 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all ${
                                        formErrors[`variant_value_${variantIndex}_${vAttrIndex}`]
                                          ? 'border-red-500 bg-red-50'
                                          : 'border-gray-300'
                                      } ${!vAttr.attribute_id ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                    >
                                      <option value="">Select Value</option>
                                      {vAttrValues.map((val) => (
                                        <option key={val._id || val.id} value={val._id || val.id}>
                                          {val.value}
                                        </option>
                                      ))}
                                    </select>

                                    <button
                                      type="button"
                                      onClick={() => removeVariantAttribute(variantIndex, vAttrIndex)}
                                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                                      title="Remove attribute"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>

                        <div className="flex justify-end mt-6 pt-4 border-t border-gray-200">
                          <button
                            type="button"
                            onClick={() => continueVariantDetails(variantIndex)}
                            disabled={variant.variant_attributes.length === 0 || 
                                     variant.variant_attributes.some(attr => !attr.attribute_id || !attr.value_id)}
                            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow"
                          >
                            Continue to Details
                            <ChevronDown className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Details Mode */
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Variant Name <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={variant.variant_name}
                              onChange={(e) => handleVariantChange(variantIndex, 'variant_name', e.target.value)}
                              className={`w-full px-4 py-2.5 border-2 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all ${
                                formErrors[`variant_name_${variantIndex}`]
                                  ? 'border-red-500 bg-red-50'
                                  : 'border-gray-300'
                              }`}
                              placeholder="e.g., Red - Large"
                            />
                            {formErrors[`variant_name_${variantIndex}`] && (
                              <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                {formErrors[`variant_name_${variantIndex}`]}
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Variant SKU <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={variant.variant_SKU}
                              onChange={(e) => handleVariantChange(variantIndex, 'variant_SKU', e.target.value)}
                              className={`w-full px-4 py-2.5 border-2 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all ${
                                formErrors[`variant_SKU_${variantIndex}`]
                                  ? 'border-red-500 bg-red-50'
                                  : 'border-gray-300'
                              }`}
                              placeholder="e.g., PROD-RED-L"
                            />
                            {formErrors[`variant_SKU_${variantIndex}`] && (
                              <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                {formErrors[`variant_SKU_${variantIndex}`]}
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Variant Price <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                              <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                              <input
                                type="number"
                                value={variant.variant_price}
                                onChange={(e) => handleVariantChange(variantIndex, 'variant_price', e.target.value)}
                                step="0.01"
                                min="0"
                                className={`w-full pl-12 pr-4 py-2.5 border-2 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all ${
                                  formErrors[`variant_price_${variantIndex}`]
                                    ? 'border-red-500 bg-red-50'
                                    : 'border-gray-300'
                                }`}
                                placeholder="0.00"
                              />
                            </div>
                            {formErrors[`variant_price_${variantIndex}`] && (
                              <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                {formErrors[`variant_price_${variantIndex}`]}
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Quantity <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="number"
                              value={variant.quantity}
                              onChange={(e) => handleVariantChange(variantIndex, 'quantity', e.target.value)}
                              min="0"
                              className={`w-full px-4 py-2.5 border-2 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all ${
                                formErrors[`variant_quantity_${variantIndex}`]
                                  ? 'border-red-500 bg-red-50'
                                  : 'border-gray-300'
                              }`}
                              placeholder="0"
                            />
                            {formErrors[`variant_quantity_${variantIndex}`] && (
                              <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                {formErrors[`variant_quantity_${variantIndex}`]}
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Status
                            </label>
                            <select
                              value={variant.status}
                              onChange={(e) => handleVariantChange(variantIndex, 'status', e.target.value)}
                              className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                            >
                              <option value="ACTIVE">Active</option>
                              <option value="DRAFT">Draft</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Variant Image
                            </label>
                            {variant.variant_image_preview ? (
                              <div className="relative inline-block">
                                <img
                                  src={variant.variant_image_preview}
                                  alt={`Variant ${variantIndex + 1}`}
                                  className="w-28 h-28 object-cover rounded-lg border-2 border-gray-300 shadow-sm"
                                />
                                <button
                                  type="button"
                                  onClick={() => removeVariantImage(variantIndex)}
                                  className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-md transition-colors"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ) : (
                              <label className="flex flex-col items-center justify-center w-28 h-28 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-green-500 hover:bg-green-50 transition-all bg-white">
                                <Upload className="w-6 h-6 text-gray-400" />
                                <span className="text-xs text-gray-500 mt-1 font-medium">Upload</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => handleVariantImageChange(variantIndex, e)}
                                  className="hidden"
                                />
                              </label>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-1.5 px-5 py-2 text-sm bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow font-medium"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Updating Product...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Update Product</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ProductEdit;

