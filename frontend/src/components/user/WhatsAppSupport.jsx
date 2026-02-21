import React, { useState, useEffect } from 'react';
import { useLocation, useParams } from 'react-router-dom';

/**
 * WhatsApp Support Floating Button Component
 * 
 * Features:
 * - Fixed position at bottom-right corner
 * - WhatsApp green color (#25D366)
 * - Hover animations and tooltip
 * - Auto-detects current page/product for context
 * - Opens WhatsApp chat with pre-filled message
 * - Responsive design for mobile and desktop
 * - Pulse animation to attract attention
 */

const WhatsAppSupport = () => {
  const location = useLocation();
  const params = useParams();
  const [showTooltip, setShowTooltip] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Only show on user pages, not admin pages
  useEffect(() => {
    const isAdminPage = location.pathname.startsWith('/admin');
    setIsVisible(!isAdminPage);
  }, [location.pathname]);

  // Don't render on admin pages
  if (!isVisible) {
    return null;
  }

  // WhatsApp Business Number
  // Format: Country code + number without + or spaces
  // Example: 919265733241 (for India: +91 9265733241)
  const WHATSAPP_NUMBER = '919265733241'; // WhatsApp number from Footer component

  // Get current page context for smart message
  const getContextMessage = () => {
    const baseMessage = 'Hi, I need help with an order on your website.';
    
    // Detect if user is on a product page
    if (location.pathname.includes('/product/') && params.productId) {
      return `${baseMessage} I'm viewing product ID: ${params.productId}`;
    }
    
    // Detect if user is on cart page
    if (location.pathname === '/cart') {
      return `${baseMessage} I need help with my cart.`;
    }
    
    // Detect if user is on checkout page
    if (location.pathname === '/checkout') {
      return `${baseMessage} I need help with checkout.`;
    }
    
    // Default message
    return baseMessage;
  };

  // Handle WhatsApp click
  const handleWhatsAppClick = () => {
    const message = encodeURIComponent(getContextMessage());
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  // Check if current page is Product Detail page
  const isProductDetailPage = location.pathname.includes('/product/');

  // Move button higher on mobile to avoid BottomNav overlap
  // Use a larger bottom margin (e.g., bottom-28) for mobile, keep desktop as before
  const bottomPosition = isProductDetailPage
    ? 'bottom-28 sm:bottom-6' // higher on product page (mobile), normal on desktop
    : 'bottom-24 sm:bottom-6'; // higher on all mobile pages, normal on desktop

  return (
    <div
      className={`fixed ${bottomPosition} right-4 sm:right-6 z-40`}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute bottom-full right-0 mb-3 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-lg whitespace-nowrap animate-fade-in-tooltip">
          <span>Need help? Chat with us</span>
          {/* Tooltip arrow */}
          <div className="absolute top-full right-6 -mt-1 border-4 border-transparent border-t-gray-900"></div>
        </div>
      )}

      {/* WhatsApp Button */}
      <button
        onClick={handleWhatsAppClick}
        className="group relative w-14 h-14 sm:w-16 sm:h-16 bg-[#25D366] rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 active:scale-95 flex items-center justify-center animate-pulse-slow"
        aria-label="Chat with us on WhatsApp"
      >
        {/* WhatsApp Icon - Using SVG for better WhatsApp logo representation */}
        <svg
          className="w-7 h-7 sm:w-8 sm:h-8 text-white"
          fill="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
        </svg>
        
        {/* Ripple effect on hover */}
        <span className="absolute inset-0 rounded-full bg-[#25D366] opacity-0 group-hover:opacity-20 group-hover:scale-150 transition-all duration-500"></span>
      </button>

    </div>
  );
};

export default WhatsAppSupport;

