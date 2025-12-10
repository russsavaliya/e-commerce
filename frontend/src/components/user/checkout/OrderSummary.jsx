/**
 * Order Summary Component
 * Displays order totals and place order button
 */

import React from 'react';
import { IndianRupee, Loader2 } from 'lucide-react';

const OrderSummary = ({ cart, onPlaceOrder, isSubmitting, buttonLabel = 'Place Order' }) => {
  const subtotal = cart?.subtotal || 0;
  const shipping = 0; // Free shipping for now
  const total = subtotal + shipping;

  return (
    <div className="bg-white border-2 border-gray-200 rounded-lg p-6 shadow-sm sticky top-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>

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
        className="w-full bg-gray-900 text-white py-4 rounded-full font-semibold hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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

