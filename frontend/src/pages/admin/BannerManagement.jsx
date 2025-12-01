/**
 * Banner Management Page
 * Admin panel for managing homepage banners
 */

import React, { useState, useEffect } from 'react';
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

      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }

      if (editingBanner && formData.existing_image) {
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

  return (
    <div className="w-full p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Banner Management</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage homepage banners and their display order
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Banner
        </button>
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
                  {formData.imagePreview || formData.existing_image ? (
                    <div className="relative">
                      <img
                        src={formData.imagePreview || formData.existing_image}
                        alt="Banner preview"
                        className="w-48 h-32 object-cover rounded-lg border border-gray-300"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setFormData((prev) => ({
                            ...prev,
                            image: null,
                            imagePreview: null,
                            existing_image: editingBanner ? prev.existing_image : '',
                          }));
                        }}
                        className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-48 h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-green-500 hover:bg-green-50 transition-all">
                      <Upload className="w-8 h-8 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-600">Upload Image</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  )}
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

              {/* Category (for category strip / category banners) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Linked Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  disabled={loadingCategories}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white max-h-48 overflow-y-auto shadow-sm"
                >
                  <option value="">Select category (optional)</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                {formErrors.category && (
                  <p className="text-xs text-red-600 mt-1">{formErrors.category}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  For homepage category strip banners (Haldi, Marriage, etc.), select the related category.
                </p>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {banners.map((banner, index) => (
            <div
              key={banner._id}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, index)}
              className={`bg-white rounded-lg border-2 border-gray-200 overflow-hidden transition-all ${
                draggedIndex === index
                  ? 'opacity-50 border-green-500'
                  : 'hover:border-green-300 hover:shadow-lg'
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
                {/* Drag Handle */}
                <div className="absolute top-2 left-2 p-2 bg-black/50 text-white rounded cursor-move">
                  <GripVertical className="w-4 h-4" />
                </div>
                {/* Status Badge */}
                <div className="absolute top-2 right-2">
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
                <h3 className="font-semibold text-gray-900 mb-1">
                  {banner.title || 'Untitled Banner'}
                </h3>
                <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                    {banner.position === 'homepage_hero' ? 'Homepage Hero' :
                     banner.position === 'homepage_middle' ? 'Homepage Middle' :
                     banner.position === 'homepage_bottom' ? 'Homepage Bottom' :
                     banner.position === 'category_page' ? 'Category Page' :
                     banner.position === 'product_page' ? 'Product Page' : banner.position}
                  </span>
                  <span
                    className={`px-2 py-1 rounded ${
                      banner.is_active
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {banner.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="text-xs text-gray-500 mb-3">
                  Order: {banner.order}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(banner)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(banner._id)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
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

