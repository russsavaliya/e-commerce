/**
 * Cart Items Review Component
 * Displays cart items for review during checkout
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { IndianRupee, Package } from 'lucide-react';

const CartItemsReview = ({ cart }) => {
  const navigate = useNavigate();

  const normalizeImagePath = (imagePath) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    return imagePath;
  };

  return (
    <div className="bg-white border-2 border-gray-200 rounded-lg p-6 shadow-sm">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Order Items</h2>

      <div className="space-y-4">
        {cart?.items?.map((item) => (
          <div
            key={item.cartItemId}
            className="flex gap-4 pb-4 border-b border-gray-100 last:border-b-0 last:pb-0"
          >
            {/* Product Image */}
            <div
              className="w-20 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 cursor-pointer flex items-center justify-center"
              onClick={() => navigate(item.product.slug ? `/product/${item.product.slug}/${item.productId}` : `/product/${item.productId}`)}
            >
              <img
                src={normalizeImagePath(item.image || item.product.images?.[0])}
                alt={item.product.name}
                className="max-w-full max-h-full object-contain"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/200x300?text=Image';
                }}
              />
            </div>

            {/* Product Details */}
            <div className="flex-1 min-w-0">
              <h3
                className="font-semibold text-gray-900 mb-1 cursor-pointer hover:text-[#481d6f] transition-colors line-clamp-2"
                onClick={() => navigate(item.product.slug ? `/product/${item.product.slug}/${item.productId}` : `/product/${item.productId}`)}
              >
                {item.product.name}
              </h3>
              {item.variantName && (
                <p className="text-sm text-gray-500 mb-2">
                  Option: <span className="font-medium text-gray-700">{item.variantName}</span>
                </p>
              )}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <IndianRupee className="w-4 h-4 text-gray-900" />
                  <span className="text-base font-semibold text-gray-900">
                    {item.price?.toLocaleString('en-IN') || '0'}
                  </span>
                  <span className="text-sm text-gray-500 ml-2">× {item.quantity}</span>
                </div>
                <div className="flex items-center gap-1">
                  <IndianRupee className="w-4 h-4 text-gray-900" />
                  <span className="text-base font-bold text-gray-900">
                    {(item.subtotal || 0).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Total Items Count */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>Total Items</span>
          <span className="font-semibold text-gray-900">{cart?.totalItems || 0}</span>
        </div>
      </div>
    </div>
  );
};

export default CartItemsReview;

