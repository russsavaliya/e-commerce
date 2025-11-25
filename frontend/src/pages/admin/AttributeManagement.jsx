/**
 * Attribute Management Page
 * Complete CRUD interface for managing product attributes
 */

import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Save,
  Loader2,
  Tag,
  PlusCircle,
  MinusCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  getAllAttributes,
  createAttribute,
  updateAttribute,
  deleteAttribute,
} from '../../services/admin/attributeService';

const AttributeManagement = () => {
  // State Management
  const [attributes, setAttributes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingAttribute, setEditingAttribute] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [expandedRows, setExpandedRows] = useState(new Set());

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalAttributes, setTotalAttributes] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [formData, setFormData] = useState({
    name: '',
    values: [{ value: '' }],
  });

  const [formErrors, setFormErrors] = useState({});

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
    let fetchPage = currentPage;
    let fetchLimit = itemsPerPage;
    let fetchSearch = searchQuery;

    // If search query exists, debounce and reset to page 1
    if (searchQuery.trim() !== '') {
      searchTimeoutRef.current = setTimeout(() => {
        fetchPage = 1;
        fetchSearch = searchQuery;
        const params = { page: fetchPage, limit: fetchLimit, search: fetchSearch };
        
        // Only fetch if parameters changed and not already fetching
        if (!isFetchingRef.current && 
            (lastParamsRef.current.page !== params.page || 
             lastParamsRef.current.limit !== params.limit || 
             lastParamsRef.current.search !== params.search)) {
          fetchAttributes(fetchPage, fetchLimit, fetchSearch);
        }
      }, 500);
    } else {
      // No search query - fetch immediately
      const params = { page: fetchPage, limit: fetchLimit, search: fetchSearch };
      
      // Only fetch if parameters changed and not already fetching
      if (!isFetchingRef.current && 
          (lastParamsRef.current.page !== params.page || 
           lastParamsRef.current.limit !== params.limit || 
           lastParamsRef.current.search !== params.search)) {
        fetchAttributes(fetchPage, fetchLimit, fetchSearch);
      }
    }

    // Cleanup
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
        searchTimeoutRef.current = null;
      }
    };
  }, [currentPage, itemsPerPage, searchQuery]);

  /**
   * Fetch all attributes from API with pagination and search
   */
  const fetchAttributes = async (page = currentPage, limit = itemsPerPage, search = '', forceRefresh = false) => {
    // Prevent duplicate calls
    if (isFetchingRef.current) {
      return;
    }

    // Check if same parameters (skip if forceRefresh is true)
    if (!forceRefresh && 
        lastParamsRef.current.page === page && 
        lastParamsRef.current.limit === limit && 
        lastParamsRef.current.search === search) {
      return;
    }

    isFetchingRef.current = true;
    lastParamsRef.current = { page, limit, search };

    try {
      setLoading(true);
      const data = await getAllAttributes(page, limit, search);

      // Handle different response structures
      const attributesArray = Array.isArray(data.data?.attributes)
        ? data.data.attributes
        : Array.isArray(data.data)
          ? data.data
          : Array.isArray(data.attributes)
            ? data.attributes
            : Array.isArray(data)
              ? data
              : [];

      // Normalize attributes to ensure they have a proper id field
      const normalizedAttributes = attributesArray.map((attr) => ({
        ...attr,
        id: attr._id || attr.id || Math.random().toString(36).substr(2, 9), // Fallback to random ID if neither exists
      }));

      setAttributes(normalizedAttributes);

      // Update pagination metadata from API response
      if (data.data?.total_count !== undefined) {
        setTotalAttributes(data.data.total_count);
        setTotalPages(data.data.total_pages || 1);
      } else if (data.total_count !== undefined) {
        setTotalAttributes(data.total_count);
        setTotalPages(data.total_pages || 1);
      } else {
        // Fallback: calculate from array length if API doesn't return total
        setTotalAttributes(attributesArray.length);
        setTotalPages(Math.ceil(attributesArray.length / limit) || 1);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to load attributes');
      setAttributes([]);
      setTotalAttributes(0);
      setTotalPages(1);
      // Reset last params on error so we can retry
      lastParamsRef.current = { page: null, limit: null, search: null };
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  };

  /**
   * Validate form data
   */
  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = 'Attribute name is required';
    }

    const validValues = formData.values.filter((v) => v.value.trim() !== '');
    if (validValues.length === 0) {
      errors.values = 'At least one value is required';
    }

    // Check for duplicate values
    const valueStrings = validValues.map((v) => v.value.trim().toLowerCase());
    const duplicates = valueStrings.filter(
      (v, index) => valueStrings.indexOf(v) !== index
    );
    if (duplicates.length > 0) {
      errors.values = 'Duplicate values are not allowed';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);

      // Filter out empty values
      const validValues = formData.values
        .filter((v) => v.value.trim() !== '')
        .map((v) => ({ value: v.value.trim() }));

      const attributeData = {
        name: formData.name.trim(),
        values: validValues,
      };

      if (editingAttribute) {
        const attributeId = editingAttribute._id || editingAttribute.id;
        await updateAttribute(attributeId, attributeData);
        toast.success('Attribute updated successfully!');
      } else {
        await createAttribute(attributeData);
        toast.success('Attribute created successfully!');
      }

      // Reset form and refresh list
      resetForm();
      await fetchAttributes(currentPage, itemsPerPage, searchQuery, true);
    } catch (error) {
      toast.error(error.message || 'Failed to save attribute');
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * Reset form to initial state
   */
  const resetForm = () => {
    setFormData({
      name: '',
      values: [{ value: '' }],
    });
    setFormErrors({});
    setShowForm(false);
    setEditingAttribute(null);
  };

  /**
   * Handle edit button click
   */
  const handleEdit = (attribute) => {
    setEditingAttribute(attribute);
    setFormData({
      name: attribute.name,
      values:
        attribute.values.length > 0
          ? attribute.values.map((v) => ({ value: v.value }))
          : [{ value: '' }],
    });
    setShowForm(true);
    setFormErrors({});
  };

  /**
   * Handle delete button click
   */
  const handleDelete = async (id) => {
    try {
      setSubmitting(true);
      await deleteAttribute(id);
      toast.success('Attribute deleted successfully!');
      await fetchAttributes(currentPage, itemsPerPage, searchQuery, true);
      setDeleteConfirm(null);
    } catch (error) {
      toast.error(error.message || 'Failed to delete attribute');
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * Add a new value field
   */
  const addValueField = () => {
    setFormData({
      ...formData,
      values: [...formData.values, { value: '' }],
    });
  };

  /**
   * Remove a value field
   */
  const removeValueField = (index) => {
    if (formData.values.length > 1) {
      const newValues = formData.values.filter((_, i) => i !== index);
      setFormData({
        ...formData,
        values: newValues,
      });
    }
  };

  /**
   * Update a value field
   */
  const updateValueField = (index, value) => {
    const newValues = [...formData.values];
    newValues[index].value = value;
    setFormData({
      ...formData,
      values: newValues,
    });

    // Clear error when user starts typing
    if (formErrors.values) {
      setFormErrors({ ...formErrors, values: '' });
    }
  };

  /**
   * Toggle row expansion to show/hide values
   */
  const toggleRowExpansion = (attributeId) => {
    setExpandedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(attributeId)) {
        newSet.delete(attributeId);
      } else {
        newSet.add(attributeId);
      }
      return newSet;
    });
  };

  return (
    <div className="space-y-4">
      {/* Overlay when form is open */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={resetForm}></div>
      )}
      {/* Header Section with Stats */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-lg font-semibold text-gray-900 mb-1">Attribute Management</h1>
            <p className="text-sm text-gray-600">
              Create and manage product attributes and their values
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
            Add Attribute
          </button>
        </div>

        {/* Stats Section */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <div className="flex items-center gap-2 text-gray-700">
              <Tag className="w-4 h-4 text-green-600" />
              <span className="font-medium">Total Attributes:</span>
              <span className="text-green-600 font-semibold">{totalAttributes}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <Tag className="w-4 h-4 text-green-600" />
              <span className="font-medium">Showing:</span>
              <span className="text-green-600 font-semibold">
                {attributes.length} of {totalAttributes}
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

      {/* Search Bar */}
      <div className="bg-white rounded-lg shadow-sm p-3 border border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search attributes or values..."
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            aria-label="Search attributes"
          />
        </div>
      </div>

      {/* Create/Edit Form - Modal */}
      {showForm && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div
            className="bg-white rounded-lg shadow-2xl p-5 border border-gray-200 w-full max-w-lg max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingAttribute ? 'Edit Attribute' : 'Add New Attribute'}
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
              {/* Attribute Name */}
              <div>
                <label
                  htmlFor="attributeName"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Attribute Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="attributeName"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    if (formErrors.name) {
                      setFormErrors({ ...formErrors, name: '' });
                    }
                  }}
                  placeholder="e.g., Color, Size, Material"
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${formErrors.name
                    ? 'border-red-300 bg-red-50'
                    : 'border-gray-300 bg-white'
                    }`}
                  aria-invalid={!!formErrors.name}
                  aria-describedby={formErrors.name ? 'name-error' : undefined}
                />
                {formErrors.name && (
                  <p id="name-error" className="mt-1.5 text-xs text-red-600" role="alert">
                    {formErrors.name}
                  </p>
                )}
              </div>

              {/* Values */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Values <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  {formData.values.map((valueItem, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={valueItem.value}
                        onChange={(e) => updateValueField(index, e.target.value)}
                        placeholder={`Value ${index + 1}`}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                      />
                      {formData.values.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeValueField(index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          aria-label="Remove value"
                        >
                          <MinusCircle className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addValueField}
                    className="flex items-center gap-2 px-3 py-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors border border-green-200 text-sm"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Add Value</span>
                  </button>
                </div>
                {formErrors.values && (
                  <p className="mt-1.5 text-xs text-red-600" role="alert">
                    {formErrors.values}
                  </p>
                )}
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
                      {editingAttribute ? 'Update Attribute' : 'Create Attribute'}
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
      {/* Attributes Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          // Loading State
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="w-10 h-10 animate-spin text-green-600 mb-3" />
            <span className="text-base font-medium text-gray-700">Loading attributes...</span>
            <span className="text-sm text-gray-500 mt-1">Please wait</span>
          </div>
        ) : (() => {
          const filtered = searchQuery.trim() === ''
            ? attributes
            : attributes.filter(
              (attr) =>
                attr.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (attr.values &&
                  attr.values.some((val) =>
                    val.value.toLowerCase().includes(searchQuery.toLowerCase())
                  ))
            );

          if (filtered.length === 0) {
            return (
              // Empty State
              <div className="flex flex-col items-center justify-center py-10 px-4">
                <Tag className="w-12 h-12 text-gray-300 mb-3" />
                <p className="text-base font-medium text-gray-900 mb-1">
                  {searchQuery ? 'No attributes found' : 'No attributes yet'}
                </p>
                <p className="text-sm text-gray-600 text-center">
                  {searchQuery
                    ? 'Try adjusting your search query'
                    : 'Get started by creating your first attribute'}
                </p>
              </div>
            );
          }

          return (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                      Attribute Name
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                      Values Count
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200">
                  {filtered.map((attribute) => {
                    // Use normalized id (after normalization, all attributes have id field)
                    const attributeId = attribute.id;
                    const isExpanded = expandedRows.has(attributeId);
                    const valuesCount = attribute.values ? attribute.values.length : 0;

                    return (
                      <React.Fragment key={attributeId}>
                        <tr
                          className="hover:bg-gray-50 cursor-pointer transition-colors"
                          onClick={() => toggleRowExpansion(attributeId)}
                        >
                          {/* Attribute Name */}
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              {isExpanded ? (
                                <ChevronUp className="w-3.5 h-3.5 text-gray-400" />
                              ) : (
                                <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                              )}
                              <Tag className="w-3.5 h-3.5 text-green-600" />
                              <span className="text-sm font-medium text-gray-900 capitalize">
                                {attribute.name}
                              </span>
                            </div>
                          </td>

                          {/* Values Count */}
                          <td className="px-4 py-3">
                            <span className="text-sm text-gray-600">
                              {valuesCount} {valuesCount === 1 ? 'value' : 'values'}
                            </span>
                          </td>

                          {/* Action Buttons */}
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                              <button
                                onClick={() => handleEdit(attribute)}
                                className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                aria-label={`Edit ${attribute.name}`}
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>

                              <button
                                onClick={() => setDeleteConfirm(attributeId)}
                                className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                aria-label={`Delete ${attribute.name}`}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                        {/* Expanded row showing values */}
                        {isExpanded && (
                          <tr className="bg-gray-50">
                            <td colSpan={3} className="px-4 py-3">
                              <div className="space-y-2">
                                <p className="text-xs font-medium text-gray-700 mb-2">Values:</p>
                                <div className="flex flex-wrap gap-2">
                                  {attribute.values && attribute.values.length > 0 ? (
                                    attribute.values.map((val, index) => (
                                      <span
                                        key={index}
                                        className="px-2.5 py-1 bg-green-50 text-gray-700 rounded-md text-xs border border-green-200"
                                      >
                                        {val.value}
                                      </span>
                                    ))
                                  ) : (
                                    <span className="text-xs text-gray-400 italic">No values</span>
                                  )}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          );
        })()}
      </div>

      {/* Pagination */}
      {totalPages > 1 && !loading && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-700">Items per page:</label>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
            <div className="text-sm text-gray-700">
              Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
              <span className="font-medium">
                {Math.min(currentPage * itemsPerPage, totalAttributes)}
              </span>{' '}
              of <span className="font-medium">{totalAttributes}</span> attributes
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Delete Attribute</h3>
                <p className="text-sm text-gray-600">This action cannot be undone</p>
              </div>
            </div>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete this attribute? All associated data will be
              permanently removed.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleDelete(deleteConfirm)}
                disabled={submitting}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  'Delete'
                )}
              </button>
              <button
                onClick={() => setDeleteConfirm(null)}
                disabled={submitting}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
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

export default AttributeManagement;

