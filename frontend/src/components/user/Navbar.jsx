/**
 * Navbar Component - Luxury Saree Website
 * Premium navigation bar with logo and menu items
 * Automatically adjusts style based on current route
 */

import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Search, ShoppingBag, Heart, User } from 'lucide-react';
import { getCartCount } from '../../services/user/cartService';
import logoImage from '../../assets/images/logo.png';

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isHomePage = location.pathname === '/';
  
  // State for scroll-based navbar styling (for homepage)
  const [isScrolled, setIsScrolled] = useState(false);
  const [cartCount, setCartCount] = useState(0);

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
            {menuItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`${textClasses} ${hoverClasses} transition-colors font-medium text-base tracking-wide uppercase`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Right Icons */}
          <div className="hidden md:flex items-center space-x-4">
            <button
              className={`p-2 ${textClasses} ${hoverClasses} transition-colors`}
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>
            {/* <button
              className={`p-2 ${textClasses} ${hoverClasses} transition-colors relative`}
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5" />
            </button> */}
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
                <button className={`p-2 ${textClasses} ${hoverClasses} transition-colors`}>
                  <Search className="w-5 h-5" />
                </button>
                <button className={`p-2 ${textClasses} ${hoverClasses} transition-colors`}>
                  <Heart className="w-5 h-5" />
                </button>
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
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

