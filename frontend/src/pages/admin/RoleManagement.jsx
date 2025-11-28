/**
 * Role Management Page
 * Complete CRUD interface for managing roles and permissions
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
  Shield,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  CheckSquare,
  Square,
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  getAllRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
} from '../../services/admin/roleService';

// Available permissions from backend model
const AVAILABLE_PERMISSIONS = [
  'super_admin',
  'admin_create',
  'admin_delete',
  'role_create',
  'role_update',
  'role_delete',
  'category_add',
  'category_update',
  'category_delete',
  'attribute_add',
  'attribute_update',
  'attribute_delete',
  'product_add',
  'product_update',
  'product_delete',
];

const RoleManagement = () => {
  // State Management
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalRoles, setTotalRoles] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [formData, setFormData] = useState({
    name: '',
    title: '',
    permissions: [],
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
          fetchRoles(fetchPage, fetchLimit, fetchSearch);
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
        fetchRoles(fetchPage, fetchLimit, fetchSearch);
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
   * Fetch all roles from API with pagination and search
   */
  const fetchRoles = async (page = currentPage, limit = itemsPerPage, search = '', forceRefresh = false) => {
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
      const data = await getAllRoles(page, limit, search);

      // Handle different response structures
      const rolesArray = Array.isArray(data.data?.roles)
        ? data.data.roles
        : Array.isArray(data.data)
          ? data.data
          : Array.isArray(data.roles)
            ? data.roles
            : Array.isArray(data)
              ? data
              : [];

      // Normalize roles to ensure they have a proper id field
      const normalizedRoles = rolesArray.map((role) => ({
        ...role,
        id: role._id || role.id || Math.random().toString(36).substr(2, 9),
      }));

      setRoles(normalizedRoles);

      // Update pagination metadata from API response
      if (data.data?.total_count !== undefined) {
        setTotalRoles(data.data.total_count);
        setTotalPages(data.data.total_pages || 1);
      } else if (data.total_count !== undefined) {
        setTotalRoles(data.total_count);
        setTotalPages(data.total_pages || 1);
      } else {
        // Fallback: calculate from array length if API doesn't return total
        setTotalRoles(rolesArray.length);
        setTotalPages(Math.ceil(rolesArray.length / limit) || 1);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to load roles');
      setRoles([]);
      setTotalRoles(0);
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
      errors.name = 'Role name is required';
    }

    if (!formData.title.trim()) {
      errors.title = 'Role title is required';
    }

    if (formData.permissions.length === 0) {
      errors.permissions = 'At least one permission is required';
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

      const roleData = {
        name: formData.name.trim(),
        title: formData.title.trim(),
        permissions: formData.permissions,
      };

      if (editingRole) {
        const roleId = editingRole._id || editingRole.id;
        await updateRole(roleId, roleData);
        toast.success('Role updated successfully!');
      } else {
        await createRole(roleData);
        toast.success('Role created successfully!');
      }

      // Reset form and refresh list
      resetForm();
      await fetchRoles(currentPage, itemsPerPage, searchQuery, true);
    } catch (error) {
      toast.error(error.message || 'Failed to save role');
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
      title: '',
      permissions: [],
    });
    setFormErrors({});
    setShowForm(false);
    setEditingRole(null);
  };

  /**
   * Handle edit button click
   */
  const handleEdit = (role) => {
    setEditingRole(role);
    setFormData({
      name: role.name || '',
      title: role.title || '',
      permissions: Array.isArray(role.permissions) ? [...role.permissions] : [],
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
      await deleteRole(id);
      toast.success('Role deleted successfully!');
      await fetchRoles(currentPage, itemsPerPage, searchQuery, true);
      setDeleteConfirm(null);
    } catch (error) {
      toast.error(error.message || 'Failed to delete role');
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * Toggle permission selection
   */
  const togglePermission = (permission) => {
    setFormData((prev) => {
      const permissions = prev.permissions.includes(permission)
        ? prev.permissions.filter((p) => p !== permission)
        : [...prev.permissions, permission];

      return {
        ...prev,
        permissions,
      };
    });

    // Clear error when user selects a permission
    if (formErrors.permissions) {
      setFormErrors({ ...formErrors, permissions: '' });
    }
  };

  /**
   * Select all permissions
   */
  const selectAllPermissions = () => {
    setFormData((prev) => ({
      ...prev,
      permissions: [...AVAILABLE_PERMISSIONS],
    }));
    if (formErrors.permissions) {
      setFormErrors({ ...formErrors, permissions: '' });
    }
  };

  /**
   * Deselect all permissions
   */
  const deselectAllPermissions = () => {
    setFormData((prev) => ({
      ...prev,
      permissions: [],
    }));
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
            <h1 className="text-lg font-semibold text-gray-900 mb-1">Role Management</h1>
            <p className="text-sm text-gray-600">
              Create and manage roles with specific permissions
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
            Add Role
          </button>
        </div>

        {/* Stats Section */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <div className="flex items-center gap-2 text-gray-700">
              <Shield className="w-4 h-4 text-green-600" />
              <span className="font-medium">Total Roles:</span>
              <span className="text-green-600 font-semibold">{totalRoles}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <Shield className="w-4 h-4 text-green-600" />
              <span className="font-medium">Showing:</span>
              <span className="text-green-600 font-semibold">
                {roles.length} of {totalRoles}
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
            placeholder="Search roles by name or title..."
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            aria-label="Search roles"
          />
        </div>
      </div>

      {/* Create/Edit Form - Modal */}
      {showForm && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div
            className="bg-white rounded-lg shadow-2xl p-5 border border-gray-200 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingRole ? 'Edit Role' : 'Add New Role'}
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
              {/* Role Name */}
              <div>
                <label
                  htmlFor="roleName"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Role Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="roleName"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    if (formErrors.name) {
                      setFormErrors({ ...formErrors, name: '' });
                    }
                  }}
                  placeholder="e.g., admin, manager, editor"
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

              {/* Role Title */}
              <div>
                <label
                  htmlFor="roleTitle"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Role Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="roleTitle"
                  value={formData.title}
                  onChange={(e) => {
                    setFormData({ ...formData, title: e.target.value });
                    if (formErrors.title) {
                      setFormErrors({ ...formErrors, title: '' });
                    }
                  }}
                  placeholder="e.g., Administrator, Manager, Editor"
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${formErrors.title
                      ? 'border-red-300 bg-red-50'
                      : 'border-gray-300 bg-white'
                    }`}
                  aria-invalid={!!formErrors.title}
                  aria-describedby={formErrors.title ? 'title-error' : undefined}
                />
                {formErrors.title && (
                  <p id="title-error" className="mt-1.5 text-xs text-red-600" role="alert">
                    {formErrors.title}
                  </p>
                )}
              </div>

              {/* Permissions */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Permissions <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={selectAllPermissions}
                      className="text-xs text-green-600 hover:text-green-700 font-medium"
                    >
                      Select All
                    </button>
                    <span className="text-gray-300">|</span>
                    <button
                      type="button"
                      onClick={deselectAllPermissions}
                      className="text-xs text-gray-600 hover:text-gray-700 font-medium"
                    >
                      Deselect All
                    </button>
                  </div>
                </div>
                <div className="border border-gray-300 rounded-lg p-3 max-h-64 overflow-y-auto bg-gray-50">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {AVAILABLE_PERMISSIONS.map((permission) => {
                      const isSelected = formData.permissions.includes(permission);
                      return (
                        <label
                          key={permission}
                          className="flex items-center gap-2 p-2 rounded-lg hover:bg-white cursor-pointer transition-colors"
                        >
                          <div className="relative">
                            {isSelected ? (
                              <CheckSquare className="w-4 h-4 text-green-600" />
                            ) : (
                              <Square className="w-4 h-4 text-gray-400" />
                            )}
                          </div>
                          <span className="text-sm text-gray-700 capitalize">
                            {permission.replace(/_/g, ' ')}
                          </span>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => togglePermission(permission)}
                            className="sr-only"
                          />
                        </label>
                      );
                    })}
                  </div>
                </div>
                {formErrors.permissions && (
                  <p className="mt-1.5 text-xs text-red-600" role="alert">
                    {formErrors.permissions}
                  </p>
                )}
                <p className="mt-2 text-xs text-gray-500">
                  Selected: {formData.permissions.length} of {AVAILABLE_PERMISSIONS.length} permissions
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
                      {editingRole ? 'Update Role' : 'Create Role'}
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

      {/* Roles Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          // Loading State
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="w-10 h-10 animate-spin text-green-600 mb-3" />
            <span className="text-base font-medium text-gray-700">Loading roles...</span>
            <span className="text-sm text-gray-500 mt-1">Please wait</span>
          </div>
        ) : roles.length === 0 ? (
          // Empty State
          <div className="flex flex-col items-center justify-center py-10 px-4">
            <Shield className="w-12 h-12 text-gray-300 mb-3" />
            <p className="text-base font-medium text-gray-900 mb-1">
              {searchQuery ? 'No roles found' : 'No roles yet'}
            </p>
            <p className="text-sm text-gray-600 text-center">
              {searchQuery
                ? 'Try adjusting your search query'
                : 'Get started by creating your first role'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                    Role Name
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                    Title
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                    Permissions
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {roles.map((role) => {
                  const roleId = role.id;
                  const permissionsCount = role.permissions ? role.permissions.length : 0;

                  return (
                    <tr key={roleId} className="hover:bg-gray-50 transition-colors">
                      {/* Role Name */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Shield className="w-4 h-4 text-green-600" />
                          <span className="text-sm font-medium text-gray-900">
                            {role.name}
                          </span>
                        </div>
                      </td>

                      {/* Title */}
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-700">{role.title}</span>
                      </td>

                      {/* Permissions Count */}
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-600">
                          {permissionsCount} {permissionsCount === 1 ? 'permission' : 'permissions'}
                        </span>
                      </td>

                      {/* Action Buttons */}
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(role)}
                            className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            aria-label={`Edit ${role.name}`}
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => setDeleteConfirm(roleId)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            aria-label={`Delete ${role.name}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
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
                {Math.min(currentPage * itemsPerPage, totalRoles)}
              </span>{' '}
              of <span className="font-medium">{totalRoles}</span> roles
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
                <h3 className="text-lg font-semibold text-gray-900">Delete Role</h3>
                <p className="text-sm text-gray-600">This action cannot be undone</p>
              </div>
            </div>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete this role? All associated data will be
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

export default RoleManagement;

