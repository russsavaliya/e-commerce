/**
 * Admin Profile Page
 * Displays logged-in admin's complete details
 */

import React, { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Shield,
  Calendar,
  Loader2,
  UserCircle,
  Key,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
  Lock,
  X,
  Save,
} from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { getAdminProfile, updatePassword } from '../../services/admin/adminService';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user: contextUser } = useAdminAuth();
  const [adminDetails, setAdminDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  const [passwordErrors, setPasswordErrors] = useState({});

  useEffect(() => {
    fetchAdminProfile();
  }, []);

  const fetchAdminProfile = async () => {
    try {
      setLoading(true);
      const data = await getAdminProfile();
      setAdminDetails(data.data || data);
    } catch (error) {
      toast.error(error.message || 'Failed to load profile');
      // Fallback to context user if API fails
      if (contextUser) {
        setAdminDetails(contextUser);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="w-10 h-10 animate-spin text-green-600 mb-3" />
        <span className="text-base font-medium text-gray-700">Loading profile...</span>
        <span className="text-sm text-gray-500 mt-1">Please wait</span>
      </div>
    );
  }

  const admin = adminDetails || contextUser;
  if (!admin) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <UserCircle className="w-16 h-16 text-gray-300 mb-3" />
        <p className="text-base font-medium text-gray-900">No profile data available</p>
      </div>
    );
  }

  const isSuperAdmin = admin.isSuperAdmin === true || admin.isSuperAdmin === 'true' || admin.isSuperAdmin === 1;
  const roleName = admin.role?.title || admin.role?.name || 'No Role Assigned';
  const rolePermissions = admin.role?.permissions || [];
  const createdAt = admin.createdAt ? new Date(admin.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }) : 'N/A';

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();

    // Validation
    const errors = {};
    if (!passwordData.currentPassword.trim()) {
      errors.currentPassword = 'Current password is required';
    }
    if (!passwordData.newPassword.trim()) {
      errors.newPassword = 'New password is required';
    } else if (passwordData.newPassword.length < 6) {
      errors.newPassword = 'Password must be at least 6 characters long';
    }
    if (!passwordData.confirmPassword.trim()) {
      errors.confirmPassword = 'Please confirm your new password';
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setPasswordErrors(errors);
    if (Object.keys(errors).length > 0) {
      return;
    }

    try {
      setSubmitting(true);
      await updatePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      toast.success('Password updated successfully!');
      setShowPasswordModal(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPasswordErrors({});
    } catch (error) {
      toast.error(error.message || 'Failed to update password');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
            <UserCircle className="w-12 h-12 text-green-600" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">{admin.name || 'Admin'}</h1>
            <p className="text-sm text-gray-600 mb-2">{admin.email || ''}</p>
            <div className="flex items-center gap-2">
              {isSuperAdmin ? (
                <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-md text-xs font-medium">
                  Super Admin
                </span>
              ) : (
                <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-medium">
                  Admin
                </span>
              )}
              {admin.role && (
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-md text-xs font-medium">
                  {roleName}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-green-600" />
            Personal Information
          </h2>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Full Name
              </label>
              <p className="text-sm text-gray-900 mt-1">{admin.name || 'N/A'}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Email Address
              </label>
              <p className="text-sm text-gray-900 mt-1 flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-400" />
                {admin.email || 'N/A'}
              </p>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Account Created
              </label>
              <p className="text-sm text-gray-900 mt-1 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                {createdAt}
              </p>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Admin ID
              </label>
              <p className="text-sm text-gray-600 mt-1 font-mono break-all">
                {admin._id || admin.id || 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* Role & Permissions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-green-600" />
            Role & Permissions
          </h2>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Role
              </label>
              <p className="text-sm text-gray-900 mt-1">{roleName}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Account Type
              </label>
              <p className="text-sm text-gray-900 mt-1">
                {isSuperAdmin ? (
                  <span className="inline-flex items-center gap-1 text-purple-700">
                    <CheckCircle className="w-4 h-4" />
                    Super Administrator
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-gray-700">
                    <User className="w-4 h-4" />
                    Standard Administrator
                  </span>
                )}
              </p>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
                Permissions ({rolePermissions.length})
              </label>
              {isSuperAdmin ? (
                <div className="mt-2 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                  <p className="text-sm text-purple-700 font-medium">
                    Super Admin has all permissions
                  </p>
                </div>
              ) : rolePermissions.length > 0 ? (
                <div className="mt-2 flex flex-wrap gap-2 max-h-48 overflow-y-auto">
                  {rolePermissions.map((permission, index) => (
                    <span
                      key={index}
                      className="px-2.5 py-1 bg-green-50 text-green-700 rounded-md text-xs border border-green-200"
                    >
                      {permission.replace(/_/g, ' ')}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="mt-2 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <p className="text-sm text-gray-500">No permissions assigned</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Additional Info Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Key className="w-5 h-5 text-green-600" />
            Account Security
          </h2>
          <button
            onClick={() => setShowPasswordModal(true)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            <Lock className="w-4 h-4" />
            Update Password
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
              Authentication Status
            </p>
            <p className="text-sm text-gray-900 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              Authenticated
            </p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
              Access Level
            </p>
            <p className="text-sm text-gray-900">
              {isSuperAdmin ? 'Full Access' : 'Role-Based Access'}
            </p>
          </div>
        </div>
      </div>

      {/* Update Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div
            className="bg-white rounded-lg shadow-2xl p-6 border border-gray-200 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Lock className="w-5 h-5 text-green-600" />
                Update Password
              </h2>
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                  setPasswordErrors({});
                }}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Close modal"
              >
                <X className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            <form
              onSubmit={handlePasswordUpdate}
              className="space-y-4"
            >
              {/* Current Password */}
              <div>
                <label
                  htmlFor="currentPassword"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Current Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    id="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={(e) => {
                      setPasswordData({ ...passwordData, currentPassword: e.target.value });
                      if (passwordErrors.currentPassword) {
                        setPasswordErrors({ ...passwordErrors, currentPassword: '' });
                      }
                    }}
                    placeholder="Enter current password"
                    className={`w-full px-3 py-2 pr-10 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                      passwordErrors.currentPassword
                        ? 'border-red-300 bg-red-50'
                        : 'border-gray-300 bg-white'
                    }`}
                    aria-invalid={!!passwordErrors.currentPassword}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
                  >
                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {passwordErrors.currentPassword && (
                  <p className="mt-1.5 text-xs text-red-600" role="alert">
                    {passwordErrors.currentPassword}
                  </p>
                )}
              </div>

              {/* New Password */}
              <div>
                <label
                  htmlFor="newPassword"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  New Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    id="newPassword"
                    value={passwordData.newPassword}
                    onChange={(e) => {
                      setPasswordData({ ...passwordData, newPassword: e.target.value });
                      if (passwordErrors.newPassword) {
                        setPasswordErrors({ ...passwordErrors, newPassword: '' });
                      }
                    }}
                    placeholder="Enter new password (min 6 characters)"
                    className={`w-full px-3 py-2 pr-10 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                      passwordErrors.newPassword
                        ? 'border-red-300 bg-red-50'
                        : 'border-gray-300 bg-white'
                    }`}
                    aria-invalid={!!passwordErrors.newPassword}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {passwordErrors.newPassword && (
                  <p className="mt-1.5 text-xs text-red-600" role="alert">
                    {passwordErrors.newPassword}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Confirm New Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={(e) => {
                      setPasswordData({ ...passwordData, confirmPassword: e.target.value });
                      if (passwordErrors.confirmPassword) {
                        setPasswordErrors({ ...passwordErrors, confirmPassword: '' });
                      }
                    }}
                    placeholder="Confirm new password"
                    className={`w-full px-3 py-2 pr-10 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                      passwordErrors.confirmPassword
                        ? 'border-red-300 bg-red-50'
                        : 'border-gray-300 bg-white'
                    }`}
                    aria-invalid={!!passwordErrors.confirmPassword}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {passwordErrors.confirmPassword && (
                  <p className="mt-1.5 text-xs text-red-600" role="alert">
                    {passwordErrors.confirmPassword}
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
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Update Password
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                    setPasswordErrors({});
                  }}
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
    </div>
  );
};

export default Profile;

