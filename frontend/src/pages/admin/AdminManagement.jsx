/**
 * Admin Management Page
 * Interface for creating and managing admin users
 */

import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Trash2,
  X,
  Save,
  Loader2,
  UserPlus,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Eye,
  EyeOff,
  Users,
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  getAllAdmins,
  createAdmin,
  deleteAdmin,
} from '../../services/admin/adminService';
import {
  getAllRoles,
} from '../../services/admin/roleService';

const AdminManagement = () => {
  // State Management
  const [admins, setAdmins] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [createdAdmin, setCreatedAdmin] = useState(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalAdmins, setTotalAdmins] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: '',
  });

  const [formErrors, setFormErrors] = useState({});

  const searchTimeoutRef = React.useRef(null);
  const isFetchingRef = React.useRef(false);
  const lastParamsRef = React.useRef({ page: null, limit: null, search: null });

  // Fetch roles on component mount
  useEffect(() => {
    fetchRoles();
  }, []);

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
          fetchAdmins(fetchPage, fetchLimit, fetchSearch);
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
        fetchAdmins(fetchPage, fetchLimit, fetchSearch);
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
   * Fetch all roles for dropdown
   */
  const fetchRoles = async () => {
    try {
      setLoadingRoles(true);
      const data = await getAllRoles(1, 100, ''); // Get all roles
      const rolesArray = Array.isArray(data.data?.roles)
        ? data.data.roles
        : Array.isArray(data.data)
          ? data.data
          : Array.isArray(data.roles)
            ? data.roles
            : [];
      setRoles(rolesArray);
    } catch (error) {
      toast.error(error.message || 'Failed to load roles');
      setRoles([]);
    } finally {
      setLoadingRoles(false);
    }
  };

  /**
   * Fetch all admins from API with pagination and search
   */
  const fetchAdmins = async (page = currentPage, limit = itemsPerPage, search = '', forceRefresh = false) => {
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
      const data = await getAllAdmins(page, limit, search);

      // Handle different response structures
      const adminsArray = Array.isArray(data.data?.admins)
        ? data.data.admins
        : Array.isArray(data.data)
          ? data.data
          : Array.isArray(data.admins)
            ? data.admins
            : Array.isArray(data)
              ? data
              : [];

      // Normalize admins to ensure they have a proper id field
      const normalizedAdmins = adminsArray.map((admin) => ({
        ...admin,
        id: admin._id || admin.id || Math.random().toString(36).substr(2, 9),
      }));

      setAdmins(normalizedAdmins);

      // Update pagination metadata from API response
      if (data.data?.total_count !== undefined) {
        setTotalAdmins(data.data.total_count);
        setTotalPages(data.data.total_pages || 1);
      } else if (data.total_count !== undefined) {
        setTotalAdmins(data.total_count);
        setTotalPages(data.total_pages || 1);
      } else {
        // Fallback: calculate from array length if API doesn't return total
        setTotalAdmins(adminsArray.length);
        setTotalPages(Math.ceil(adminsArray.length / limit) || 1);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to load admins');
      setAdmins([]);
      setTotalAdmins(0);
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
      errors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!formData.password.trim()) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    if (!formData.role) {
      errors.role = 'Role is required';
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

      const adminData = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        role: formData.role,
      };

      const response = await createAdmin(adminData);
      
      // Store created admin info to show success message
      setCreatedAdmin({
        name: response.data?.name || formData.name,
        email: response.data?.email || formData.email,
        id: response.data?._id || response.data?.id,
      });

      toast.success('Admin created successfully!');
      
      // Reset form and refresh list
      resetForm();
      await fetchAdmins(currentPage, itemsPerPage, searchQuery, true);
      
      // Show success modal for 5 seconds
      setTimeout(() => {
        setCreatedAdmin(null);
      }, 5000);
    } catch (error) {
      toast.error(error.message || 'Failed to create admin');
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
      email: '',
      password: '',
      role: '',
    });
    setFormErrors({});
    setShowForm(false);
    setShowPassword(false);
  };

  /**
   * Handle delete button click
   */
  const handleDelete = async (id) => {
    try {
      setSubmitting(true);
      await deleteAdmin(id);
      toast.success('Admin deleted successfully!');
      await fetchAdmins(currentPage, itemsPerPage, searchQuery, true);
      setDeleteConfirm(null);
    } catch (error) {
      toast.error(error.message || 'Failed to delete admin');
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * Generate random password
   */
  const generatePassword = () => {
    const length = 12;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    setFormData({ ...formData, password });
    if (formErrors.password) {
      setFormErrors({ ...formErrors, password: '' });
    }
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
            <h1 className="text-lg font-semibold text-gray-900 mb-1">Admin Management</h1>
            <p className="text-sm text-gray-600">
              Create and manage admin users with roles and permissions
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
            Add Admin
          </button>
        </div>

        {/* Stats Section */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <div className="flex items-center gap-2 text-gray-700">
              <Users className="w-4 h-4 text-green-600" />
              <span className="font-medium">Total Admins:</span>
              <span className="text-green-600 font-semibold">{totalAdmins}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <Users className="w-4 h-4 text-green-600" />
              <span className="font-medium">Showing:</span>
              <span className="text-green-600 font-semibold">
                {admins.length} of {totalAdmins}
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
            placeholder="Search admins by name or email..."
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            aria-label="Search admins"
          />
        </div>
      </div>

      {/* Create Form - Modal */}
      {showForm && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div
            className="bg-white rounded-lg shadow-2xl p-5 border border-gray-200 w-full max-w-lg max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Add New Admin</h2>
              <button
                onClick={resetForm}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Close form"
              >
                <X className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label
                  htmlFor="adminName"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="adminName"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    if (formErrors.name) {
                      setFormErrors({ ...formErrors, name: '' });
                    }
                  }}
                  placeholder="Enter admin name"
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    formErrors.name
                      ? 'border-red-300 bg-red-50'
                      : 'border-gray-300 bg-white'
                  }`}
                  aria-invalid={!!formErrors.name}
                />
                {formErrors.name && (
                  <p className="mt-1.5 text-xs text-red-600" role="alert">
                    {formErrors.name}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="adminEmail"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="adminEmail"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value });
                    if (formErrors.email) {
                      setFormErrors({ ...formErrors, email: '' });
                    }
                  }}
                  placeholder="Enter email address"
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    formErrors.email
                      ? 'border-red-300 bg-red-50'
                      : 'border-gray-300 bg-white'
                  }`}
                  aria-invalid={!!formErrors.email}
                />
                {formErrors.email && (
                  <p className="mt-1.5 text-xs text-red-600" role="alert">
                    {formErrors.email}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="adminPassword"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="adminPassword"
                    value={formData.password}
                    onChange={(e) => {
                      setFormData({ ...formData, password: e.target.value });
                      if (formErrors.password) {
                        setFormErrors({ ...formErrors, password: '' });
                      }
                    }}
                    placeholder="Enter password"
                    className={`w-full px-3 py-2 pr-20 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                      formErrors.password
                        ? 'border-red-300 bg-red-50'
                        : 'border-gray-300 bg-white'
                    }`}
                    aria-invalid={!!formErrors.password}
                  />
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={generatePassword}
                      className="text-xs text-green-600 hover:text-green-700 font-medium px-2 py-1"
                    >
                      Generate
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="p-1 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                {formErrors.password && (
                  <p className="mt-1.5 text-xs text-red-600" role="alert">
                    {formErrors.password}
                  </p>
                )}
              </div>

              {/* Role */}
              <div>
                <label
                  htmlFor="adminRole"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Role <span className="text-red-500">*</span>
                </label>
                {loadingRoles ? (
                  <div className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg">
                    <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                    <span className="text-sm text-gray-500">Loading roles...</span>
                  </div>
                ) : (
                  <select
                    id="adminRole"
                    value={formData.role}
                    onChange={(e) => {
                      setFormData({ ...formData, role: e.target.value });
                      if (formErrors.role) {
                        setFormErrors({ ...formErrors, role: '' });
                      }
                    }}
                    className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                      formErrors.role
                        ? 'border-red-300 bg-red-50'
                        : 'border-gray-300 bg-white'
                    }`}
                    aria-invalid={!!formErrors.role}
                  >
                    <option value="">Select a role</option>
                    {roles.map((role) => (
                      <option key={role._id || role.id} value={role._id || role.id}>
                        {role.title || role.name}
                      </option>
                    ))}
                  </select>
                )}
                {formErrors.role && (
                  <p className="mt-1.5 text-xs text-red-600" role="alert">
                    {formErrors.role}
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
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Create Admin
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

      {/* Success Modal - Show Created Admin Info */}
      {createdAdmin && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <UserPlus className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Admin Created Successfully!</h3>
                <p className="text-sm text-gray-600">Share these credentials with the admin</p>
              </div>
            </div>
            <div className="space-y-3 mb-6">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-1">Name</p>
                <p className="text-sm font-medium text-gray-900">{createdAdmin.name}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-1">Email</p>
                <p className="text-sm font-medium text-gray-900">{createdAdmin.email}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-1">Admin ID</p>
                <p className="text-sm font-medium text-gray-900 break-all">{createdAdmin.id}</p>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-xs text-yellow-700">
                  <strong>Note:</strong> The password you set has been saved. Please share it securely with the admin.
                </p>
              </div>
            </div>
            <button
              onClick={() => setCreatedAdmin(null)}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {submitting && !showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-xl p-8 flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 animate-spin text-green-600" />
            <span className="text-lg font-semibold text-gray-900">Processing...</span>
            <span className="text-sm text-gray-600">Please wait</span>
          </div>
        </div>
      )}

      {/* Admins Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          // Loading State
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="w-10 h-10 animate-spin text-green-600 mb-3" />
            <span className="text-base font-medium text-gray-700">Loading admins...</span>
            <span className="text-sm text-gray-500 mt-1">Please wait</span>
          </div>
        ) : admins.length === 0 ? (
          // Empty State
          <div className="flex flex-col items-center justify-center py-10 px-4">
            <Users className="w-12 h-12 text-gray-300 mb-3" />
            <p className="text-base font-medium text-gray-900 mb-1">
              {searchQuery ? 'No admins found' : 'No admins yet'}
            </p>
            <p className="text-sm text-gray-600 text-center">
              {searchQuery
                ? 'Try adjusting your search query'
                : 'Get started by creating your first admin'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                    Role
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                    Type
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {admins.map((admin) => {
                  const adminId = admin.id;
                  const roleName = admin.role?.title || admin.role?.name || 'No Role';
                  // Check if super admin - handle both boolean true and string "true"
                  const isSuperAdmin = admin.isSuperAdmin === true || admin.isSuperAdmin === 'true' || admin.isSuperAdmin === 1;

                  return (
                    <tr key={adminId} className="hover:bg-gray-50 transition-colors">
                      {/* Name */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-green-600" />
                          <span className="text-sm font-medium text-gray-900">
                            {admin.name}
                          </span>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-700">{admin.email}</span>
                      </td>

                      {/* Role */}
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-600">{roleName}</span>
                      </td>

                      {/* Type */}
                      <td className="px-4 py-3">
                        {isSuperAdmin ? (
                          <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-md text-xs font-medium">
                            Super Admin
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-medium">
                            Admin
                          </span>
                        )}
                      </td>

                      {/* Action Buttons */}
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          {!isSuperAdmin ? (
                            <button
                              onClick={() => setDeleteConfirm(adminId)}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              aria-label={`Delete ${admin.name}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          ) : (
                            <span className="text-xs text-gray-400 italic">Protected</span>
                          )}
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
                {Math.min(currentPage * itemsPerPage, totalAdmins)}
              </span>{' '}
              of <span className="font-medium">{totalAdmins}</span> admins
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
                      className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                        currentPage === pageNum
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
                <h3 className="text-lg font-semibold text-gray-900">Delete Admin</h3>
                <p className="text-sm text-gray-600">This action cannot be undone</p>
              </div>
            </div>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete this admin? All associated data will be
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

export default AdminManagement;

