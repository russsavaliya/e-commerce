import { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Save,
  Loader2,
  FolderTree,
  ChevronLeft,
  ChevronRight,
  BarChart3,
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../../services/admin/categoryService';

const CategoryManagement = () => {
  // State Management
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalCategories, setTotalCategories] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [formData, setFormData] = useState({
    name: '',
    parent_category_id: '',
  });

  const [formErrors, setFormErrors] = useState({});

  const [searchTimeout, setSearchTimeout] = useState(null);

  // Effects
  useEffect(() => {
    fetchCategories(currentPage, itemsPerPage, searchQuery);
  }, [currentPage, itemsPerPage]);

  // Debounced search effect
  useEffect(() => {
    // Clear previous timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    // Set new timeout for search
    const timeout = setTimeout(() => {
      // Reset to page 1 when searching
      fetchCategories(1, itemsPerPage, searchQuery);
    }, 500); // 500ms debounce

    setSearchTimeout(timeout);

    // Cleanup
    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [searchQuery]);

  // Fetch Categories from API with Pagination and Search
  const fetchCategories = async (page = currentPage, limit = itemsPerPage, search = '') => {
    try {
      setLoading(true);
      const data = await getAllCategories(page, limit, search);
      const categoriesArray = Array.isArray(data.data?.exist_category) ? data.data.exist_category : [];

      // Update categories and pagination info
      setCategories(categoriesArray);
      setFilteredCategories(categoriesArray);

      // Update pagination metadata from API response
      if (data.data?.total_count !== undefined) {
        setTotalCategories(data.data.total_count);
        setTotalPages(data.data.total_pages || 1);
      } else {
        // Fallback: calculate from array length if API doesn't return total
        setTotalCategories(categoriesArray.length);
        setTotalPages(Math.ceil(categoriesArray.length / limit));
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error(error.message || 'Failed to fetch categories');
      setCategories([]);
      setFilteredCategories([]);
      setTotalCategories(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get parent category ID (handles both object and string/null)
  const getParentCategoryId = (parentCategoryId) => {
    if (!parentCategoryId) return null;
    // If parent_category_id is an object (populated), extract the _id
    if (typeof parentCategoryId === 'object' && parentCategoryId._id) {
      return parentCategoryId._id;
    }
    // If it's already a string, return it
    return parentCategoryId;
  };

  // Get Full Category Path (Parent > Child)
  const getCategoryPath = (category) => {
    const parentId = getParentCategoryId(category.parent_category_id);
    if (!parentId) {
      return category.name;
    }

    // Find parent category by _id
    const parent = categories.find((c) => c._id === parentId);
    if (parent) {
      return `${getCategoryPath(parent)} > ${category.name}`;
    }

    // If parent not found in current list, use the populated object's name
    if (typeof category.parent_category_id === 'object' && category.parent_category_id.name) {
      return `${category.parent_category_id.name} > ${category.name}`;
    }

    return category.name;
  };

  // Get Parent Category Name
  const getParentCategoryName = (parentCategoryId) => {
    if (!parentCategoryId) return 'None (Top Level)';

    // If parent_category_id is an object (populated), use its name directly
    if (typeof parentCategoryId === 'object' && parentCategoryId.name) {
      return parentCategoryId.name;
    }

    // If it's a string ID, find the parent in categories
    const parent = categories.find((c) => c._id === parentCategoryId);
    return parent ? parent.name : 'Unknown';
  };

  // Get All Parent Options (for dropdown)
  const getAllParentOptions = (excludeId = null) => {
    // Use _id to exclude the current category being edited
    return categories.filter((cat) => cat._id !== excludeId);
  };

  // Form Validation
  const validateForm = () => {
    const errors = {};

    // Check if name is empty
    if (!formData.name.trim()) {
      errors.name = 'Category name is required';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Category name must be at least 2 characters';
    }

    // Check for duplicate names at the same level
    const existingCategory = categories.find((cat) => {
      const catParentId = getParentCategoryId(cat.parent_category_id);
      const formParentId = formData.parent_category_id || null;
      return (
        cat.name.toLowerCase() === formData.name.toLowerCase().trim() &&
        catParentId === formParentId &&
        cat._id !== editingCategory?._id
      );
    });

    if (existingCategory) {
      errors.name = 'A category with this name already exists at this level';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle Form Submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);

      const categoryPayload = {
        name: formData.name.trim(),
        parent_category_id: formData.parent_category_id || null,
      };

      if (editingCategory) {
        // Use _id for updating category
        await updateCategory(editingCategory._id, categoryPayload);
        toast.success('Category updated successfully!');
      } else {
        await createCategory(categoryPayload);
        toast.success('Category created successfully!');
      }

      resetForm();
      // Reset to first page after creating/updating
      setCurrentPage(1);
      fetchCategories(1, itemsPerPage, searchQuery);
    } catch (error) {
      console.error('Error saving category:', error);
      toast.error(error.message || 'Failed to save category');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Edit Category
  const handleEdit = (category) => {
    setEditingCategory(category);
    // Extract parent category ID - handle both object and string/null
    const parentId = getParentCategoryId(category.parent_category_id);
    setFormData({
      name: category.name,
      parent_category_id: parentId || '',
    });
    setShowForm(true);
    setFormErrors({});
  };

  // Handle Delete Category
  const handleDelete = async (categoryId) => {
    try {
      setSubmitting(true);
      await deleteCategory(categoryId);
      toast.success('Category deleted successfully!');
      // If current page becomes empty, go to previous page
      if (filteredCategories.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
      fetchCategories(currentPage - 1, itemsPerPage, searchQuery);
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error(error.message || 'Failed to delete category');
    } finally {
      setSubmitting(false);
    }
  };

  // Reset Form
  const resetForm = () => {
    setFormData({
      name: '',
      parent_category_id: '',
    });
    setEditingCategory(null);
    setShowForm(false);
    setFormErrors({});
  };

  return (
    <div className={`space-y-4 ${showForm ? 'relative' : ''}`}>
      {/* Loading Overlay */}
      {submitting && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-xl p-8 flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 animate-spin text-green-600" />
            <span className="text-lg font-semibold text-gray-900">Processing...</span>
            <span className="text-sm text-gray-600">Please wait</span>
          </div>
        </div>
      )}
      {/* Overlay when form is open */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={resetForm}></div>
      )}
      {/* Header Section with Stats */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-lg font-semibold text-gray-900 mb-1">Category Management</h1>
            <p className="text-sm text-gray-600">
              Create and manage product categories with hierarchical structure
            </p>
          </div>

          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Category
          </button>
        </div>

        {/* Stats Section */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <div className="flex items-center gap-2 text-gray-700">
              <BarChart3 className="w-4 h-4 text-green-600" />
              <span className="font-medium">Total Categories:</span>
              <span className="text-green-600 font-semibold">{totalCategories}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <FolderTree className="w-4 h-4 text-green-600" />
              <span className="font-medium">Showing:</span>
              <span className="text-green-600 font-semibold">
                {filteredCategories.length} of {totalCategories}
              </span>
            </div>
            {totalPages > 1 && (
              <div className="flex items-center gap-2 text-gray-700">
                <span className="font-medium">Page:</span>
                <span className="text-purple-600 font-semibold">
                  {currentPage} of {totalPages}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add/Edit Form - Modal */}
      {showForm && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div
            className="bg-white rounded-lg shadow-2xl p-5 border border-gray-200 w-full max-w-lg max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </h2>
              <button
                onClick={resetForm}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Close form"
              >
                <X className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Category Name Input */}
              <div>
                <label
                  htmlFor="categoryName"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Category Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="categoryName"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    if (formErrors.name) {
                      setFormErrors({ ...formErrors, name: '' });
                    }
                  }}
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${formErrors.name
                    ? 'border-red-300 bg-red-50'
                    : 'border-gray-300 bg-white'
                    }`}
                  placeholder="Enter category name"
                  aria-invalid={!!formErrors.name}
                  aria-describedby={formErrors.name ? 'name-error' : undefined}
                />
                {formErrors.name && (
                  <p id="name-error" className="mt-1.5 text-xs text-red-600" role="alert">
                    {formErrors.name}
                  </p>
                )}
              </div>

              {/* Parent Category Dropdown */}
              <div>
                <label
                  htmlFor="parentCategory"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Parent Category <span className="text-gray-400 text-xs">(Optional)</span>
                </label>
                <select
                  id="parentCategory"
                  value={formData.parent_category_id}
                  onChange={(e) =>
                    setFormData({ ...formData, parent_category_id: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                >
                  <option value="">None (Top Level Category)</option>
                  {/* Use _id for option value - this ensures we pass _id instead of name */}
                  {getAllParentOptions(editingCategory?._id).map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {getCategoryPath(cat)}
                    </option>
                  ))}
                </select>
                <p className="mt-1.5 text-xs text-gray-500">
                  Leave empty to create a top-level category
                </p>
              </div>

              {/* Form Action Buttons */}
              <div className="flex items-center gap-3 pt-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      {editingCategory ? 'Update Category' : 'Create Category'}
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={resetForm}
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

      {/* Search Bar */}
      <div className="bg-white rounded-lg shadow-sm p-3 border border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1); // Reset to page 1 when search changes
            }}
            placeholder="Search categories..."
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            aria-label="Search categories"
          />
        </div>
      </div>

      {/* Categories Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          // Loading State
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="w-10 h-10 animate-spin text-green-600 mb-3" />
            <span className="text-base font-medium text-gray-700">Loading categories...</span>
            <span className="text-sm text-gray-500 mt-1">Please wait</span>
          </div>
        ) : filteredCategories.length === 0 ? (
          // Empty State
          <div className="flex flex-col items-center justify-center py-10 px-4">
            <FolderTree className="w-12 h-12 text-gray-300 mb-3" />
            <p className="text-base font-medium text-gray-900 mb-1">
              {searchQuery ? 'No categories found' : 'No categories yet'}
            </p>
            <p className="text-sm text-gray-600 text-center">
              {searchQuery
                ? 'Try adjusting your search query'
                : 'Get started by creating your first category'}
            </p>
          </div>
        ) : (
          // Categories Table
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                    Category Name
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                    Parent Category
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {filteredCategories.map((category) => (
                  <tr
                    key={category._id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    {/* Category Name */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <FolderTree className="w-3.5 h-3.5 text-green-600" />
                        <span className="text-sm font-medium text-gray-900">
                          {category.name}
                        </span>
                      </div>
                    </td>

                    {/* Parent Category */}
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-600">
                        {getParentCategoryName(category.parent_category_id)}
                      </span>
                    </td>

                    {/* Action Buttons */}
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(category)}
                          className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          aria-label={`Edit ${category.name}`}
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => setDeleteConfirm(category)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          aria-label={`Delete ${category.name}`}
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
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && !loading && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Items per page selector */}
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-700">Items per page:</label>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1); // Reset to first page when changing items per page
                }}
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
              Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
              <span className="font-medium">
                {Math.min(currentPage * itemsPerPage, totalCategories)}
              </span>{' '}
              of <span className="font-medium">{totalCategories}</span> categories
            </div>

            {/* Pagination buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* Page numbers */}
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${currentPage === pageNum
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
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Next page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-5">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Confirm Delete
            </h3>

            <p className="text-sm text-gray-600 mb-5">
              Are you sure you want to delete the category{' '}
              <span className="font-semibold text-gray-900">
                "{deleteConfirm.name}"
              </span>
              ? This action cannot be undone.
            </p>

            <div className="flex items-center gap-3">
              <button
                onClick={() => handleDelete(deleteConfirm._id)}
                disabled={submitting}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Deleting...' : 'Delete'}
              </button>

              <button
                onClick={() => setDeleteConfirm(null)}
                disabled={submitting}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
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

export default CategoryManagement;