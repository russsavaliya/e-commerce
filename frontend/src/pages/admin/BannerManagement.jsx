/**
 * Banner Management Page
 * Admin panel for managing homepage banners
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  X,
  Save,
  Loader2,
  Image as ImageIcon,
  Eye,
  EyeOff,
  GripVertical,
  Upload,
  Search,
  ChevronDown,
  FolderTree,
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  getAllBanners,
  createBanner,
  updateBanner,
  deleteBanner,
  toggleBannerStatus,
} from '../../services/admin/bannerService';
import { getAllCategories } from '../../services/admin/categoryService';

const BannerManagement = () => {
  // State Management
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [draggedIndex, setDraggedIndex] = useState(null);

  const [categories, setCategories] = useState([]);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [categorySearchTerm, setCategorySearchTerm] = useState('');
  const categoryDropdownRef = useRef(null);

  const [formData, setFormData] = useState({
    title: '',
    position: 'homepage_hero',
    category: '',
    order: 0,
    is_active: true,
    image: null,
    imagePreview: null,
    existing_image: '',
  });

  const [formErrors, setFormErrors] = useState({});

  // Fetch categories for linking banners
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
      console.error('Error fetching categories for banners:', error);
      toast.error('Failed to fetch categories');
      setCategories([]);
    } finally {
      setLoadingCategories(false);
    }
  };

  // Fetch banners
  const fetchBanners = async () => {
    try {
      setLoading(true);
      const response = await getAllBanners();
      if (response.status) {
        setBanners(response.data || []);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to fetch banners');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
    fetchCategories();
  }, []);

  // Close category dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target)) {
        setCategoryDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Filter categories based on search term
  const filteredCategories = categories.filter((cat) =>
    cat.name?.toLowerCase().includes(categorySearchTerm.toLowerCase())
  );

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
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

  // Handle image upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setFormErrors((prev) => ({
          ...prev,
          image: 'Please select a valid image file',
        }));
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setFormErrors((prev) => ({
          ...prev,
          image: 'Image size should be less than 5MB',
        }));
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          image: file,
          imagePreview: reader.result,
        }));
      };
      reader.readAsDataURL(file);

      // Clear error
      if (formErrors.image) {
        setFormErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.image;
          return newErrors;
        });
      }
    }
  };

  // Validate form
  const validateForm = () => {
    const errors = {};

    if (!editingBanner && !formData.image && !formData.existing_image) {
      errors.image = 'Banner image is required';
    }

    if (formData.order < 0) {
      errors.order = 'Order must be a positive number';
    }

    // For homepage category strip, category is required
    if (formData.position === 'homepage_category_strip' && !formData.category) {
      errors.category = 'Please select a category for this banner';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    try {
      setSubmitting(true);

      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('position', formData.position);
      if (formData.category) {
        formDataToSend.append('category', formData.category);
      }
      formDataToSend.append('order', formData.order);
      formDataToSend.append('is_active', formData.is_active);

      // If new image selected, send only new image.
      if (formData.image) {
        formDataToSend.append('image', formData.image);
      } else if (editingBanner && formData.existing_image) {
        // If editing and no new image, send existing_image so backend keeps it
        formDataToSend.append('existing_image', formData.existing_image);
      }

      if (editingBanner) {
        await updateBanner(editingBanner._id, formDataToSend);
        toast.success('Banner updated successfully!');
      } else {
        await createBanner(formDataToSend);
        toast.success('Banner created successfully!');
      }

      // Reset form and close
      resetForm();
      fetchBanners();
    } catch (error) {
      toast.error(error.message || 'Failed to save banner');
    } finally {
      setSubmitting(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      title: '',
      position: 'homepage_hero',
      category: '',
      order: 0,
      is_active: true,
      image: null,
      imagePreview: null,
      existing_image: '',
    });
    setFormErrors({});
    setEditingBanner(null);
    setShowForm(false);
  };

  // Handle edit
  const handleEdit = (banner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title || '',
      position: banner.position || 'homepage_hero',
      category: banner.category?._id || banner.category || '',
      order: banner.order || 0,
      is_active: banner.is_active !== undefined ? banner.is_active : true,
      image: null,
      imagePreview: null,
      existing_image: banner.image_url || '',
    });
    setFormErrors({});
    setShowForm(true);
  };

  // Handle delete
  const handleDelete = async (id) => {
    try {
      await deleteBanner(id);
      toast.success('Banner deleted successfully!');
      fetchBanners();
      setDeleteConfirm(null);
    } catch (error) {
      toast.error(error.message || 'Failed to delete banner');
    }
  };

  // Handle toggle status
  const handleToggleStatus = async (id) => {
    try {
      await toggleBannerStatus(id);
      toast.success('Banner status updated!');
      fetchBanners();
    } catch (error) {
      toast.error(error.message || 'Failed to update banner status');
    }
  };

  // Drag and drop handlers
  const handleDragStart = (index) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (e, dropIndex) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      return;
    }

    const newBanners = [...banners];
    const draggedBanner = newBanners[draggedIndex];
    newBanners.splice(draggedIndex, 1);
    newBanners.splice(dropIndex, 0, draggedBanner);

    // Update order values
    const updatedBanners = newBanners.map((banner, index) => ({
      ...banner,
      order: index,
    }));

    setBanners(updatedBanners);
    setDraggedIndex(null);

    // Update orders in backend
    try {
      const updatePromises = updatedBanners.map((banner, index) => {
        if (banner.order !== index) {
          const formData = new FormData();
          formData.append('title', banner.title);
          formData.append('position', banner.position);
          formData.append('order', index);
          formData.append('is_active', banner.is_active);
          formData.append('existing_image', banner.image_url);
          return updateBanner(banner._id, formData);
        }
        return Promise.resolve();
      });

      await Promise.all(updatePromises);
      toast.success('Banner order updated!');
      fetchBanners();
    } catch (error) {
      toast.error('Failed to update banner order');
      fetchBanners(); // Revert on error
    }
  };

  // Helper: Get position badge color
  const getPositionBadgeColor = (position) => {
    const colors = {
      'homepage_hero': 'bg-purple-100 text-purple-700 border-purple-200',
      'homepage_category_strip': 'bg-blue-100 text-blue-700 border-blue-200',
      'homepage_middle': 'bg-green-100 text-green-700 border-green-200',
      'homepage_bottom': 'bg-orange-100 text-orange-700 border-orange-200',
      'category_page': 'bg-pink-100 text-pink-700 border-pink-200',
      'product_page': 'bg-yellow-100 text-yellow-700 border-yellow-200',
    };
    return colors[position] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  // Helper: Get position display name
  const getPositionName = (position) => {
    const names = {
      'homepage_hero': 'Homepage Hero',
      'homepage_category_strip': 'Category Strip',
      'homepage_middle': 'Homepage Middle',
      'homepage_bottom': 'Homepage Bottom',
      'category_page': 'Category Page',
      'product_page': 'Product Page',
    };
    return names[position] || position;
  };

  // Helper: Get section header color
  const getSectionHeaderColor = (position) => {
    const colors = {
      'homepage_hero': 'border-l-purple-500 bg-purple-50',
      'homepage_category_strip': 'border-l-blue-500 bg-blue-50',
      'homepage_middle': 'border-l-green-500 bg-green-50',
      'homepage_bottom': 'border-l-orange-500 bg-orange-50',
      'category_page': 'border-l-pink-500 bg-pink-50',
      'product_page': 'border-l-yellow-500 bg-yellow-50',
    };
    return colors[position] || 'border-l-gray-500 bg-gray-50';
  };

  // Helper: Get card border color
  const getCardBorderColor = (position) => {
    const colors = {
      'homepage_hero': 'border-purple-300',
      'homepage_category_strip': 'border-blue-300',
      'homepage_middle': 'border-green-300',
      'homepage_bottom': 'border-orange-300',
      'category_page': 'border-pink-300',
      'product_page': 'border-yellow-300',
    };
    return colors[position] || 'border-gray-300';
  };

  // Helper: render banners section-wise so admin ko clearly dikhe kaunsa banner kahan use hoga
  const renderBannerSection = (sectionBanners, title, description) => {
    if (!sectionBanners || sectionBanners.length === 0) return null;

    const position = sectionBanners[0]?.position;
    const headerColor = getSectionHeaderColor(position);

    return (
      <div className="mb-8">
        <div className={`border-l-4 rounded-r-lg p-4 mb-4 ${headerColor}`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <span className="text-2xl">📌</span>
                {title}
              </h2>
              {description && (
                <p className="text-sm text-gray-600 mt-1">{description}</p>
              )}
            </div>
            <span className="px-3 py-1 bg-white rounded-lg text-sm font-semibold text-gray-700 border-2 border-gray-300">
              {sectionBanners.length} {sectionBanners.length === 1 ? 'Banner' : 'Banners'}
            </span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sectionBanners.map((banner, index) => (
            <div
              key={banner._id}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, index)}
              className={`bg-white rounded-lg border-2 overflow-hidden transition-all shadow-sm ${
                draggedIndex === index
                  ? 'opacity-50 border-green-500'
                  : `${getCardBorderColor(banner.position)} hover:shadow-lg`
              }`}
            >
              {/* Banner Image */}
              <div className="relative h-48 bg-gray-100">
                <img
                  src={banner.image_url}
                  alt={banner.title || 'Banner'}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/400x200?text=Image+Error';
                  }}
                />
                {/* Section Badge - Top Left */}
                <div className={`absolute top-2 left-2 px-3 py-1 rounded-lg text-xs font-bold border-2 ${getPositionBadgeColor(banner.position)}`}>
                  {getPositionName(banner.position)}
                </div>
                {/* Drag Handle */}
                <div className="absolute top-2 right-2 p-2 bg-black/50 text-white rounded cursor-move">
                  <GripVertical className="w-4 h-4" />
                </div>
                {/* Status Badge */}
                <div className="absolute bottom-2 right-2">
                  <button
                    onClick={() => handleToggleStatus(banner._id)}
                    className={`p-2 rounded-full ${
                      banner.is_active
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-400 text-white'
                    }`}
                    title={banner.is_active ? 'Active - Click to deactivate' : 'Inactive - Click to activate'}
                  >
                    {banner.is_active ? (
                      <Eye className="w-4 h-4" />
                    ) : (
                      <EyeOff className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Banner Info */}
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2 text-base">
                  {banner.title || 'Untitled Banner'}
                </h3>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-xs text-gray-500">
                    Order: <span className="font-semibold text-gray-700">{banner.order}</span>
                  </span>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      banner.is_active
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {banner.is_active ? '✓ Active' : '✗ Inactive'}
                  </span>
                </div>
                {banner.category && (
                  <div className="text-xs text-gray-500 mb-3">
                    Category: <span className="font-medium text-gray-700">{banner.category?.name || 'N/A'}</span>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 mt-3">
                  <button
                    onClick={() => handleEdit(banner)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(banner._id)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <ImageIcon className="w-7 h-7" style={{ color: '#4EA674' }} />
              Banner Management
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Manage homepage banners and their display order
            </p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Banner
          </button>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingBanner ? 'Edit Banner' : 'Add New Banner'}
              </h2>
              <button
                onClick={resetForm}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Banner Image {!editingBanner && <span className="text-red-500">*</span>}
                </label>
                <div className="flex items-center gap-4">
                  {/* Preview (if any) */}
                  {formData.imagePreview || formData.existing_image ? (
                    <div className="relative">
                      <img
                        src={formData.imagePreview || formData.existing_image}
                        alt="Banner preview"
                        className="w-48 h-32 object-cover rounded-lg border border-gray-300"
                      />
                    </div>
                  ) : null}

                  {/* Upload / Change button – always visible so admin can change image while editing */}
                  <label className="flex flex-col items-center justify-center w-48 h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-green-500 hover:bg-green-50 transition-all">
                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-600">
                      {formData.imagePreview || formData.existing_image ? 'Change Image' : 'Upload Image'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                </div>
                {formErrors.image && (
                  <p className="text-xs text-red-600 mt-1">{formErrors.image}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Recommended: 1920x600px, Max 5MB
                </p>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title (Optional)
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter banner title"
                />
              </div>

              {/* Position */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Banner Position <span className="text-red-500">*</span>
                </label>
                <select
                  name="position"
                  value={formData.position}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 max-h-48 overflow-y-auto shadow-sm"
                >
                  <option value="homepage_hero">Homepage Hero (Top Carousel)</option>
                  <option value="homepage_category_strip">Homepage Category Strip (Curved Cards)</option>
                  <option value="homepage_middle">Homepage Middle Section</option>
                  <option value="homepage_bottom">Homepage Bottom Section</option>
                  <option value="category_page">Category Page</option>
                  <option value="product_page">Product Page</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Select where this banner should be displayed
                </p>
              </div>

              {/* Category (for category strip / category banners) */}
              <div className="category-dropdown-container" ref={categoryDropdownRef}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Linked Category
                  {formData.position === 'homepage_category_strip' && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </label>
                {loadingCategories ? (
                  <div className="flex items-center gap-2 text-gray-500">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Loading categories...</span>
                  </div>
                ) : (
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                      className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-left flex items-center justify-between gap-3 ${
                        formErrors.category ? 'border-red-300' : 'border-gray-300'
                      } ${!formData.category ? 'text-gray-500' : 'text-gray-900'}`}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {formData.category ? (
                          <span className="truncate">
                            {categories.find((cat) => cat._id === formData.category)?.name || 'Selected Category'}
                          </span>
                        ) : (
                          <span>Select category (optional)</span>
                        )}
                      </div>
                      <ChevronDown
                        className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform ${
                          categoryDropdownOpen ? 'transform rotate-180' : ''
                        }`}
                      />
                    </button>
                    {categoryDropdownOpen && (
                      <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-xl overflow-hidden">
                        {/* Search Input Section */}
                        <div className="p-2.5 border-b border-gray-200 bg-gray-50">
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                            <input
                              type="text"
                              placeholder="Search categories..."
                              value={categorySearchTerm}
                              onChange={(e) => setCategorySearchTerm(e.target.value)}
                              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm bg-white"
                              onClick={(e) => e.stopPropagation()}
                              onKeyDown={(e) => e.stopPropagation()}
                            />
                          </div>
                        </div>

                        {/* Category List Section - Scrollable */}
                        <div className="max-h-[240px] overflow-y-auto custom-scrollbar">
                          <div className="py-1">
                            {/* No Category Option */}
                            <button
                              type="button"
                              onClick={() => {
                                setFormData((prev) => ({ ...prev, category: '' }));
                                setCategoryDropdownOpen(false);
                                setCategorySearchTerm('');
                                if (formErrors.category) {
                                  setFormErrors((prev) => {
                                    const newErrors = { ...prev };
                                    delete newErrors.category;
                                    return newErrors;
                                  });
                                }
                              }}
                              className={`w-full px-4 py-2.5 text-left hover:bg-gray-50 transition-colors flex items-center gap-3 ${
                                !formData.category ? 'bg-green-50 text-green-700 font-medium' : 'text-gray-700'
                              }`}
                            >
                              <FolderTree className="w-4 h-4 text-gray-400 flex-shrink-0" />
                              <span className="flex-1">No Category</span>
                            </button>

                            {/* Category Options */}
                            {filteredCategories.length > 0 ? (
                              <div className="pb-2">
                                {filteredCategories.map((cat, index) => (
                                  <button
                                    key={cat._id}
                                    type="button"
                                    onClick={() => {
                                      setFormData((prev) => ({ ...prev, category: cat._id }));
                                      setCategoryDropdownOpen(false);
                                      setCategorySearchTerm('');
                                      if (formErrors.category) {
                                        setFormErrors((prev) => {
                                          const newErrors = { ...prev };
                                          delete newErrors.category;
                                          return newErrors;
                                        });
                                      }
                                    }}
                                    className={`w-full px-4 py-2.5 text-left hover:bg-gray-50 transition-colors flex items-center gap-3 ${
                                      formData.category === cat._id 
                                        ? 'bg-green-50 text-green-700 font-medium' 
                                        : 'text-gray-700'
                                    }`}
                                  >
                                    <FolderTree className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                    <span className="truncate flex-1">{cat.name}</span>
                                    {formData.category === cat._id && (
                                      <span className="text-green-600 font-semibold flex-shrink-0">✓</span>
                                    )}
                                  </button>
                                ))}
                              </div>
                            ) : (
                              <div className="px-4 py-8 text-center text-gray-500">
                                <p className="text-sm">No categories found</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                {formErrors.category && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.category}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  For homepage category strip banners (Haldi, Marriage, etc.), select the related category.
                </p>
              </div>

              {/* Order */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Display Order
                </label>
                <input
                  type="number"
                  name="order"
                  value={formData.order}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                {formErrors.order && (
                  <p className="text-xs text-red-600 mt-1">{formErrors.order}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Lower numbers appear first
                </p>
              </div>

              {/* Active Status */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="is_active"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                  Active (Visible on homepage)
                </label>
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      {editingBanner ? 'Update Banner' : 'Create Banner'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Banner</h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete this banner? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Banners List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-green-600" />
        </div>
      ) : banners.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">No banners found</p>
          <p className="text-sm text-gray-500 mb-4">
            Create your first banner to display on the homepage
          </p>
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Banner
          </button>
        </div>
      ) : (
        <>
          {renderBannerSection(
            banners.filter((b) => b.position === 'homepage_hero'),
            'Homepage Hero Banners',
            'Top main slider banners (hero section).'
          )}

          {renderBannerSection(
            banners.filter((b) => b.position === 'homepage_category_strip'),
            'Homepage Category Strip Banners',
            'Curved category strip banners (Haldi, Marriage, etc.).'
          )}

          {renderBannerSection(
            banners.filter((b) => b.position === 'homepage_middle'),
            'Homepage Middle Banners',
            'Homepage middle section banners (between product sections).'
          )}

          {renderBannerSection(
            banners.filter((b) => b.position === 'homepage_bottom'),
            'Homepage Bottom Banners',
            'Banners shown at bottom of homepage.'
          )}

          {renderBannerSection(
            banners.filter((b) => b.position === 'category_page'),
            'Category Page Banners',
            'Banners used on category detail pages.'
          )}

          {renderBannerSection(
            banners.filter((b) => b.position === 'product_page'),
            'Product Page Banners',
            'Banners used on product detail pages.'
          )}

          {renderBannerSection(
            banners.filter(
              (b) =>
                ![
                  'homepage_hero',
                  'homepage_category_strip',
                  'homepage_middle',
                  'homepage_bottom',
                  'category_page',
                  'product_page',
                ].includes(b.position)
            ),
            'Other Banners',
            'Banners with custom positions.'
          )}
        </>
      )}

      {/* Drag and Drop Hint */}
      {banners.length > 0 && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-700">
            <strong>Tip:</strong> Drag and drop banners to reorder them. Lower order numbers appear first on the homepage.
          </p>
        </div>
      )}
    </div>
  );
};

export default BannerManagement;

