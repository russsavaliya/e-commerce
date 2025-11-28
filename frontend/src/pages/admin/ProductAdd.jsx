/**
 * Product Add/Edit Page
 * Complete form for creating and editing products with attributes and variants
 */

import React, { useState, useEffect } from 'react';
import {
  Save,
  X,
  Loader2,
  Plus,
  Trash2,
  Upload,
  Image as ImageIcon,
  Package,
  IndianRupee,
  Tag,
  Layers,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Search,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { createProduct } from '../../services/admin/productService';
import { getAllCategories } from '../../services/admin/categoryService';
import { getAllAttributes } from '../../services/admin/attributeService';

const ProductAdd = () => {
  const navigate = useNavigate();

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
    discount_percentage: '',
    is_best_seller: false,
    is_new: false,
    is_trending: false,
    productImages: [], // Array of File objects
    productImagePreviews: [], // Array of preview URLs
  });

  // Attributes state - array of { attributeId, selectedValueIds: [] }
  const [productAttributes, setProductAttributes] = useState([]);

  // Category dropdown state
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [categorySearchTerm, setCategorySearchTerm] = useState('');

  // Attribute dropdown states - for each attribute index
  const [attributeDropdownOpen, setAttributeDropdownOpen] = useState({});
  const [attributeSearchTerm, setAttributeSearchTerm] = useState({});
  
  // Attribute value dropdown states - for each attribute index
  const [attributeValueDropdownOpen, setAttributeValueDropdownOpen] = useState({});
  const [attributeValueSearchTerm, setAttributeValueSearchTerm] = useState({});
  
  // Variant attribute dropdown states - for each variant and attribute index
  const [variantAttributeDropdownOpen, setVariantAttributeDropdownOpen] = useState({});
  const [variantAttributeSearchTerm, setVariantAttributeSearchTerm] = useState({});
  
  // Variant attribute value dropdown states
  const [variantAttributeValueDropdownOpen, setVariantAttributeValueDropdownOpen] = useState({});
  const [variantAttributeValueSearchTerm, setVariantAttributeValueSearchTerm] = useState({});

  // Variants state - array of variant objects (optional, starts empty)
  const [variants, setVariants] = useState([]);
  const [showVariants, setShowVariants] = useState(false);
  // Track which variants are in attribute selection mode
  const [variantAttributeMode, setVariantAttributeMode] = useState({});

  // Form errors
  const [formErrors, setFormErrors] = useState({});

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (categoryDropdownOpen && !event.target.closest('.category-dropdown-container')) {
        setCategoryDropdownOpen(false);
        setCategorySearchTerm('');
      }
      // Close attribute dropdowns
      Object.keys(attributeDropdownOpen).forEach(index => {
        if (attributeDropdownOpen[index] && !event.target.closest(`.attribute-dropdown-container-${index}`)) {
          setAttributeDropdownOpen(prev => ({ ...prev, [index]: false }));
          setAttributeSearchTerm(prev => ({ ...prev, [index]: '' }));
        }
      });
      // Close attribute value dropdowns
      Object.keys(attributeValueDropdownOpen).forEach(index => {
        if (attributeValueDropdownOpen[index] && !event.target.closest(`.attribute-value-dropdown-container-${index}`)) {
          setAttributeValueDropdownOpen(prev => ({ ...prev, [index]: false }));
          setAttributeValueSearchTerm(prev => ({ ...prev, [index]: '' }));
        }
      });
      // Close variant attribute dropdowns
      Object.keys(variantAttributeDropdownOpen).forEach(key => {
        const [variantIndex, vAttrIndex] = key.split('-');
        const containerClass = `.variant-attribute-dropdown-container-${variantIndex}-${vAttrIndex}`;
        if (variantAttributeDropdownOpen[key] && !event.target.closest(containerClass)) {
          setVariantAttributeDropdownOpen(prev => ({ ...prev, [key]: false }));
          setVariantAttributeSearchTerm(prev => ({ ...prev, [key]: '' }));
        }
      });
      // Close variant attribute value dropdowns
      Object.keys(variantAttributeValueDropdownOpen).forEach(key => {
        const [variantIndex, vAttrIndex] = key.split('-');
        const containerClass = `.variant-attribute-value-dropdown-container-${variantIndex}-${vAttrIndex}`;
        if (variantAttributeValueDropdownOpen[key] && !event.target.closest(containerClass)) {
          setVariantAttributeValueDropdownOpen(prev => ({ ...prev, [key]: false }));
          setVariantAttributeValueSearchTerm(prev => ({ ...prev, [key]: '' }));
        }
      });
    };

    if (categoryDropdownOpen || Object.values(attributeDropdownOpen).some(Boolean) || Object.values(attributeValueDropdownOpen).some(Boolean) || Object.values(variantAttributeDropdownOpen).some(Boolean) || Object.values(variantAttributeValueDropdownOpen).some(Boolean)) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [categoryDropdownOpen, attributeDropdownOpen, attributeValueDropdownOpen, variantAttributeDropdownOpen, variantAttributeValueDropdownOpen]);

  // Fetch categories and attributes on mount
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      await Promise.all([fetchCategories(), fetchAttributes()]);
    } catch (error) {
      toast.error('Failed to load initial data');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      // Fetch all categories (high limit to get all)
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
      // Fetch all attributes (high limit to get all)
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

  const removeProductImage = (index) => {
    setFormData((prev) => {
      const newImages = [...prev.productImages];
      const newPreviews = [...prev.productImagePreviews];
      // Revoke object URL to prevent memory leak
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

  // Get available attributes for product (excluding already selected ones)
  const getAvailableAttributesForProduct = (currentAttrIndex) => {
    // Get already selected attribute IDs (excluding the current one being edited)
    const selectedAttributeIds = productAttributes
      .map((attr, idx) => idx !== currentAttrIndex ? attr.attributeId : null)
      .filter(Boolean);
    
    // Filter out already selected attributes
    return attributes.filter(
      (attr) => !selectedAttributeIds.includes(attr._id || attr.id)
    );
  };

  // Get available attributes for a variant (excluding already selected ones)
  const getAvailableAttributesForVariant = (variantIndex, currentAttrIndex) => {
    const variant = variants[variantIndex];
    if (!variant || !variant.variant_attributes) {
      return attributes;
    }
    
    // Get already selected attribute IDs (excluding the current one being edited)
    const selectedAttributeIds = variant.variant_attributes
      .map((attr, idx) => idx !== currentAttrIndex ? attr.attribute_id : null)
      .filter(Boolean);
    
    // Filter out already selected attributes
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
    setShowVariants(true); // Show variants section when first variant is added
    const newIndex = variants.length;
    setVariants((prev) => [
      ...prev,
      {
        variant_name: '',
        variant_SKU: '',
        variant_price: '',
        variant_image: null,
        variant_image_preview: null,
        variant_attributes: [],
        quantity: '',
        status: 'ACTIVE',
      },
    ]);
    // Start in attribute selection mode
    setVariantAttributeMode((prev) => ({
      ...prev,
      [newIndex]: true,
    }));
  };

  const removeVariant = (index) => {
    setVariants((prev) => {
      const updated = [...prev];
      // Revoke object URL if exists
      if (updated[index].variant_image_preview) {
        URL.revokeObjectURL(updated[index].variant_image_preview);
      }
      updated.splice(index, 1);
      return updated;
    });
    // Remove from attribute mode tracking
    setVariantAttributeMode((prev) => {
      const updated = { ...prev };
      delete updated[index];
      // Reindex remaining variants
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

  // Move variant from attribute selection mode to details mode
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
      // Revoke previous preview if exists
      const prev = variants[index];
      if (prev.variant_image_preview) {
        URL.revokeObjectURL(prev.variant_image_preview);
      }

      setVariants((prev) => {
        const updated = [...prev];
        updated[index] = {
          ...updated[index],
          variant_image: file,
          variant_image_preview: URL.createObjectURL(file),
        };
        return updated;
      });
    }
  };

  const removeVariantImage = (index) => {
    setVariants((prev) => {
      const updated = [...prev];
      if (updated[index].variant_image_preview) {
        URL.revokeObjectURL(updated[index].variant_image_preview);
      }
      updated[index] = {
        ...updated[index],
        variant_image: null,
        variant_image_preview: null,
      };
      return updated;
    });
  };

  // Handle variant attributes (for variants)
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
      
      // Always regenerate when attributes change
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

    // Basic fields
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

    // Validate product attributes
    productAttributes.forEach((attr, index) => {
      if (!attr.attributeId) {
        errors[`productAttribute_${index}`] = 'Please select an attribute';
      } else if (!attr.selectedValueIds || attr.selectedValueIds.length === 0) {
        errors[`productAttributeValue_${index}`] =
          'Please select at least one value';
      }
    });

    // Validate variants (only if variants exist - variants are optional)
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
        // Validate variant attributes
        variant.variant_attributes.forEach((vAttr, vAttrIndex) => {
          if (!vAttr.attribute_id) {
            errors[`variant_attr_${index}_${vAttrIndex}`] =
              'Please select an attribute';
          }
          if (!vAttr.value_id) {
            errors[`variant_value_${index}_${vAttrIndex}`] =
              'Please select a value';
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

      // Prepare FormData
      const formDataToSend = new FormData();

      // Basic product fields
      formDataToSend.append('name', formData.name.trim());
      formDataToSend.append('SKU', formData.SKU.trim());
      formDataToSend.append('description', formData.description.trim() || '');
      formDataToSend.append('category', formData.category);
      formDataToSend.append('status', formData.status);
      formDataToSend.append('selling_price', parseFloat(formData.selling_price));
      formDataToSend.append(
        'original_price',
        parseFloat(formData.original_price) || 0
      );
      formDataToSend.append('cost_price', parseFloat(formData.cost_price) || 0);
      formDataToSend.append('quantity', parseInt(formData.quantity) || 0);
      formDataToSend.append('discount_percentage', parseFloat(formData.discount_percentage) || 0);
      formDataToSend.append('is_best_seller', formData.is_best_seller);
      formDataToSend.append('is_new', formData.is_new);
      formDataToSend.append('is_trending', formData.is_trending);

      // Product images
      formData.productImages.forEach((file) => {
        formDataToSend.append('images', file);
      });

      // Product attributes - format: [{ attributeId, attributeValuesIds: [] }]
      const formattedAttributes = productAttributes.map((attr) => ({
        attributeId: attr.attributeId,
        attributeValuesIds: attr.selectedValueIds,
      }));
      formDataToSend.append('attributes', JSON.stringify(formattedAttributes));

      // Variants - format according to product model (send empty array if no variants)
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

        // Add variant image if exists
        if (variant.variant_image) {
          formDataToSend.append(`variant_images[${index}]`, variant.variant_image);
        }

        return variantData;
      }) : [];
      formDataToSend.append('variants', JSON.stringify(formattedVariants));

      // Call API
      await createProduct(formDataToSend);
      toast.success('Product created successfully!');
      navigate('/admin/dashboard'); // Navigate to dashboard after successful creation
    } catch (error) {
      toast.error(error.message || 'Failed to create product');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full relative">
      {/* Loading Overlay */}
      {submitting && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-xl p-8 flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 animate-spin text-green-600" />
            <span className="text-lg font-semibold text-gray-900">Creating Product...</span>
            <span className="text-sm text-gray-600">Please wait, this may take a few moments</span>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 min-h-[400px]">
          <Loader2 className="w-10 h-10 animate-spin text-green-600 mb-4" />
          <span className="text-lg font-medium text-gray-700">Loading product form...</span>
          <span className="text-sm text-gray-500 mt-2">Please wait while we fetch the data</span>
        </div>
      ) : (
        <>
          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 mb-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="product-form"
              disabled={submitting}
              className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Create Product</span>
                </>
              )}
            </button>
          </div>

          {/* Form Content */}
          <div className="space-y-4">

          {/* Form */}
          <form id="product-form" onSubmit={handleSubmit} className="space-y-4">
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
                <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
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
                <p className="text-xs text-red-500 mt-1">
                  {formErrors.selling_price}
                </p>
              )}
            </div>

            {/* Original Price (MRP) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Original Price (MRP)
              </label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
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
                <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
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

            {/* Discount Percentage */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Discount Percentage
              </label>
              <input
                type="number"
                name="discount_percentage"
                value={formData.discount_percentage}
                onChange={handleInputChange}
                step="0.01"
                min="0"
                max="100"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="0.00"
              />
              <p className="text-xs text-gray-500 mt-1">
                Discount percentage (0-100)
              </p>
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

          {/* Product Flags - Checkboxes */}
          <div className="mt-3">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Flags
            </label>
            <div className="flex flex-wrap gap-3">
              {/* Best Seller Checkbox */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="is_best_seller"
                  checked={formData.is_best_seller}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_best_seller: e.target.checked }))}
                  className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <span className="text-sm font-medium text-gray-700">Best Seller</span>
              </label>

              {/* New Checkbox */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="is_new"
                  checked={formData.is_new}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_new: e.target.checked }))}
                  className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <span className="text-sm font-medium text-gray-700">New</span>
              </label>

              {/* Trending Checkbox */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="is_trending"
                  checked={formData.is_trending}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_trending: e.target.checked }))}
                  className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <span className="text-sm font-medium text-gray-700">Trending</span>
              </label>
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
              {/* Image Previews */}
              {formData.productImagePreviews.map((preview, index) => (
                <div key={index} className="relative">
                  <img
                    src={preview}
                    alt={`Product ${index + 1}`}
                    className="w-24 h-24 object-cover rounded-lg border border-gray-300"
                  />
                  <button
                    type="button"
                    onClick={() => removeProductImage(index)}
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
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <Tag className="w-4 h-4 text-green-600" />
                Product Attributes
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Add multiple attributes (e.g., Brand, Material, Color) and select multiple values for each
              </p>
            </div>
            {productAttributes.length > 0 && (
              <button
                type="button"
                onClick={addProductAttribute}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                Add More
              </button>
            )}
          </div>

          {productAttributes.length === 0 ? (
            <div className="text-center py-6 border-2 border-dashed border-green-200 rounded-lg bg-gradient-to-br from-green-50 to-green-100">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Tag className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-sm font-semibold text-gray-800 mb-1">
                No attributes added yet
              </p>
              <p className="text-xs text-gray-600 mb-4 max-w-md mx-auto">
                Start by adding your first product attribute. You can add multiple attributes like Brand, Material, Color, etc.
              </p>
              <button
                type="button"
                onClick={addProductAttribute}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Add Your First Attribute
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Show count */}
              <div className="flex items-center justify-between text-sm text-gray-600 bg-green-50 px-3 py-2 rounded-lg">
                <span>
                  <span className="font-semibold text-green-700">{productAttributes.length}</span> attribute{productAttributes.length !== 1 ? 's' : ''} added
                </span>
                <button
                  type="button"
                  onClick={addProductAttribute}
                  className="text-green-600 hover:text-green-700 font-medium flex items-center gap-1"
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
                    className="p-5 border-2 border-gray-200 rounded-lg bg-white hover:border-green-300 transition-colors"
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

                        {/* Attribute Selection - Searchable Dropdown */}
                        <div className={`mb-3 relative attribute-dropdown-container-${index}`}>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Select Attribute <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <button
                              type="button"
                              onClick={() => {
                                if (!loadingAttributes) {
                                  setAttributeDropdownOpen(prev => ({ ...prev, [index]: !prev[index] }));
                                  setAttributeSearchTerm(prev => ({ ...prev, [index]: '' }));
                                }
                              }}
                              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 flex items-center justify-between ${
                                formErrors[`productAttribute_${index}`]
                                  ? 'border-red-500'
                                  : 'border-gray-300'
                              } ${loadingAttributes ? 'bg-gray-100 cursor-not-allowed' : 'bg-white cursor-pointer'}`}
                              disabled={loadingAttributes}
                            >
                              <span className={attr.attributeId ? 'text-gray-900' : 'text-gray-500'}>
                                {attr.attributeId
                                  ? attributes.find(a => (a._id || a.id) === attr.attributeId)?.name || 'Choose an attribute...'
                                  : 'Choose an attribute...'}
                              </span>
                              {attributeDropdownOpen[index] ? (
                                <ChevronUp className="w-4 h-4 text-gray-400" />
                              ) : (
                                <ChevronDown className="w-4 h-4 text-gray-400" />
                              )}
                            </button>
                            
                            {attributeDropdownOpen[index] && (
                              <div 
                                className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-64 overflow-hidden"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {/* Search Input */}
                                <div className="p-2 border-b border-gray-200">
                                  <div className="relative">
                                    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                      type="text"
                                      placeholder="Search attribute..."
                                      value={attributeSearchTerm[index] || ''}
                                      onChange={(e) => {
                                        e.stopPropagation();
                                        setAttributeSearchTerm(prev => ({ ...prev, [index]: e.target.value }));
                                      }}
                                      onClick={(e) => e.stopPropagation()}
                                      className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                      autoFocus
                                    />
                                  </div>
                                </div>
                                
                                {/* Attribute List */}
                                <div className="overflow-y-auto max-h-48">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      handleAttributeChange(index, '');
                                      setAttributeDropdownOpen(prev => ({ ...prev, [index]: false }));
                                      setAttributeSearchTerm(prev => ({ ...prev, [index]: '' }));
                                    }}
                                    className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 transition-colors ${
                                      !attr.attributeId ? 'bg-green-50 text-green-600' : 'text-gray-700'
                                    }`}
                                  >
                                    Choose an attribute...
                                  </button>
                                  {getAvailableAttributesForProduct(index)
                                    .filter(a => 
                                      a.name.toLowerCase().includes((attributeSearchTerm[index] || '').toLowerCase())
                                    )
                                    .map((a) => (
                                      <button
                                        key={a._id || a.id}
                                        type="button"
                                        onClick={(e) => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          handleAttributeChange(index, a._id || a.id);
                                          setAttributeDropdownOpen(prev => ({ ...prev, [index]: false }));
                                          setAttributeSearchTerm(prev => ({ ...prev, [index]: '' }));
                                        }}
                                        className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 transition-colors ${
                                          attr.attributeId === (a._id || a.id) 
                                            ? 'bg-green-50 text-green-600 font-medium' 
                                            : 'text-gray-700'
                                        }`}
                                      >
                                        {a.name}
                                      </button>
                                    ))}
                                  {getAvailableAttributesForProduct(index).filter(a => 
                                    a.name.toLowerCase().includes((attributeSearchTerm[index] || '').toLowerCase())
                                  ).length === 0 && (
                                    <div className="px-3 py-4 text-sm text-gray-500 text-center">
                                      No attributes found
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                          {formErrors[`productAttribute_${index}`] && (
                            <p className="text-xs text-red-500 mt-1">
                              {formErrors[`productAttribute_${index}`]}
                            </p>
                          )}
                        </div>

                        {/* Attribute Values Selection - Searchable */}
                        {selectedAttribute && (
                          <div className={`relative attribute-value-dropdown-container-${index}`}>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Select Values (You can select multiple) <span className="text-red-500">*</span>
                            </label>
                            {attributeValues.length === 0 ? (
                              <p className="text-xs text-gray-500 italic">
                                No values available for this attribute
                              </p>
                            ) : (
                              <>
                                {/* Search Input for Values */}
                                <div className="mb-2">
                                  <div className="relative">
                                    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                      type="text"
                                      placeholder="Search values..."
                                      value={attributeValueSearchTerm[index] || ''}
                                      onChange={(e) => {
                                        e.stopPropagation();
                                        setAttributeValueSearchTerm(prev => ({ ...prev, [index]: e.target.value }));
                                      }}
                                      onClick={(e) => e.stopPropagation()}
                                      className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                    />
                                  </div>
                                </div>
                                
                                {/* Values List with Scroll */}
                                <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-2 bg-gray-50">
                                  <div className="flex flex-wrap gap-2">
                                    {attributeValues
                                      .filter(valueObj => 
                                        valueObj.value.toLowerCase().includes((attributeValueSearchTerm[index] || '').toLowerCase())
                                      )
                                      .map((valueObj) => {
                                        const valueId = valueObj._id || valueObj.id;
                                        const isSelected = attr.selectedValueIds?.includes(valueId);

                                        return (
                                          <button
                                            key={valueId}
                                            type="button"
                                            onClick={() =>
                                              handleAttributeValueToggle(index, valueId)
                                            }
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
                                  {attributeValues.filter(valueObj => 
                                    valueObj.value.toLowerCase().includes((attributeValueSearchTerm[index] || '').toLowerCase())
                                  ).length === 0 && (
                                    <div className="px-3 py-4 text-sm text-gray-500 text-center">
                                      No values found
                                    </div>
                                  )}
                                </div>
                              </>
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

                      {/* Remove Button */}
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

        {/* Variants - Optional Section */}
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
                className="bg-gradient-to-br from-gray-50 to-blue-50 border border-gray-300 rounded-lg p-3 shadow-sm hover:shadow transition-all"
              >
                {/* Variant Header */}
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-200">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center text-white font-bold text-xs">
                      {variantIndex + 1}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">
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
                    className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                    title="Remove variant"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Selected Attributes - Show at top when in details mode */}
                {!isAttributeMode && variant.variant_attributes.length > 0 && (
                  <div className="mb-3 pt-2 pb-2 border-b border-gray-300 bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-2 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-semibold text-gray-800 flex items-center gap-1.5">
                        <Tag className="w-4 h-4 text-green-600" />
                        Selected Attributes
                      </label>
                      <button
                        type="button"
                        onClick={() => setVariantAttributeMode((prev) => ({ ...prev, [variantIndex]: true }))}
                        className="text-xs text-green-600 hover:text-green-700 font-medium flex items-center gap-1 px-2 py-1 rounded-md hover:bg-green-100 transition-colors"
                      >
                        <Tag className="w-3.5 h-3.5" />
                        Edit Attributes
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
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
                            className="px-2.5 py-1.5 bg-white text-blue-800 rounded-md text-xs font-semibold border border-green-300 shadow-sm hover:shadow transition-shadow flex items-center gap-1.5"
                          >
                            <span className="text-green-600 font-bold">{selectedAttr?.name || 'Unknown'}:</span>
                            <span className="text-gray-700 font-medium">{selectedValue?.value || 'Unknown'}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Step 1: Attribute Selection Mode */}
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

                    {/* Variant Attributes Section */}
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
                                className="flex items-center gap-3 p-4 bg-white rounded-lg border-2 border-gray-200 hover:border-green-300 transition-colors"
                              >
                                {/* Attribute Selection - Searchable Dropdown */}
                                <div className={`flex-1 relative variant-attribute-dropdown-container-${variantIndex}-${vAttrIndex}`}>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (!loadingAttributes) {
                                        const key = `${variantIndex}-${vAttrIndex}`;
                                        setVariantAttributeDropdownOpen(prev => ({ ...prev, [key]: !prev[key] }));
                                        setVariantAttributeSearchTerm(prev => ({ ...prev, [key]: '' }));
                                      }
                                    }}
                                    className={`w-full px-3 py-2 text-sm border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all flex items-center justify-between ${
                                      formErrors[
                                        `variant_attr_${variantIndex}_${vAttrIndex}`
                                      ]
                                        ? 'border-red-500 bg-red-50'
                                        : 'border-gray-300 bg-white'
                                    } ${loadingAttributes ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                                    disabled={loadingAttributes}
                                  >
                                    <span className={vAttr.attribute_id ? 'text-gray-900' : 'text-gray-500'}>
                                      {vAttr.attribute_id
                                        ? availableAttributes.find(a => (a._id || a.id) === vAttr.attribute_id)?.name || 'Select Attribute'
                                        : 'Select Attribute'}
                                    </span>
                                    {variantAttributeDropdownOpen[`${variantIndex}-${vAttrIndex}`] ? (
                                      <ChevronUp className="w-4 h-4 text-gray-400" />
                                    ) : (
                                      <ChevronDown className="w-4 h-4 text-gray-400" />
                                    )}
                                  </button>
                                  
                                  {variantAttributeDropdownOpen[`${variantIndex}-${vAttrIndex}`] && (
                                    <div 
                                      className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-64 overflow-hidden"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      {/* Search Input */}
                                      <div className="p-2 border-b border-gray-200">
                                        <div className="relative">
                                          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                          <input
                                            type="text"
                                            placeholder="Search attribute..."
                                            value={variantAttributeSearchTerm[`${variantIndex}-${vAttrIndex}`] || ''}
                                            onChange={(e) => {
                                              e.stopPropagation();
                                              setVariantAttributeSearchTerm(prev => ({ ...prev, [`${variantIndex}-${vAttrIndex}`]: e.target.value }));
                                            }}
                                            onClick={(e) => e.stopPropagation()}
                                            className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                            autoFocus
                                          />
                                        </div>
                                      </div>
                                      
                                      {/* Attribute List */}
                                      <div className="overflow-y-auto max-h-48">
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            handleVariantAttributeChange(variantIndex, vAttrIndex, 'attribute_id', '');
                                            const key = `${variantIndex}-${vAttrIndex}`;
                                            setVariantAttributeDropdownOpen(prev => ({ ...prev, [key]: false }));
                                            setVariantAttributeSearchTerm(prev => ({ ...prev, [key]: '' }));
                                          }}
                                          className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 transition-colors ${
                                            !vAttr.attribute_id ? 'bg-green-50 text-green-600' : 'text-gray-700'
                                          }`}
                                        >
                                          Select Attribute
                                        </button>
                                        {availableAttributes
                                          .filter(a => 
                                            a.name.toLowerCase().includes((variantAttributeSearchTerm[`${variantIndex}-${vAttrIndex}`] || '').toLowerCase())
                                          )
                                          .map((a) => (
                                            <button
                                              key={a._id || a.id}
                                              type="button"
                                              onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                handleVariantAttributeChange(variantIndex, vAttrIndex, 'attribute_id', a._id || a.id);
                                                const key = `${variantIndex}-${vAttrIndex}`;
                                                setVariantAttributeDropdownOpen(prev => ({ ...prev, [key]: false }));
                                                setVariantAttributeSearchTerm(prev => ({ ...prev, [key]: '' }));
                                              }}
                                              className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 transition-colors ${
                                                vAttr.attribute_id === (a._id || a.id) 
                                                  ? 'bg-green-50 text-green-600 font-medium' 
                                                  : 'text-gray-700'
                                              }`}
                                            >
                                              {a.name}
                                            </button>
                                          ))}
                                        {availableAttributes.filter(a => 
                                          a.name.toLowerCase().includes((variantAttributeSearchTerm[`${variantIndex}-${vAttrIndex}`] || '').toLowerCase())
                                        ).length === 0 && (
                                          <div className="px-3 py-4 text-sm text-gray-500 text-center">
                                            No attributes found
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>

                                {/* Value Selection - Searchable Dropdown */}
                                <div className={`flex-1 relative variant-attribute-value-dropdown-container-${variantIndex}-${vAttrIndex}`}>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (vAttr.attribute_id && !loadingAttributes) {
                                        const key = `${variantIndex}-${vAttrIndex}`;
                                        setVariantAttributeValueDropdownOpen(prev => ({ ...prev, [key]: !prev[key] }));
                                        setVariantAttributeValueSearchTerm(prev => ({ ...prev, [key]: '' }));
                                      }
                                    }}
                                    disabled={!vAttr.attribute_id || loadingAttributes}
                                    className={`w-full px-3 py-2 text-sm border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all flex items-center justify-between ${
                                      formErrors[
                                        `variant_value_${variantIndex}_${vAttrIndex}`
                                      ]
                                        ? 'border-red-500 bg-red-50'
                                        : 'border-gray-300'
                                    } ${!vAttr.attribute_id || loadingAttributes ? 'bg-gray-100 cursor-not-allowed' : 'bg-white cursor-pointer'}`}
                                  >
                                    <span className={vAttr.value_id ? 'text-gray-900' : 'text-gray-500'}>
                                      {vAttr.value_id
                                        ? vAttrValues.find(v => (v._id || v.id) === vAttr.value_id)?.value || 'Select Value'
                                        : 'Select Value'}
                                    </span>
                                    {variantAttributeValueDropdownOpen[`${variantIndex}-${vAttrIndex}`] ? (
                                      <ChevronUp className="w-4 h-4 text-gray-400" />
                                    ) : (
                                      <ChevronDown className="w-4 h-4 text-gray-400" />
                                    )}
                                  </button>
                                  
                                  {variantAttributeValueDropdownOpen[`${variantIndex}-${vAttrIndex}`] && vAttr.attribute_id && (
                                    <div 
                                      className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-64 overflow-hidden"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      {/* Search Input */}
                                      <div className="p-2 border-b border-gray-200">
                                        <div className="relative">
                                          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                          <input
                                            type="text"
                                            placeholder="Search value..."
                                            value={variantAttributeValueSearchTerm[`${variantIndex}-${vAttrIndex}`] || ''}
                                            onChange={(e) => {
                                              e.stopPropagation();
                                              setVariantAttributeValueSearchTerm(prev => ({ ...prev, [`${variantIndex}-${vAttrIndex}`]: e.target.value }));
                                            }}
                                            onClick={(e) => e.stopPropagation()}
                                            className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                            autoFocus
                                          />
                                        </div>
                                      </div>
                                      
                                      {/* Value List */}
                                      <div className="overflow-y-auto max-h-48">
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            handleVariantAttributeChange(variantIndex, vAttrIndex, 'value_id', '');
                                            const key = `${variantIndex}-${vAttrIndex}`;
                                            setVariantAttributeValueDropdownOpen(prev => ({ ...prev, [key]: false }));
                                            setVariantAttributeValueSearchTerm(prev => ({ ...prev, [key]: '' }));
                                          }}
                                          className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 transition-colors ${
                                            !vAttr.value_id ? 'bg-green-50 text-green-600' : 'text-gray-700'
                                          }`}
                                        >
                                          Select Value
                                        </button>
                                        {vAttrValues
                                          .filter(val => 
                                            val.value.toLowerCase().includes((variantAttributeValueSearchTerm[`${variantIndex}-${vAttrIndex}`] || '').toLowerCase())
                                          )
                                          .map((val) => (
                                            <button
                                              key={val._id || val.id}
                                              type="button"
                                              onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                handleVariantAttributeChange(variantIndex, vAttrIndex, 'value_id', val._id || val.id);
                                                const key = `${variantIndex}-${vAttrIndex}`;
                                                setVariantAttributeValueDropdownOpen(prev => ({ ...prev, [key]: false }));
                                                setVariantAttributeValueSearchTerm(prev => ({ ...prev, [key]: '' }));
                                              }}
                                              className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 transition-colors ${
                                                vAttr.value_id === (val._id || val.id) 
                                                  ? 'bg-green-50 text-green-600 font-medium' 
                                                  : 'text-gray-700'
                                              }`}
                                            >
                                              {val.value}
                                            </button>
                                          ))}
                                        {vAttrValues.filter(val => 
                                          val.value.toLowerCase().includes((variantAttributeValueSearchTerm[`${variantIndex}-${vAttrIndex}`] || '').toLowerCase())
                                        ).length === 0 && (
                                          <div className="px-3 py-4 text-sm text-gray-500 text-center">
                                            No values found
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>

                                {/* Remove Button */}
                                <button
                                  type="button"
                                  onClick={() =>
                                    removeVariantAttribute(variantIndex, vAttrIndex)
                                  }
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

                    {/* Continue Button */}
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
                  /* Step 2: Details Mode - Show Name, Price, etc. */
                  <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Variant Name */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Variant Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={variant.variant_name}
                      onChange={(e) =>
                        handleVariantChange(
                          variantIndex,
                          'variant_name',
                          e.target.value
                        )
                      }
                      className={`w-full px-3 py-1.5 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all text-sm ${
                        formErrors[`variant_name_${variantIndex}`]
                          ? 'border-red-500 bg-red-50'
                          : 'border-gray-300'
                      }`}
                      placeholder="e.g., Red - Large"
                    />
                    {formErrors[`variant_name_${variantIndex}`] && (
                      <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {formErrors[`variant_name_${variantIndex}`]}
                      </p>
                    )}
                  </div>

                  {/* Variant SKU */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Variant SKU <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={variant.variant_SKU}
                      onChange={(e) =>
                        handleVariantChange(
                          variantIndex,
                          'variant_SKU',
                          e.target.value
                        )
                      }
                      className={`w-full px-3 py-1.5 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all text-sm ${
                        formErrors[`variant_SKU_${variantIndex}`]
                          ? 'border-red-500 bg-red-50'
                          : 'border-gray-300'
                      }`}
                      placeholder="e.g., PROD-RED-L"
                    />
                    {formErrors[`variant_SKU_${variantIndex}`] && (
                      <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {formErrors[`variant_SKU_${variantIndex}`]}
                      </p>
                    )}
                  </div>

                  {/* Variant Price */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Variant Price <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <IndianRupee className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="number"
                        value={variant.variant_price}
                        onChange={(e) =>
                          handleVariantChange(
                            variantIndex,
                            'variant_price',
                            e.target.value
                          )
                        }
                        step="0.01"
                        min="0"
                        className={`w-full pl-9 pr-3 py-1.5 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all text-sm ${
                          formErrors[`variant_price_${variantIndex}`]
                            ? 'border-red-500 bg-red-50'
                            : 'border-gray-300'
                        }`}
                        placeholder="0.00"
                      />
                    </div>
                    {formErrors[`variant_price_${variantIndex}`] && (
                      <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {formErrors[`variant_price_${variantIndex}`]}
                      </p>
                    )}
                  </div>

                  {/* Quantity */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Quantity <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={variant.quantity}
                      onChange={(e) =>
                        handleVariantChange(
                          variantIndex,
                          'quantity',
                          e.target.value
                        )
                      }
                      min="0"
                      className={`w-full px-3 py-1.5 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all text-sm ${
                        formErrors[`variant_quantity_${variantIndex}`]
                          ? 'border-red-500 bg-red-50'
                          : 'border-gray-300'
                      }`}
                      placeholder="0"
                    />
                    {formErrors[`variant_quantity_${variantIndex}`] && (
                      <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {formErrors[`variant_quantity_${variantIndex}`]}
                      </p>
                    )}
                  </div>

                  {/* Variant Status */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={variant.status}
                      onChange={(e) =>
                        handleVariantChange(
                          variantIndex,
                          'status',
                          e.target.value
                        )
                      }
                      className="w-full px-3 py-1.5 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all text-sm"
                    >
                      <option value="ACTIVE">Active</option>
                      <option value="DRAFT">Draft</option>
                    </select>
                  </div>

                  {/* Variant Image */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Variant Image
                    </label>
                    {variant.variant_image_preview ? (
                      <div className="relative inline-block">
                        <img
                          src={variant.variant_image_preview}
                          alt={`Variant ${variantIndex + 1}`}
                          className="w-20 h-20 object-cover rounded-lg border border-gray-300 shadow-sm"
                        />
                        <button
                          type="button"
                          onClick={() => removeVariantImage(variantIndex)}
                          className="absolute -top-1.5 -right-1.5 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 shadow transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-20 h-20 border border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-green-500 hover:bg-green-50 transition-all bg-white">
                        <Upload className="w-4 h-4 text-gray-400" />
                        <span className="text-xs text-gray-500 mt-0.5 font-medium">Upload</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) =>
                            handleVariantImageChange(variantIndex, e)
                          }
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

      </form>
      </div>
        </>
      )}
    </div>
  );
};

export default ProductAdd;

