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
      className="group relative bg-white overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 border-2 border-gray-100 hover:border-[rgb(72,29,111)] hover:border-opacity-40 hover:-translate-y-2"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => navigate(product.slug ? `/product/${product.slug}/${product._id}` : `/product/${product._id}`)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') navigate(product.slug ? `/product/${product.slug}/${product._id}` : `/product/${product._id}`);
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
              className={`w-full h-full object-cover transition-opacity duration-500 absolute inset-0 ${isHovered && secondaryImage ? 'opacity-0' : 'opacity-100'
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
                className={`w-full h-full object-cover transition-opacity duration-500 absolute inset-0 ${isHovered ? 'opacity-100' : 'opacity-0'
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

        {/* Discount Badge - Small Badge in Top-Right Corner */}
        {discountPercentage > 0 && (
          <div className="absolute top-2 right-2 z-10">
            <div
              className="px-2 py-1 flex items-center justify-center shadow-md"
              style={{
                background: '#d81b60',
                // background: 'rgb(229, 41, 135)',
                border: '1px',
              }}
            >
              <span
                className="text-white font-bold uppercase tracking-tight whitespace-nowrap text-[9px] sm:text-[10px]"
                style={{
                  letterSpacing: '0.3px',
                  textShadow: '0 1px 2px rgba(0, 0, 0, 0.25)',
                  fontWeight: '700',
                }}
              >
                {discountPercentage}% OFF
              </span>
            </div>
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
        {/* Product Name - Premium Typography */}
        <h3
          className="text-gray-900 mb-2 sm:mb-3 line-clamp-2 leading-tight sm:leading-snug"
          style={{
            fontFamily: '"Inter", sans-serif',
            fontWeight: 600,
            fontSize: '14px',
            letterSpacing: '-0.01em',
            lineHeight: '1.4',
          }}
        >
          {product.name || 'Product Name'}
        </h3>

        {/* Price - Premium Typography */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          {product.original_price && product.original_price > product.selling_price && (
            <span
              className="text-gray-400 line-through whitespace-nowrap"
              style={{
                fontFamily: '"Inter", sans-serif',
                fontWeight: 400,
                fontSize: '13px',
                letterSpacing: '0.01em',
              }}
            >
              ₹ {product.original_price.toLocaleString('en-IN')}
            </span>
          )}
          <div className="flex items-center">
            <span
              className="text-gray-900"
              style={{
                fontFamily: '"Inter", sans-serif',
                fontWeight: 700,
                fontSize: '16px',
                letterSpacing: '-0.02em',
                lineHeight: '1.2',
                color: 'rgb(72,29,111)'
              }}
            >
              ₹ {product.selling_price?.toLocaleString('en-IN') || '0'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;

