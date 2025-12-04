/**
 * Navbar Component - Luxury Saree Website
 * Premium navigation bar with logo and menu items
 * Automatically adjusts style based on current route
 */

import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Menu, X, Search, ShoppingBag, Heart, User } from 'lucide-react';
import logoImage from '../../assets/images/logo.png';

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  
  // State for scroll-based navbar styling (for homepage)
  const [isScrolled, setIsScrolled] = useState(false);

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

  const menuItems = [
    { name: 'Home', path: '/' },
    { name: 'Sale', path: '/sale' },
    { name: 'Collections', path: '/collections' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  // Determine navbar styling based on route and scroll
  // On homepage: black semi-transparent overlay when at top, solid white when scrolled
  // On other pages: always solid white
  const navClasses = isHomePage && !isScrolled
    ? 'bg-black/60 backdrop-blur-xl sticky top-0 z-50 shadow-2xl'
    : 'bg-white shadow-md sticky top-0 z-50 border-b border-gray-100';

  const textClasses = isHomePage && !isScrolled
    ? 'text-white'
    : 'text-gray-700';

  const hoverClasses = isHomePage && !isScrolled
    ? 'hover:text-white hover:opacity-80'
    : 'hover:text-rose-600';

  return (
    <nav className={navClasses}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex items-center">
            <a href="/" className="flex items-center space-x-3 group">
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
                  className="w-12 h-12 bg-gradient-to-br from-rose-500 to-pink-600 rounded-full hidden items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow absolute"
                  style={{ display: 'none' }}
                >
                  <span className="text-white text-xl font-bold">
                    S
                  </span>
                </div>
              </div>
              <div className="flex flex-col">
                <span 
                  className={`text-3xl font-bold leading-tight ${isHomePage && !isScrolled ? 'text-white' : 'text-gray-900'}`}
                >
                  Saree
                </span>
                <span 
                  className={`text-sm -mt-1 tracking-wider ${isHomePage && !isScrolled ? 'text-white/80' : 'text-gray-600'}`}
                >
                  LUXURY
                </span>
              </div>
            </a>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {menuItems.map((item) => (
              <a
                key={item.name}
                href={item.path}
                className={`${textClasses} ${hoverClasses} transition-colors font-medium text-base tracking-wide uppercase`}
              >
                {item.name}
              </a>
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
            <button
              className={`p-2 ${textClasses} ${hoverClasses} transition-colors relative`}
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5" />
            </button>
            <button
              className={`p-2 ${textClasses} ${hoverClasses} transition-colors relative`}
              aria-label="Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              <span className="absolute top-0 right-0 w-4 h-4 bg-rose-500 text-white text-xs rounded-full flex items-center justify-center">
                0
              </span>
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
                <a
                  key={item.name}
                  href={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`${textClasses} ${hoverClasses} transition-colors font-medium text-base tracking-wide uppercase py-2`}
                >
                  {item.name}
                </a>
              ))}
              <div className={`flex items-center space-x-4 pt-4 ${isHomePage && !isScrolled ? 'border-t border-white/20' : 'border-t border-gray-100'}`}>
                <button className={`p-2 ${textClasses} ${hoverClasses} transition-colors`}>
                  <Search className="w-5 h-5" />
                </button>
                <button className={`p-2 ${textClasses} ${hoverClasses} transition-colors`}>
                  <Heart className="w-5 h-5" />
                </button>
                <button className={`p-2 ${textClasses} ${hoverClasses} transition-colors relative`}>
                  <ShoppingBag className="w-5 h-5" />
                  <span className="absolute top-0 right-0 w-4 h-4 bg-rose-500 text-white text-xs rounded-full flex items-center justify-center">
                    0
                  </span>
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

