/**
 * Order Summary Component
 * Displays order totals and place order button
 */

import React from 'react';
import { IndianRupee, Loader2, Tag, X } from 'lucide-react';

const OrderSummary = ({
  cart,
  onPlaceOrder,
  isSubmitting,
  buttonLabel = 'Place Order',
  currentStep = 'shipping',
  appliedCoupon = null,
  onRemoveCoupon = () => { },
}) => {
  const subtotal = cart?.subtotal || 0;
  const shipping = 0; // Free shipping for now
  const discount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const baseTotal = Math.max(0, subtotal + shipping - discount);
  const total = appliedCoupon ? (appliedCoupon.finalAmount ?? baseTotal) : baseTotal;

  return (
    <div className="bg-white border-2 border-gray-200 rounded-lg p-6 shadow-sm sticky top-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>

      {/* Applied Coupon Display - Only show in payment step */}
      {currentStep === 'payment' && appliedCoupon && (
        <div className="mb-6 pb-6 border-b border-gray-200">
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-green-700" />
                <span className="text-sm font-semibold text-green-900">
                  {appliedCoupon.couponCode}
                </span>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                  Applied
                </span>
              </div>
              <button
                onClick={onRemoveCoupon}
                className="p-1 hover:bg-green-100 rounded transition-colors"
                title="Remove coupon"
              >
                <X className="w-4 h-4 text-green-700" />
              </button>
            </div>
            <p className="text-xs text-green-700">
              You saved ₹{appliedCoupon.discountAmount.toFixed(2)} with this coupon
            </p>
          </div>
        </div>
      )}

      <div className="space-y-4 mb-6">
        {/* Subtotal */}
        <div className="flex justify-between text-gray-700">
          <span>Subtotal</span>
          <div className="flex items-center gap-1">
            <IndianRupee className="w-4 h-4" />
            <span className="font-semibold">
              {subtotal.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Coupon Discount */}
        {appliedCoupon && (
          <div className="flex justify-between text-green-700">
            <span>Coupon Discount ({appliedCoupon.couponCode})</span>
            <div className="flex items-center gap-1">
              <IndianRupee className="w-4 h-4" />
              <span className="font-semibold">
                -{discount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        )}

        {/* Shipping */}
        <div className="flex justify-between text-gray-700">
          <span>Shipping</span>
          <span className="font-semibold text-green-600">Free</span>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-300 pt-4">
          <div className="flex justify-between items-center">
            <span className="text-lg font-bold text-gray-900">Total</span>
            <div className="flex items-center gap-1">
              <IndianRupee className="w-5 h-5 text-gray-900" />
              <span className="text-2xl font-bold text-gray-900">
                {total.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <button
        onClick={onPlaceOrder}
        disabled={isSubmitting}
        className="w-full bg-[rgb(72,29,111)] text-white py-4 rounded-full font-semibold hover:bg-[#390e60] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Placing Order...
          </>
        ) : (
          buttonLabel
        )}
      </button>

      {/* Security Note */}
      <p className="text-xs text-gray-500 text-center mt-4">
        🔒 Your payment information is secure
      </p>
    </div>
  );
};

export default OrderSummary;

