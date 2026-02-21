/**
 * Navbar Component - Luxury Saree Website
 * Premium navigation bar with logo and menu items
 * Automatically adjusts style based on current route
 */

import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, PackageSearch, ShoppingBag, Heart, User, RefreshCw, ChevronDown } from 'lucide-react';
import TooltipPortal from './TooltipPortal';
import { getCartCount } from '../../services/user/cartService';
import logoImage from '../../assets/images/logo.png';
import CategoryMegaMenu from './CategoryMegaMenu';

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isHomePage = location.pathname === '/';

  // State for scroll-based navbar styling
  const [isScrolled, setIsScrolled] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [saleMenuOpen, setSaleMenuOpen] = useState(false);
  const [saleMenuTimeout, setSaleMenuTimeout] = useState(null);

  // Handle sale menu with delay to prevent flickering
  const handleSaleMenuEnter = () => {
    if (saleMenuTimeout) {
      clearTimeout(saleMenuTimeout);
      setSaleMenuTimeout(null);
    }
    setSaleMenuOpen(true);
  };

  const handleSaleMenuLeave = () => {
    const timeout = setTimeout(() => {
      setSaleMenuOpen(false);
    }, 150); // Small delay to allow moving to menu
    setSaleMenuTimeout(timeout);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saleMenuTimeout) {
        clearTimeout(saleMenuTimeout);
      }
    };
  }, [saleMenuTimeout]);

  // Handle scroll for navbar shadow (all pages)
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    // Check initial scroll position
    handleScroll();

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch cart count - Commented out for now to prevent frequent API calls
  // TODO: Implement in future with better optimization (e.g., event-based updates)
  // useEffect(() => {
  //   const fetchCartCount = async () => {
  //     try {
  //       const response = await getCartCount();
  //       if (response.status) {
  //         setCartCount(response.data.count || 0);
  //       }
  //     } catch (error) {
  //       // Silently fail - cart might be empty or session not initialized
  //       setCartCount(0);
  //     }
  //   };

  //   fetchCartCount();
  //   // Refresh cart count when route changes (e.g., after adding to cart)
  //   const interval = setInterval(fetchCartCount, 2000); // Poll every 2 seconds
  //   return () => clearInterval(interval);
  // }, [location.pathname]);

  const menuItems = [
    { name: 'Home', path: '/' },
    { name: 'Sale', path: '/sale' },
    { name: 'Best Seller', path: '/bestseller' },
    { name: 'New Arrival', path: '/new-arrival' },
    // { name: 'Collections', path: '/collections' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  // Navbar styling - always light theme matching logo background
  // Light shadow at top, stronger shadow when scrolled
  const navClasses = `bg-[#faf9f5] sticky top-0 z-50 transition-shadow duration-300 ${isScrolled ? 'shadow-md' : 'shadow-sm'}`;

  // Base text color inspired by logo purple
  const textClasses = 'text-[rgb(72,29,111)]';

  // Hover color exactly rgb(72 29 111) with slight opacity change
  const hoverClasses = 'hover:text-[rgb(72,29,111)] hover:opacity-80';

  // Shared menu item typography (matches mobile navbar)
  const menuItemClasses = 'font-medium text-sm tracking-wide uppercase';

  return (
    <nav className={navClasses}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Desktop Navbar */}
        <div className="hidden md:flex items-center justify-between py-3">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0">
            <Link to="/" className="flex items-center group">
              <div className="relative">
                <img
                  src={logoImage}
                  alt="Logo"
                  className="h-14 w-auto object-contain"
                  onError={(e) => {
                    // Fallback if logo image doesn't load
                    e.target.style.display = 'none';
                    const fallback = e.target.nextElementSibling;
                    if (fallback) fallback.style.display = 'flex';
                  }}
                />
                <div
                  className="w-12 h-12 bg-gradient-to-br from-rose-500 to-pink-600 rounded-full hidden items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow absolute"
                  style={{ display: 'none' }}
                >
                  <span className="text-white text-lg font-bold">
                    S
                  </span>
                </div>
              </div>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="flex items-center space-x-6 lg:space-x-8 flex-1 justify-center">
            {menuItems.map((item) => {
              // Special handling for Sale menu with mega-menu
              if (item.name === 'Sale') {
                return (
                  <div
                    key={item.name}
                    // className="relative"
                    onMouseEnter={handleSaleMenuEnter}
                    onMouseLeave={handleSaleMenuLeave}
                  >
                    <Link
                      to={item.path}
                      className={`${textClasses} ${hoverClasses} ${menuItemClasses} transition-colors flex items-center gap-1.5`}
                    >
                      <span>{item.name}</span>
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-all duration-300 ${saleMenuOpen ? 'rotate-180 opacity-100' : 'rotate-0 opacity-70'
                          }`}
                      />
                    </Link>
                    <CategoryMegaMenu
                      isOpen={saleMenuOpen}
                      onClose={handleSaleMenuLeave}
                    />
                  </div>
                );
              }
              // Regular menu items
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`${textClasses} ${hoverClasses} ${menuItemClasses} transition-colors`}
                >
                  {item.name}
                </Link>
              );
            })}
          </div>

          {/* Right Icons */}
          <div className="flex items-center space-x-3 lg:space-x-4 flex-shrink-0">
            {/* Track Order Icon with Tooltip */}
            <div className="relative">
              <TooltipPortal content="Track Order">
                <button
                  onClick={() => navigate('/order/track')}
                  className={`p-1.5 ${textClasses} ${hoverClasses} transition-colors`}
                  aria-label="Track Order"
                >
                  <PackageSearch className="w-5 h-5" />
                </button>
              </TooltipPortal>
            </div>

            {/* Return Policy Icon with Tooltip */}
            <div className="relative">
              <TooltipPortal content="Return & Policy">
                <button
                  onClick={() => navigate('/return-policy')}
                  className={`p-1.5 ${textClasses} ${hoverClasses} transition-colors`}
                  aria-label="Return Policy"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
              </TooltipPortal>
            </div>

            {/* <button
              className={`p-2 ${textClasses} ${hoverClasses} transition-colors relative`}
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5" />
            </button> */}

            {/* Cart Icon with Tooltip */}
            <div className="relative">
              <TooltipPortal content="Cart">
                <button
                  onClick={() => navigate('/cart')}
                  className={`p-1.5 ${textClasses} ${hoverClasses} transition-colors relative`}
                  aria-label="Cart"
                >
                  <ShoppingBag className="w-5 h-5" />
                  {cartCount > 0 && (
                    <span className="absolute top-0 right-0 w-5 h-5 bg-rose-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                      {cartCount > 99 ? '99+' : cartCount}
                    </span>
                  )}
                </button>
              </TooltipPortal>
            </div>
          </div>

        </div>

        {/* Mobile Navbar */}
        <div className="md:hidden flex items-center justify-between py-2.5">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`p-2 ${textClasses} flex-shrink-0`}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>

          {/* Centered Logo on Mobile */}
          <div className="flex-1 flex justify-center">
            <Link to="/" className="flex items-center group">
              <div className="relative">
                <img
                  src={logoImage}
                  alt="Logo"
                  className="h-12 w-auto object-contain"
                  onError={(e) => {
                    // Fallback if logo image doesn't load
                    e.target.style.display = 'none';
                    const fallback = e.target.nextElementSibling;
                    if (fallback) fallback.style.display = 'flex';
                  }}
                />
                <div
                  className="w-10 h-10 bg-gradient-to-br from-rose-500 to-pink-600 rounded-full hidden items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow absolute"
                  style={{ display: 'none' }}
                >
                  <span className="text-white text-base font-bold">
                    S
                  </span>
                </div>
              </div>
            </Link>
          </div>

          {/* Mobile Right Icons */}
          <div className="flex items-center space-x-2 flex-shrink-0">
            {/* Track Order Icon */}
            <button
              onClick={() => navigate('/order/track')}
              className={`p-1.5 ${textClasses} ${hoverClasses} transition-colors`}
              aria-label="Track Order"
            >
              <PackageSearch className="w-4 h-4" />
            </button>

            {/* Cart Icon */}
            <button
              onClick={() => navigate('/cart')}
              className={`p-1.5 ${textClasses} ${hoverClasses} transition-colors relative`}
              aria-label="Cart"
            >
              <ShoppingBag className="w-4 h-4" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 w-4 h-4 bg-rose-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className={`md:hidden py-3 border-t ${isHomePage && !isScrolled ? 'border-white/20' : 'border-gray-100'}`}>
            <div className="flex flex-col space-y-3">
              {menuItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`${textClasses} ${hoverClasses} ${menuItemClasses} transition-colors py-1.5`}
                >
                  {item.name}
                </Link>
              ))}
              <div className={`flex items-center space-x-3 pt-3 ${isHomePage && !isScrolled ? 'border-t border-white/20' : 'border-t border-gray-100'}`}>
                {/* Track Order Icon */}
                <button
                  onClick={() => {
                    navigate('/order/track');
                    setMobileMenuOpen(false);
                  }}
                  className={`p-1.5 ${textClasses} ${hoverClasses} transition-colors`}
                  aria-label="Track Order"
                >
                  <PackageSearch className="w-4 h-4" />
                </button>

                {/* Return Policy Icon */}
                <button
                  onClick={() => {
                    navigate('/return-policy');
                    setMobileMenuOpen(false);
                  }}
                  className={`p-1.5 ${textClasses} ${hoverClasses} transition-colors`}
                  aria-label="Return Policy"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>

                {/* Cart Icon */}
                <button
                  onClick={() => {
                    navigate('/cart');
                    setMobileMenuOpen(false);
                  }}
                  className={`p-1.5 ${textClasses} ${hoverClasses} transition-colors relative`}
                  aria-label="Cart"
                >
                  <ShoppingBag className="w-4 h-4" />
                  {cartCount > 0 && (
                    <span className="absolute top-0 right-0 w-4 h-4 bg-rose-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                      {cartCount > 99 ? '99+' : cartCount}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

