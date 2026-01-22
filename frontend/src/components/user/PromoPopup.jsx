import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { X, Truck, Gift, Clock } from 'lucide-react';

/**
 * Promotional Popup Component
 * 
 * Features:
 * - Auto-displays after 3-5 seconds of page load
 * - Eye-catching design with vibrant colors
 * - Responsive design for mobile and desktop
 * - Smooth fade-in/fade-out animations
 * - Click outside to close (backdrop click)
 * - Close button (X icon)
 * - Session-based: won't reappear once closed in the same session
 * - Delivery truck and gift icons for visual appeal
 * - "Limited Time" urgency badge
 */

const PromoPopup = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Don't show on admin pages
    if (location.pathname.startsWith('/admin')) {
      return;
    }

    // Check if popup was already closed in this session
    const popupClosed = sessionStorage.getItem('promoPopupClosed');

    if (!popupClosed) {
      // Show popup after 3-5 seconds (random between 3000-5000ms)
      const delay = Math.floor(Math.random() * 2000) + 3000; // Random: 3-5 seconds

      const timer = setTimeout(() => {
        setIsVisible(true);
        // Start animation after state updates
        setTimeout(() => setIsAnimating(true), 10);
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [location.pathname]);

  const handleClose = () => {
    // Start fade-out animation
    setIsAnimating(false);

    // Wait for animation to complete before hiding
    setTimeout(() => {
      setIsVisible(false);
      // Mark as closed in session storage
      sessionStorage.setItem('promoPopupClosed', 'true');
    }, 300);
  };

  const handleBackdropClick = (e) => {
    // Close only if clicking directly on backdrop (not on modal content)
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const handleShopNow = () => {
    handleClose();
    navigate('/sale');
  };

  // Don't render if not visible
  if (!isVisible) {
    return null;
  }

  return (
    <>
      {/* Backdrop - Semi-transparent dark overlay */}
      <div
        className={`fixed inset-0 bg-black z-50 transition-opacity duration-300 ${isAnimating ? 'bg-opacity-40' : 'bg-opacity-0'
          }`}
        onClick={handleBackdropClick}
        aria-hidden="true"
      >
        {/* Modal Container - Centered */}
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50 pointer-events-none">
          {/* Modal Content */}
          <div
            className={`bg-[linear-gradient(135deg,_rgb(72,29,111),_rgb(219,39,100))] text-white rounded-2xl shadow-2xl max-w-md w-full relative overflow-hidden pointer-events-auto transform transition-all duration-500 ${isAnimating
              ? 'scale-100 opacity-100 translate-y-0'
              : 'scale-75 opacity-0 translate-y-8'
              }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Decorative Background Elements */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-white opacity-10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-white opacity-10 rounded-full -ml-20 -mb-20 blur-3xl"></div>

            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/15 hover:bg-white/25 text-white transition-all duration-200 hover:scale-110 active:scale-95"
              aria-label="Close popup"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Limited Time Badge */}
            <div className="absolute top-4 left-4 z-10">
              <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-lg animate-pulse">
                <Clock className="w-3.5 h-3.5" />
                <span>LIMITED TIME</span>
              </div>
            </div>

            {/* Content */}
            <div className="relative px-6 sm:px-8 pt-16 pb-8">
              {/* Icons - Delivery Truck & Gift */}
              <div className="flex items-center justify-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-[rgb(72,29,111)] to-purple-600 rounded-2xl flex items-center justify-center shadow-lg transform hover:rotate-12 transition-transform duration-300">
                  <Truck className="w-8 h-8 text-white" />
                </div>
                <div className="w-16 h-16 bg-gradient-to-br from-[#F472B6] to-[#EC4899] rounded-2xl flex items-center justify-center shadow-lg transform hover:rotate-[-12deg] transition-transform duration-300">
                  <Gift className="w-8 h-8 text-white" />
                </div>
              </div>

              {/* Main Heading */}
              <h2 className="text-3xl sm:text-4xl font-black text-center mb-3 leading-tight drop-shadow-sm">
                🎉 FREE DELIVERY<br />TODAY ONLY!
              </h2>

              {/* Sub-text */}
              <p className="text-center text-white/90 text-sm sm:text-base mb-6 leading-relaxed">
                Order now and get <span className="font-bold text-white">free shipping</span> on all orders.<br />
                Don't miss this exclusive offer!
              </p>

              {/* Divider */}
              <div className="flex items-center gap-2 mb-6">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
                <span className="text-xs font-semibold text-white/70 uppercase tracking-wider">Hurry Up</span>
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
              </div>

              {/* Call-to-Action Button */}
              <button
                onClick={handleShopNow}
                className="w-full bg-white text-[rgb(72,29,111)] py-4 rounded-full font-bold text-lg shadow-xl hover:shadow-2xl hover:bg-white/90 transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 group"
              >
                <span>Shop Now</span>
                <svg
                  className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-200"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>

              {/* Secondary Action - Close link */}
              <button
                onClick={handleClose}
                className="w-full mt-3 text-sm text-white/80 hover:text-white font-medium transition-colors duration-200"
              >
                Maybe later
              </button>

              {/* Decorative Dots Pattern */}
              <div className="absolute bottom-0 left-0 right-0 h-2 bg-white/20"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Add custom animations to global styles */}
      <style jsx>{`
        @keyframes slideInUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
};

export default PromoPopup;
