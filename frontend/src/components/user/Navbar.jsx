/**
 * Navbar Component - Luxury Saree Website
 * Premium navigation bar with logo and menu items
 * Automatically adjusts style based on current route
 */

import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, PackageSearch, ShoppingBag, Heart, User, RefreshCw, ChevronDown } from 'lucide-react';
import { getCartCount } from '../../services/user/cartService';
import logoImage from '../../assets/images/logo.png';
import CategoryMegaMenu from './CategoryMegaMenu';

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isHomePage = location.pathname === '/';
  
  // State for scroll-based navbar styling (for homepage)
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

  // Handle scroll for homepage navbar transparency
  useEffect(() => {
    if (!isHomePage) {
      setIsScrolled(true);
      return;
    }

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isHomePage]);

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
  const navClasses = 'bg-[#faf9f5] shadow-md sticky top-0 z-50 border-b border-gray-100';

  // Base text color inspired by logo purple
  const textClasses = 'text-[rgb(72,29,111)]';

  // Hover color exactly rgb(72 29 111) with slight opacity change
  const hoverClasses = 'hover:text-[rgb(72,29,111)] hover:opacity-80';

  return (
    <nav className={navClasses}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-24">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <img 
                  src={logoImage} 
                  alt="Logo" 
                  className="h-24 w-auto object-contain"
                  onError={(e) => {
                    // Fallback if logo image doesn't load
                    e.target.style.display = 'none';
                    const fallback = e.target.nextElementSibling;
                    if (fallback) fallback.style.display = 'flex';
                  }}
                />
                <div 
                  className="w-16 h-16 bg-gradient-to-br from-rose-500 to-pink-600 rounded-full hidden items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow absolute"
                  style={{ display: 'none' }}
                >
                  <span className="text-white text-xl font-bold">
                    S
                  </span>
                </div>
              </div>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {menuItems.map((item) => {
              // Special handling for Sale menu with mega-menu
              if (item.name === 'Sale') {
                return (
                  <div
                    key={item.name}
                    className="relative"
                    onMouseEnter={handleSaleMenuEnter}
                    onMouseLeave={handleSaleMenuLeave}
                  >
                    <Link
                      to={item.path}
                      className={`${textClasses} ${hoverClasses} transition-colors font-medium text-base tracking-wide uppercase flex items-center gap-1.5`}
                    >
                      <span>{item.name}</span>
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-all duration-300 ${
                          saleMenuOpen ? 'rotate-180 opacity-100' : 'rotate-0 opacity-70'
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
                  className={`${textClasses} ${hoverClasses} transition-colors font-medium text-base tracking-wide uppercase`}
                >
                  {item.name}
                </Link>
              );
            })}
          </div>

          {/* Right Icons */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Track Order Icon with Tooltip */}
            <div className="relative group">
              <button
                onClick={() => navigate('/order/track')}
                className={`p-2 ${textClasses} ${hoverClasses} transition-colors`}
                aria-label="Track Order"
              >
                <PackageSearch className="w-5 h-5" />
              </button>
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-1.5 bg-[rgb(72,29,111)] text-white text-xs font-medium rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                Track Order
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 -mb-1">
                  <div className="w-2 h-2 bg-[rgb(72,29,111)] rotate-45"></div>
                </div>
              </div>
            </div>

            {/* Return Policy Icon with Tooltip */}
            <div className="relative group">
            <button
                onClick={() => navigate('/return-policy')}
              className={`p-2 ${textClasses} ${hoverClasses} transition-colors`}
                aria-label="Return Policy"
            >
                <RefreshCw className="w-5 h-5" />
            </button>
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-1.5 bg-[rgb(72,29,111)] text-white text-xs font-medium rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                Return Policy
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 -mb-1">
                  <div className="w-2 h-2 bg-[rgb(72,29,111)] rotate-45"></div>
                </div>
              </div>
            </div>

            {/* <button
              className={`p-2 ${textClasses} ${hoverClasses} transition-colors relative`}
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5" />
            </button> */}

            {/* Cart Icon with Tooltip */}
            <div className="relative group">
            <button
              onClick={() => navigate('/cart')}
              className={`p-2 ${textClasses} ${hoverClasses} transition-colors relative`}
              aria-label="Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 w-5 h-5 bg-rose-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </button>
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-1.5 bg-[rgb(72,29,111)] text-white text-xs font-medium rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                Cart
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 -mb-1">
                  <div className="w-2 h-2 bg-[rgb(72,29,111)] rotate-45"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`md:hidden p-2 ${textClasses}`}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className={`md:hidden py-4 ${isHomePage && !isScrolled ? 'border-t border-white/20' : 'border-t border-gray-100'}`}>
            <div className="flex flex-col space-y-4">
              {menuItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`${textClasses} ${hoverClasses} transition-colors font-medium text-base tracking-wide uppercase py-2`}
                >
                  {item.name}
                </Link>
              ))}
              <div className={`flex items-center space-x-4 pt-4 ${isHomePage && !isScrolled ? 'border-t border-white/20' : 'border-t border-gray-100'}`}>
                {/* Track Order Icon with Tooltip */}
                <div className="relative group">
                  <button
                    onClick={() => {
                      navigate('/order/track');
                      setMobileMenuOpen(false);
                    }}
                    className={`p-2 ${textClasses} ${hoverClasses} transition-colors`}
                    aria-label="Track Order"
                  >
                    <PackageSearch className="w-5 h-5" />
                  </button>
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-1.5 bg-[rgb(72,29,111)] text-white text-xs font-medium rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                    Track Order
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 -mb-1">
                      <div className="w-2 h-2 bg-[rgb(72,29,111)] rotate-45"></div>
                    </div>
                  </div>
                </div>

                {/* Return Policy Icon with Tooltip */}
                <div className="relative group">
                  <button
                    onClick={() => {
                      navigate('/return-policy');
                      setMobileMenuOpen(false);
                    }}
                    className={`p-2 ${textClasses} ${hoverClasses} transition-colors`}
                    aria-label="Return Policy"
                  >
                    <RefreshCw className="w-5 h-5" />
                </button>
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-1.5 bg-[rgb(72,29,111)] text-white text-xs font-medium rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                    Return Policy
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 -mb-1">
                      <div className="w-2 h-2 bg-[rgb(72,29,111)] rotate-45"></div>
                    </div>
                  </div>
                </div>

                <button className={`p-2 ${textClasses} ${hoverClasses} transition-colors`}>
                  <Heart className="w-5 h-5" />
                </button>

                {/* Cart Icon with Tooltip */}
                <div className="relative group">
                <button
                  onClick={() => {
                    navigate('/cart');
                    setMobileMenuOpen(false);
                  }}
                  className={`p-2 ${textClasses} ${hoverClasses} transition-colors relative`}
                >
                  <ShoppingBag className="w-5 h-5" />
                  {cartCount > 0 && (
                    <span className="absolute top-0 right-0 w-5 h-5 bg-rose-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                      {cartCount > 99 ? '99+' : cartCount}
                    </span>
                  )}
                </button>
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-1.5 bg-[rgb(72,29,111)] text-white text-xs font-medium rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                    Cart
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 -mb-1">
                      <div className="w-2 h-2 bg-[rgb(72,29,111)] rotate-45"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

