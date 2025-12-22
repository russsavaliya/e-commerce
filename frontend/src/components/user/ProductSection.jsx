/**
 * ProductSection Component - Reusable product listing section
 * Used for Bestsellers, Trending, and other product sections
 */

import React from 'react';
import ProductCard from './ProductCard';

const ProductSection = ({
  title,
  icon: Icon,
  iconColor = 'text-gray-500',
  iconFill = false,
  products = [],
  backgroundClass = 'bg-white',
  showIfEmpty = false,
  textColor = 'text-gray-500'
}) => {
  // Don't render if no products and showIfEmpty is false
  if (products.length === 0 && !showIfEmpty) {
    return null;
  }

  return (
    <section className={`pt-12 pb-16 px-4 md:px-8 ${backgroundClass} animate-fade-in-up`}>
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
              className={`text-base tracking-wide font-medium ${textColor} uppercase transition-all duration-300 hover:tracking-wider`}
            >
              {title}
            </h2>
          </div>
        </div>

        {/* Products Grid */}
        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product, index) => (
              <div
                key={product._id}
                style={{
                  animationDelay: `${index * 100}ms`,
                  animation: 'fadeInUp 0.6s ease-out forwards',
                  opacity: 0
                }}
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
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

