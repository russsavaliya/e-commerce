/**
 * ProductCarousel Component - Reusable horizontal scrolling carousel
 * Features: Arrow controls (desktop), swipe gestures (mobile), infinite loop
 */

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard from './ProductCard';

const ProductCarousel = ({ products = [] }) => {
  const scrollContainerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isScrolling, setIsScrolling] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Touch/swipe state
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const isDragging = useRef(false);

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Update scroll buttons visibility
  const updateScrollButtons = useCallback(() => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const { scrollLeft, scrollWidth, clientWidth } = container;
    
    // For infinite loop, we always allow scrolling
    // But we can show/hide buttons based on position
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  }, []);

  // Scroll handler
  const scroll = useCallback((direction) => {
    if (!scrollContainerRef.current || isScrolling) return;
    
    setIsScrolling(true);
    const container = scrollContainerRef.current;
    const cardWidth = container.querySelector('.product-card')?.offsetWidth || 280;
    const gap = 24; // gap-6 = 24px
    const scrollAmount = cardWidth + gap;
    
    const currentScroll = container.scrollLeft;
    const maxScroll = container.scrollWidth - container.clientWidth;
    
    let targetScroll;
    if (direction === 'left') {
      targetScroll = Math.max(0, currentScroll - scrollAmount);
      // If at start and trying to go left, loop to end
      if (currentScroll <= 5 && maxScroll > 0) {
        targetScroll = maxScroll;
      }
    } else {
      targetScroll = Math.min(maxScroll, currentScroll + scrollAmount);
      // If at end and trying to go right, loop to start
      if (currentScroll >= maxScroll - 5 && maxScroll > 0) {
        targetScroll = 0;
      }
    }
    
    container.scrollTo({
      left: targetScroll,
      behavior: 'smooth'
    });
    
    // Reset scrolling flag after animation
    setTimeout(() => {
      setIsScrolling(false);
      updateScrollButtons();
    }, 500);
  }, [isScrolling, updateScrollButtons]);

  // Handle scroll end - update button states
  const handleScrollEnd = useCallback(() => {
    updateScrollButtons();
  }, [updateScrollButtons]);

  // Touch event handlers for swipe
  const touchStartY = useRef(0);
  const swipeDirection = useRef(null); // 'horizontal' | 'vertical' | null
  const minSwipeThreshold = 15; // Minimum pixels to determine direction (increased for better detection)
  
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    touchEndX.current = e.touches[0].clientX;
    swipeDirection.current = null; // Reset direction on new touch
    isDragging.current = true;
  };

  const handleTouchMove = (e) => {
    if (!isDragging.current || !scrollContainerRef.current) return;
    
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const deltaX = Math.abs(touchStartX.current - currentX);
    const deltaY = Math.abs(touchStartY.current - currentY);
    
    // Determine swipe direction on first significant movement
    // Use a higher threshold and clearer direction detection
    if (swipeDirection.current === null) {
      // Need at least minSwipeThreshold pixels of movement to determine direction
      if (deltaX >= minSwipeThreshold || deltaY >= minSwipeThreshold) {
        // Determine primary direction - horizontal must be clearly dominant
        if (deltaX > deltaY * 1.5 && deltaX >= minSwipeThreshold) {
          swipeDirection.current = 'horizontal';
        } else if (deltaY > deltaX * 1.5 && deltaY >= minSwipeThreshold) {
          swipeDirection.current = 'vertical';
        }
        // If neither is clearly dominant, don't set direction yet
      }
    }
    
    // Only prevent default for clearly horizontal swipes
    // This allows the carousel to scroll horizontally
    if (swipeDirection.current === 'horizontal') {
      e.preventDefault();
      // Let the native browser scrolling handle the carousel
      // Don't manually manipulate scrollLeft
    }
    // For vertical swipes or undetermined direction:
    // - Do NOT call preventDefault
    // - Let the browser handle page scrolling naturally
    // - This allows vertical page scrolling to work
    
    touchEndX.current = currentX;
  };

  const handleTouchEnd = (e) => {
    if (!isDragging.current || !scrollContainerRef.current) return;
    
    const swipeDistance = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 30; // Minimum distance for a swipe
    
    // Only trigger carousel scroll if it was a clear horizontal swipe
    if (swipeDirection.current === 'horizontal' && Math.abs(swipeDistance) > minSwipeDistance) {
      if (swipeDistance > 0) {
        // Swipe left - scroll right
        scroll('right');
      } else {
        // Swipe right - scroll left
        scroll('left');
      }
    }
    
    // Reset state
    isDragging.current = false;
    swipeDirection.current = null;
  };

  // Mouse drag handlers for desktop (optional enhancement)
  const handleMouseDown = (e) => {
    if (!isMobile) {
      touchStartX.current = e.clientX;
      isDragging.current = true;
    }
  };

  const handleMouseMove = (e) => {
    if (!isMobile && isDragging.current && scrollContainerRef.current) {
      const deltaX = touchStartX.current - e.clientX;
      scrollContainerRef.current.scrollLeft += deltaX;
      touchStartX.current = e.clientX;
    }
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  // Attach scroll listener
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    container.addEventListener('scroll', updateScrollButtons);
    container.addEventListener('scrollend', handleScrollEnd);
    
    // Fallback for browsers that don't support scrollend
    let scrollTimeout;
    const handleScroll = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        handleScrollEnd();
      }, 150);
    };
    container.addEventListener('scroll', handleScroll);

    // Initial check
    updateScrollButtons();

    return () => {
      container.removeEventListener('scroll', updateScrollButtons);
      container.removeEventListener('scrollend', handleScrollEnd);
      container.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, [updateScrollButtons, handleScrollEnd]);

  // Don't render if no products
  if (products.length === 0) {
    return null;
  }

  return (
    <div className="relative group">
      {/* Left Arrow - Desktop only */}
      {!isMobile && products.length > 0 && (
        <button
          onClick={() => scroll('left')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              scroll('left');
            }
          }}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 -translate-x-4 lg:-translate-x-6 bg-white shadow-lg rounded-full p-2 lg:p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:scale-110 active:scale-95 disabled:opacity-0 disabled:cursor-not-allowed"
          aria-label="Scroll left"
          disabled={isScrolling}
        >
          <ChevronLeft className="w-5 h-5 lg:w-6 lg:h-6 text-[rgb(72,29,111)]" />
        </button>
      )}

      {/* Scrollable Container */}
      <div
        ref={scrollContainerRef}
        className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch',
          scrollSnapType: isMobile ? 'x mandatory' : 'none',
          // On mobile: use 'manipulation' to allow panning in all directions
          // JavaScript handlers will determine swipe direction and only preventDefault for horizontal
          // This allows vertical page scrolling to work naturally
          // On desktop: only horizontal panning needed
          touchAction: isMobile ? 'manipulation' : 'pan-x',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {products.map((product, index) => (
          <div
            key={product._id || index}
            className="product-card flex-shrink-0 w-[280px] sm:w-[300px] lg:w-[320px]"
            style={{
              scrollSnapAlign: isMobile ? 'start' : 'none',
            }}
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>

      {/* Right Arrow - Desktop only */}
      {!isMobile && products.length > 0 && (
        <button
          onClick={() => scroll('right')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              scroll('right');
            }
          }}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 translate-x-4 lg:translate-x-6 bg-white shadow-lg rounded-full p-2 lg:p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:scale-110 active:scale-95 disabled:opacity-0 disabled:cursor-not-allowed"
          aria-label="Scroll right"
          disabled={isScrolling}
        >
          <ChevronRight className="w-5 h-5 lg:w-6 lg:h-6 text-[rgb(72,29,111)]" />
        </button>
      )}

      {/* Hide scrollbar styles */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default ProductCarousel;

