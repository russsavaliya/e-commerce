/**
 * Product Card Component
 * Displays product information in a luxury card design
 * Shows second image on hover
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IndianRupee, Package } from 'lucide-react';
// import { Heart } from 'lucide-react'; // TODO: Uncomment when wishlist/save functionality is implemented

// Font is now applied globally via CSS

const ProductCard = ({ product }) => {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  // Use discount_percentage from database first, otherwise calculate from prices
  const discountPercentage = product.discount_percentage && product.discount_percentage > 0
    ? product.discount_percentage
    : (product.original_price && product.original_price > product.selling_price
      ? Math.round(
          ((product.original_price - product.selling_price) / product.original_price) * 100
        )
      : 0);

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
      role="button"
      tabIndex={0}
      className="group relative bg-white overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 border-2 border-gray-100 hover:border-[#481d6f] hover:border-opacity-40"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => navigate(`/product/${product._id}`)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') navigate(`/product/${product._id}`);
      }}
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

        {/* Wishlist Icon - Commented out for future implementation */}
        {/* TODO: Uncomment when wishlist/save functionality is implemented */}
        {/* <div className="absolute bottom-3 right-3 z-10">
          <button className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:bg-white transition-colors">
            <Heart className="w-4 h-4 text-gray-700" />
          </button>
        </div> */}

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
      </div>

      {/* Product Info */}
      <div className="p-3 sm:p-4">
        {/* Product Name with Discount */}
        <h3 
          className="font-semibold text-gray-900 mb-2 sm:mb-3 line-clamp-2 text-sm sm:text-base md:text-lg leading-tight sm:leading-snug"
        >
          <span>{product.name || 'Product Name'}</span>
          {discountPercentage > 0 && (
            <span className="ml-2 text-[#481d6f] font-medium text-xs sm:text-sm md:text-base">
              (<span className="text-[10px] sm:text-xs md:text-sm font-bold">{discountPercentage}% off</span>)
            </span>
          )}
        </h3>

        {/* Price */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          {product.original_price && product.original_price > product.selling_price && (
            <span className="text-xs sm:text-sm md:text-base text-gray-400 line-through whitespace-nowrap">
              ₹ {product.original_price.toLocaleString('en-IN')}
            </span>
          )}
          <div className="flex items-center">
            <span className="text-base sm:text-lg md:text-xl font-bold text-gray-900">
              ₹ {product.selling_price?.toLocaleString('en-IN') || '0'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;

