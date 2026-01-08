/**
 * ProductSection Component - Reusable product listing section
 * Used for Bestsellers, Trending, and other product sections
 * Now uses ProductCarousel for horizontal scrolling
 */

import React from 'react';
import ProductCarousel from './ProductCarousel';

const ProductSection = ({
  title,
  icon: Icon,
  iconColor = 'text-gray-500',
  iconFill = false,
  products = [],
  backgroundClass = 'bg-white',
  showIfEmpty = false,
  textColor = 'text-gray-500',
  topPadding = 'pt-12' // Custom top padding prop
}) => {
  // Don't render if no products and showIfEmpty is false
  if (products.length === 0 && !showIfEmpty) {
    return null;
  }

  return (
    <section className={`${topPadding} pb-16 px-4 md:px-8 ${backgroundClass} animate-fade-in-up`}>
      <div className="max-w-7xl mx-auto">
        {/* Section Header - match "Your Shaadi Wardrobe" style */}
        <div className="mb-8 text-center animate-fade-in">
          <div className="flex items-center justify-center gap-2 mb-3">
            {Icon && (
              <Icon
                className={`w-5 h-5 ${iconColor} ${iconFill ? 'fill-current' : ''} transition-transform duration-300 hover:scale-110`}
              />
            )}
            <h2
              className={`text-2xl md:text-3xl font-bold ${textColor} leading-tight transition-all duration-300`}
              style={{ fontFamily: '"GeorgiaBallpark Serif", serif' }}
            >
              {title}
            </h2>
          </div>
        </div>

        {/* Products Carousel */}
        {products.length > 0 ? (
          <ProductCarousel products={products} />
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600">No products available in this section.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductSection;

