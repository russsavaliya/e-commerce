import React, { useRef, useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard from './ProductCard';

const ProductCarousel = ({ products = [] }) => {
  const scrollContainerRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Touch/swipe state
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const touchStartTime = useRef(0);
  const swipeDirection = useRef(null);
  const isDragging = useRef(false);
  const scrollPosition = useRef(0);
  
  // Scroll handling refs
  const scrollTimeout = useRef(null);
  const isLooping = useRef(false);
  const isProgrammaticScroll = useRef(false);
  const ignoreScrollEvent = useRef(false);
  const isInitialized = useRef(false);

  const minSwipeDistance = 50;
  const minSwipeThreshold = 15;
  const maxSwipeVelocity = 0.5;

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (products.length === 0) return null;

  const hasEnoughProducts = products.length >= 2;

  // Get card width including gap
  const getCardWidth = useCallback(() => {
    if (!scrollContainerRef.current) return 304;
    const card = scrollContainerRef.current.querySelector('.product-card');
    if (!card) return 304;
    return card.offsetWidth + 24; // card width + gap
  }, []);

  // Scroll to specific index
  const scrollToIndex = useCallback((index, immediate = false) => {
    if (!scrollContainerRef.current || isLooping.current) return;
    
    const container = scrollContainerRef.current;
    const cardWidth = getCardWidth();
    const targetScroll = (index + 1) * cardWidth;

    // Mark as programmatic scroll
    isProgrammaticScroll.current = true;
    ignoreScrollEvent.current = true;
    setIsScrolling(true);

    if (immediate) {
      container.style.scrollBehavior = 'auto';
      container.scrollLeft = targetScroll;
      setCurrentIndex(index);
      scrollPosition.current = targetScroll;
      
      setTimeout(() => {
        container.style.scrollBehavior = '';
        isProgrammaticScroll.current = false;
        ignoreScrollEvent.current = false;
        setIsScrolling(false);
      }, 50);
    } else {
      container.style.scrollBehavior = 'smooth';
      container.scrollTo({
        left: targetScroll,
        behavior: 'smooth'
      });

      setCurrentIndex(index);
      scrollPosition.current = targetScroll;

      setTimeout(() => {
        container.style.scrollBehavior = '';
        isProgrammaticScroll.current = false;
        ignoreScrollEvent.current = false;
        setIsScrolling(false);
      }, 500);
    }
  }, [getCardWidth]);

  // Navigate to next/previous
  const navigate = useCallback((direction) => {
    if (isScrolling || isLooping.current || products.length === 0) {
      return;
    }

    const newIndex = direction === 'next'
      ? (currentIndex + 1) % products.length
      : (currentIndex - 1 + products.length) % products.length;

    scrollToIndex(newIndex);
  }, [currentIndex, products.length, isScrolling, scrollToIndex]);

  // Handle scroll events - use ref to avoid dependency issues
  const handleScrollRef = useRef(null);
  
  handleScrollRef.current = () => {
    // Ignore if programmatic scroll or during drag
    if (!scrollContainerRef.current || !hasEnoughProducts) return;
    if (ignoreScrollEvent.current || isProgrammaticScroll.current || isDragging.current || isLooping.current) return;
    
    const container = scrollContainerRef.current;
    const scrollLeft = container.scrollLeft;
    
    // Clear previous timeout
    if (scrollTimeout.current) {
      clearTimeout(scrollTimeout.current);
    }

    // Debounce to avoid too many calculations
    scrollTimeout.current = setTimeout(() => {
      // Double check conditions
      if (ignoreScrollEvent.current || isProgrammaticScroll.current || isDragging.current || isLooping.current) return;
      
      const cardWidth = getCardWidth();
      const itemIndex = Math.round(scrollLeft / cardWidth);
      
      // Check if at the end (viewing last clone)
      const lastClonePosition = (products.length + 1) * cardWidth;
      if (scrollLeft >= lastClonePosition - (cardWidth * 0.5)) {
        isLooping.current = true;
        ignoreScrollEvent.current = true;
        
        container.style.scrollBehavior = 'auto';
        container.scrollLeft = cardWidth;
        setCurrentIndex(0);
        scrollPosition.current = cardWidth;
        
        setTimeout(() => {
          container.style.scrollBehavior = '';
          isLooping.current = false;
          ignoreScrollEvent.current = false;
        }, 50);
        return;
      }
      
      // Check if at the start (viewing first clone)
      if (scrollLeft <= cardWidth * 0.5) {
        isLooping.current = true;
        ignoreScrollEvent.current = true;
        
        const lastRealPosition = products.length * cardWidth;
        container.style.scrollBehavior = 'auto';
        container.scrollLeft = lastRealPosition;
        setCurrentIndex(products.length - 1);
        scrollPosition.current = lastRealPosition;
        
        setTimeout(() => {
          container.style.scrollBehavior = '';
          isLooping.current = false;
          ignoreScrollEvent.current = false;
        }, 50);
        return;
      }
      
      // Update current index based on scroll position
      const realIndex = itemIndex - 1;
      const clampedIndex = Math.max(0, Math.min(products.length - 1, realIndex));
      
      // Only update if different to avoid unnecessary re-renders
      setCurrentIndex(prevIndex => {
        if (clampedIndex !== prevIndex) {
          return clampedIndex;
        }
        return prevIndex;
      });
      
      scrollPosition.current = scrollLeft;
    }, 100);
  };

  // Touch handlers for mobile
  const handleTouchStart = (e) => {
    if (!isMobile) return;
    
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    touchStartTime.current = Date.now();
    swipeDirection.current = null;
    isDragging.current = true;
    
    if (scrollContainerRef.current) {
      scrollPosition.current = scrollContainerRef.current.scrollLeft;
    }
  };

  const handleTouchMove = (e) => {
    if (!isMobile || !isDragging.current || !scrollContainerRef.current) return;
    
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const deltaX = Math.abs(touchStartX.current - currentX);
    const deltaY = Math.abs(touchStartY.current - currentY);
    
    // Determine swipe direction
    if (swipeDirection.current === null) {
      if (deltaX >= minSwipeThreshold || deltaY >= minSwipeThreshold) {
        swipeDirection.current = deltaX > deltaY * 1.5 ? 'horizontal' : 'vertical';
      }
    }
    
    // Handle horizontal swipe
    if (swipeDirection.current === 'horizontal') {
      e.preventDefault();
      
      const scrollDelta = touchStartX.current - currentX;
      const newScroll = scrollPosition.current + scrollDelta;
      
      const container = scrollContainerRef.current;
      const cardWidth = getCardWidth();
      const minScroll = 0;
      const maxScroll = container.scrollWidth - container.clientWidth;
      const clampedScroll = Math.max(minScroll - cardWidth * 0.3, Math.min(maxScroll + cardWidth * 0.3, newScroll));
      
      container.scrollLeft = clampedScroll;
    }
  };

  const handleTouchEnd = (e) => {
    if (!isMobile || !isDragging.current) return;
    
    isDragging.current = false;
    
    if (swipeDirection.current !== 'horizontal' || !scrollContainerRef.current) {
      swipeDirection.current = null;
      return;
    }
    
    const currentX = e.changedTouches[0].clientX;
    const swipeDistance = touchStartX.current - currentX;
    const swipeTime = Date.now() - touchStartTime.current;
    const swipeVelocity = swipeTime > 0 ? Math.abs(swipeDistance) / swipeTime : 0;
    
    const isSignificantSwipe = Math.abs(swipeDistance) > minSwipeDistance;
    const isFastSwipe = swipeVelocity > maxSwipeVelocity;
    
    if (isSignificantSwipe || isFastSwipe) {
      navigate(swipeDistance > 0 ? 'next' : 'prev');
    } else {
      scrollToIndex(currentIndex, true);
    }
    
    swipeDirection.current = null;
  };

  // Initialize scroll position - ONLY ONCE when products change
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    // Only initialize if not already initialized or if products changed
    if (hasEnoughProducts && !isInitialized.current) {
      const cardWidth = getCardWidth();
      ignoreScrollEvent.current = true;
      isProgrammaticScroll.current = true;
      container.scrollLeft = cardWidth;
      setCurrentIndex(0);
      scrollPosition.current = cardWidth;
      isInitialized.current = true;
      
      setTimeout(() => {
        ignoreScrollEvent.current = false;
        isProgrammaticScroll.current = false;
      }, 200);
    }

    // Add scroll listener with stable reference
    const handleScroll = () => {
      if (handleScrollRef.current) {
        handleScrollRef.current();
      }
    };

    container.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      container.removeEventListener('scroll', handleScroll);
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    };
  }, [products.length, hasEnoughProducts, getCardWidth]);

  // Reset initialization flag when products change
  useEffect(() => {
    isInitialized.current = false;
  }, [products.length]);

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      if (scrollContainerRef.current && !isScrolling && !isLooping.current) {
        scrollToIndex(currentIndex, true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [currentIndex, isScrolling, scrollToIndex]);

  // Prepare products with clones for infinite loop
  const getDisplayProducts = () => {
    if (!hasEnoughProducts) return products;
    return [products[products.length - 1], ...products, products[0]];
  };

  const displayProducts = getDisplayProducts();

  return (
    <div className="relative group">
      {/* Left Arrow */}
      {products.length > 0 && (
        <button
          onClick={() => navigate('prev')}
          className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 -translate-x-2 sm:-translate-x-3 lg:-translate-x-4 
            bg-white/90 backdrop-blur-sm shadow-md rounded-lg 
            p-1.5 sm:p-2 
            ${isMobile ? 'opacity-60' : 'opacity-0 group-hover:opacity-100'} 
            transition-all duration-300 
            hover:bg-white hover:shadow-lg hover:scale-105 
            active:scale-95 active:bg-white/95 
            disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100
            focus:outline-none focus:ring-2 focus:ring-[rgb(72,29,111)] focus:ring-opacity-30`}
          aria-label="Previous"
          disabled={isScrolling || isLooping.current}
        >
          <ChevronLeft className="w-4 h-4 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-[rgb(72,29,111)] transition-colors duration-200 hover:text-[rgb(72,29,111)]/90" />
        </button>
      )}

      {/* Scrollable Container */}
      <div
        ref={scrollContainerRef}
        className="flex gap-6 overflow-x-auto scrollbar-hide pb-4"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch',
          scrollSnapType: isMobile ? 'x mandatory' : 'none',
          touchAction: 'pan-x pan-y',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {displayProducts.map((product, index) => {
          const isClone = hasEnoughProducts && (index === 0 || index === displayProducts.length - 1);
          const key = isClone 
            ? `${product._id || 'clone'}-clone-${index}`
            : `${product._id || index}-${index}`;
          
          return (
            <div
              key={key}
              className="product-card flex-shrink-0 w-[280px] sm:w-[300px] lg:w-[320px]"
              style={{ scrollSnapAlign: isMobile ? 'start' : 'none' }}
            >
              <ProductCard product={product} />
            </div>
          );
        })}
      </div>

      {/* Right Arrow */}
      {products.length > 0 && (
        <button
          onClick={() => navigate('next')}
          className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 translate-x-2 sm:translate-x-3 lg:translate-x-4 
            bg-white/90 backdrop-blur-sm shadow-md rounded-lg 
            p-1.5 sm:p-2 
            ${isMobile ? 'opacity-60' : 'opacity-0 group-hover:opacity-100'} 
            transition-all duration-300 
            hover:bg-white hover:shadow-lg hover:scale-105 
            active:scale-95 active:bg-white/95 
            disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100
            focus:outline-none focus:ring-2 focus:ring-[rgb(72,29,111)] focus:ring-opacity-30`}
          aria-label="Next"
          disabled={isScrolling || isLooping.current}
        >
          <ChevronRight className="w-4 h-4 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-[rgb(72,29,111)] transition-colors duration-200 hover:text-[rgb(72,29,111)]/90" />
        </button>
      )}

      {/* Hide scrollbar */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default ProductCarousel;
