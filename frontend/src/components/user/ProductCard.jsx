/**
 * Product Card Component
 * Displays product information in a luxury card design
 * Shows second image on hover
 */

import React, { useState } from 'react';
import { IndianRupee, Star, Sparkles, Package, Heart } from 'lucide-react';

// Luxury font style for saree website
const luxuryFont = { fontFamily: "'Playfair Display', 'Cormorant Garamond', serif" };

const ProductCard = ({ product }) => {
  const [isHovered, setIsHovered] = useState(false);

  // Calculate discount percentage if original price exists
  const discountPercentage =
    product.original_price && product.original_price > product.selling_price
      ? Math.round(
          ((product.original_price - product.selling_price) / product.original_price) * 100
        )
      : product.discount_percentage || 0;

  // Get product images
  const productImages = product.images && product.images.length > 0 ? product.images : [];
  const primaryImage = productImages[0] || null;
  const secondaryImage = productImages[1] || null;

  // Normalize image path (handle Cloudinary URLs and local paths)
  const normalizeImagePath = (imagePath) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    return imagePath;
  };

  return (
    <div 
      className="group relative bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Product Image */}
      <div className="relative aspect-[3/4] bg-gray-100 overflow-hidden">
        {primaryImage ? (
          <>
            {/* Primary Image */}
            <img
              src={normalizeImagePath(primaryImage)}
              alt={product.name || 'Product'}
              className={`w-full h-full object-cover transition-opacity duration-500 absolute inset-0 ${
                isHovered && secondaryImage ? 'opacity-0' : 'opacity-100'
              }`}
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/400x533?text=Image+Not+Available';
              }}
            />
            {/* Secondary Image (shows on hover) */}
            {secondaryImage && (
              <img
                src={normalizeImagePath(secondaryImage)}
                alt={product.name || 'Product'}
                className={`w-full h-full object-cover transition-opacity duration-500 absolute inset-0 ${
                  isHovered ? 'opacity-100' : 'opacity-0'
                }`}
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/400x533?text=Image+Not+Available';
                }}
              />
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <Package className="w-16 h-16 text-gray-400" />
          </div>
        )}

        {/* Sale Badge */}
        {discountPercentage > 0 && (
          <div className="absolute top-3 right-3 z-10">
            <span className="px-3 py-1 bg-orange-500 text-white text-xs font-bold rounded">
              Sale
            </span>
          </div>
        )}

        {/* Wishlist Icon */}
        <div className="absolute bottom-3 right-3 z-10">
          <button className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:bg-white transition-colors">
            <Heart className="w-4 h-4 text-gray-700" />
          </button>
        </div>

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
      </div>

      {/* Product Info */}
      <div className="p-4">
        {/* Product Name */}
        <h3 
          className="font-medium text-gray-900 mb-2 line-clamp-2 min-h-[2.75rem] text-sm leading-snug"
          style={luxuryFont}
        >
          {product.name || 'Product Name'}
        </h3>

        {/* Rating and Reviews */}
        <div className="flex items-center gap-2 mb-2">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-3 h-3 ${
                  i < 5 ? 'text-red-500 fill-red-500' : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-gray-600">0 reviews</span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2">
          {product.original_price && product.original_price > product.selling_price && (
            <span className="text-sm text-gray-400 line-through">
              ₹ {product.original_price.toLocaleString('en-IN')}
            </span>
          )}
          <div className="flex items-center">
            <span className="text-base font-semibold text-gray-900">
              ₹ {product.selling_price?.toLocaleString('en-IN') || '0'}
            </span>
          </div>
          {discountPercentage > 0 && (
            <span className="text-xs text-gray-600 font-medium">
              {discountPercentage}% off
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;

