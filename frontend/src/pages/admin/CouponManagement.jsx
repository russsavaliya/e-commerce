/**
 * Admin Coupon Management Page
 * Manage coupons: create, edit, list, and disable
 */

import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  X,
  Save,
  Loader2,
  Tag,
  Calendar,
  IndianRupee,
  Percent,
  Eye,
  EyeOff,
  Copy,
  CheckCircle2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  createCoupon,
  getAllCoupons,
  getCouponById,
  updateCoupon,
  deleteCoupon,
} from '../../services/admin/couponService';

const CouponManagement = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [copiedCode, setCopiedCode] = useState(null);

  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discountType: 'percentage',
    discountValue: '',
    minOrderValue: '',
    maxDiscountAmount: '',
    usageLimit: '',
    validFrom: '',
    validTill: '',
    isActive: true,
    showOnUserSide: false,
    applicableToCOD: true,
    applicableToOnline: true,
  });

  const [formErrors, setFormErrors] = useState({});

  // Fetch coupons
  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const response = await getAllCoupons();
      if (response.status) {
        setCoupons(response.data || []);
      } else {
        toast.error(response.message || 'Failed to fetch coupons');
      }
    } catch (error) {
      console.error('Error fetching coupons:', error);
      toast.error(error.message || 'Failed to fetch coupons');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
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

  // Validate form
  const validateForm = () => {
    const errors = {};

    if (!formData.code || !formData.code.trim()) {
      errors.code = 'Coupon code is required';
    }

    if (!formData.discountType) {
      errors.discountType = 'Discount type is required';
    }

    if (!formData.discountValue || formData.discountValue < 0) {
      errors.discountValue = 'Discount value is required and must be non-negative';
    } else if (formData.discountType === 'percentage' && (formData.discountValue < 0 || formData.discountValue > 100)) {
      errors.discountValue = 'Percentage discount must be between 0 and 100';
    }

    if (!formData.minOrderValue || formData.minOrderValue < 0) {
      errors.minOrderValue = 'Minimum order value is required and must be non-negative';
    }

    if (!formData.usageLimit || formData.usageLimit < 0) {
      errors.usageLimit = 'Usage limit is required and must be non-negative';
    }

    if (!formData.validFrom) {
      errors.validFrom = 'Valid from date is required';
    }

    if (!formData.validTill) {
      errors.validTill = 'Valid till date is required';
    }

    if (formData.validFrom && formData.validTill && new Date(formData.validTill) < new Date(formData.validFrom)) {
      errors.validTill = 'Valid till date must be after valid from date';
    }

    if (!formData.applicableToCOD && !formData.applicableToOnline) {
      errors.paymentMethods = 'At least one payment method must be selected';
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

      // Validate at least one payment method is selected
      if (!formData.applicableToCOD && !formData.applicableToOnline) {
        toast.error('Please select at least one payment method');
        return;
      }

      const payload = {
        code: formData.code.trim(),
        description: formData.description.trim(),
        discountType: formData.discountType,
        discountValue: Number(formData.discountValue),
        minOrderValue: Number(formData.minOrderValue),
        maxDiscountAmount: formData.maxDiscountAmount ? Number(formData.maxDiscountAmount) : null,
        usageLimit: Number(formData.usageLimit),
        validFrom: formData.validFrom,
        validTill: formData.validTill,
        isActive: formData.isActive,
        showOnUserSide: formData.showOnUserSide,
        applicableToCOD: formData.applicableToCOD,
        applicableToOnline: formData.applicableToOnline,
      };

      if (editingCoupon) {
        // Update existing coupon
        const response = await updateCoupon(editingCoupon._id, payload);

        if (response.status) {
          toast.success('Coupon updated successfully!');
          resetForm();
          fetchCoupons();
        } else {
          toast.error(response.message || 'Failed to update coupon');
        }
      } else {
        // Create new coupon
        const response = await createCoupon(payload);

        if (response.status) {
          toast.success('Coupon created successfully!');
          resetForm();
          fetchCoupons();
        } else {
          toast.error(response.message || 'Failed to create coupon');
        }
      }
    } catch (error) {
      console.error('Error saving coupon:', error);
      toast.error(error.message || 'Failed to save coupon');
    } finally {
      setSubmitting(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      code: '',
      description: '',
      discountType: 'percentage',
      discountValue: '',
      minOrderValue: '',
      maxDiscountAmount: '',
      usageLimit: '',
      validFrom: '',
      validTill: '',
      isActive: true,
      showOnUserSide: false,
      applicableToCOD: true,
      applicableToOnline: true,
    });
    setFormErrors({});
    setEditingCoupon(null);
    setShowForm(false);
  };

  // Handle edit
  const handleEdit = async (coupon) => {
    try {
      const response = await getCouponById(coupon._id);
      if (response.status && response.data) {
        const couponData = response.data;
        setEditingCoupon(couponData);
        setFormData({
          code: couponData.code || '',
          description: couponData.description || '',
          discountType: couponData.discountType || 'percentage',
          discountValue: couponData.discountValue || '',
          minOrderValue: couponData.minOrderValue || '',
          maxDiscountAmount: couponData.maxDiscountAmount || '',
          usageLimit: couponData.usageLimit || '',
          validFrom: couponData.validFrom ? new Date(couponData.validFrom).toISOString().split('T')[0] : '',
          validTill: couponData.validTill ? new Date(couponData.validTill).toISOString().split('T')[0] : '',
          isActive: couponData.isActive !== undefined ? couponData.isActive : true,
          showOnUserSide: couponData.showOnUserSide !== undefined ? couponData.showOnUserSide : false,
          applicableToCOD: couponData.applicableToCOD !== undefined ? couponData.applicableToCOD : true,
          applicableToOnline: couponData.applicableToOnline !== undefined ? couponData.applicableToOnline : true,
        });
        setFormErrors({});
        setShowForm(true);
      } else {
        toast.error('Failed to load coupon details');
      }
    } catch (error) {
      console.error('Error loading coupon:', error);
      toast.error(error.message || 'Failed to load coupon details');
    }
  };

  // Handle delete
  const handleDelete = async (couponId) => {
    try {
      const response = await deleteCoupon(couponId);
      if (response.status) {
        toast.success('Coupon disabled successfully!');
        fetchCoupons();
        setDeleteConfirm(null);
      } else {
        toast.error(response.message || 'Failed to delete coupon');
      }
    } catch (error) {
      console.error('Error deleting coupon:', error);
      toast.error(error.message || 'Failed to delete coupon');
    }
  };

  // Copy coupon code
  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success('Coupon code copied!');
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  // Check if coupon is currently valid
  const isCouponValid = (coupon) => {
    const now = new Date();
    const validFrom = new Date(coupon.validFrom);
    const validTill = new Date(coupon.validTill);
    return coupon.isActive && now >= validFrom && now <= validTill && coupon.usedCount < coupon.usageLimit;
  };

  // Check if coupon has already expired
  const isCouponExpired = (coupon) => {
    if (!coupon.validTill) return false;
    const now = new Date();
    const validTill = new Date(coupon.validTill);
    return now > validTill;
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Tag className="w-7 h-7" style={{ color: '#4EA674' }} />
              Coupon Management
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Create and manage discount coupons for your customers
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
            Create Coupon
          </button>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}
              </h2>
              <button
                onClick={resetForm}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Coupon Code */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Coupon Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="code"
                    value={formData.code}
                    onChange={handleInputChange}
                    placeholder="e.g., SAVE10"
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                      formErrors.code ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {formErrors.code && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.code}</p>
                  )}
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Enter coupon description"
                    rows={2}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
                  />
                </div>

                {/* Discount Type */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Discount Type <span className="text-red-500">*</span>
                  </label>
                  <div className="relative z-10">
                    <select
                      name="discountType"
                      value={formData.discountType}
                      onChange={handleInputChange}
                      className={`appearance-none bg-white border rounded-lg px-4 py-2.5 pr-8 text-sm text-gray-700 cursor-pointer hover:border-gray-400 transition-all w-full ${
                        formErrors.discountType ? 'border-red-300' : 'border-gray-300'
                      }`}
                    >
                      <option value="percentage">Percentage</option>
                      <option value="flat">Flat Amount</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                  {formErrors.discountType && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.discountType}</p>
                  )}
                </div>

                {/* Discount Value */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Discount Value <span className="text-red-500">*</span>
                    {formData.discountType === 'percentage' && <span className="text-gray-500 text-xs ml-2">(0-100)</span>}
                  </label>
                  <div className="relative">
                    {formData.discountType === 'percentage' ? (
                      <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    ) : (
                      <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    )}
                    <input
                      type="number"
                      name="discountValue"
                      value={formData.discountValue}
                      onChange={handleInputChange}
                      placeholder={formData.discountType === 'percentage' ? '10' : '100'}
                      min="0"
                      max={formData.discountType === 'percentage' ? '100' : undefined}
                      step="0.01"
                      className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                        formErrors.discountValue ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                  </div>
                  {formErrors.discountValue && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.discountValue}</p>
                  )}
                </div>

                {/* Min Order Value */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Minimum Order Value <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="number"
                      name="minOrderValue"
                      value={formData.minOrderValue}
                      onChange={handleInputChange}
                      placeholder="500"
                      min="0"
                      step="0.01"
                      className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                        formErrors.minOrderValue ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                  </div>
                  {formErrors.minOrderValue && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.minOrderValue}</p>
                  )}
                </div>

                {/* Max Discount Amount (only for percentage) */}
                {formData.discountType === 'percentage' && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Max Discount Amount (Optional)
                    </label>
                    <div className="relative">
                      <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="number"
                        name="maxDiscountAmount"
                        value={formData.maxDiscountAmount}
                        onChange={handleInputChange}
                        placeholder="No limit"
                        min="0"
                        step="0.01"
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                  </div>
                )}

                {/* Usage Limit */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Usage Limit <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="usageLimit"
                    value={formData.usageLimit}
                    onChange={handleInputChange}
                    placeholder="100"
                    min="0"
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                      formErrors.usageLimit ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {formErrors.usageLimit && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.usageLimit}</p>
                  )}
                </div>

                {/* Valid From */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Valid From <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="validFrom"
                    value={formData.validFrom}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                      formErrors.validFrom ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {formErrors.validFrom && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.validFrom}</p>
                  )}
                </div>

                {/* Valid Till */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Valid Till <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="validTill"
                    value={formData.validTill}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                      formErrors.validTill ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {formErrors.validTill && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.validTill}</p>
                  )}
                </div>

                {/* Payment Methods */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Applicable Payment Methods <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        name="applicableToCOD"
                        checked={formData.applicableToCOD}
                        onChange={handleInputChange}
                        className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                      />
                      <span className="text-sm text-gray-700">Cash on Delivery (COD)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        name="applicableToOnline"
                        checked={formData.applicableToOnline}
                        onChange={handleInputChange}
                        className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                      />
                      <span className="text-sm text-gray-700">Online Payment</span>
                    </label>
                  </div>
                  {formErrors.paymentMethods && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.paymentMethods}</p>
                  )}
                </div>

                {/* Toggles */}
                <div className="md:col-span-2 space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleInputChange}
                      className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                    />
                    <span className="text-sm font-semibold text-gray-700">Active</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="showOnUserSide"
                      checked={formData.showOnUserSide}
                      onChange={handleInputChange}
                      className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                    />
                    <span className="text-sm font-semibold text-gray-700">Show on User Side</span>
                  </label>
                </div>
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
                      {editingCoupon ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      {editingCoupon ? 'Update Coupon' : 'Create Coupon'}
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
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Disable Coupon</h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to disable this coupon? It will no longer be available for use.
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
                Disable
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Coupons List */}
      {loading ? (
        <div className="flex items-center justify-center py-20 min-h-[400px]">
          <Loader2 className="w-10 h-10 animate-spin text-green-600 mb-4" />
          <div className="ml-4">
            <span className="text-lg font-medium text-gray-700">Loading coupons...</span>
            <span className="text-sm text-gray-500 mt-2 block">Please wait while we fetch the data</span>
          </div>
        </div>
      ) : coupons.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-lg border border-gray-200">
          <Tag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-2 text-lg font-medium">No coupons found</p>
          <p className="text-sm text-gray-500 mb-6">
            Create your first coupon to get started
          </p>
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Coupon
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Code</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Discount</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Min Order</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Usage</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Valid Period</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {coupons.map((coupon) => {
                  const isValid = isCouponValid(coupon);
                  const discountText = coupon.discountType === 'percentage'
                    ? `${coupon.discountValue}% OFF`
                    : `₹${coupon.discountValue} OFF`;

                  return (
                    <tr key={coupon._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-gray-900">{coupon.code}</span>
                          <button
                            onClick={() => handleCopyCode(coupon.code)}
                            className="p-1 hover:bg-gray-100 rounded transition-colors"
                            title="Copy code"
                          >
                            {copiedCode === coupon.code ? (
                              <CheckCircle2 className="w-4 h-4 text-green-600" />
                            ) : (
                              <Copy className="w-4 h-4 text-gray-400" />
                            )}
                          </button>
                        </div>
                        {coupon.description && (
                          <p className="text-xs text-gray-500 mt-1">{coupon.description}</p>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">{discountText}</span>
                        {coupon.discountType === 'percentage' && coupon.maxDiscountAmount && (
                          <p className="text-xs text-gray-500">Max: ₹{coupon.maxDiscountAmount}</p>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">₹{coupon.minOrderValue}</span>
                        <div className="flex items-center gap-1.5 mt-1">
                          {coupon.applicableToCOD && (
                            <span className="text-[10px] px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded">COD</span>
                          )}
                          {coupon.applicableToOnline && (
                            <span className="text-[10px] px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded">Online</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">
                          {coupon.usedCount} / {coupon.usageLimit}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1 text-xs text-gray-600">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{formatDate(coupon.validFrom)} - {formatDate(coupon.validTill)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-wrap items-center gap-2">
                          {coupon.isActive ? (
                            <span className="px-2 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded-full">
                              Active
                            </span>
                          ) : (
                            <span className="px-2 py-1 text-xs font-semibold bg-gray-100 text-gray-800 rounded-full">
                              Inactive
                            </span>
                          )}
                          {coupon.showOnUserSide ? (
                            <Eye className="w-4 h-4 text-green-600" title="Visible to users" />
                          ) : (
                            <EyeOff className="w-4 h-4 text-gray-400" title="Hidden from users" />
                          )}
                          {isValid && (
                            <span className="px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full">
                              Valid
                            </span>
                          )}
                          {isCouponExpired(coupon) && (
                            <span className="px-2 py-1 text-xs font-semibold bg-red-100 text-red-800 rounded-full">
                              Expired
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(coupon)}
                            className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(coupon._id)}
                            className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded transition-colors"
                            title="Disable"
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
        </div>
      )}
    </div>
  );
};

export default CouponManagement;

